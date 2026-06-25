import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CardnetProvider } from './providers/cardnet.provider';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';

@Module({
  imports: [LedgerModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    CardnetProvider,
    { provide: PAYMENT_PROVIDER, useExisting: CardnetProvider },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
