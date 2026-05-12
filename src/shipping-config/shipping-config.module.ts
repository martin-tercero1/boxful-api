import { Module } from '@nestjs/common';
import { ShippingConfigService } from './shipping-config.service';

@Module({
  providers: [ShippingConfigService],
  exports: [ShippingConfigService],
})
export class ShippingConfigModule {}