import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthModule } from '../auth/auth.module';
import { MeController } from './me.controller';

@Module({
  imports: [AuthModule, AccountsModule],
  controllers: [MeController],
})
export class MeModule {}
