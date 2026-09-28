import type {
  ChannelSendResult,
  MessageChannelAdapter,
  OutgoingMessage,
} from './message-channel.interface';

const RESEND_URL = 'https://api.resend.com/emails';
const TIMEOUT_MS = 10_000;

/**
 * Email real vía Resend (API HTTP, sin SDK). Se activa solo con RESEND_API_KEY.
 * Sin dominio verificado, Resend solo entrega desde `onboarding@resend.dev` y al
 * email dueño de la cuenta: suficiente para el demo.
 */
export class ResendEmailChannel implements MessageChannelAdapter {
  readonly channel = 'email' as const;
  readonly provider = 'resend';

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async send(message: OutgoingMessage): Promise<ChannelSendResult> {
    const res = await this.fetchFn(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: this.from,
        // Resend compara destinatarios distinguiendo mayúsculas; los emails en la
        // práctica no las distinguen (accounts.email es citext).
        to: [message.to.trim().toLowerCase()],
        subject: message.subject ?? '(sin asunto)',
        text: message.body,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !data.id) {
      throw new Error(`Resend ${res.status}: ${data.message ?? 'respuesta sin id'}`);
    }
    return { providerRef: data.id };
  }
}
