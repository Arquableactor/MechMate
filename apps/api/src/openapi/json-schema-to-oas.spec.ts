import { definitionsToOas, jsonSchemaToOas } from './json-schema-to-oas';

describe('jsonSchemaToOas', () => {
  it('tipo nullable: ["string","null"] → type + nullable', () => {
    expect(jsonSchemaToOas({ type: ['string', 'null'] })).toEqual({ type: 'string', nullable: true });
    expect(jsonSchemaToOas({ type: 'number' })).toEqual({ type: 'number' });
  });

  it('$ref: reescribe a components; nullable por anyOf → allOf + nullable', () => {
    expect(jsonSchemaToOas({ $ref: '#/definitions/Cents' })).toEqual({ $ref: '#/components/schemas/Cents' });
    expect(jsonSchemaToOas({ anyOf: [{ $ref: '#/definitions/DecodedVehicleView' }, { type: 'null' }] })).toEqual({
      allOf: [{ $ref: '#/components/schemas/DecodedVehicleView' }],
      nullable: true,
    });
  });

  it('objeto en línea nullable (anyOf con null) → el objeto + nullable, recursivo', () => {
    expect(
      jsonSchemaToOas({
        anyOf: [
          {
            type: 'object',
            properties: { id: { type: 'string' }, paid_at: { type: ['string', 'null'] } },
            required: ['id', 'paid_at'],
            additionalProperties: false,
          },
          { type: 'null' },
        ],
      }),
    ).toEqual({
      type: 'object',
      properties: { id: { type: 'string' }, paid_at: { type: 'string', nullable: true } },
      required: ['id', 'paid_at'],
      additionalProperties: false,
      nullable: true,
    });
  });

  it('const → enum; enum con null → nullable; arrays y descripción se conservan', () => {
    expect(jsonSchemaToOas({ type: 'string', const: 'ok' })).toEqual({ type: 'string', enum: ['ok'] });
    expect(jsonSchemaToOas({ type: ['string', 'null'], enum: ['a', 'b', null] })).toEqual({ type: 'string', enum: ['a', 'b'], nullable: true });
    expect(jsonSchemaToOas({ type: 'array', items: { $ref: '#/definitions/Role' }, description: 'Roles' })).toEqual({
      type: 'array',
      items: { $ref: '#/components/schemas/Role' },
      description: 'Roles',
    });
  });

  it('falla cerrada: palabra clave, unión de tipos o $ref que no sabe traducir → lanza con la ruta', () => {
    expect(() => definitionsToOas({ X: { type: 'object', properties: { a: { type: 'string', pattern: '^x' } } } })).toThrow(
      /#\/components\/schemas\/X\/properties\/a: "pattern"/,
    );
    expect(() => jsonSchemaToOas({ type: ['string', 'number'] })).toThrow(/Unión de tipos no soportada/);
    expect(() => jsonSchemaToOas({ $ref: 'otro.json#/X' })).toThrow(/\$ref no soportado/);
  });
});
