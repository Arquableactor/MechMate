import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { InspectionFinding, InspectionPhoto, Prisma } from '@prisma/client';
import {
  type FindingSeverity,
  type InspectionFindingView,
  type InspectionPhotoView,
  type InspectionView,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_FINDING,
  PHOTO_CONTENT_TYPES,
  type PhotoContentType,
  type PhotoUploadView,
} from '@repo/types';
import { isUUID } from 'class-validator';
import { uuid7 } from '../common/uuid7';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage-provider.interface';
import { WorkOrdersService } from '../work-orders/work-orders.service';

export interface FindingInput {
  area?: string;
  title?: string;
  severity?: FindingSeverity;
  notes?: string | null;
}

const EXTENSION: Record<PhotoContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

const FINDING_NOT_FOUND = 'Hallazgo no encontrado';
const PHOTO_NOT_FOUND = 'Foto no encontrada';

const text = (v: string | null | undefined) => (typeof v === 'string' ? v.trim() || null : v);

/**
 * Clave en R2 de una foto. SIEMPRE bajo `shops/<shopId>/` (un CHECK de la DB
 * lo exige): así una foto no puede apuntar a la carpeta de otro taller.
 */
export function photoKey(p: {
  shopId: string;
  workOrderId: string;
  findingId: string;
  photoId: string;
  contentType: PhotoContentType;
}): string {
  return `shops/${p.shopId}/work-orders/${p.workOrderId}/findings/${p.findingId}/${p.photoId}.${EXTENSION[p.contentType]}`;
}

/**
 * DVI: una inspección por OT, con hallazgos (verde/amarillo/rojo) y fotos en
 * R2. Las fotos se suben en dos pasos: (1) la API crea la foto `pending` y da
 * una URL firmada (tipo y tamaño firmados); (2) el cliente sube directo a R2 y
 * confirma: la API verifica EN R2 que el archivo existe y coincide.
 */
@Injectable()
export class InspectionsService {
  private readonly logger = new Logger(InspectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workOrders: WorkOrdersService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /** Crea la inspección de la OT (o devuelve la existente: idempotente). */
  async open(shopId: string, workOrderId: string, createdBy: string, notes?: string | null): Promise<InspectionView> {
    await this.assertEditableWorkOrder(shopId, workOrderId);
    await this.prisma.inspection.createMany({
      data: [{ shop_id: shopId, work_order_id: workOrderId, notes: text(notes) ?? null, created_by_account_id: createdBy }],
      skipDuplicates: true,
    });
    return this.get(shopId, workOrderId);
  }

  async get(shopId: string, workOrderId: string): Promise<InspectionView> {
    const inspection = await this.prisma.inspection.findFirst({
      where: { work_order_id: workOrderId, shop_id: shopId },
      include: { findings: { orderBy: { id: 'asc' }, include: { photos: { orderBy: { id: 'asc' } } } } },
    });
    if (!inspection) throw new NotFoundException('La OT no tiene inspección');

    return {
      id: inspection.id,
      work_order_id: inspection.work_order_id,
      notes: inspection.notes,
      findings: await Promise.all(inspection.findings.map((f) => this.toFindingView(f))),
      created_at: inspection.created_at.toISOString(),
      updated_at: inspection.updated_at.toISOString(),
    };
  }

  async addFinding(shopId: string, workOrderId: string, input: Required<Pick<FindingInput, 'area' | 'title' | 'severity'>> & FindingInput): Promise<InspectionView> {
    const inspection = await this.editableInspection(shopId, workOrderId);
    const area = text(input.area);
    const title = text(input.title);
    if (!area || !title) throw new BadRequestException('Área y título del hallazgo son obligatorios.');
    await this.prisma.inspectionFinding.create({
      data: {
        shop_id: shopId,
        inspection_id: inspection.id,
        area,
        title,
        severity: input.severity,
        notes: text(input.notes) ?? null,
      },
    });
    return this.get(shopId, workOrderId);
  }

  async updateFinding(shopId: string, workOrderId: string, findingId: string, input: FindingInput): Promise<InspectionView> {
    const finding = await this.findingOrThrow(shopId, workOrderId, findingId);
    const data: Prisma.InspectionFindingUpdateInput = {};
    for (const field of ['area', 'title'] as const) {
      if (input[field] !== undefined) {
        const value = text(input[field]);
        if (!value) throw new BadRequestException(`${field} no puede quedar vacío.`);
        data[field] = value;
      }
    }
    if (input.severity !== undefined) data.severity = input.severity;
    if (input.notes !== undefined) data.notes = text(input.notes);
    await this.prisma.inspectionFinding.update({ where: { id: finding.id }, data });
    return this.get(shopId, workOrderId);
  }

  /** Borra el hallazgo con sus fotos (en la DB y en R2). */
  async removeFinding(shopId: string, workOrderId: string, findingId: string): Promise<InspectionView> {
    const finding = await this.findingOrThrow(shopId, workOrderId, findingId);
    const photos = await this.prisma.inspectionPhoto.findMany({ where: { finding_id: finding.id } });
    await this.prisma.inspectionFinding.delete({ where: { id: finding.id } });
    await this.deleteFiles(photos);
    return this.get(shopId, workOrderId);
  }

  /** Paso 1: registra la foto como pending y devuelve la URL firmada para subirla. */
  async requestPhotoUpload(
    shopId: string,
    workOrderId: string,
    findingId: string,
    input: { content_type: string; size_bytes: number },
  ): Promise<PhotoUploadView> {
    if (!(PHOTO_CONTENT_TYPES as readonly string[]).includes(input.content_type)) {
      throw new BadRequestException(`Tipo de foto no permitido. Usa: ${PHOTO_CONTENT_TYPES.join(', ')}.`);
    }
    if (!Number.isInteger(input.size_bytes) || input.size_bytes < 1 || input.size_bytes > MAX_PHOTO_BYTES) {
      throw new BadRequestException(`La foto debe pesar entre 1 byte y ${MAX_PHOTO_BYTES / (1024 * 1024)} MB.`);
    }
    const finding = await this.findingOrThrow(shopId, workOrderId, findingId);
    if ((await this.prisma.inspectionPhoto.count({ where: { finding_id: finding.id } })) >= MAX_PHOTOS_PER_FINDING) {
      throw new ConflictException(`Máximo ${MAX_PHOTOS_PER_FINDING} fotos por hallazgo.`);
    }

    const contentType = input.content_type as PhotoContentType;
    // El id va dentro de la clave en R2, así que se genera antes del INSERT (v7, como toda PK).
    const id = uuid7();
    const key = photoKey({ shopId, workOrderId, findingId: finding.id, photoId: id, contentType });
    const upload = await this.storage.createUploadUrl(key, { contentType, sizeBytes: input.size_bytes });
    const photo = await this.prisma.inspectionPhoto.create({
      data: {
        id,
        shop_id: shopId,
        finding_id: finding.id,
        storage_key: key,
        content_type: contentType,
        size_bytes: input.size_bytes,
      },
    });
    return {
      photo: await this.toPhotoView(photo),
      upload: { url: upload.url, method: upload.method, headers: upload.headers, expires_at: upload.expiresAt },
    };
  }

  /**
   * Paso 2: el cliente avisa que subió. Se verifica EN R2 que el archivo existe
   * con el tamaño y tipo declarados; solo entonces pasa a `uploaded`.
   * Idempotente: confirmar dos veces no falla.
   */
  async confirmPhoto(shopId: string, workOrderId: string, findingId: string, photoId: string): Promise<InspectionPhotoView> {
    const photo = await this.photoOrThrow(shopId, workOrderId, findingId, photoId);
    if (photo.status === 'uploaded') return this.toPhotoView(photo);

    const stored = await this.storage.headObject(photo.storage_key);
    if (!stored) throw new ConflictException('La foto todavía no se subió: sube el archivo y vuelve a confirmar.');
    if (stored.sizeBytes !== photo.size_bytes || stored.contentType !== photo.content_type) {
      throw new ConflictException('El archivo subido no coincide con el tamaño o tipo declarados.');
    }
    const updated = await this.prisma.inspectionPhoto.update({
      where: { id: photo.id },
      data: { status: 'uploaded', uploaded_at: new Date() },
    });
    return this.toPhotoView(updated);
  }

  async removePhoto(shopId: string, workOrderId: string, findingId: string, photoId: string): Promise<InspectionView> {
    const photo = await this.photoOrThrow(shopId, workOrderId, findingId, photoId);
    await this.prisma.inspectionPhoto.delete({ where: { id: photo.id } });
    await this.deleteFiles([photo]);
    return this.get(shopId, workOrderId);
  }

  // --- helpers ---

  private async assertEditableWorkOrder(shopId: string, workOrderId: string): Promise<void> {
    this.workOrders.assertEditable(await this.workOrders.getOrThrow(shopId, workOrderId));
  }

  private async editableInspection(shopId: string, workOrderId: string) {
    await this.assertEditableWorkOrder(shopId, workOrderId);
    const inspection = await this.prisma.inspection.findFirst({ where: { work_order_id: workOrderId, shop_id: shopId } });
    if (!inspection) throw new NotFoundException('La OT no tiene inspección: ábrela primero.');
    return inspection;
  }

  /** Hallazgo de la inspección de ESTA OT de ESTE taller (y OT editable). */
  private async findingOrThrow(shopId: string, workOrderId: string, findingId: string): Promise<InspectionFinding> {
    const inspection = await this.editableInspection(shopId, workOrderId);
    const finding = isUUID(findingId)
      ? await this.prisma.inspectionFinding.findFirst({ where: { id: findingId, inspection_id: inspection.id, shop_id: shopId } })
      : null;
    if (!finding) throw new NotFoundException(FINDING_NOT_FOUND);
    return finding;
  }

  private async photoOrThrow(shopId: string, workOrderId: string, findingId: string, photoId: string): Promise<InspectionPhoto> {
    const finding = await this.findingOrThrow(shopId, workOrderId, findingId);
    const photo = isUUID(photoId)
      ? await this.prisma.inspectionPhoto.findFirst({ where: { id: photoId, finding_id: finding.id, shop_id: shopId } })
      : null;
    if (!photo) throw new NotFoundException(PHOTO_NOT_FOUND);
    return photo;
  }

  /** Borra archivos en R2 sin tumbar la operación: un huérfano en R2 no es grave; un 500 al usuario sí. */
  private async deleteFiles(photos: InspectionPhoto[]): Promise<void> {
    for (const p of photos) {
      await this.storage.deleteObject(p.storage_key).catch((error: unknown) =>
        this.logger.warn(`No se pudo borrar ${p.storage_key} en R2: ${error instanceof Error ? error.message : String(error)}`),
      );
    }
  }

  private async toFindingView(f: InspectionFinding & { photos: InspectionPhoto[] }): Promise<InspectionFindingView> {
    return {
      id: f.id,
      area: f.area,
      title: f.title,
      severity: f.severity,
      notes: f.notes,
      photos: await Promise.all(f.photos.map((p) => this.toPhotoView(p))),
      created_at: f.created_at.toISOString(),
    };
  }

  private async toPhotoView(p: InspectionPhoto): Promise<InspectionPhotoView> {
    const download = p.status === 'uploaded' ? await this.storage.createDownloadUrl(p.storage_key) : null;
    return {
      id: p.id,
      status: p.status,
      content_type: p.content_type,
      size_bytes: p.size_bytes,
      url: download?.url ?? null,
      url_expires_at: download?.expiresAt ?? null,
      created_at: p.created_at.toISOString(),
    };
  }
}
