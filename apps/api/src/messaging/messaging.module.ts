import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogChannel } from './channels/log.channel';
import { MESSAGE_CHANNELS, type MessageChannelAdapter } from './channels/message-channel.interface';
import { ResendEmailChannel } from './channels/resend-email.channel';
import { MessagingService } from './messaging.service';

const DEFAULT_EMAIL_FROM = 'MechMate <onboarding@resend.dev>';

/**
 * Un adaptador por canal. Email real solo con RESEND_API_KEY; push simulado
 * hasta que exista el móvil (Día 8); WhatsApp es un stub que enchufa el comprador.
 */
export function buildChannels(config: Pick<ConfigService, 'get'>): MessageChannelAdapter[] {
  const resendKey = config.get<string>('RESEND_API_KEY')?.trim();
  const email: MessageChannelAdapter = resendKey
    ? new ResendEmailChannel(resendKey, config.get<string>('EMAIL_FROM') ?? DEFAULT_EMAIL_FROM)
    : new LogChannel('email', 'mock');

  new Logger('MessagingModule').log(
    `Canales: email=${email.provider}, push=mock, whatsapp=stub`,
  );
  return [email, new LogChannel('push', 'mock'), new LogChannel('whatsapp', 'stub')];
}

@Module({
  providers: [
    MessagingService,
    { provide: MESSAGE_CHANNELS, useFactory: buildChannels, inject: [ConfigService] },
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
