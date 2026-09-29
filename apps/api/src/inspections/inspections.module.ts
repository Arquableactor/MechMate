import { Module } from '@nestjs/common';
import { ShopsModule } from '../shops/shops.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';

/** DVI: dueño de inspections, inspection_findings e inspection_photos (archivos en R2). */
@Module({
  imports: [ShopsModule, WorkOrdersModule],
  controllers: [InspectionsController],
  providers: [InspectionsService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
