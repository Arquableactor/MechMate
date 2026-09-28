import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { ShopsModule } from '../shops/shops.module';
import { PayoutsService } from './payouts.service';

@Module({
  imports: [LedgerModule, ShopsModule],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}
