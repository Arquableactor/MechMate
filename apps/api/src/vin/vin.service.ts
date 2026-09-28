import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import type { Prisma, VinDecode } from '@prisma/client';
import type { DecodedVehicleView, VinDecodeView } from '@repo/types';
import { PrismaService } from '../prisma/prisma.service';
import { hasValidCheckDigit, isValidVinFormat, normalizeVin } from './vin';
import { VIN_DECODER, type VinDecoder } from './vin-decoder.interface';

export const INVALID_VIN_MESSAGE =
  'VIN inválido: deben ser 17 caracteres sin I, O ni Q. Si es un número de chasis ' +
  '(p. ej. vehículos japoneses), registra el vehículo a mano.';

const CHECK_DIGIT_WARNING =
  'El dígito verificador (posición 9) no cuadra: revisa que el VIN esté bien escrito. ' +
  'En vehículos fuera de Norteamérica puede ser normal.';

function toVehicleView(d: VinDecode): DecodedVehicleView {
  return {
    make: d.make,
    model: d.model,
    year: d.year,
    trim: d.trim,
    engine: d.engine,
    fuel_type: d.fuel_type,
    body_class: d.body_class,
    drive_type: d.drive_type,
    transmission: d.transmission,
  };
}

/**
 * Decodifica VINs con caché global. Nunca bloquea el flujo del taller: si el
 * proveedor no conoce el VIN o está caído, responde `found: false` (y
 * `provider_unavailable`) para que el vehículo se cargue a mano. Solo un VIN
 * con formato inválido es error (400).
 */
@Injectable()
export class VinService {
  private readonly logger = new Logger(VinService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(VIN_DECODER) private readonly decoder: VinDecoder,
  ) {}

  async decode(input: string): Promise<VinDecodeView> {
    const vin = normalizeVin(input);
    if (!isValidVinFormat(vin)) throw new BadRequestException(INVALID_VIN_MESSAGE);

    const checkDigitValid = hasValidCheckDigit(vin);
    const base = {
      vin,
      check_digit_valid: checkDigitValid,
      warnings: checkDigitValid ? [] : [CHECK_DIGIT_WARNING],
    };

    const cached = await this.prisma.vinDecode.findUnique({ where: { vin } });
    if (cached) {
      return { ...base, found: true, source: 'cache', provider_unavailable: false, vehicle: toVehicleView(cached) };
    }

    let decoded;
    try {
      decoded = await this.decoder.decode(vin);
    } catch (error) {
      this.logger.warn(
        `${this.decoder.provider} no disponible para ${vin}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { ...base, found: false, source: null, provider_unavailable: true, vehicle: null };
    }
    if (!decoded) {
      return { ...base, found: false, source: null, provider_unavailable: false, vehicle: null };
    }

    const data = {
      provider: this.decoder.provider,
      make: decoded.make,
      model: decoded.model,
      year: decoded.year,
      trim: decoded.trim,
      engine: decoded.engine,
      fuel_type: decoded.fuelType,
      body_class: decoded.bodyClass,
      drive_type: decoded.driveType,
      transmission: decoded.transmission,
      provider_warnings: decoded.warnings,
      raw: decoded.raw as Prisma.InputJsonValue,
    };
    // upsert: dos consultas simultáneas del mismo VIN no chocan en el UNIQUE.
    const saved = await this.prisma.vinDecode.upsert({
      where: { vin },
      create: { vin, ...data },
      update: {},
    });
    return {
      ...base,
      found: true,
      source: this.decoder.provider,
      provider_unavailable: false,
      vehicle: toVehicleView(saved),
    };
  }
}
