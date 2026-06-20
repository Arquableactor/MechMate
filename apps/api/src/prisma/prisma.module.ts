import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Módulo global: expone `PrismaService` a toda la app sin re-importar. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
