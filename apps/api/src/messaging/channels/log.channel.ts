import { randomUUID } from 'node:crypto';
import { Logger } from '@nestjs/common';
import type { MessageChannel } from '@prisma/client';
import {
  type ChannelSendResult,
  type MessageChannelAdapter,
  type OutgoingMessage,
  maskRecipient,
} from './message-channel.interface';

/**
 * Canal simulado: no sale nada a la red, solo deja constancia en el log (el
 * contenido completo queda en la tabla `messages`). Es el default de email sin
 * RESEND_API_KEY, de push hasta el Día 8 y el stub de WhatsApp que enchufa el
 * comprador.
 */
export class LogChannel implements MessageChannelAdapter {
  private readonly logger: Logger;

  constructor(
    readonly channel: MessageChannel,
    readonly provider: string,
  ) {
    this.logger = new Logger(`${channel}:${provider}`);
  }

  async send(message: OutgoingMessage): Promise<ChannelSendResult> {
    const subject = message.subject ? ` "${message.subject}"` : '';
    this.logger.log(`→ ${maskRecipient(message.to)}${subject} (simulado, no se envió)`);
    return { providerRef: `${this.provider}_${randomUUID()}` };
  }
}
