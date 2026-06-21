import { Prisma, type Account, type AccountRole } from '@prisma/client';
import type { Role } from '@repo/types';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';

type AccountWithRoles = Account & { roles: AccountRole[] };

const baseAccount = (overrides: Partial<AccountWithRoles> = {}): AccountWithRoles => ({
  id: 'acc-1',
  auth0_sub: 'auth0|abc',
  email: 'Owner@Example.com',
  phone: null,
  full_name: 'Owner',
  status: 'active',
  kyc_status: 'none',
  created_at: new Date('2026-06-20T12:00:00.000Z'),
  updated_at: new Date('2026-06-20T12:00:00.000Z'),
  roles: [],
  ...overrides,
});

const rolesOf = (...roles: Role[]): AccountRole[] =>
  roles.map((role) => ({ account_id: 'acc-1', role }));

describe('AccountsService', () => {
  const buildService = (prisma: Partial<Record<string, unknown>>) =>
    new AccountsService(prisma as unknown as PrismaService);

  describe('JIT provisioning', () => {
    it('devuelve la cuenta existente sin crear (idempotente por sub)', async () => {
      const create = jest.fn();
      const service = buildService({
        account: {
          findUnique: jest.fn().mockResolvedValue(baseAccount()),
          create,
        },
      });

      const result = await service.provisionFromClaims({ sub: 'auth0|abc' });

      expect(result.id).toBe('acc-1');
      expect(create).not.toHaveBeenCalled();
    });

    it('crea exactamente una cuenta cuando el sub es nuevo', async () => {
      const create = jest.fn().mockResolvedValue(baseAccount({ roles: [] }));
      const service = buildService({
        account: {
          findUnique: jest.fn().mockResolvedValue(null),
          create,
        },
      });

      await service.provisionFromClaims({ sub: 'auth0|new', email: 'a@b.com', name: 'A' });

      expect(create).toHaveBeenCalledTimes(1);
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ auth0_sub: 'auth0|new', email: 'a@b.com' }),
        }),
      );
    });

    it('es race-safe: ante P2002 concurrente recupera la cuenta ya creada', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: '6.19.3',
      });
      const findUnique = jest
        .fn()
        .mockResolvedValueOnce(null) // primera lectura: no existe
        .mockResolvedValueOnce(baseAccount()); // tras P2002 no aplica (usamos findUniqueOrThrow)
      const service = buildService({
        account: {
          findUnique,
          create: jest.fn().mockRejectedValue(p2002),
          findUniqueOrThrow: jest.fn().mockResolvedValue(baseAccount()),
        },
      });

      const result = await service.provisionFromClaims({ sub: 'auth0|abc' });
      expect(result.id).toBe('acc-1');
    });
  });

  describe('addRole + multi-rol', () => {
    it('una sola cuenta puede tener mechanic + seller + customer a la vez', async () => {
      // Simula el estado acumulado tras añadir los 3 roles.
      const upsert = jest.fn().mockResolvedValue(undefined);
      const findUniqueOrThrow = jest
        .fn()
        .mockResolvedValueOnce(baseAccount({ roles: rolesOf('mechanic') }))
        .mockResolvedValueOnce(baseAccount({ roles: rolesOf('mechanic', 'seller') }))
        .mockResolvedValueOnce(
          baseAccount({ roles: rolesOf('mechanic', 'seller', 'customer') }),
        );
      const service = buildService({ accountRole: { upsert }, account: { findUniqueOrThrow } });

      await service.addRole('acc-1', 'mechanic');
      await service.addRole('acc-1', 'seller');
      const final = await service.addRole('acc-1', 'customer');

      const roles = final.roles.map((r) => r.role);
      expect(roles).toEqual(expect.arrayContaining(['mechanic', 'seller', 'customer']));
      expect(roles).toHaveLength(3);
      expect(upsert).toHaveBeenCalledTimes(3);
    });

    it('es idempotente: añadir un rol existente no duplica (upsert con update vacío)', async () => {
      const upsert = jest.fn().mockResolvedValue(undefined);
      const service = buildService({
        accountRole: { upsert },
        account: {
          findUniqueOrThrow: jest.fn().mockResolvedValue(baseAccount({ roles: rolesOf('mechanic') })),
        },
      });

      const result = await service.addRole('acc-1', 'mechanic');

      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { account_id_role: { account_id: 'acc-1', role: 'mechanic' } },
          update: {},
        }),
      );
      expect(result.roles).toHaveLength(1);
    });
  });

  describe('toMeResponse', () => {
    it('mapea la entidad al contrato MeResponse (roles como strings, fecha ISO)', () => {
      const service = buildService({});
      const me = service.toMeResponse(baseAccount({ roles: rolesOf('customer') }));

      expect(me).toMatchObject({
        id: 'acc-1',
        auth0_sub: 'auth0|abc',
        roles: ['customer'],
        created_at: '2026-06-20T12:00:00.000Z',
      });
    });
  });
});
