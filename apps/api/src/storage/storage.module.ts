import { Global, Logger, Module, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { R2StorageProvider } from './r2-storage.provider';
import { STORAGE_PROVIDER, type StorageProvider } from './storage-provider.interface';

const R2_KEYS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'] as const;

/** Sin R2 configurado (dev/tests): responde 503 si alguien intenta usar archivos. */
class UnconfiguredStorage implements StorageProvider {
  readonly provider = 'unconfigured';
  private fail(): never {
    throw new ServiceUnavailableException('El almacenamiento de archivos no está configurado (R2).');
  }
  createUploadUrl = async () => this.fail();
  createDownloadUrl = async () => this.fail();
  headObject = async () => this.fail();
  deleteObject = async () => this.fail();
}

/**
 * Elige el proveedor de archivos. Fail-closed en producción: sin R2 la API no
 * arranca (la DVI con fotos dejaría de funcionar en silencio). En dev/test sin
 * R2, los endpoints de archivos responden 503 y el resto funciona.
 */
export function buildStorage(config: Pick<ConfigService, 'get'>): StorageProvider {
  const values = Object.fromEntries(R2_KEYS.map((k) => [k, config.get<string>(k)?.trim()]));
  const missing = R2_KEYS.filter((k) => !values[k]);
  const logger = new Logger('StorageModule');

  if (missing.length === 0) {
    logger.log(`Archivos: R2 (bucket ${values.R2_BUCKET})`);
    return new R2StorageProvider({
      accountId: values.R2_ACCOUNT_ID!,
      accessKeyId: values.R2_ACCESS_KEY_ID!,
      secretAccessKey: values.R2_SECRET_ACCESS_KEY!,
      bucket: values.R2_BUCKET!,
    });
  }
  if (config.get<string>('NODE_ENV') === 'production') {
    throw new Error(`Faltan variables de R2 en producción: ${missing.join(', ')}`);
  }
  logger.warn(`R2 no configurado (${missing.join(', ')}): los endpoints de archivos responden 503`);
  return new UnconfiguredStorage();
}

@Global()
@Module({
  providers: [{ provide: STORAGE_PROVIDER, useFactory: buildStorage, inject: [ConfigService] }],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
