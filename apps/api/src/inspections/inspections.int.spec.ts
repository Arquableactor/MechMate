import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { AccountsService } from '../accounts/accounts.service';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import type { StorageProvider, StoredObject } from '../storage/storage-provider.interface';
import { VehiclesService } from '../vehicles/vehicles.service';
import type { VinService } from '../vin/vin.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { InspectionsService } from './inspections.service';

/** Almacenamiento falso en memoria que se comporta como R2 (sin red en CI). */
class FakeStorage implements StorageProvider {
  readonly provider = 'fake';
  readonly objects = new Map<string, StoredObject>();
  /** Simula el PUT que haría el teléfono con la URL firmada. */
  put(key: string, sizeBytes: number, contentType: string) {
    this.objects.set(key, { sizeBytes, contentType });
  }
  async createUploadUrl(key: string, opts: { contentType: string; sizeBytes: number }) {
    return {
      url: `https://fake.r2/${key}?sig=1`,
      method: 'PUT' as const,
      headers: { 'content-type': opts.contentType, 'content-length': String(opts.sizeBytes) },
      expiresAt: new Date(Date.now() + 900_000).toISOString(),
    };
  }
  async createDownloadUrl(key: string) {
    return { url: `https://fake.r2/${key}?get=1`, expiresAt: new Date(Date.now() + 3_600_000).toISOString() };
  }
  async headObject(key: string) {
    return this.objects.get(key) ?? null;
  }
  async deleteObject(key: string) {
    this.objects.delete(key);
  }
}

let prisma: PrismaService;
let storage: FakeStorage;
let inspections: InspectionsService;
let workOrders: WorkOrdersService;
let shops: ShopsService;
let customers: CustomersService;
let vehicles: VehiclesService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  storage = new FakeStorage();
  shops = new ShopsService(prisma, new AccountsService(prisma));
  customers = new CustomersService(prisma);
  vehicles = new VehiclesService(prisma, customers, {} as VinService);
  workOrders = new WorkOrdersService(prisma, customers, vehicles, shops);
  inspections = new InspectionsService(prisma, workOrders, storage);
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function newWorkOrder() {
  const owner = await prisma.account.create({ data: { auth0_sub: `auth0|${randomUUID()}` } });
  const shopId = (await shops.create(owner.id, { name: 'Taller', type: 'mechanic_shop' })).id;
  const customer = await customers.create(shopId, { full_name: 'Cliente' });
  const vehicle = await vehicles.create(shopId, {
    customer_id: customer.id,
    plate: `D${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    make: 'Mazda',
  });
  const wo = await workOrders.create(shopId, owner.id, { customer_id: customer.id, vehicle_id: vehicle.id, complaint: 'Revisión' });
  return { shopId, woId: wo.id, ownerId: owner.id };
}

const brakes = { area: 'Frenos', title: 'Pastillas al 20%', severity: 'urgent' as const };

async function withFinding() {
  const ctx = await newWorkOrder();
  await inspections.open(ctx.shopId, ctx.woId, ctx.ownerId);
  const view = await inspections.addFinding(ctx.shopId, ctx.woId, brakes);
  return { ...ctx, findingId: view.findings[0].id };
}

describe('DVI (integración, Postgres real + almacenamiento falso)', () => {
  it('abrir es idempotente; antes de abrir, 404', async () => {
    const { shopId, woId, ownerId } = await newWorkOrder();
    await expect(inspections.get(shopId, woId)).rejects.toThrow(NotFoundException);

    const a = await inspections.open(shopId, woId, ownerId, 'Revisión de 20 puntos');
    const b = await inspections.open(shopId, woId, ownerId);
    expect(b.id).toBe(a.id);
    expect(b).toMatchObject({ work_order_id: woId, notes: 'Revisión de 20 puntos', findings: [] });
  });

  it('hallazgos: agregar, editar y borrar', async () => {
    const { shopId, woId, findingId } = await withFinding();
    await inspections.addFinding(shopId, woId, { area: 'Luces', title: 'Faro trasero ok', severity: 'ok' });

    const edited = await inspections.updateFinding(shopId, woId, findingId, { severity: 'attention', notes: 'Revisar en 1 mes' });
    expect(edited.findings.map((f) => [f.area, f.severity])).toEqual([
      ['Frenos', 'attention'],
      ['Luces', 'ok'],
    ]);
    expect(edited.findings[0].notes).toBe('Revisar en 1 mes');

    const removed = await inspections.removeFinding(shopId, woId, findingId);
    expect(removed.findings.map((f) => f.area)).toEqual(['Luces']);
  });

  describe('fotos (subida en dos pasos)', () => {
    it('pedir subida → pending con clave bajo la carpeta del taller y id v7', async () => {
      const { shopId, woId, findingId } = await withFinding();
      const { photo, upload } = await inspections.requestPhotoUpload(shopId, woId, findingId, {
        content_type: 'image/jpeg',
        size_bytes: 2048,
      });

      expect(photo).toMatchObject({ status: 'pending', url: null, size_bytes: 2048 });
      expect(isUUID(photo.id, 7)).toBe(true);
      expect(upload.url).toContain(`shops/${shopId}/work-orders/${woId}/findings/${findingId}/${photo.id}.jpg`);
      expect(upload.headers).toEqual({ 'content-type': 'image/jpeg', 'content-length': '2048' });
    });

    it('confirmar: 409 si no se subió o no coincide; OK si coincide (y es idempotente)', async () => {
      const { shopId, woId, findingId } = await withFinding();
      const { photo } = await inspections.requestPhotoUpload(shopId, woId, findingId, { content_type: 'image/png', size_bytes: 500 });
      const key = (await prisma.inspectionPhoto.findUniqueOrThrow({ where: { id: photo.id } })).storage_key;

      await expect(inspections.confirmPhoto(shopId, woId, findingId, photo.id)).rejects.toThrow(/todavía no se subió/);
      storage.put(key, 999, 'image/png');
      await expect(inspections.confirmPhoto(shopId, woId, findingId, photo.id)).rejects.toThrow(/no coincide/);

      storage.put(key, 500, 'image/png');
      const confirmed = await inspections.confirmPhoto(shopId, woId, findingId, photo.id);
      expect(confirmed).toMatchObject({ status: 'uploaded' });
      expect(confirmed.url).toContain(key);
      expect((await inspections.confirmPhoto(shopId, woId, findingId, photo.id)).status).toBe('uploaded');

      const view = await inspections.get(shopId, woId);
      expect(view.findings[0].photos[0]).toMatchObject({ id: photo.id, status: 'uploaded' });
    });

    it('límites: tipo y tamaño (400), máximo 10 fotos por hallazgo (409)', async () => {
      const { shopId, woId, findingId } = await withFinding();
      for (const bad of [
        { content_type: 'video/mp4', size_bytes: 100 },
        { content_type: 'image/gif', size_bytes: 100 },
        { content_type: 'image/jpeg', size_bytes: 0 },
        { content_type: 'image/jpeg', size_bytes: 10 * 1024 * 1024 + 1 },
      ]) {
        await expect(inspections.requestPhotoUpload(shopId, woId, findingId, bad)).rejects.toThrow(BadRequestException);
      }
      for (let i = 0; i < 10; i++) {
        await inspections.requestPhotoUpload(shopId, woId, findingId, { content_type: 'image/heic', size_bytes: 100 });
      }
      await expect(
        inspections.requestPhotoUpload(shopId, woId, findingId, { content_type: 'image/heic', size_bytes: 100 }),
      ).rejects.toThrow(/Máximo 10 fotos/);
    });

    it('borrar foto o hallazgo también borra el archivo en el almacenamiento', async () => {
      const { shopId, woId, findingId } = await withFinding();
      const keyOf = async (id: string) => (await prisma.inspectionPhoto.findUniqueOrThrow({ where: { id } })).storage_key;
      const a = (await inspections.requestPhotoUpload(shopId, woId, findingId, { content_type: 'image/jpeg', size_bytes: 10 })).photo;
      const b = (await inspections.requestPhotoUpload(shopId, woId, findingId, { content_type: 'image/jpeg', size_bytes: 10 })).photo;
      const [keyA, keyB] = [await keyOf(a.id), await keyOf(b.id)];
      storage.put(keyA, 10, 'image/jpeg');
      storage.put(keyB, 10, 'image/jpeg');

      await inspections.removePhoto(shopId, woId, findingId, a.id);
      expect(storage.objects.has(keyA)).toBe(false);
      await inspections.removeFinding(shopId, woId, findingId);
      expect(storage.objects.has(keyB)).toBe(false);
      expect(await prisma.inspectionPhoto.count({ where: { id: { in: [a.id, b.id] } } })).toBe(0);
    });
  });

  it('OT cerrada: no se editan hallazgos ni fotos (409)', async () => {
    const { shopId, woId, findingId } = await withFinding();
    await prisma.workOrder.update({ where: { id: woId }, data: { status: 'cancelled', cancelled_at: new Date() } });

    await expect(inspections.addFinding(shopId, woId, brakes)).rejects.toThrow(ConflictException);
    await expect(inspections.updateFinding(shopId, woId, findingId, { title: 'x' })).rejects.toThrow(ConflictException);
    await expect(
      inspections.requestPhotoUpload(shopId, woId, findingId, { content_type: 'image/jpeg', size_bytes: 10 }),
    ).rejects.toThrow(ConflictException);
    // Pero sí se puede CONSULTAR (historial).
    await expect(inspections.get(shopId, woId)).resolves.toBeDefined();
  });

  describe('aislamiento', () => {
    it('otro taller, hallazgo de otra OT o foto de otro hallazgo → 404', async () => {
      const a = await withFinding();
      const b = await withFinding();
      const photoOfA = (await inspections.requestPhotoUpload(a.shopId, a.woId, a.findingId, { content_type: 'image/jpeg', size_bytes: 10 })).photo;

      await expect(inspections.get(b.shopId, a.woId)).rejects.toThrow(NotFoundException);
      await expect(inspections.addFinding(b.shopId, a.woId, brakes)).rejects.toThrow(NotFoundException);
      await expect(inspections.updateFinding(b.shopId, b.woId, a.findingId, { title: 'x' })).rejects.toThrow(NotFoundException);
      await expect(inspections.confirmPhoto(b.shopId, b.woId, b.findingId, photoOfA.id)).rejects.toThrow(NotFoundException);
      await expect(inspections.removePhoto(a.shopId, a.woId, 'no-uuid', photoOfA.id)).rejects.toThrow(NotFoundException);
    });

    it('la DB rechaza una foto cuya clave apunte a la carpeta de OTRO taller (CHECK)', async () => {
      const a = await withFinding();
      const b = await withFinding();
      await expect(
        prisma.inspectionPhoto.create({
          data: {
            shop_id: a.shopId,
            finding_id: a.findingId,
            storage_key: `shops/${b.shopId}/robada.jpg`,
            content_type: 'image/jpeg',
            size_bytes: 10,
          },
        }),
      ).rejects.toThrow(/inspection_photos_key_tenant_check/);
    });
  });
});
