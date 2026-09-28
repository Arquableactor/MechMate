import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import { AccountsService, type Auth0Claims } from '../accounts/accounts.service';

/**
 * Valida el JWT de Auth0 (resource server): RS256, firma vía JWKS, `iss`/`aud`
 * correctos. En `validate` hace JIT provisioning y adjunta la cuenta a la
 * request (la consume `@CurrentUser()` y el `RolesGuard`).
 */
/**
 * Prefijo de los claims de identidad que agrega la Action post-login de Auth0
 * (los access tokens no traen email/nombre por defecto, y Auth0 exige prefijo
 * propio para claims agregados). Es el mismo identifier de la API.
 */
export const CLAIMS_NAMESPACE = 'https://api.automecanica.do/';

type RawClaims = Record<string, unknown> & { sub?: string };

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/**
 * Normaliza el payload del JWT a `Auth0Claims`: prioriza los claims con prefijo
 * (Action post-login) y cae a los estándar (p. ej. ID tokens o tokens de prueba).
 */
export function toAuth0Claims(payload: RawClaims): Auth0Claims {
  const pick = (name: string) => payload[`${CLAIMS_NAMESPACE}${name}`] ?? payload[name];
  return {
    sub: payload.sub as string,
    email: str(pick('email')),
    email_verified: pick('email_verified') === true,
    name: str(pick('name')),
    phone_number: str(pick('phone_number')),
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly accounts: AccountsService,
  ) {
    const issuer = config.getOrThrow<string>('AUTH0_ISSUER_URL');
    const audience = config.getOrThrow<string>('AUTH0_AUDIENCE');

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer,
      audience,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: new URL('.well-known/jwks.json', issuer).toString(),
      }),
    };
    super(options);
  }

  async validate(payload: RawClaims) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token sin claim `sub`.');
    }
    return this.accounts.provisionFromClaims(toAuth0Claims(payload));
  }
}
