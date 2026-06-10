import type {
  OrderLifecycle,
  OrderLifecycleEvent,
  OrderModel,
  OrderProductTier,
  OrderStatus,
  OrderSummary,
} from "./types";

const TIER_PRICING: Record<OrderProductTier, { name: string; amount: number }> = {
  free: { name: "免费预览", amount: 0 },
  pro: { name: "Pro 专业版", amount: 29900 },
  enterprise: { name: "Enterprise 企业版", amount: 99900 },
};

function tierAmount(tier: OrderProductTier): number {
  return TIER_PRICING[tier].amount;
}

function tierName(tier: OrderProductTier): string {
  return TIER_PRICING[tier].name;
}

export function buildOrderModel(input?: {
  deploymentId?: string;
  tier?: OrderProductTier;
  status?: OrderStatus;
}): OrderModel {
  const deploymentId = input?.deploymentId ?? "order-default";
  const tier = input?.tier ?? "pro";
  const status = input?.status ?? "confirmed";
  const now = new Date().toISOString();

  return {
    orderId: `order-${deploymentId}`,
    customerId: `customer-${deploymentId}`,
    productTier: tier,
    productName: tierName(tier),
    amount: tierAmount(tier),
    currency: "CNY",
    status,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildOrderLifecycle(input?: {
  deploymentId?: string;
  order?: OrderModel;
}): OrderLifecycle {
  const deploymentId = input?.deploymentId ?? "order-default";
  const order = input?.order ?? buildOrderModel({ deploymentId });
  const baseTime = new Date(order.createdAt).getTime();

  const stageSequence: Array<{
    stage: OrderLifecycleEvent["stage"];
    status: OrderStatus;
    offsetMinutes: number;
    note: string;
  }> = [
    { stage: "created", status: "pending", offsetMinutes: 0, note: "订单已创建" },
    { stage: "payment-pending", status: "pending", offsetMinutes: 1, note: "等待支付确认（描述层占位）" },
    { stage: "confirmed", status: "confirmed", offsetMinutes: 5, note: "订单已确认" },
    { stage: "provisioned", status: "processing", offsetMinutes: 10, note: "权益已预配" },
    { stage: "fulfilled", status: "fulfilled", offsetMinutes: 15, note: "交付完成" },
    { stage: "closed", status: "fulfilled", offsetMinutes: 20, note: "订单生命周期关闭" },
  ];

  const events: OrderLifecycleEvent[] = stageSequence.map((item, index) => ({
    eventId: `order-event-${deploymentId}-${index}`,
    orderId: order.orderId,
    stage: item.stage,
    status: item.status,
    occurredAt: new Date(baseTime + item.offsetMinutes * 60_000).toISOString(),
    note: item.note,
  }));

  return {
    lifecycleId: `order-lifecycle-${deploymentId}`,
    orderId: order.orderId,
    currentStage: events[events.length - 1]?.stage ?? "created",
    events,
  };
}

export function buildOrderSummary(input?: {
  deploymentId?: string;
  order?: OrderModel;
  lifecycle?: OrderLifecycle;
}): OrderSummary {
  const deploymentId = input?.deploymentId ?? "order-default";
  const order = input?.order ?? buildOrderModel({ deploymentId });
  const lifecycle =
    input?.lifecycle ?? buildOrderLifecycle({ deploymentId, order });

  return {
    summaryId: `order-summary-${deploymentId}`,
    orderId: order.orderId,
    productTier: order.productTier,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    lifecycleStage: lifecycle.currentStage,
    summary: `order-summary id=${order.orderId} tier=${order.productTier} status=${order.status} stage=${lifecycle.currentStage} amount=${order.amount}`,
  };
}
