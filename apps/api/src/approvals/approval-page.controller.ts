import { randomBytes } from 'node:crypto';
import { Controller, Get, HttpException, Logger, Param, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { pageHeaders, renderApprovalPage, renderErrorPage } from './approval-page';
import { ApprovalsService } from './approvals.service';

/**
 * `GET /a/:token` (FUERA del prefijo /v1: enlace corto para WhatsApp/email).
 * La página HTML que ve el cliente en su teléfono. Sin cuenta: la llave es el
 * token firmado. Nunca devuelve JSON ni stack traces: siempre una página.
 */
@ApiExcludeController()
@Controller('a')
export class ApprovalPageController {
  private readonly logger = new Logger(ApprovalPageController.name);

  constructor(private readonly approvals: ApprovalsService) {}

  @Get(':token')
  async page(@Param('token') token: string, @Res() res: Response): Promise<void> {
    const nonce = randomBytes(16).toString('base64');
    res.set(pageHeaders(nonce));
    try {
      const view = await this.approvals.publicView(token);
      res.status(200).send(renderApprovalPage(view, token, nonce));
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : 500;
      if (status >= 500) this.logger.error(`Página de aprobación: ${error instanceof Error ? error.message : String(error)}`);
      const message =
        status === 404
          ? 'Este enlace no es válido. Revisa que lo hayas copiado completo o pide uno nuevo al taller.'
          : 'No pudimos cargar el presupuesto. Intenta de nuevo en unos minutos.';
      res.status(status).send(renderErrorPage(message, nonce));
    }
  }
}
