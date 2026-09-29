/**
 * Costura hacia el almacenamiento de archivos (como `PaymentProvider`): hoy
 * Cloudflare R2; cambiar a S3/GCS no toca el dominio. Los archivos NUNCA pasan
 * por la API: el cliente sube y descarga directo con URLs firmadas que vencen.
 */
export interface SignedUpload {
  url: string;
  method: 'PUT';
  /** Headers que el cliente DEBE enviar tal cual (están firmados). */
  headers: Record<string, string>;
  expiresAt: string;
}

export interface SignedDownload {
  url: string;
  expiresAt: string;
}

export interface StoredObject {
  sizeBytes: number;
  contentType: string | null;
}

export interface StorageProvider {
  readonly provider: string;
  /**
   * URL para subir UN archivo a `key`. Firma también el tipo y el tamaño
   * exactos: la URL no sirve para subir otra cosa (ni un archivo más grande).
   */
  createUploadUrl(key: string, opts: { contentType: string; sizeBytes: number; expiresInSeconds?: number }): Promise<SignedUpload>;
  createDownloadUrl(key: string, opts?: { expiresInSeconds?: number }): Promise<SignedDownload>;
  /** Metadatos del objeto si existe (para confirmar que la subida ocurrió), o null. */
  headObject(key: string): Promise<StoredObject | null>;
  deleteObject(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
