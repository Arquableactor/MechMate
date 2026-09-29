import { Module } from '@nestjs/common';
import { InvoicesModule } from '../invoices/invoices.module';
import { PaymentsModule } from '../payments/payments.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { ShopsModule } from '../shops/shops.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';

/** Cobro de OT: orquesta Pagos, Facturas, OT y Payouts (no es dueño de tablas). */
@Module({
  imports: [ShopsModule, WorkOrdersModule, InvoicesModule, PaymentsModule, PayoutsModule],
  controllers: [ChargesController],
  providers: [ChargesService],
})
export class BillingModule {}
