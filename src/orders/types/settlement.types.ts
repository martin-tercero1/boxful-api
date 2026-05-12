export interface OrderSettlementResult {
  orderNumber: string;
  status: string;
  cashOnDelivery: boolean;
  amountCollected: number;
  shippingCost: number;
  commission: number;
  settlementAmount: number;
}

export interface UserSettlementResult {
  orders: OrderSettlementResult[];
  totalSettlement: number;
}