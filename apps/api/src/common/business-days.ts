/** Zona de los talleres (RD no tiene horario de verano: siempre UTC-4). */
const TZ = 'America/Santo_Domingo';

/** Fecha calendario (YYYY-MM-DD) de `instant` en hora de Santo Domingo. */
export function localDate(instant: Date, timeZone = TZ): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
}

/**
 * Suma `days` días hábiles (lunes a viernes) a la fecha LOCAL de `instant`.
 * Un cobro del viernes con T+2 cae el martes; uno del sábado, el martes.
 * No contempla feriados de RD (anotado para la entrega).
 */
export function addBusinessDays(instant: Date, days: number, timeZone = TZ): string {
  const [y, m, d] = localDate(instant, timeZone).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) added++;
  }
  return date.toISOString().slice(0, 10);
}
