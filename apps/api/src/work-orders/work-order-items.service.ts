import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, WorkOrder } from '@prisma/client';
import type { WorkOrderDetailView, WorkOrderItemType } from '@repo/types';
import { isUUID } from 'class-validator';
import { lineAmounts } from '../common/money';
import { PrismaService } from '../prisma/prisma.service';
import { parseQuantityMilli } from './quantity';
import { TX_OPTIONS, WorkOrdersService } from './work-orders.service';

export interface ItemInput {
  type?: WorkOrderItemType;
  description?: string;
  part_number?: string | null;
  /** Decimal: `"1.5"`. */
  quantity?: string;
  /** Centavos como string (BigInt en el wire). */
  unit_price_cents?: string;
  /** Default 1800 (ITBIS 18%); 0 = exento. */
  tax_rate_bps?: number;
}

const DEFAULT_TAX_RATE_BPS = 1800;
const ITEM_NOT_FOUND = 'Línea no encontrada';

type LockedWorkOrder = Pick<WorkOrder, 'id' | 'status' | 'number'>;

function parseQuantity(input: string): bigint {
  const q = parseQuantityMilli(input);
  if (q === null) throw new BadRequestException('Cantidad inválida: número > 0 con hasta 3 decimales (p. ej. 1.5).');
  return q;
}

function parsePrice(input: string): bigint {
  if (!/^\d{1,13}$/.test(input)) {
    throw new BadRequestException('unit_price_cents inválido: centavos enteros >= 0 (p. ej. "120000" = RD$1,200.00).');
  }
  return BigInt(input);
}

const text = (v: string | null | undefined) => (typeof v === 'string' ? v.trim() || null : v);

/**
 * Líneas de la OT. Cada cambio corre en UNA tx que: (1) bloquea la OT
 * (`FOR UPDATE`), (2) verifica que siga editable, (3) aplica el cambio y
 * (4) recalcula los totales. El bloqueo serializa los cambios a una misma OT:
 * sin él, dos altas simultáneas sumarían cada una sin ver la otra y el total
 * quedaría mal; y nadie puede agregar una línea mientras otro la cierra.
 */
@Injectable()
export class WorkOrderItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workOrders: WorkOrdersService,
  ) {}

  async add(
    shopId: string,
    workOrderId: string,
    input: ItemInput & Required<Pick<ItemInput, 'type' | 'description' | 'quantity' | 'unit_price_cents'>>,
  ): Promise<WorkOrderDetailView> {
    const description = text(input.description);
    if (!description) throw new BadRequestException('La descripción no puede estar vacía.');
    const quantity = parseQuantity(input.quantity);
    const price = parsePrice(input.unit_price_cents);
    const rate = input.tax_rate_bps ?? DEFAULT_TAX_RATE_BPS;
    const amounts = lineAmounts(quantity, price, rate);

    await this.inLockedWorkOrder(shopId, workOrderId, (tx) =>
      tx.workOrderItem.create({
        data: {
          shop_id: shopId,
          work_order_id: workOrderId,
          type: input.type,
          description,
          part_number: text(input.part_number) ?? null,
          quantity_milli: Number(quantity),
          unit_price_cents: price,
          tax_rate_bps: rate,
          subtotal_cents: amounts.subtotal,
          tax_cents: amounts.tax,
          total_cents: amounts.total,
        },
      }),
    );
    return this.workOrders.getDetail(shopId, workOrderId);
  }

  async update(shopId: string, workOrderId: string, itemId: string, input: ItemInput): Promise<WorkOrderDetailView> {
    await this.inLockedWorkOrder(shopId, workOrderId, async (tx) => {
      const item = isUUID(itemId)
        ? await tx.workOrderItem.findFirst({ where: { id: itemId, work_order_id: workOrderId, shop_id: shopId } })
        : null;
      if (!item) throw new NotFoundException(ITEM_NOT_FOUND);

      const quantity = input.quantity !== undefined ? parseQuantity(input.quantity) : BigInt(item.quantity_milli);
      const price = input.unit_price_cents !== undefined ? parsePrice(input.unit_price_cents) : item.unit_price_cents;
      const rate = input.tax_rate_bps ?? item.tax_rate_bps;
      const amounts = lineAmounts(quantity, price, rate);

      const data: Prisma.WorkOrderItemUpdateInput = {
        quantity_milli: Number(quantity),
        unit_price_cents: price,
        tax_rate_bps: rate,
        subtotal_cents: amounts.subtotal,
        tax_cents: amounts.tax,
        total_cents: amounts.total,
      };
      if (input.type !== undefined) data.type = input.type;
      if (input.part_number !== undefined) data.part_number = text(input.part_number);
      if (input.description !== undefined) {
        const description = text(input.description);
        if (!description) throw new BadRequestException('La descripción no puede estar vacía.');
        data.description = description;
      }
      await tx.workOrderItem.update({ where: { id: item.id }, data });
    });
    return this.workOrders.getDetail(shopId, workOrderId);
  }

  async remove(shopId: string, workOrderId: string, itemId: string): Promise<WorkOrderDetailView> {
    await this.inLockedWorkOrder(shopId, workOrderId, async (tx) => {
      const { count } = isUUID(itemId)
        ? await tx.workOrderItem.deleteMany({ where: { id: itemId, work_order_id: workOrderId, shop_id: shopId } })
        : { count: 0 };
      if (count === 0) throw new NotFoundException(ITEM_NOT_FOUND);
    });
    return this.workOrders.getDetail(shopId, workOrderId);
  }

  /** Bloquea la OT, verifica que sea editable, aplica `change` y recalcula totales. */
  private async inLockedWorkOrder(
    shopId: string,
    workOrderId: string,
    change: (tx: Prisma.TransactionClient) => Promise<unknown>,
  ): Promise<void> {
    if (!isUUID(workOrderId)) throw new NotFoundException('Orden de trabajo no encontrada');
    await this.prisma.$transaction(async (tx) => {
      const [wo] = await tx.$queryRaw<LockedWorkOrder[]>`
        SELECT id, status::text AS status, number
        FROM work_orders
        WHERE id = ${workOrderId}::uuid AND shop_id = ${shopId}::uuid
        FOR UPDATE`;
      if (!wo) throw new NotFoundException('Orden de trabajo no encontrada');
      this.workOrders.assertEditable(wo);

      await change(tx);

      await tx.$executeRaw`
        UPDATE work_orders w
        SET subtotal_cents = s.subtotal,
            tax_cents      = s.tax,
            total_cents    = s.subtotal + s.tax,
            updated_at     = now()
        FROM (
          SELECT COALESCE(SUM(subtotal_cents), 0) AS subtotal, COALESCE(SUM(tax_cents), 0) AS tax
          FROM work_order_items
          WHERE work_order_id = ${workOrderId}::uuid
        ) s
        WHERE w.id = ${workOrderId}::uuid`;
    }, TX_OPTIONS);
  }
}
