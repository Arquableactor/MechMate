import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, WorkOrder } from '@prisma/client';
import type { Page, WorkOrderStatus, WorkOrderView } from '@repo/types';
import { isUUID } from 'class-validator';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { nextShopSequence } from '../shops/shop-sequences';
import { ShopsService } from '../shops/shops.service';
import { VehiclesService } from '../vehicles/vehicles.service';

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

const NOT_FOUND = 'Orden de trabajo no encontrada';
const SEQUENCE = 'work_order';
const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };
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

    // Las altas de un mismo taller se serializan en la fila del contador: con
    // carga, una tx puede esperar a las anteriores. Timeouts explícitos (el
    // default de Prisma, 5 s, expiraba bajo concurrencia).
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

  async getOrThrow(shopId: string, workOrderId: string): Promise<WorkOrder> {
    const wo = isUUID(workOrderId)
      ? await this.prisma.workOrder.findFirst({ where: { id: workOrderId, shop_id: shopId } })
      : null;
    if (!wo) throw new NotFoundException(NOT_FOUND);
    return wo;
  }

  assertEditable(wo: WorkOrder): void {
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
      created_by_account_id: wo.created_by_account_id,
      created_at: wo.created_at.toISOString(),
      updated_at: wo.updated_at.toISOString(),
    }));
  }
}
