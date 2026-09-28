import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Vehicle } from '@prisma/client';
import type { DecodedVehicleView, Page, VehicleView } from '@repo/types';
import { isUUID } from 'class-validator';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { isValidVinFormat, normalizeVin } from '../vin/vin';
import { INVALID_VIN_MESSAGE, VinService } from '../vin/vin.service';
import { normalizeChassis, normalizePlate } from './vehicle-identifiers';

/** Campos editables. `null` borra el dato; `undefined` no lo toca (PATCH). */
export interface VehicleInput {
  customer_id?: string;
  vin?: string | null;
  chassis_number?: string | null;
  plate?: string | null;
  make?: string;
  model?: string | null;
  year?: number | null;
  trim?: string | null;
  engine?: string | null;
  fuel_type?: string | null;
  color?: string | null;
  mileage_km?: number | null;
  notes?: string | null;
}

type Identifiers = Pick<Vehicle, 'vin' | 'chassis_number' | 'plate'>;

const NOT_FOUND = 'Vehículo no encontrado';
const NEEDS_IDENTIFIER = 'Indica al menos un identificador: VIN, número de chasis o placa.';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const TECH_FIELDS = ['model', 'year', 'trim', 'engine', 'fuel_type'] as const;

/** Texto sin espacios de más (vacío → null); números y null pasan tal cual. */
const clean = <T>(v: T): T | null => (typeof v === 'string' ? ((v.trim() || null) as T | null) : v);

export function toVehicleView(v: Vehicle): VehicleView {
  return {
    id: v.id,
    customer_id: v.customer_id,
    vin: v.vin,
    chassis_number: v.chassis_number,
    plate: v.plate,
    make: v.make,
    model: v.model,
    year: v.year,
    trim: v.trim,
    engine: v.engine,
    fuel_type: v.fuel_type,
    color: v.color,
    mileage_km: v.mileage_km,
    data_source: v.data_source,
    notes: v.notes,
    created_at: v.created_at.toISOString(),
    updated_at: v.updated_at.toISOString(),
  };
}

/**
 * Vehículos de un taller. Como en clientes, TODA consulta filtra por
 * `shop_id`; además la FK compuesta (customer_id, shop_id) impide en la DB
 * asignar un vehículo a un cliente de otro taller.
 */
@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customers: CustomersService,
    private readonly vin: VinService,
  ) {}

  /**
   * Alta. Con VIN se autocompleta (caché/NHTSA); lo escrito a mano tiene
   * prioridad sobre lo decodificado. Si no hay decodificación, la marca es
   * obligatoria.
   */
  async create(shopId: string, input: VehicleInput & { customer_id: string }): Promise<VehicleView> {
    await this.customers.assertInShop(shopId, input.customer_id);
    const ids = this.normalizeIdentifiers(input);
    if (!ids.vin && !ids.chassis_number && !ids.plate) throw new BadRequestException(NEEDS_IDENTIFIER);

    let decoded: DecodedVehicleView | null = null;
    if (ids.vin) decoded = (await this.vin.decode(ids.vin)).vehicle;

    const make = clean(input.make) ?? decoded?.make;
    if (!make) {
      throw new BadRequestException(
        ids.vin
          ? 'No se pudo decodificar el VIN: indica la marca (y modelo/año) a mano.'
          : 'Indica la marca del vehículo.',
      );
    }

    // Lo escrito a mano (incluido null explícito) gana; si no vino, lo decodificado.
    const tech = Object.fromEntries(
      TECH_FIELDS.map((f) => [f, input[f] !== undefined ? clean(input[f]) : (decoded?.[f] ?? null)]),
    ) as Pick<Vehicle, (typeof TECH_FIELDS)[number]>;

    const data: Prisma.VehicleUncheckedCreateInput = {
      shop_id: shopId,
      customer_id: input.customer_id,
      vin: ids.vin ?? null,
      chassis_number: ids.chassis_number ?? null,
      plate: ids.plate ?? null,
      make,
      ...tech,
      color: clean(input.color) ?? null,
      mileage_km: input.mileage_km ?? null,
      notes: clean(input.notes) ?? null,
      data_source: decoded ? 'vin_decode' : 'manual',
    };
    try {
      return toVehicleView(await this.prisma.vehicle.create({ data }));
    } catch (error) {
      throw await this.toConflict(error, shopId, data);
    }
  }

  async update(shopId: string, vehicleId: string, input: VehicleInput): Promise<VehicleView> {
    const current = await this.getOrThrow(shopId, vehicleId);
    if (input.customer_id !== undefined) await this.customers.assertInShop(shopId, input.customer_id);

    const ids = this.normalizeIdentifiers(input);
    const after = { ...pick(current), ...ids };
    if (!after.vin && !after.chassis_number && !after.plate) throw new BadRequestException(NEEDS_IDENTIFIER);

    const data: Prisma.VehicleUncheckedUpdateInput = { ...ids };
    if (input.customer_id !== undefined) data.customer_id = input.customer_id;
    if (input.make !== undefined) {
      const make = clean(input.make);
      if (!make) throw new BadRequestException('La marca no puede quedar vacía.');
      data.make = make;
    }
    for (const f of [...TECH_FIELDS, 'color', 'notes'] as const) {
      if (input[f] !== undefined) data[f] = clean(input[f]);
    }
    if (input.mileage_km !== undefined) data.mileage_km = input.mileage_km;

    try {
      return toVehicleView(await this.prisma.vehicle.update({ where: { id: current.id }, data }));
    } catch (error) {
      throw await this.toConflict(error, shopId, { ...after }, current.id);
    }
  }

  async get(shopId: string, vehicleId: string): Promise<VehicleView> {
    return toVehicleView(await this.getOrThrow(shopId, vehicleId));
  }

  /**
   * Búsqueda por placa, VIN, chasis (parciales) o marca/modelo; opcionalmente
   * solo los de un cliente. Del más nuevo al más viejo, paginado por cursor.
   */
  async search(
    shopId: string,
    opts: { q?: string; customerId?: string; limit?: number; cursor?: string },
  ): Promise<Page<VehicleView>> {
    if (opts.customerId) await this.customers.assertInShop(shopId, opts.customerId);
    const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const q = opts.q?.trim();
    const compact = q?.toUpperCase().replace(/[^A-Z0-9]/g, '') ?? '';

    const or: Prisma.VehicleWhereInput[] = [];
    if (q) {
      or.push({ make: { contains: q, mode: 'insensitive' } }, { model: { contains: q, mode: 'insensitive' } });
    }
    if (compact.length >= 3) {
      or.push({ plate: { contains: compact } }, { vin: { contains: compact } }, { chassis_number: { contains: q!.toUpperCase().replace(/\s+/g, '') } });
    }

    const rows = await this.prisma.vehicle.findMany({
      where: {
        shop_id: shopId,
        ...(opts.customerId ? { customer_id: opts.customerId } : {}),
        ...(or.length ? { OR: or } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(opts.cursor && isUUID(opts.cursor) ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, limit);
    return {
      items: items.map(toVehicleView),
      next_cursor: rows.length > limit ? items[items.length - 1].id : null,
    };
  }

  private async getOrThrow(shopId: string, vehicleId: string): Promise<Vehicle> {
    const vehicle = isUUID(vehicleId)
      ? await this.prisma.vehicle.findFirst({ where: { id: vehicleId, shop_id: shopId } })
      : null;
    if (!vehicle) throw new NotFoundException(NOT_FOUND);
    return vehicle;
  }

  /** Normaliza solo lo que vino (PATCH); 400 si algo no es válido. */
  private normalizeIdentifiers(input: VehicleInput): Partial<Identifiers> {
    const out: Partial<Identifiers> = {};
    if (input.vin !== undefined) {
      const vin = input.vin === null ? null : normalizeVin(input.vin);
      if (vin !== null && !isValidVinFormat(vin)) throw new BadRequestException(INVALID_VIN_MESSAGE);
      out.vin = vin || null;
    }
    if (input.chassis_number !== undefined) {
      const chassis = input.chassis_number === null ? null : normalizeChassis(input.chassis_number);
      if (input.chassis_number !== null && !chassis) {
        throw new BadRequestException('Número de chasis inválido: 5 a 25 letras, números o guiones.');
      }
      out.chassis_number = chassis;
    }
    if (input.plate !== undefined) {
      const plate = input.plate === null ? null : normalizePlate(input.plate);
      if (input.plate !== null && !plate) {
        throw new BadRequestException('Placa inválida: 4 a 10 letras o números (p. ej. A123456).');
      }
      out.plate = plate;
    }
    return out;
  }

  /** P2002 (UNIQUE por taller) → 409 con el id del vehículo que ya existe. */
  private async toConflict(
    error: unknown,
    shopId: string,
    ids: Partial<Identifiers>,
    selfId?: string,
  ): Promise<unknown> {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') return error;
    const or = (['vin', 'chassis_number', 'plate'] as const)
      .filter((k) => ids[k])
      .map((k) => ({ [k]: ids[k] }) as Prisma.VehicleWhereInput);
    const existing = await this.prisma.vehicle.findFirst({
      where: { shop_id: shopId, OR: or, ...(selfId ? { NOT: { id: selfId } } : {}) },
    });
    return new ConflictException({
      message: 'Ya existe un vehículo en este taller con ese VIN, chasis o placa.',
      existing_vehicle_id: existing?.id ?? null,
    });
  }
}

const pick = (v: Vehicle): Identifiers => ({ vin: v.vin, chassis_number: v.chassis_number, plate: v.plate });
