import { Module } from '@nestjs/common';
import { ShopsModule } from '../shops/shops.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

/** Clientes del taller (dueño de la tabla `customers`). */
@Module({
  imports: [ShopsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
