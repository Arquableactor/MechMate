import { Module } from '@nestjs/common';
import { InspectionsModule } from '../inspections/inspections.module';
import { ShopsModule } from '../shops/shops.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { ApprovalPageController } from './approval-page.controller';
import { ApprovalsController, PublicApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';

/** Aprobación del presupuesto por el cliente (dueño de work_order_approvals). */
@Module({
  imports: [ShopsModule, WorkOrdersModule, InspectionsModule],
  controllers: [ApprovalsController, PublicApprovalsController, ApprovalPageController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
