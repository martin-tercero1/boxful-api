import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class ShippingConfigService {
  constructor(private prisma: PrismaService) {}

  async getCostForDate(date: Date): Promise<number> {
    const dayOfWeek = date.getDay(); // 0-6

    const config = await this.prisma.shippingConfig.findUnique({
      where: { dayOfWeek },
    });

    if (!config) throw new InternalServerErrorException(
      `No shipping cost configured for day ${dayOfWeek}`
    );

    return config.cost;
  }
}