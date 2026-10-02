/**
 * JSON Schema (lo que genera ts-json-schema-generator desde @repo/types) →
 * Schema Object de OpenAPI 3.0 (lo que entienden Swagger y openapi-generator):
 *  - `type: ['string', 'null']` / `anyOf: [X, {type: 'null'}]` → `nullable: true`
 *  - `$ref` nullable → `allOf: [$ref]` + `nullable` (en 3.0 un $ref ignora hermanos)
 *  - `const` → `enum` de un valor
 *  - `#/definitions/X` → `#/components/schemas/X`
 * Falla cerrada: una palabra clave desconocida lanza (mejor romper el build que
 * publicar un contrato que no dice la verdad).
 */
export type JsonSchema = Record<string, unknown>;

const KNOWN = new Set(['type', 'properties', 'required', 'additionalProperties', 'enum', 'const', 'items', '$ref', 'anyOf', 'description']);

const isNullSchema = (s: unknown) => typeof s === 'object' && s !== null && (s as JsonSchema).type === 'null' && Object.keys(s).length === 1;

export function toOasRef(ref: string): string {
  const m = /^#\/definitions\/([A-Za-z0-9_]+)$/.exec(ref);
  if (!m) throw new Error(`$ref no soportado en el contrato: ${ref}`);
  return `#/components/schemas/${m[1]}`;
}

export function jsonSchemaToOas(schema: JsonSchema, path = '#'): JsonSchema {
  for (const key of Object.keys(schema)) {
    if (!KNOWN.has(key)) throw new Error(`Palabra clave de JSON Schema no soportada en ${path}: "${key}"`);
  }

  if (Array.isArray(schema.anyOf)) {
    const options = schema.anyOf as JsonSchema[];
    const rest = options.filter((o) => !isNullSchema(o));
    const nullable = rest.length < options.length;
    const { anyOf: _drop, ...siblings } = schema;
    if (rest.length === 1) {
      const inner = jsonSchemaToOas(rest[0], `${path}/anyOf`);
      if (!nullable) return { ...siblings, ...inner };
      return inner.$ref ? { ...siblings, allOf: [inner], nullable: true } : { ...siblings, ...inner, nullable: true };
    }
    return {
      ...siblings,
      anyOf: rest.map((o, i) => jsonSchemaToOas(o, `${path}/anyOf/${i}`)),
      ...(nullable ? { nullable: true } : {}),
    };
  }

  const out: JsonSchema = {};
  let nullable = false;
  for (const [key, value] of Object.entries(schema)) {
    switch (key) {
      case '$ref':
        out.$ref = toOasRef(value as string);
        break;
      case 'type': {
        const types = (Array.isArray(value) ? value : [value]) as string[];
        const rest = types.filter((t) => t !== 'null');
        if (rest.length !== types.length) nullable = true;
        if (rest.length !== 1) throw new Error(`Unión de tipos no soportada en ${path}: ${JSON.stringify(types)}`);
        out.type = rest[0];
        break;
      }
      case 'const':
        out.enum = [value];
        break;
      case 'enum': {
        const values = value as unknown[];
        if (values.includes(null)) nullable = true;
        out.enum = values.filter((v) => v !== null);
        break;
      }
      case 'properties':
        out.properties = Object.fromEntries(
          Object.entries(value as Record<string, JsonSchema>).map(([k, v]) => [k, jsonSchemaToOas(v, `${path}/properties/${k}`)]),
        );
        break;
      case 'items':
        out.items = jsonSchemaToOas(value as JsonSchema, `${path}/items`);
        break;
      case 'additionalProperties':
        out.additionalProperties = typeof value === 'boolean' ? value : jsonSchemaToOas(value as JsonSchema, `${path}/additionalProperties`);
        break;
      default:
        out[key] = value;
    }
  }
  if (nullable) out.nullable = true;
  return out;
}

const PRIMITIVES = new Set(['string', 'integer', 'number', 'boolean']);
const isPrimitiveAlias = (s: JsonSchema) =>
  typeof s.type === 'string' && PRIMITIVES.has(s.type) && Object.keys(s).every((k) => k === 'type' || k === 'description');

/**
 * Alias primitivos (`Cents = string`, `Int = number` + `@asType integer`) se
 * incrustan en cada campo: el cliente generado ve `String`/`int`, no un
 * modelo-envoltorio. Los enums y objetos siguen siendo schemas con nombre.
 */
export function inlinePrimitiveAliases(definitions: Record<string, JsonSchema>): Record<string, JsonSchema> {
  const aliases = new Map(
    Object.entries(definitions)
      .filter(([, s]) => isPrimitiveAlias(s))
      .map(([name, s]) => [`#/definitions/${name}`, { type: s.type }]),
  );
  const inline = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(inline);
    if (!node || typeof node !== 'object') return node;
    const { $ref, ...rest } = node as JsonSchema;
    const alias = typeof $ref === 'string' ? aliases.get($ref) : undefined;
    const children = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, inline(v)]));
    if (alias) return { ...alias, ...children };
    return $ref === undefined ? children : { $ref, ...children };
  };
  return Object.fromEntries(
    Object.entries(definitions)
      .filter(([, s]) => !isPrimitiveAlias(s))
      .map(([name, s]) => [name, inline(s) as JsonSchema]),
  );
}

/** Todas las definiciones → `components.schemas` (con los alias primitivos incrustados). */
export function definitionsToOas(definitions: Record<string, JsonSchema>): Record<string, JsonSchema> {
  return Object.fromEntries(
    Object.entries(inlinePrimitiveAliases(definitions)).map(([name, s]) => [name, jsonSchemaToOas(s, `#/components/schemas/${name}`)]),
  );
}
