/**
 * Red de seguridad para serializar `BigInt` en JSON. `JSON.stringify(1n)` lanza
 * por defecto; aquí lo convertimos a **string** (sin pérdida de precisión).
 *
 * BLAST RADIUS: parchea el prototipo global ⇒ afecta TODO `JSON.stringify` del
 * proceso (logs incluidos). Los campos monetarios además se serializan
 * explícitamente como string en el boundary (funciones `toView`); este patch es
 * solo la malla por si algo se escapa. Debe importarse **primero** en `main.ts`
 * y en el setup de jest, antes de cualquier serialización.
 */
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

if (typeof BigInt.prototype.toJSON !== 'function') {
  BigInt.prototype.toJSON = function (this: bigint): string {
    return this.toString();
  };
}

export {};
