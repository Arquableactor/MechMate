import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { ShopsModule } from '../shops/shops.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

/** Órdenes de trabajo (dueño de `work_orders`; los contadores viven en shops). */
@Module({
  imports: [ShopsModule, CustomersModule, VehiclesModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
