import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { ShopsModule } from '../shops/shops.module';
import { VinModule } from '../vin/vin.module';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

/** Vehículos del taller (dueño de la tabla `vehicles`). */
@Module({
  imports: [ShopsModule, CustomersModule, VinModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
