import { ApiExtension } from '@nestjs/swagger';
import type { ApiSchemaName, ApiSchemas, Page } from '@repo/types';

/** Forma de la respuesta: el tipo tal cual, una página (`Page<T>`) o un arreglo. */
export type ViewShape = 'one' | 'page' | 'array';

type Shaped<T, S extends ViewShape> = S extends 'page' ? Page<T> : S extends 'array' ? T[] : T;

/** Extensión que lee `buildOpenApiDocument` para poner el schema en la respuesta 2xx. */
export const VIEW_EXTENSION = 'x-mechmate-view';

export interface ViewExtension {
  name: ApiSchemaName;
  shape: ViewShape;
}

/**
 * Declara el tipo de respuesta de un endpoint para el contrato OpenAPI.
 * TypeScript EXIGE que el método devuelva `ApiSchemas[name]` (o su página /
 * arreglo): si el retorno cambia y el decorador no, no compila.
 *
 *   @ApiView('InvoiceView')          → InvoiceView
 *   @ApiView('InvoiceView', 'page')  → Page<InvoiceView>  (schema `InvoiceViewPage`)
 *   @ApiView('ShopView', 'array')    → ShopView[]
 */
export function ApiView<K extends ApiSchemaName, S extends ViewShape = 'one'>(name: K, shape?: S) {
  const extension = ApiExtension(VIEW_EXTENSION, { name, shape: shape ?? 'one' } satisfies ViewExtension);
  return <F extends (...args: never[]) => Shaped<ApiSchemas[K], S> | Promise<Shaped<ApiSchemas[K], S>>>(
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): void => {
    extension(target, key, descriptor);
  };
}
