import { buildChannels } from '../messaging.module';
import { LogChannel } from './log.channel';
import { maskRecipient } from './message-channel.interface';
import { ResendEmailChannel } from './resend-email.channel';

describe('maskRecipient', () => {
  it.each([
    ['jperez@gmail.com', 'jp***@gmail.com'],
    ['a@b.do', 'a***@b.do'],
    ['+18095551234', '***1234'],
    ['abc', '***'],
  ])('%s → %s', (input, expected) => {
    expect(maskRecipient(input)).toBe(expected);
  });
});

describe('LogChannel', () => {
  it('no envía nada y devuelve una referencia simulada con el nombre del proveedor', async () => {
    const result = await new LogChannel('whatsapp', 'stub').send({ to: '+18095551234', body: 'hola' });
    expect(result.providerRef).toMatch(/^stub_[0-9a-f-]{36}$/);
  });
});

describe('ResendEmailChannel', () => {
  const reply = (status: number, body: unknown) =>
    jest.fn().mockResolvedValue({ ok: status < 300, status, json: async () => body });

  it('llama a la API de Resend con la API key y devuelve su id', async () => {
    const fetchFn = reply(200, { id: 're_123' });
    const channel = new ResendEmailChannel('key-abc', 'MechMate <x@y.do>', fetchFn);

    await expect(
      channel.send({ to: 'cliente@mail.do', subject: 'Recibo', body: 'Gracias' }),
    ).resolves.toEqual({ providerRef: 're_123' });

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer key-abc');
    expect(JSON.parse(init.body)).toEqual({
      from: 'MechMate <x@y.do>',
      to: ['cliente@mail.do'],
      subject: 'Recibo',
      text: 'Gracias',
    });
  });

  it('normaliza el destinatario a minúsculas (Resend distingue mayúsculas)', async () => {
    const fetchFn = reply(200, { id: 're_1' });
    await new ResendEmailChannel('k', 'f', fetchFn).send({ to: ' Juan@Gmail.COM ', body: 'x' });
    expect(JSON.parse(fetchFn.mock.calls[0][1].body).to).toEqual(['juan@gmail.com']);
  });

  it('lanza con el status y el mensaje de Resend si falla (para que se reintente)', async () => {
    const channel = new ResendEmailChannel('k', 'f', reply(422, { message: 'invalid to' }));
    await expect(channel.send({ to: 'x', body: 'y' })).rejects.toThrow('Resend 422: invalid to');
  });

  it('lanza si la respuesta no trae id', async () => {
    const channel = new ResendEmailChannel('k', 'f', reply(200, {}));
    await expect(channel.send({ to: 'x', body: 'y' })).rejects.toThrow('respuesta sin id');
  });
});

describe('buildChannels', () => {
  const config = (values: Record<string, string>) => ({ get: (k: string) => values[k] }) as never;

  it('sin RESEND_API_KEY: email simulado, push simulado, WhatsApp stub', () => {
    const channels = buildChannels(config({}));
    expect(channels.map((c) => `${c.channel}:${c.provider}`)).toEqual([
      'email:mock',
      'push:mock',
      'whatsapp:stub',
    ]);
  });

  it('con RESEND_API_KEY: email real por Resend', () => {
    const [email] = buildChannels(config({ RESEND_API_KEY: 're_key' }));
    expect(email).toBeInstanceOf(ResendEmailChannel);
  });

  it('RESEND_API_KEY vacío cuenta como ausente', () => {
    const [email] = buildChannels(config({ RESEND_API_KEY: '  ' }));
    expect(email.provider).toBe('mock');
  });
});
