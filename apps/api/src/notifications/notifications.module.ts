import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { CustomersModule } from '../customers/customers.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { MessagingModule } from '../messaging/messaging.module';
import { ShopsModule } from '../shops/shops.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { PaymentNotificationsService } from './payment-notifications.service';
import { ShopNotificationsService } from './shop-notifications.service';
import { WorkOrderNotificationsService } from './work-order-notifications.service';

/**
 * Qué se avisa y a quién, a partir de eventos de dominio. `messaging` solo
 * sabe enviar; este módulo decide contenido y destinatarios. Se suscribe al
 * DomainEventsRegistry (global) en su onModuleInit.
 */
@Module({
  imports: [AccountsModule, MessagingModule, ShopsModule, CustomersModule, VehiclesModule, ApprovalsModule, InvoicesModule],
  providers: [PaymentNotificationsService, ShopNotificationsService, WorkOrderNotificationsService],
})
export class NotificationsModule {}
