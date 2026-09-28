import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { MessagingModule } from '../messaging/messaging.module';
import { ShopsModule } from '../shops/shops.module';
import { PaymentNotificationsService } from './payment-notifications.service';
import { ShopNotificationsService } from './shop-notifications.service';

/**
 * Qué se avisa y a quién, a partir de eventos de dominio. `messaging` solo
 * sabe enviar; este módulo decide contenido y destinatarios. Se suscribe al
 * DomainEventsRegistry (global) en su onModuleInit.
 */
@Module({
  imports: [AccountsModule, MessagingModule, ShopsModule],
  providers: [PaymentNotificationsService, ShopNotificationsService],
})
export class NotificationsModule {}
