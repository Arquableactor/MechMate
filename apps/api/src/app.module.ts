import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { DomainEventsModule } from './domain-events/domain-events.module';
import { HealthModule } from './health/health.module';
import { LedgerModule } from './ledger/ledger.module';
import { MeModule } from './me/me.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SentryExceptionFilter } from './observability/sentry-exception.filter';
import { OutboxModule } from './outbox/outbox.module';
import { PaymentsModule } from './payments/payments.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { ShopsModule } from './shops/shops.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { VinModule } from './vin/vin.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule.forRoot(),
    OutboxModule,
    DomainEventsModule.forRoot(),
    MessagingModule,
    NotificationsModule,
    AuthModule,
    AccountsModule,
    HealthModule,
    MeModule,
    ShopsModule,
    VinModule,
    CustomersModule,
    VehiclesModule,
    WorkOrdersModule,
    LedgerModule,
    PaymentsModule,
    PayoutsModule,
  ],
  // Reporta 5xx a Sentry; la respuesta HTTP la sigue armando Nest.
  providers: [{ provide: APP_FILTER, useClass: SentryExceptionFilter }],
})
export class AppModule {}
