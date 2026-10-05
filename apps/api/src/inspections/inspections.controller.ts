import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import {
  FINDING_SEVERITIES,
  type FindingSeverity,
  type InspectionPhotoView,
  type InspectionView,
  MAX_PHOTO_BYTES,
  PHOTO_CONTENT_TYPES,
  type PhotoUploadView,
} from '@repo/types';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { ShopAccessGuard } from '../shops/shop-access.guard';
import { AssignedWorkOrderGuard } from '../work-orders/assigned-work-order.guard';
import { InspectionsService } from './inspections.service';

export class OpenInspectionDto {
  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 2000 })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}

export class AddFindingDto {
  @ApiProperty({ example: 'Frenos', maxLength: 60 })
  @IsString()
  @Length(1, 60)
  area!: string;

  @ApiProperty({ example: 'Pastillas delanteras al 20%', maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiProperty({ enum: FINDING_SEVERITIES, example: 'urgent', description: 'ok = verde, attention = amarillo, urgent = rojo.' })
  @IsIn(FINDING_SEVERITIES as readonly string[])
  severity!: FindingSeverity;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 2000 })
  @ValidateIf((_, v) => v !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}

export class UpdateFindingDto extends PartialType(AddFindingDto) {}

export class RequestPhotoUploadDto {
  @ApiProperty({ enum: PHOTO_CONTENT_TYPES, example: 'image/jpeg' })
  @IsIn(PHOTO_CONTENT_TYPES as readonly string[], { message: `content_type debe ser: ${PHOTO_CONTENT_TYPES.join(', ')}.` })
  content_type!: string;

  @ApiProperty({ example: 2_450_000, maximum: MAX_PHOTO_BYTES, description: 'Tamaño EXACTO del archivo en bytes (queda firmado).' })
  @IsInt()
  @Min(1)
  @Max(MAX_PHOTO_BYTES)
  size_bytes!: number;
}

@ApiTags('inspections')
@ApiBearerAuth()
// Mecánico: solo en sus OT asignadas; asesor también (fotos al recibir el vehículo).
@UseGuards(JwtAuthGuard, ShopAccessGuard, AssignedWorkOrderGuard)
@Controller('shops/:shopId/work-orders/:workOrderId/inspection')
export class InspectionsController {
  constructor(private readonly inspections: InspectionsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Abre la inspección (DVI) de la OT; si ya existe, la devuelve.' })
  @ApiOkResponse({ description: 'Inspección con hallazgos y fotos.' })
  @ApiView('InspectionView')
  open(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @CurrentUser() account: AuthenticatedAccount,
    @Body() dto: OpenInspectionDto,
  ): Promise<InspectionView> {
    return this.inspections.open(shopId, workOrderId, account.id, dto.notes);
  }

  @Get()
  @ApiOperation({ summary: 'Inspección con hallazgos y fotos (URLs firmadas de 1 h).' })
  @ApiView('InspectionView')
  get(@Param('shopId') shopId: string, @Param('workOrderId') workOrderId: string): Promise<InspectionView> {
    return this.inspections.get(shopId, workOrderId);
  }

  @Post('findings')
  @ApiOperation({ summary: 'Agrega un hallazgo (área, título, severidad verde/amarillo/rojo).' })
  @ApiCreatedResponse({ description: 'Inspección actualizada.' })
  @ApiConflictResponse({ description: 'La OT ya está cerrada.' })
  @ApiView('InspectionView')
  addFinding(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Body() dto: AddFindingDto,
  ): Promise<InspectionView> {
    return this.inspections.addFinding(shopId, workOrderId, dto);
  }

  @Patch('findings/:findingId')
  @ApiOperation({ summary: 'Edita un hallazgo.' })
  @ApiView('InspectionView')
  updateFinding(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Param('findingId') findingId: string,
    @Body() dto: UpdateFindingDto,
  ): Promise<InspectionView> {
    return this.inspections.updateFinding(shopId, workOrderId, findingId, dto);
  }

  @Delete('findings/:findingId')
  @ApiOperation({ summary: 'Borra un hallazgo y sus fotos (también en R2).' })
  @ApiView('InspectionView')
  removeFinding(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Param('findingId') findingId: string,
  ): Promise<InspectionView> {
    return this.inspections.removeFinding(shopId, workOrderId, findingId);
  }

  @Post('findings/:findingId/photos')
  @ApiOperation({
    summary:
      'Paso 1 de subir una foto: devuelve una URL firmada (15 min) para hacer PUT directo a R2 con los headers indicados.',
  })
  @ApiCreatedResponse({ description: 'Foto pending + instrucciones de subida.' })
  @ApiView('PhotoUploadView')
  requestPhotoUpload(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Param('findingId') findingId: string,
    @Body() dto: RequestPhotoUploadDto,
  ): Promise<PhotoUploadView> {
    return this.inspections.requestPhotoUpload(shopId, workOrderId, findingId, dto);
  }

  @Post('findings/:findingId/photos/:photoId/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Paso 2: confirma la subida; la API verifica en R2 tamaño y tipo.' })
  @ApiConflictResponse({ description: 'Todavía no se subió, o no coincide con lo declarado.' })
  @ApiView('InspectionPhotoView')
  confirmPhoto(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Param('findingId') findingId: string,
    @Param('photoId') photoId: string,
  ): Promise<InspectionPhotoView> {
    return this.inspections.confirmPhoto(shopId, workOrderId, findingId, photoId);
  }

  @Delete('findings/:findingId/photos/:photoId')
  @ApiOperation({ summary: 'Borra una foto (también en R2).' })
  @ApiView('InspectionView')
  removePhoto(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @Param('findingId') findingId: string,
    @Param('photoId') photoId: string,
  ): Promise<InspectionView> {
    return this.inspections.removePhoto(shopId, workOrderId, findingId, photoId);
  }
}
