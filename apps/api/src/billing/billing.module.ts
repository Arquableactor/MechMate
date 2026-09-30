import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PaymentsModule } from '../payments/payments.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { ShopsModule } from '../shops/shops.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

/**
 * Cobro de OT e historial por vehículo/cliente: orquesta Pagos, Facturas, OT,
 * Payouts, Clientes y Vehículos (no es dueño de tablas).
 */
@Module({
  imports: [ShopsModule, CustomersModule, VehiclesModule, WorkOrdersModule, InvoicesModule, PaymentsModule, PayoutsModule],
  controllers: [ChargesController, HistoryController],
  providers: [ChargesService, HistoryService],
})
export class BillingModule {}
