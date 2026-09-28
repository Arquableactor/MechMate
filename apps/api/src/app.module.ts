import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { DomainEventsModule } from './domain-events/domain-events.module';
import { HealthModule } from './health/health.module';
import { LedgerModule } from './ledger/ledger.module';
import { MeModule } from './me/me.module';
import { MessagingModule } from './messaging/messaging.module';
import { OutboxModule } from './outbox/outbox.module';
import { PaymentsModule } from './payments/payments.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule.forRoot(),
    OutboxModule,
    DomainEventsModule.forRoot(),
    MessagingModule,
    AuthModule,
    AccountsModule,
    HealthModule,
    MeModule,
    LedgerModule,
    PaymentsModule,
    PayoutsModule,
  ],
})
export class AppModule {}
