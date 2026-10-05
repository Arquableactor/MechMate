import { type CanActivate, type ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import type { ShopMember } from '@prisma/client';
import { WorkOrdersService } from './work-orders.service';

/**
 * El mecánico solo trabaja en las OT ASIGNADAS a él: en rutas con
 * `:workOrderId`, una OT ajena es 404 (como si no existiera; no revela que
 * hay otras órdenes). Dueño y asesor pasan siempre.
 * Va DESPUÉS de ShopAccessGuard (necesita `request.shopMember`).
 */
@Injectable()
export class AssignedWorkOrderGuard implements CanActivate {
  constructor(private readonly workOrders: WorkOrdersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ params: { shopId?: string; workOrderId?: string }; shopMember?: ShopMember }>();
    const member = request.shopMember;
    const { shopId, workOrderId } = request.params;
    if (!member || member.role !== 'mechanic' || !shopId || !workOrderId) return true;

    if (!(await this.workOrders.isAssignedTo(shopId, workOrderId, member.id))) {
      throw new NotFoundException('Orden de trabajo no encontrada');
    }
    return true;
  }
}
