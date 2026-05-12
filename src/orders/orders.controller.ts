import { Param, Post, Get, Body, Controller, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth-guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Query } from "@nestjs/common";
import { DeliveryUpdateDto } from "./dto/delivery-update.dto";
import { ApiOperation, ApiHeader, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { WebhookSecretGuard } from "./guards/webhook-secret.guard";

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.ordersService.findAll(user.sub, filters);
  }

  @Post('orders/:id/delivery')
  @UseGuards(WebhookSecretGuard)
  @ApiOperation({ summary: 'Receive delivery status update from external system' })
  @ApiHeader({ name: 'x-webhook-secret', required: true })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiBody({
    type: DeliveryUpdateDto,
    examples: {
      example1: {
        summary: 'Example delivery update',
        value: {
          status: 'DELIVERED',
          amountCollected: 100
        }
      }
    }
  })
  handleDelivery(
    @Param('id') id: string,
    @Body() dto: DeliveryUpdateDto,
  ) {
    return this.ordersService.handleDeliveryUpdate(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('settlement')
  @ApiOperation({ summary: 'Calculate total settlement across all orders for the logged-in merchant' })
  calculateAll(@CurrentUser() user: any) {
    return this.ordersService.calculateForUser(user.sub);
  }
}