/**
 * Identificadores de vehículo normalizados. Devuelven `null` si no son válidos
 * (el servicio responde 400). Deben coincidir con los CHECK de `vehicles`.
 */

/** Placa RD: mayúsculas, sin espacios ni guiones (`a-123 456` → `A123456`). */
export function normalizePlate(input: string): string | null {
  const plate = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^[A-Z0-9]{4,10}$/.test(plate) ? plate : null;
}

/**
 * Número de chasis (vehículos sin VIN, típicamente importados de Japón):
 * mayúsculas y sin espacios; el guion se conserva porque es parte del formato
 * (`nze121 - 1234567` → `NZE121-1234567`).
 */
export function normalizeChassis(input: string): string | null {
  const chassis = input.toUpperCase().replace(/\s+/g, '');
  return /^[A-Z0-9-]{5,25}$/.test(chassis) ? chassis : null;
}
