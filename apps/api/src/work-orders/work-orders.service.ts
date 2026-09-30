import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, WorkOrder, WorkOrderItem } from '@prisma/client';
import type {
  ManualWorkOrderTransition,
  Page,
  WorkOrderDetailView,
  WorkOrderItemView,
  WorkOrderStatus,
  WorkOrderStatusChangedPayload,
  WorkOrderView,
} from '@repo/types';
import { isUUID } from 'class-validator';
import { CustomersService } from '../customers/customers.service';
import { recordOutboxEvents } from '../outbox/outbox.writer';
import { PrismaService } from '../prisma/prisma.service';
import { nextShopSequence } from '../shops/shop-sequences';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { formatQuantity } from './quantity';

export interface CreateWorkOrderInput {
  customer_id: string;
  vehicle_id: string;
  complaint: string;
  notes?: string | null;
  mileage_in?: number | null;
  assigned_member_id?: string | null;
  promised_at?: string | null;
}

export type UpdateWorkOrderInput = Partial<Omit<CreateWorkOrderInput, 'customer_id' | 'vehicle_id'>>;

/** Estados en los que la OT todavía se puede editar. */
export const EDITABLE_STATUSES: readonly WorkOrderStatus[] = [
  'draft',
  'awaiting_approval',
  'approved',
  'in_progress',
];

/**
 * Máquina de estados de la OT. Solo estas transiciones existen. Las de la DVI
 * (awaiting_approval/approved, Día 6) y del cobro (invoiced/paid, Día 7) las
 * dispara su propio flujo; por el endpoint manual solo in_progress,
 * completed y cancelled (MANUAL_WORK_ORDER_TRANSITIONS).
 */
export const WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, readonly WorkOrderStatus[]> = {
  draft: ['awaiting_approval', 'in_progress', 'cancelled'],
  awaiting_approval: ['approved', 'draft', 'cancelled'],
  approved: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['invoiced'],
  invoiced: ['paid'],
  paid: [],
  cancelled: [],
};

/** Fila de la OT bloqueada con FOR UPDATE (lo mínimo para decidir). */
export type LockedWorkOrder = Pick<
  WorkOrder,
  'id' | 'status' | 'number' | 'customer_id' | 'vehicle_id' | 'total_cents' | 'currency'
>;

const NOT_FOUND = 'Orden de trabajo no encontrada';
const SEQUENCE = 'work_order';
/**
 * Timeouts de las tx de OT. Los cambios a un mismo taller/OT se serializan en
 * bloqueos de fila: con carga, una tx puede esperar a las anteriores (el
 * default de Prisma, 5 s, expiraba bajo concurrencia).
 */
export const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export const workOrderCode = (n: number) => `OT-${String(n).padStart(4, '0')}`;

const text = (v: string | null | undefined) => (typeof v === 'string' ? v.trim() || null : v);

/**
 * Órdenes de trabajo de un taller. Como en clientes y vehículos, toda consulta
 * filtra por `shop_id`, y las FK compuestas impiden en la DB mezclar talleres.
 */
@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customers: CustomersService,
    private readonly vehicles: VehiclesService,
    private readonly shops: ShopsService,
  ) {}

  async create(shopId: string, createdBy: string, input: CreateWorkOrderInput): Promise<WorkOrderView> {
    await this.customers.assertInShop(shopId, input.customer_id);
    const vehicle = await this.vehicles.get(shopId, input.vehicle_id);
    if (vehicle.customer_id !== input.customer_id) {
      throw new BadRequestException('El vehículo no pertenece a ese cliente.');
    }
    const complaint = text(input.complaint);
    if (!complaint) throw new BadRequestException('Describe la falla que reporta el cliente.');
    await this.assertAssignable(shopId, input.assigned_member_id);

    const created = await this.prisma.$transaction(async (tx) => {
      const number = await nextShopSequence(tx, shopId, SEQUENCE);
      return tx.workOrder.create({
        data: {
          shop_id: shopId,
          number,
          customer_id: input.customer_id,
          vehicle_id: input.vehicle_id,
          complaint,
          notes: text(input.notes) ?? null,
          mileage_in: input.mileage_in ?? null,
          assigned_member_id: input.assigned_member_id ?? null,
          promised_at: input.promised_at ? new Date(input.promised_at) : null,
          created_by_account_id: createdBy,
        },
      });
    }, TX_OPTIONS);

    // Lectura del odómetro al recibir el vehículo: actualiza su ficha (solo sube).
    if (input.mileage_in != null) await this.vehicles.recordMileage(shopId, input.vehicle_id, input.mileage_in);
    return (await this.toViews(shopId, [created]))[0];
  }

  async get(shopId: string, workOrderId: string): Promise<WorkOrderView> {
    return (await this.toViews(shopId, [await this.getOrThrow(shopId, workOrderId)]))[0];
  }

  /** La OT con sus líneas, en el orden en que se agregaron. */
  async getDetail(shopId: string, workOrderId: string): Promise<WorkOrderDetailView> {
    const view = await this.get(shopId, workOrderId);
    const items = await this.prisma.workOrderItem.findMany({
      where: { work_order_id: view.id, shop_id: shopId },
      orderBy: { id: 'asc' },
    });
    return { ...view, items: items.map(toItemView) };
  }

  /** Edita datos de cabecera. Una OT cerrada (completada/facturada/cancelada) no se edita. */
  async update(shopId: string, workOrderId: string, input: UpdateWorkOrderInput): Promise<WorkOrderView> {
    const current = await this.getOrThrow(shopId, workOrderId);
    this.assertEditable(current);

    const data: Prisma.WorkOrderUpdateInput = {};
    if (input.complaint !== undefined) {
      const complaint = text(input.complaint);
      if (!complaint) throw new BadRequestException('La falla reportada no puede quedar vacía.');
      data.complaint = complaint;
    }
    if (input.notes !== undefined) data.notes = text(input.notes);
    if (input.mileage_in !== undefined) data.mileage_in = input.mileage_in;
    if (input.promised_at !== undefined) data.promised_at = input.promised_at ? new Date(input.promised_at) : null;
    if (input.assigned_member_id !== undefined) {
      await this.assertAssignable(shopId, input.assigned_member_id);
      data.assigned_member_id = input.assigned_member_id;
    }

    const updated = await this.prisma.workOrder.update({ where: { id: current.id }, data });
    if (input.mileage_in != null) await this.vehicles.recordMileage(shopId, current.vehicle_id, input.mileage_in);
    return (await this.toViews(shopId, [updated]))[0];
  }

  /**
   * Lista con filtros (estado, cliente, vehículo = historial) y búsqueda por
   * número (`12`, `OT-0012`). Del más nuevo al más viejo, paginada por cursor.
   */
  async list(
    shopId: string,
    opts: {
      status?: WorkOrderStatus;
      customerId?: string;
      vehicleId?: string;
      q?: string;
      limit?: number;
      cursor?: string;
    },
  ): Promise<Page<WorkOrderView>> {
    const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const number = opts.q ? Number(opts.q.replace(/\D/g, '')) : NaN;
    if (opts.q && !(Number.isInteger(number) && number > 0)) return { items: [], next_cursor: null };

    const rows = await this.prisma.workOrder.findMany({
      where: {
        shop_id: shopId,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.customerId ? { customer_id: opts.customerId } : {}),
        ...(opts.vehicleId ? { vehicle_id: opts.vehicleId } : {}),
        ...(opts.q ? { number } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(opts.cursor && isUUID(opts.cursor) ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, limit);
    return {
      items: await this.toViews(shopId, items),
      next_cursor: rows.length > limit ? items[items.length - 1].id : null,
    };
  }

  /**
   * Resumen para el historial de un vehículo o cliente (sin paginar): visitas
   * (OT no canceladas), OT en curso, última visita y las OT pagadas (sus
   * facturas dan el total gastado). Una consulta liviana (solo columnas).
   */
  async historyStats(
    shopId: string,
    filter: { customerId: string } | { vehicleId: string },
  ): Promise<{ visits: number; open: number; lastVisitAt: Date | null; paidIds: string[] }> {
    const rows = await this.prisma.workOrder.findMany({
      where: {
        shop_id: shopId,
        status: { not: 'cancelled' },
        ...('customerId' in filter ? { customer_id: filter.customerId } : { vehicle_id: filter.vehicleId }),
      },
      select: { id: true, status: true, created_at: true },
    });
    const done: readonly WorkOrderStatus[] = ['completed', 'invoiced', 'paid'];
    return {
      visits: rows.length,
      open: rows.filter((r) => !done.includes(r.status)).length,
      lastVisitAt: rows.reduce<Date | null>((max, r) => (!max || r.created_at > max ? r.created_at : max), null),
      paidIds: rows.filter((r) => r.status === 'paid').map((r) => r.id),
    };
  }

  /**
   * Cambia el estado respetando la máquina de estados, en UNA tx con la OT
   * bloqueada (no se puede completar mientras alguien agrega una línea) y con
   * el evento `WorkOrderStatusChanged` en el outbox (misma tx).
   */
  async transition(
    shopId: string,
    workOrderId: string,
    to: ManualWorkOrderTransition,
    by: { accountId: string; reason?: string | null },
  ): Promise<WorkOrderDetailView> {
    await this.prisma.$transaction(async (tx) => {
      const wo = await this.lockForUpdate(tx, shopId, workOrderId);
      if (to === 'completed' && (await tx.workOrderItem.count({ where: { work_order_id: wo.id } })) === 0) {
        throw new ConflictException('La orden no tiene líneas: agrega mano de obra o piezas antes de completarla.');
      }
      await this.changeStatus(tx, shopId, wo, to, by);
    }, TX_OPTIONS);
    return this.getDetail(shopId, workOrderId);
  }

  /**
   * ÚNICA vía para cambiar el estado de una OT (transiciones manuales,
   * aprobación del cliente, cobro…): valida contra la máquina de estados, pone
   * la fecha que corresponde y escribe `WorkOrderStatusChanged` en el outbox,
   * todo en la tx del llamador, que ya tiene la OT bloqueada (lockForUpdate).
   */
  async changeStatus(
    tx: Prisma.TransactionClient,
    shopId: string,
    wo: LockedWorkOrder,
    to: WorkOrderStatus,
    by: { accountId: string | null; reason?: string | null },
  ): Promise<void> {
    if (!WORK_ORDER_TRANSITIONS[wo.status].includes(to)) {
      throw new ConflictException(`La orden ${workOrderCode(wo.number)} está ${wo.status}: no puede pasar a ${to}.`);
    }
    const reason = to === 'cancelled' ? text(by.reason) ?? null : null;
    const now = new Date();

    const updated = await tx.workOrder.update({
      where: { id: wo.id },
      data: {
        status: to,
        ...(to === 'in_progress' ? { started_at: now } : {}),
        ...(to === 'completed' ? { completed_at: now } : {}),
        ...(to === 'cancelled' ? { cancelled_at: now, cancellation_reason: reason } : {}),
      },
    });
    await recordOutboxEvents(tx, [
      {
        topic: 'WorkOrderStatusChanged',
        payload: {
          workOrderId: wo.id,
          shopId,
          code: workOrderCode(wo.number),
          from: wo.status,
          to,
          customerId: wo.customer_id,
          vehicleId: wo.vehicle_id,
          // Leído DESPUÉS del update: refleja los totales vigentes en esta tx.
          total_cents: updated.total_cents.toString(),
          currency: wo.currency,
          changedByAccountId: by.accountId,
          reason,
        } satisfies WorkOrderStatusChangedPayload,
      },
    ]);
  }

  /**
   * Bloquea la OT (`SELECT … FOR UPDATE`) en la tx del llamador: serializa los
   * cambios a una misma OT (líneas, transiciones). 404 si no es de este taller.
   */
  async lockForUpdate(tx: Prisma.TransactionClient, shopId: string, workOrderId: string): Promise<LockedWorkOrder> {
    if (!isUUID(workOrderId)) throw new NotFoundException(NOT_FOUND);
    const [wo] = await tx.$queryRaw<LockedWorkOrder[]>`
      SELECT id, status::text AS status, number, customer_id, vehicle_id, total_cents, currency
      FROM work_orders
      WHERE id = ${workOrderId}::uuid AND shop_id = ${shopId}::uuid
      FOR UPDATE`;
    if (!wo) throw new NotFoundException(NOT_FOUND);
    return wo;
  }

  async getOrThrow(shopId: string, workOrderId: string): Promise<WorkOrder> {
    const wo = isUUID(workOrderId)
      ? await this.prisma.workOrder.findFirst({ where: { id: workOrderId, shop_id: shopId } })
      : null;
    if (!wo) throw new NotFoundException(NOT_FOUND);
    return wo;
  }

  assertEditable(wo: Pick<WorkOrder, 'status' | 'number'>): void {
    if (!EDITABLE_STATUSES.includes(wo.status)) {
      throw new ConflictException(`La orden ${workOrderCode(wo.number)} está ${wo.status}: ya no se puede editar.`);
    }
  }

  private async assertAssignable(shopId: string, memberId: string | null | undefined): Promise<void> {
    if (memberId && !(await this.shops.isActiveMember(shopId, memberId))) {
      throw new BadRequestException('La persona asignada no es miembro activo del taller.');
    }
  }

  /** Arma las vistas con resúmenes de cliente/vehículo en DOS consultas en total (no N+1). */
  private async toViews(shopId: string, rows: WorkOrder[]): Promise<WorkOrderView[]> {
    if (rows.length === 0) return [];
    const [customers, vehicles] = await Promise.all([
      this.customers.getSummaries(shopId, rows.map((r) => r.customer_id)),
      this.vehicles.getSummaries(shopId, rows.map((r) => r.vehicle_id)),
    ]);
    return rows.map((wo) => ({
      id: wo.id,
      number: wo.number,
      code: workOrderCode(wo.number),
      status: wo.status,
      // Las FK compuestas garantizan que existen en este taller.
      customer: customers.get(wo.customer_id)!,
      vehicle: vehicles.get(wo.vehicle_id)!,
      complaint: wo.complaint,
      notes: wo.notes,
      mileage_in: wo.mileage_in,
      assigned_member_id: wo.assigned_member_id,
      promised_at: wo.promised_at?.toISOString() ?? null,
      currency: wo.currency,
      subtotal_cents: wo.subtotal_cents.toString(),
      tax_cents: wo.tax_cents.toString(),
      total_cents: wo.total_cents.toString(),
      started_at: wo.started_at?.toISOString() ?? null,
      completed_at: wo.completed_at?.toISOString() ?? null,
      cancelled_at: wo.cancelled_at?.toISOString() ?? null,
      cancellation_reason: wo.cancellation_reason,
      created_by_account_id: wo.created_by_account_id,
      created_at: wo.created_at.toISOString(),
      updated_at: wo.updated_at.toISOString(),
    }));
  }
}

export function toItemView(i: WorkOrderItem): WorkOrderItemView {
  return {
    id: i.id,
    type: i.type,
    description: i.description,
    part_number: i.part_number,
    quantity: formatQuantity(i.quantity_milli),
    unit_price_cents: i.unit_price_cents.toString(),
    tax_rate_bps: i.tax_rate_bps,
    approval_status: i.approval_status,
    decided_at: i.decided_at?.toISOString() ?? null,
    subtotal_cents: i.subtotal_cents.toString(),
    tax_cents: i.tax_cents.toString(),
    total_cents: i.total_cents.toString(),
    created_at: i.created_at.toISOString(),
    updated_at: i.updated_at.toISOString(),
  };
}

/**
 * Recalcula los totales de la OT a partir de sus líneas, en la tx del llamador
 * (que ya tiene la OT bloqueada). Las líneas RECHAZADAS por el cliente no
 * suman: no se cobran.
 */
export async function recalculateTotals(tx: Prisma.TransactionClient, workOrderId: string): Promise<void> {
  await tx.$executeRaw`
    UPDATE work_orders w
    SET subtotal_cents = s.subtotal,
        tax_cents      = s.tax,
        total_cents    = s.subtotal + s.tax,
        updated_at     = now()
    FROM (
      SELECT COALESCE(SUM(subtotal_cents), 0) AS subtotal, COALESCE(SUM(tax_cents), 0) AS tax
      FROM work_order_items
      WHERE work_order_id = ${workOrderId}::uuid AND approval_status <> 'declined'
    ) s
    WHERE w.id = ${workOrderId}::uuid`;
}
