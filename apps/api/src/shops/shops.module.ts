import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { ShopAccessGuard } from './shop-access.guard';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

/**
 * Talleres y su membresía. Exporta el guard de aislamiento multi-tenant para
 * los módulos con rutas `/v1/shops/:shopId/...` (clientes, vehículos…).
 */
@Module({
  imports: [AccountsModule],
  controllers: [ShopsController],
  providers: [ShopsService, ShopAccessGuard],
  exports: [ShopsService, ShopAccessGuard],
})
export class ShopsModule {}
