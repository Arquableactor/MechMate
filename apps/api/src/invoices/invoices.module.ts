import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { ShopsModule } from '../shops/shops.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { FISCAL_PROVIDER, PendingFiscalProvider } from './fiscal-provider';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

/** Facturación (dueño de invoices e invoice_lines). El proveedor fiscal se cambia aquí. */
@Module({
  imports: [ShopsModule, CustomersModule, VehiclesModule, WorkOrdersModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, { provide: FISCAL_PROVIDER, useClass: PendingFiscalProvider }],
  exports: [InvoicesService],
})
export class InvoicesModule {}
