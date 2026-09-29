import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { ShopsModule } from '../shops/shops.module';
import { PaymentsController } from './payments.controller';
import { InvoicePaymentsService } from './invoice-payments.service';
import { PaymentsService } from './payments.service';
import { CardnetProvider } from './providers/cardnet.provider';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';

@Module({
  imports: [LedgerModule, ShopsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    InvoicePaymentsService,
    CardnetProvider,
    { provide: PAYMENT_PROVIDER, useExisting: CardnetProvider },
  ],
  exports: [PaymentsService, InvoicePaymentsService],
})
export class PaymentsModule {}
