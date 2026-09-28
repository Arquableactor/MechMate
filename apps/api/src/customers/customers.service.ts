import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type Customer, Prisma } from '@prisma/client';
import type { CustomerSummary, CustomerView, Page } from '@repo/types';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeCedula, normalizeEmail, normalizeName, normalizePhone } from './contact-normalize';

export interface CustomerInput {
  full_name?: string;
  /** `null` borra el dato; `undefined` no lo toca (PATCH). */
  phone?: string | null;
  email?: string | null;
  document_id?: string | null;
  notes?: string | null;
}

const NOT_FOUND = 'Cliente no encontrado';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export function toCustomerView(c: Customer): CustomerView {
  return {
    id: c.id,
    full_name: c.full_name,
    phone: c.phone,
    email: c.email,
    document_id: c.document_id,
    account_id: c.account_id,
    notes: c.notes,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  };
}

/**
 * Clientes de un taller. TODA consulta va filtrada por `shop_id`: un cliente de
 * otro taller, para este servicio, no existe (404). El acceso al taller ya lo
 * validó ShopAccessGuard; esto es la segunda barrera del aislamiento.
 */
@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(shopId: string, input: CustomerInput & { full_name: string }): Promise<CustomerView> {
    const data = { shop_id: shopId, ...this.normalize(input) } as Prisma.CustomerUncheckedCreateInput;
    try {
      return toCustomerView(await this.prisma.customer.create({ data }));
    } catch (error) {
      throw await this.toConflict(error, shopId, data);
    }
  }

  async update(shopId: string, customerId: string, input: CustomerInput): Promise<CustomerView> {
    await this.getOrThrow(shopId, customerId);
    const data = this.normalize(input);
    try {
      return toCustomerView(await this.prisma.customer.update({ where: { id: customerId }, data }));
    } catch (error) {
      throw await this.toConflict(error, shopId, data, customerId);
    }
  }

  async get(shopId: string, customerId: string): Promise<CustomerView> {
    return toCustomerView(await this.getOrThrow(shopId, customerId));
  }

  /** Resúmenes en lote (una consulta), solo de este taller. Para listas de OT. */
  async getSummaries(shopId: string, ids: string[]): Promise<Map<string, CustomerSummary>> {
    const rows = await this.prisma.customer.findMany({
      where: { shop_id: shopId, id: { in: [...new Set(ids)] } },
      select: { id: true, full_name: true, phone: true },
    });
    return new Map(rows.map((r) => [r.id, r]));
  }

  /** Lanza 404 si el cliente no es de este taller (lo usa Vehículos). */
  async assertInShop(shopId: string, customerId: string): Promise<void> {
    await this.getOrThrow(shopId, customerId);
  }

  /**
   * Búsqueda por nombre, teléfono o cédula (lo que escriba el mecánico), del más
   * nuevo al más viejo, paginada por cursor (ids uuid v7 ⇒ orden temporal).
   */
  async search(
    shopId: string,
    opts: { q?: string; limit?: number; cursor?: string },
  ): Promise<Page<CustomerView>> {
    const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const q = opts.q?.trim();
    const digits = q?.replace(/\D/g, '') ?? '';

    const or: Prisma.CustomerWhereInput[] = [];
    if (q) or.push({ full_name: { contains: normalizeName(q), mode: 'insensitive' } });
    if (digits.length >= 3) {
      or.push({ phone: { contains: digits } }, { document_id: { startsWith: digits } });
    }
    if (q && q.includes('@')) or.push({ email: { contains: normalizeEmail(q) } });

    const rows = await this.prisma.customer.findMany({
      where: { shop_id: shopId, ...(or.length ? { OR: or } : {}) },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(opts.cursor && isUUID(opts.cursor) ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, limit);
    return {
      items: items.map(toCustomerView),
      next_cursor: rows.length > limit ? items[items.length - 1].id : null,
    };
  }

  private async getOrThrow(shopId: string, customerId: string): Promise<Customer> {
    const customer = isUUID(customerId)
      ? await this.prisma.customer.findFirst({ where: { id: customerId, shop_id: shopId } })
      : null;
    if (!customer) throw new NotFoundException(NOT_FOUND);
    return customer;
  }

  /** Normaliza lo que vino; 400 con mensaje claro si algo no es válido. */
  private normalize(input: CustomerInput): Prisma.CustomerUpdateInput {
    const out: Prisma.CustomerUpdateInput = {};
    if (input.full_name !== undefined) {
      const name = normalizeName(input.full_name);
      if (name.length < 2) throw new BadRequestException('full_name debe tener al menos 2 caracteres.');
      out.full_name = name;
    }
    if (input.phone !== undefined) {
      const phone = input.phone === null ? null : normalizePhone(input.phone);
      if (input.phone !== null && !phone) {
        throw new BadRequestException(
          'Teléfono inválido: usa 10 dígitos con código de área (809, 829, 849) o formato internacional (+…).',
        );
      }
      out.phone = phone;
    }
    if (input.document_id !== undefined) {
      const doc = input.document_id === null ? null : normalizeCedula(input.document_id);
      if (input.document_id !== null && !doc) {
        throw new BadRequestException('Cédula inválida: deben ser 11 dígitos (p. ej. 001-1234567-8).');
      }
      out.document_id = doc;
    }
    if (input.email !== undefined) out.email = input.email === null ? null : normalizeEmail(input.email);
    if (input.notes !== undefined) out.notes = input.notes?.trim() || null;
    return out;
  }

  /**
   * P2002 (UNIQUE por taller) → 409 con el id del cliente que ya existe, para
   * que la app ofrezca abrirlo en vez de duplicarlo.
   */
  private async toConflict(
    error: unknown,
    shopId: string,
    data: { phone?: unknown; document_id?: unknown },
    selfId?: string,
  ): Promise<unknown> {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') return error;
    const or: Prisma.CustomerWhereInput[] = [];
    if (typeof data.phone === 'string') or.push({ phone: data.phone });
    if (typeof data.document_id === 'string') or.push({ document_id: data.document_id });
    const existing = await this.prisma.customer.findFirst({
      where: { shop_id: shopId, OR: or, ...(selfId ? { NOT: { id: selfId } } : {}) },
    });
    return new ConflictException({
      message: 'Ya existe un cliente en este taller con ese teléfono o cédula.',
      existing_customer_id: existing?.id ?? null,
    });
  }
}
