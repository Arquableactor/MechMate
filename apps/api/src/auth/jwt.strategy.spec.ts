import type { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import type { AccountsService } from '../accounts/accounts.service';
import { CLAIMS_NAMESPACE, JwtStrategy, toAuth0Claims } from './jwt.strategy';

// Sin red: capturamos las opciones con que se arma el proveedor de llaves JWKS.
jest.mock('jwks-rsa', () => ({ passportJwtSecret: jest.fn(() => jest.fn()) }));

const DUMMY_AUTH0 = {
  AUTH0_DOMAIN: 'test-tenant.us.auth0.com',
  AUTH0_AUDIENCE: 'https://api.test.automecanica.do',
  AUTH0_ISSUER_URL: 'https://test-tenant.us.auth0.com/',
};

/**
 * ConfigService de prueba: solo lee del mapa dado, nunca de `process.env`.
 * Así el test es hermético aunque el shell tenga (o no) `AUTH0_*` definidas.
 */
function stubConfig(values: Record<string, string>): ConfigService {
  return {
    getOrThrow: (key: string) => {
      if (!(key in values)) throw new TypeError(`Configuration key "${key}" does not exist`);
      return values[key];
    },
  } as unknown as ConfigService;
}

const accounts = {} as AccountsService;

describe('JwtStrategy', () => {
  beforeEach(() => jest.mocked(passportJwtSecret).mockClear());

  it('se construye con config dummy y valida iss/aud/RS256 del tenant', () => {
    const strategy = new JwtStrategy(stubConfig(DUMMY_AUTH0), accounts);

    const verifOpts = (strategy as unknown as { _verifOpts: Record<string, unknown> })._verifOpts;
    expect(verifOpts).toMatchObject({
      issuer: DUMMY_AUTH0.AUTH0_ISSUER_URL,
      audience: DUMMY_AUTH0.AUTH0_AUDIENCE,
      algorithms: ['RS256'],
    });
  });

  it('toma las llaves del JWKS del issuer', () => {
    new JwtStrategy(stubConfig(DUMMY_AUTH0), accounts);

    expect(passportJwtSecret).toHaveBeenCalledWith(
      expect.objectContaining({
        jwksUri: 'https://test-tenant.us.auth0.com/.well-known/jwks.json',
      }),
    );
  });

  it.each(['AUTH0_ISSUER_URL', 'AUTH0_AUDIENCE'])(
    'falla cerrado si falta %s (sin defaults silenciosos)',
    (missing) => {
      const { [missing]: _omitted, ...rest } = DUMMY_AUTH0 as Record<string, string>;
      expect(() => new JwtStrategy(stubConfig(rest), accounts)).toThrow(missing);
    },
  );
});

describe('toAuth0Claims', () => {
  const ns = (k: string) => `${CLAIMS_NAMESPACE}${k}`;

  it('lee los claims con prefijo que agrega la Action post-login', () => {
    expect(
      toAuth0Claims({
        sub: 'auth0|1',
        [ns('email')]: 'ana@mail.do',
        [ns('email_verified')]: true,
        [ns('name')]: 'Ana',
      }),
    ).toEqual({ sub: 'auth0|1', email: 'ana@mail.do', email_verified: true, name: 'Ana', phone_number: undefined });
  });

  it('el prefijo tiene prioridad sobre el claim estándar', () => {
    expect(
      toAuth0Claims({ sub: 'x', email: 'viejo@mail.do', [ns('email')]: 'nuevo@mail.do' }).email,
    ).toBe('nuevo@mail.do');
  });

  it('cae a los claims estándar si no hay prefijo', () => {
    expect(toAuth0Claims({ sub: 'x', email: 'a@b.do', email_verified: true })).toMatchObject({
      email: 'a@b.do',
      email_verified: true,
    });
  });

  it('SEGURIDAD: email_verified solo es true si viene exactamente `true`', () => {
    for (const v of ['true', 1, 'yes', undefined, null]) {
      expect(toAuth0Claims({ sub: 'x', email: 'a@b.do', [ns('email_verified')]: v }).email_verified).toBe(false);
    }
  });

  it('token de máquina (M2M, sin identidad): solo sub', () => {
    expect(toAuth0Claims({ sub: 'abc@clients', gty: 'client-credentials' })).toEqual({
      sub: 'abc@clients',
      email: undefined,
      email_verified: false,
      name: undefined,
      phone_number: undefined,
    });
  });
});
