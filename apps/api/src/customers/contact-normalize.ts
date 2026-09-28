/**
 * Normalización de datos de contacto dominicanos. Todas devuelven `null` si el
 * valor no es válido (el servicio responde 400 con un mensaje claro).
 */

const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Teléfono → E.164. RD está en el plan norteamericano (+1, códigos 809/829/849):
 * `809-555-1234`, `(829) 555 1234`, `1 849 555 1234` → `+18095551234`.
 * Con `+` se respeta el código de país (clientes extranjeros).
 * 7 dígitos sin código de área es ambiguo → inválido.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  let e164: string;
  if (trimmed.startsWith('+')) e164 = `+${digits}`;
  else if (digits.length === 10) e164 = `+1${digits}`;
  else if (digits.length === 11 && digits.startsWith('1')) e164 = `+${digits}`;
  else return null;
  return E164.test(e164) ? e164 : null;
}

/**
 * Cédula dominicana → 11 dígitos: `001-1234567-8` → `00112345678`. Se valida el
 * largo, no el dígito verificador (hay cédulas antiguas válidas que no cuadran).
 */
export function normalizeCedula(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  return /^\d{11}$/.test(digits) ? digits : null;
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/** Nombre: sin espacios de más (`  juan   pérez ` → `juan pérez`). */
export function normalizeName(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}
