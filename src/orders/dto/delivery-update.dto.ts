import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { OrderStatus } from '../../generated/prisma/client';

export class DeliveryUpdateDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountCollected?: number;
}