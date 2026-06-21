import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccountsModule } from '../accounts/accounts.module';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PassportModule, AccountsModule],
  providers: [JwtStrategy, RolesGuard],
  exports: [RolesGuard],
})
export class AuthModule {}
