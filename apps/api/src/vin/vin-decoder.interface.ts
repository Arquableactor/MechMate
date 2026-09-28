/** Lo que sabemos de un vehículo a partir de su VIN (independiente del proveedor). */
export interface DecodedVehicle {
  make: string;
  model: string | null;
  year: number | null;
  trim: string | null;
  /** Legible, p. ej. `3.0L V6` / `1.8L 4 cil.`; null si el proveedor no lo sabe. */
  engine: string | null;
  fuelType: string | null;
  bodyClass: string | null;
  driveType: string | null;
  transmission: string | null;
  /** Avisos del proveedor (p. ej. dígito verificador que no cuadra). */
  warnings: string[];
  /** Respuesta cruda del proveedor, para auditoría y para Fitment (Día 9). */
  raw: Record<string, unknown>;
}

/**
 * Costura hacia el catálogo (como `PaymentProvider`): hoy NHTSA vPIC (gratis,
 * cubre vehículos del mercado de EE. UU.); el comprador puede enchufar TecDoc
 * sin tocar el resto.
 * - Devuelve `null` si el proveedor no conoce el VIN.
 * - LANZA si el proveedor no está disponible (red, 5xx, timeout).
 */
export interface VinDecoder {
  readonly provider: string;
  decode(vin: string): Promise<DecodedVehicle | null>;
}

export const VIN_DECODER = Symbol('VIN_DECODER');
