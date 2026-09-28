import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Message, MessageChannel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGE_CHANNELS, type MessageChannelAdapter } from './channels/message-channel.interface';

export interface SendMessageInput {
  /** Cuenta destinataria (cruce a Identity por ID). */
  accountId?: string | null;
  channel: MessageChannel;
  /** Email, token de push o teléfono, según el canal. */
  recipient: string;
  /** Nombre de la plantilla que produjo el mensaje (p. ej. `payment_received`). */
  template: string;
  subject?: string | null;
  body: string;
  /** Datos con que se renderizó (auditoría). */
  payload?: Prisma.InputJsonValue;
  /**
   * Clave de idempotencia: mismo valor ⇒ mismo mensaje. Convención:
   * `<id del evento>:<plantilla>:<canal>:<destinatario>`.
   */
  dedupeKey: string;
}

const MAX_ERROR_LEN = 1_000;

/**
 * Envío de mensajes con registro auditable en `messages`.
 * - Idempotente por `dedupeKey`: un mensaje ya `sent` no se reenvía (los
 *   reintentos de un evento pueden volver a llamar a `send`).
 * - Se envía el contenido guardado la primera vez (no se re-renderiza).
 * - Si el canal falla: `failed` + `attempts`/`last_error`, y RELANZA para que
 *   el reintento lo haga BullMQ (DomainEventsProcessor).
 */
@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  private readonly channels: Map<MessageChannel, MessageChannelAdapter>;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MESSAGE_CHANNELS) adapters: MessageChannelAdapter[],
  ) {
    this.channels = new Map(adapters.map((a) => [a.channel, a]));
  }

  async send(input: SendMessageInput): Promise<Message> {
    // ON CONFLICT (dedupe_key) DO NOTHING: crear o reusar sin carrera de P2002.
    await this.prisma.message.createMany({
      data: [
        {
          account_id: input.accountId ?? null,
          channel: input.channel,
          recipient: input.recipient,
          template: input.template,
          subject: input.subject ?? null,
          body: input.body,
          payload: input.payload ?? {},
          dedupe_key: input.dedupeKey,
        },
      ],
      skipDuplicates: true,
    });
    const message = await this.prisma.message.findUniqueOrThrow({
      where: { dedupe_key: input.dedupeKey },
    });

    if (message.status === 'sent') {
      this.logger.debug(`Ya enviado, no se reenvía: ${message.template} ${message.id}`);
      return message;
    }

    const adapter = this.channels.get(message.channel);
    if (!adapter) throw new Error(`Sin adaptador para el canal ${message.channel}`);

    try {
      const { providerRef } = await adapter.send({
        to: message.recipient,
        subject: message.subject,
        body: message.body,
      });
      return await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: 'sent',
          sent_at: new Date(),
          provider_ref: providerRef,
          attempts: { increment: 1 },
          last_error: null,
        },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: 'failed',
          attempts: { increment: 1 },
          last_error: reason.slice(0, MAX_ERROR_LEN),
        },
      });
      throw error;
    }
  }
}
