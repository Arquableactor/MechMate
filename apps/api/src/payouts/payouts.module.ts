import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { PayoutsService } from './payouts.service';

@Module({
  imports: [LedgerModule],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}
