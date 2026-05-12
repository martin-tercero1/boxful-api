import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShippingConfigService } from '../shipping-config/shipping-config.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, ShippingConfigService],
  exports: [OrdersService],
})
export class OrdersModule {}