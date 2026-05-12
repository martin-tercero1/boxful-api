import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { NotFoundException } from "@nestjs/common";
import { DeliveryUpdateDto } from "./dto/delivery-update.dto";
import { OrderStatus } from "../generated/prisma/client";
import { BadRequestException } from "@nestjs/common";
import { UserSettlementResult } from "./types/settlement.types";
import { ShippingConfigService } from "../shipping-config/shipping-config.service";
import { OrderSettlementResult } from "./types/settlement.types";
import { Order } from "../generated/prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private shippingConfigService: ShippingConfigService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const reference = `ORD-${Date.now()}`;
    return this.prisma.order.create({
      data: { ...dto, reference, userId },
    });
  }

  async findAll(userId: string, filters: any) {
    const {from, to, reference, page = 1, limit = 10 } = filters;

    const where: any = { userId };
    if (reference) where.reference = { contains: reference, mode: 'insensitive' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async handleDeliveryUpdate(orderId: string, dto: DeliveryUpdateDto) {
    const order = await this.prisma.order.findUnique({ where: { reference: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Order already delivered');
    }

if (!order.cashOnDelivery && dto.amountCollected != null) {
  throw new BadRequestException(
    'Cannot set amountCollected on a non-COD order'
  );
}

    return this.prisma.order.update({
      where: { reference: orderId },
      data: {
        status: dto.status,
        amountCollected: dto.amountCollected ?? null,
        deliveredAt: dto.status === OrderStatus.DELIVERED ? new Date() : null,
      },
    });
  }

  async calculateForUser(userId: string): Promise<UserSettlementResult> {
    const orders = await this.prisma.order.findMany({ where: { userId } });
    if (!orders.length) throw new NotFoundException('No orders found');

    const settlements = await Promise.all(orders.map(o => this.calculate(o)));

    const total = settlements.reduce((sum, s) => sum + s.settlementAmount, 0);

    return {
      orders: settlements,
      totalSettlement: parseFloat(total.toFixed(2)),
    };
  }

  private async calculate(order: Order): Promise<OrderSettlementResult> {
    const referenceDate = order.deliveredAt ?? order.scheduledDate;
    const shippingCost = await this.shippingConfigService.getCostForDate(referenceDate);

    let commission = 0;
    let amountCollected = 0;

    if (order.cashOnDelivery && order.amountCollected != null) {
      amountCollected = order.amountCollected;
      commission = Math.min(amountCollected * 0.0001, 25);
    }

    const settlementAmount = parseFloat(
      (amountCollected - shippingCost - commission).toFixed(2)
    );

    return {
      orderNumber: order.reference,
      status: order.status,
      cashOnDelivery: order.cashOnDelivery,
      amountCollected,
      shippingCost,
      commission: parseFloat(commission.toFixed(2)),
      settlementAmount,
    };
  }
}