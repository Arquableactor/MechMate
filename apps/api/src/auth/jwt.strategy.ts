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

  async validate(payload: Auth0Claims) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token sin claim `sub`.');
    }
    return this.accounts.provisionFromClaims(payload);
  }
}
