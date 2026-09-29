import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WorkOrderApproval } from '@prisma/client';
import type {
  ApprovalRequestView,
  ItemDecision,
  PublicApprovalView,
  WorkOrderApprovalRequestedPayload,
} from '@repo/types';
import { isUUID } from 'class-validator';
import { InspectionsService } from '../inspections/inspections.service';
import { recordOutboxEvents } from '../outbox/outbox.writer';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import {
  recalculateTotals,
  TX_OPTIONS,
  workOrderCode,
  WorkOrdersService,
} from '../work-orders/work-orders.service';
import { signApprovalToken, verifyApprovalToken } from './approval-token';

const APPROVAL_TTL_MS = 7 * 24 * 3600 * 1000;
const DEV_SECRET = 'dev-only-insecure-approval-secret';
const INVALID_LINK = 'Enlace de aprobación no válido';

/**
 * Aprobación del presupuesto por el cliente (DVI). El taller pide aprobación
 * (OT → awaiting_approval) y el cliente, desde un enlace firmado y sin cuenta,
 * aprueba o rechaza cada línea propuesta. Al decidir todas, OT → approved. Las
 * rechazadas no suman a los totales. Todo cambio de estado pasa por
 * WorkOrdersService.changeStatus (máquina de estados + evento en el outbox).
 */
@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);
  private readonly secret: string;
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly workOrders: WorkOrdersService,
    private readonly inspections: InspectionsService,
    private readonly shops: ShopsService,
    config: ConfigService,
  ) {
    const production = config.get<string>('NODE_ENV') === 'production';
    const secret = config.get<string>('APPROVAL_LINK_SECRET')?.trim();
    const baseUrl = config.get<string>('PUBLIC_BASE_URL')?.trim();
    if (production && (!secret || secret.length < 32)) {
      throw new Error('APPROVAL_LINK_SECRET (32+ caracteres) es obligatorio en producción');
    }
    if (production && !baseUrl) throw new Error('PUBLIC_BASE_URL es obligatorio en producción');
    if (!secret) this.logger.warn('APPROVAL_LINK_SECRET no definido: secreto de desarrollo (NO usar en producción)');
    this.secret = secret || DEV_SECRET;
    this.baseUrl = (baseUrl || 'http://localhost:3000').replace(/\/+$/, '');
  }

  /** Enlace que recibe el cliente (lo recalcula el notificador: el token no se guarda). */
  linkFor(approvalId: string): string {
    return `${this.baseUrl}/a/${signApprovalToken(approvalId, this.secret)}`;
  }

  /**
   * Pide aprobación: exige líneas propuestas, revoca la solicitud pendiente
   * anterior (si se reenvía), crea una nueva que vence en 7 días, pasa la OT a
   * awaiting_approval y escribe el evento que dispara el aviso al cliente.
   */
  async request(shopId: string, workOrderId: string, accountId: string): Promise<ApprovalRequestView> {
    const approval = await this.prisma.$transaction(async (tx) => {
      const wo = await this.workOrders.lockForUpdate(tx, shopId, workOrderId);
      if (wo.status !== 'draft' && wo.status !== 'awaiting_approval') {
        throw new ConflictException(`La orden ${workOrderCode(wo.number)} está ${wo.status}: no se puede pedir aprobación.`);
      }
      const proposed = await tx.workOrderItem.count({ where: { work_order_id: wo.id, approval_status: 'proposed' } });
      if (proposed === 0) {
        throw new ConflictException('No hay líneas propuestas: marca con requires_approval las que el cliente debe aprobar.');
      }

      await tx.workOrderApproval.updateMany({
        where: { work_order_id: wo.id, status: 'pending' },
        data: { status: 'revoked' },
      });
      const created = await tx.workOrderApproval.create({
        data: {
          shop_id: shopId,
          work_order_id: wo.id,
          expires_at: new Date(Date.now() + APPROVAL_TTL_MS),
          created_by_account_id: accountId,
        },
      });
      if (wo.status === 'draft') await this.workOrders.changeStatus(tx, shopId, wo, 'awaiting_approval', { accountId });

      await recordOutboxEvents(tx, [
        {
          topic: 'WorkOrderApprovalRequested',
          payload: {
            approvalId: created.id,
            workOrderId: wo.id,
            shopId,
            code: workOrderCode(wo.number),
            customerId: wo.customer_id,
            vehicleId: wo.vehicle_id,
            expiresAt: created.expires_at.toISOString(),
          } satisfies WorkOrderApprovalRequestedPayload,
        },
      ]);
      return created;
    }, TX_OPTIONS);
    return this.toView(approval);
  }

  /** El taller cancela la solicitud pendiente: la OT vuelve a draft para editar líneas. */
  async revoke(shopId: string, workOrderId: string, approvalId: string, accountId: string): Promise<ApprovalRequestView> {
    const approval = await this.prisma.$transaction(async (tx) => {
      const wo = await this.workOrders.lockForUpdate(tx, shopId, workOrderId);
      const pending = isUUID(approvalId)
        ? await tx.workOrderApproval.findFirst({ where: { id: approvalId, work_order_id: wo.id, shop_id: shopId } })
        : null;
      if (!pending) throw new NotFoundException('Solicitud de aprobación no encontrada');
      if (pending.status !== 'pending') throw new ConflictException(`La solicitud ya está ${pending.status}.`);

      const revoked = await tx.workOrderApproval.update({ where: { id: pending.id }, data: { status: 'revoked' } });
      if (wo.status === 'awaiting_approval') await this.workOrders.changeStatus(tx, shopId, wo, 'draft', { accountId });
      return revoked;
    }, TX_OPTIONS);
    return this.toView(approval);
  }

  async list(shopId: string, workOrderId: string): Promise<ApprovalRequestView[]> {
    await this.workOrders.getOrThrow(shopId, workOrderId);
    const rows = await this.prisma.workOrderApproval.findMany({
      where: { work_order_id: workOrderId, shop_id: shopId },
      orderBy: { id: 'desc' },
    });
    return rows.map((r) => this.toView(r));
  }

  // --- Lado del cliente (público, sin cuenta: solo el enlace firmado) ---

  async publicView(token: string): Promise<PublicApprovalView> {
    const approval = await this.approvalFromToken(token);
    const [wo, shop, inspection] = await Promise.all([
      this.workOrders.getDetail(approval.shop_id, approval.work_order_id),
      this.shops.getOwnerContact(approval.shop_id),
      // Sin inspección la página muestra solo las líneas.
      this.inspections.get(approval.shop_id, approval.work_order_id).catch(() => null),
    ]);
    const v = wo.vehicle;

    return {
      status: this.effectiveStatus(approval),
      expires_at: approval.expires_at.toISOString(),
      shop_name: shop?.shopName ?? 'El taller',
      work_order_code: wo.code,
      vehicle: v ? [v.make, v.model, v.year].filter(Boolean).join(' ') + (v.plate ? ` (${v.plate})` : '') : 'Vehículo',
      // Solo el nombre de pila: la página es accesible con el enlace; nada de más.
      customer_first_name: wo.customer.full_name.split(' ')[0],
      currency: wo.currency,
      findings: (inspection?.findings ?? []).map((f) => ({
        area: f.area,
        title: f.title,
        severity: f.severity,
        notes: f.notes,
        photo_urls: f.photos.filter((p) => p.url).map((p) => p.url!),
      })),
      items: wo.items.map((i) => ({
        id: i.id,
        type: i.type,
        description: i.description,
        quantity: i.quantity,
        total_cents: i.total_cents,
        approval_status: i.approval_status,
      })),
      subtotal_cents: wo.subtotal_cents,
      tax_cents: wo.tax_cents,
      total_cents: wo.total_cents,
    };
  }

  /**
   * El cliente aprueba/rechaza líneas PROPUESTAS (puede hacerlo por partes).
   * Cuando ya no quedan propuestas: solicitud completed y OT → approved.
   */
  async decide(token: string, decisions: { item_id: string; decision: ItemDecision }[]): Promise<PublicApprovalView> {
    if (decisions.length === 0) throw new BadRequestException('No hay decisiones.');
    const approvalId = this.idFromToken(token);

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.workOrderApproval.findUnique({ where: { id: approvalId } });
      if (!current) throw new NotFoundException(INVALID_LINK);
      const wo = await this.workOrders.lockForUpdate(tx, current.shop_id, current.work_order_id);
      // Releída con la OT bloqueada: el taller pudo revocarla en paralelo.
      const approval = await tx.workOrderApproval.findUniqueOrThrow({ where: { id: approvalId } });
      const status = this.effectiveStatus(approval);
      if (status === 'expired') throw new GoneException('El enlace venció: pide al taller uno nuevo.');
      if (status !== 'pending') throw new ConflictException('Esta solicitud ya no admite cambios.');

      const ids = [...new Set(decisions.map((d) => d.item_id))];
      const proposed = await tx.workOrderItem.findMany({
        where: { id: { in: ids.filter((id) => isUUID(id)) }, work_order_id: wo.id, approval_status: 'proposed' },
        select: { id: true },
      });
      if (proposed.length !== ids.length) {
        throw new BadRequestException('Alguna línea no existe en esta orden o ya fue decidida.');
      }

      const now = new Date();
      for (const decision of ['approved', 'declined'] as const) {
        const target = decisions.filter((d) => d.decision === decision).map((d) => d.item_id);
        if (target.length) {
          await tx.workOrderItem.updateMany({
            where: { id: { in: target }, work_order_id: wo.id },
            data: { approval_status: decision, decided_at: now },
          });
        }
      }
      await recalculateTotals(tx, wo.id);

      const remaining = await tx.workOrderItem.count({ where: { work_order_id: wo.id, approval_status: 'proposed' } });
      if (remaining === 0) {
        await tx.workOrderApproval.update({ where: { id: approval.id }, data: { status: 'completed', decided_at: now } });
        await this.workOrders.changeStatus(tx, approval.shop_id, wo, 'approved', { accountId: null });
      }
    }, TX_OPTIONS);

    return this.publicView(token);
  }

  // --- helpers ---

  private idFromToken(token: string): string {
    const id = verifyApprovalToken(token, this.secret);
    if (!id) throw new NotFoundException(INVALID_LINK);
    return id;
  }

  private async approvalFromToken(token: string): Promise<WorkOrderApproval> {
    const approval = await this.prisma.workOrderApproval.findUnique({ where: { id: this.idFromToken(token) } });
    if (!approval) throw new NotFoundException(INVALID_LINK);
    return approval;
  }

  private effectiveStatus(a: WorkOrderApproval): PublicApprovalView['status'] {
    return a.status === 'pending' && a.expires_at.getTime() <= Date.now() ? 'expired' : a.status;
  }

  private toView(a: WorkOrderApproval): ApprovalRequestView {
    return {
      id: a.id,
      status: a.status,
      link: this.linkFor(a.id),
      expires_at: a.expires_at.toISOString(),
      decided_at: a.decided_at?.toISOString() ?? null,
      created_at: a.created_at.toISOString(),
    };
  }
}
