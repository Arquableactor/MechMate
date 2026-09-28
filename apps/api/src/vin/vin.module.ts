import { Module } from '@nestjs/common';
import { NhtsaVinDecoder } from './nhtsa-vin-decoder';
import { VIN_DECODER } from './vin-decoder.interface';
import { VinController } from './vin.controller';
import { VinService } from './vin.service';

/** Decodificación de VIN. El proveedor se cambia aquí (NHTSA hoy; TecDoc después). */
@Module({
  controllers: [VinController],
  providers: [VinService, { provide: VIN_DECODER, useFactory: () => new NhtsaVinDecoder() }],
  exports: [VinService],
})
export class VinModule {}
