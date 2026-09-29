import { AwsClient } from 'aws4fetch';
import type {
  SignedDownload,
  SignedUpload,
  StorageProvider,
  StoredObject,
} from './storage-provider.interface';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

const DEFAULT_UPLOAD_TTL = 15 * 60; // 15 min: tiempo de tomar y subir la foto
const DEFAULT_DOWNLOAD_TTL = 60 * 60; // 1 h: lo que dura abierta la página del cliente
const MAX_TTL = 7 * 24 * 3600; // límite de SigV4

/** Segmento seguro: letras, números, `-`, `_`, `.` (sin `.`/`..` sueltos). */
const SAFE_SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

/**
 * Las claves separan a los talleres (`shops/<id>/…`): una clave con `..`
 * (encodeURIComponent NO codifica los puntos) haría que la URL se resuelva
 * FUERA de ese prefijo, incluso fuera del bucket. Se rechaza todo lo que no
 * sea segmentos simples.
 */
export function assertSafeKey(key: string): void {
  const segments = key.split('/');
  if (key.length > 512 || segments.some((s) => !SAFE_SEGMENT.test(s) || s === '.' || s === '..')) {
    throw new Error(`Clave de almacenamiento inválida: ${JSON.stringify(key)}`);
  }
}

const clampTtl = (s: number) => Math.min(Math.max(Math.floor(s), 1), MAX_TTL);
const expiresAt = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

/**
 * Cloudflare R2 vía su API compatible con S3, firmando con SigV4 (aws4fetch:
 * liviano, sin el SDK de AWS). El bucket es PRIVADO: todo acceso es con URL
 * firmada que vence.
 */
export class R2StorageProvider implements StorageProvider {
  readonly provider = 'r2';
  private readonly client: AwsClient;
  private readonly base: string;

  constructor(config: R2Config) {
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      service: 's3',
      region: 'auto',
    });
    this.base = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}`;
  }

  async createUploadUrl(
    key: string,
    opts: { contentType: string; sizeBytes: number; expiresInSeconds?: number },
  ): Promise<SignedUpload> {
    const ttl = clampTtl(opts.expiresInSeconds ?? DEFAULT_UPLOAD_TTL);
    const headers = { 'content-type': opts.contentType, 'content-length': String(opts.sizeBytes) };
    const signed = await this.client.sign(`${this.objectUrl(key)}?X-Amz-Expires=${ttl}`, {
      method: 'PUT',
      headers,
      aws: { signQuery: true, allHeaders: true },
    });
    return { url: signed.url, method: 'PUT', headers, expiresAt: expiresAt(ttl) };
  }

  async createDownloadUrl(key: string, opts: { expiresInSeconds?: number } = {}): Promise<SignedDownload> {
    const ttl = clampTtl(opts.expiresInSeconds ?? DEFAULT_DOWNLOAD_TTL);
    const signed = await this.client.sign(`${this.objectUrl(key)}?X-Amz-Expires=${ttl}`, {
      method: 'GET',
      aws: { signQuery: true },
    });
    return { url: signed.url, expiresAt: expiresAt(ttl) };
  }

  async headObject(key: string): Promise<StoredObject | null> {
    const res = await this.client.fetch(this.objectUrl(key), { method: 'HEAD' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`R2 HEAD ${res.status}`);
    return {
      sizeBytes: Number(res.headers.get('content-length') ?? 0),
      contentType: res.headers.get('content-type'),
    };
  }

  async deleteObject(key: string): Promise<void> {
    const res = await this.client.fetch(this.objectUrl(key), { method: 'DELETE' });
    if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE ${res.status}`);
  }

  private objectUrl(key: string): string {
    assertSafeKey(key);
    return `${this.base}/${key}`;
  }
}
