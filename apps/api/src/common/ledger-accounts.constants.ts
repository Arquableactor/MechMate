/**
 * UUIDs fijos de las cuentas contables singleton sembradas en la migración
 * `20260620110000_ledger` (owner_id NULL). La app las referencia por estas
 * constantes en vez de consultarlas por una clave única nullable (que Prisma no
 * modela bien). Si cambias estos valores, cambia también el seed de la migración.
 */
export const PLATFORM_COMMISSION_REVENUE_DOP = '00000000-0000-7000-8000-000000000001';
export const PLATFORM_CLEARING_DOP = '00000000-0000-7000-8000-000000000002';
export const TAX_PAYABLE_DOP = '00000000-0000-7000-8000-000000000003';
