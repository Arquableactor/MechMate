import { Module } from '@nestjs/common';
import { LedgerAccountsService } from './ledger-accounts.service';
import { LedgerService } from './ledger.service';

@Module({
  providers: [LedgerService, LedgerAccountsService],
  exports: [LedgerService, LedgerAccountsService],
})
export class LedgerModule {}
