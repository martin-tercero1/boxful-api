import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductDto {
  @IsNumber()
  @Min(1)
  height: number;

  @IsNumber()
  @Min(1)
  length: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  weight: number;

  @IsString()
  content: string;
}

export class CreateOrderDto {
  @IsString()
  pickUpAddress: string;

  @IsDateString()
  scheduledDate: Date;

  @IsString()
  firstNames: string;

  @IsString()
  lastNames: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  destinationAddress: string;

  @IsString()
  department: string;

  @IsString()
  municipality: string;

  @IsString()
  referencePoint: string;

  @IsString()
  indications: string;

  @IsBoolean()
  cashOnDelivery: boolean;

  @ValidateIf((o) => o.cashOnDelivery === true)
  @IsInt()
  @Min(0)
  cashAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];
}