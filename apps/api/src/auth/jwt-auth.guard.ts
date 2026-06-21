import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Exige un JWT válido. Token ausente/inválido ⇒ 401 (comportamiento de AuthGuard). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
