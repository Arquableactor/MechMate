import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { VinDecodeView } from '@repo/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { VinService } from './vin.service';

@ApiTags('vin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vin')
export class VinController {
  constructor(private readonly vin: VinService) {}

  @Get(':vin')
  @ApiOperation({
    summary:
      'Decodifica un VIN (marca, modelo, año, motor…) para autocompletar el vehículo. ' +
      'Si no se encuentra o el proveedor no responde, devuelve found=false: cargar a mano.',
  })
  @ApiParam({ name: 'vin', example: '1HGCM82633A004352' })
  @ApiOkResponse({ description: 'Resultado de la decodificación (puede ser found=false).' })
  @ApiBadRequestResponse({ description: 'Formato inválido (no son 17 caracteres válidos).' })
  @ApiView('VinDecodeView')
  decode(@Param('vin') vin: string): Promise<VinDecodeView> {
    return this.vin.decode(vin);
  }
}
