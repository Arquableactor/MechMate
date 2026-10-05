import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import type { InvoiceView, Page } from '@repo/types';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { type AuthenticatedAccount, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiView } from '../openapi/api-view.decorator';
import { FrontDeskOnly, ShopAccessGuard } from '../shops/shop-access.guard';
import { InvoicesService } from './invoices.service';

class ListInvoicesQuery {
  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cursor?: string;
}

@ApiTags('invoices')
@ApiBearerAuth()
@FrontDeskOnly()
@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('shops/:shopId')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Post('work-orders/:workOrderId/invoice')
  @ApiOperation({ summary: 'Factura una OT completada (snapshot inmutable de las líneas aprobadas). OT → invoiced.' })
  @ApiCreatedResponse({ description: 'Factura FAC-XXXX emitida.' })
  @ApiConflictResponse({ description: 'OT no completada, ya facturada, o sin líneas aprobadas.' })
  @ApiView('InvoiceView')
  issue(
    @Param('shopId') shopId: string,
    @Param('workOrderId') workOrderId: string,
    @CurrentUser() account: AuthenticatedAccount,
  ): Promise<InvoiceView> {
    return this.invoices.issue(shopId, workOrderId, account.id);
  }

  @Get('work-orders/:workOrderId/invoice')
  @ApiOperation({ summary: 'Factura de una OT.' })
  @ApiNotFoundResponse({ description: 'La OT no tiene factura (o no es de este taller).' })
  @ApiView('InvoiceView')
  byWorkOrder(@Param('shopId') shopId: string, @Param('workOrderId') workOrderId: string): Promise<InvoiceView> {
    return this.invoices.getByWorkOrder(shopId, workOrderId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Facturas del taller, de la más nueva a la más vieja.' })
  @ApiView('InvoiceView', 'page')
  list(@Param('shopId') shopId: string, @Query() q: ListInvoicesQuery): Promise<Page<InvoiceView>> {
    return this.invoices.list(shopId, q);
  }

  @Get('invoices/:invoiceId')
  @ApiOperation({ summary: 'Detalle de una factura.' })
  @ApiView('InvoiceView')
  get(@Param('shopId') shopId: string, @Param('invoiceId') invoiceId: string): Promise<InvoiceView> {
    return this.invoices.get(shopId, invoiceId);
  }
}
