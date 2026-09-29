import { ServiceUnavailableException } from '@nestjs/common';
import { R2StorageProvider } from './r2-storage.provider';
import { buildStorage } from './storage.module';

const config = {
  accountId: 'acc123',
  accessKeyId: 'AKIDEXAMPLE',
  secretAccessKey: 'secret',
  bucket: 'mechmate-dvi',
};

describe('R2StorageProvider (firma, sin red)', () => {
  const r2 = new R2StorageProvider(config);

  it('URL de subida: firma tipo y tamaño, vence en 15 min por defecto', async () => {
    const up = await r2.createUploadUrl('shops/s1/photo.jpg', { contentType: 'image/jpeg', sizeBytes: 2048 });
    const url = new URL(up.url);

    expect(url.origin + url.pathname).toBe('https://acc123.r2.cloudflarestorage.com/mechmate-dvi/shops/s1/photo.jpg');
    expect(url.searchParams.get('X-Amz-SignedHeaders')).toBe('content-length;content-type;host');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('900');
    expect(url.searchParams.get('X-Amz-Signature')).toMatch(/^[0-9a-f]{64}$/);
    expect(up).toMatchObject({ method: 'PUT', headers: { 'content-type': 'image/jpeg', 'content-length': '2048' } });
  });

  it('URL de descarga: 1 h por defecto; el vencimiento se acota a 7 días (límite SigV4)', async () => {
    const dl = await r2.createDownloadUrl('a.jpg');
    expect(new URL(dl.url).searchParams.get('X-Amz-Expires')).toBe('3600');
    const far = await r2.createDownloadUrl('a.jpg', { expiresInSeconds: 30 * 24 * 3600 });
    expect(new URL(far.url).searchParams.get('X-Amz-Expires')).toBe(String(7 * 24 * 3600));
  });

  it('SEGURIDAD: rechaza claves que podrían salirse del prefijo del taller o del bucket', async () => {
    for (const key of [
      'shops/s1/../../otro-bucket/x.jpg',
      '../x.jpg',
      'shops/./x.jpg',
      '/shops/x.jpg',
      'shops//x.jpg',
      'shops/s1/x y.jpg',
      'shops/s1/x?y=1',
      'shops/s1/%2e%2e/x',
      '',
    ]) {
      await expect(r2.createDownloadUrl(key)).rejects.toThrow('Clave de almacenamiento inválida');
    }
    await expect(r2.createDownloadUrl('shops/s1/wo-1/photo_2.v1.jpg')).resolves.toBeDefined();
  });
});

describe('buildStorage', () => {
  const cfg = (values: Record<string, string>) => ({ get: (k: string) => values[k] }) as never;
  const full = {
    R2_ACCOUNT_ID: 'a',
    R2_ACCESS_KEY_ID: 'b',
    R2_SECRET_ACCESS_KEY: 'c',
    R2_BUCKET: 'd',
  };

  it('con las 4 variables → R2', () => {
    expect(buildStorage(cfg(full)).provider).toBe('r2');
  });

  it('producción sin R2 → no arranca (fail-closed), nombrando lo que falta', () => {
    expect(() => buildStorage(cfg({ NODE_ENV: 'production', R2_BUCKET: 'd' }))).toThrow(
      'Faltan variables de R2 en producción: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY',
    );
  });

  it('dev sin R2 → arranca, pero usar archivos responde 503', async () => {
    const storage = buildStorage(cfg({ ...full, R2_SECRET_ACCESS_KEY: '  ' }));
    expect(storage.provider).toBe('unconfigured');
    await expect(storage.createDownloadUrl('x')).rejects.toThrow(ServiceUnavailableException);
  });
});
