import { Module } from '@nestjs/common';
import { OutboxRelayService } from './outbox-relay.service';

/**
 * Publicación del outbox transaccional. Corre dentro del proceso de la API
 * (monolito); `OUTBOX_RELAY_ENABLED=false` lo apaga por instancia si más
 * adelante se separa en un worker propio.
 */
@Module({
  providers: [OutboxRelayService],
  exports: [OutboxRelayService],
})
export class OutboxModule {}
