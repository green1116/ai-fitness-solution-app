import type { PaymentSession } from "@/lib/pay/paymentSession";

export type ProviderName = "mock" | "stripe" | "wechat";

export type PaymentOrderStatus =
  | "pending"
  | "mock_started"
  | "paid"
  | "failed"
  | "canceled";

export type CreateOrderInput = {
  planId: string;
  projectId: string;
  targetLevel: "pro" | "enterprise";
  amount: number;
  userId?: string | null;
  clientFingerprint?: string | null;
};

export type PaymentOrder = {
  orderId: string;
  planId: string;
  targetLevel: "pro" | "enterprise";
  amount: number;
  status: PaymentOrderStatus;
  provider: ProviderName;
  providerOrderId: string | null;
  paidAt: string | null;
};

export type CreateOrderResult = {
  ok: boolean;
  order: PaymentOrder;
  message?: string;
};

export type StartPaymentInput = {
  orderId: string;
  planId?: string;
  targetLevel?: "pro" | "enterprise";
  baseUrl: string;
};

export type StartPaymentResult = {
  ok: boolean;
  order: PaymentOrder;
  paymentSession: PaymentSession;
  paymentStatus: "mock_started" | "pending" | "paid";
  message?: string;
};

export type WebhookInput = Record<string, unknown>;

/** 浏览器 mock 收银 POST /api/pay/webhook 时携带，用于订单未落库或 DB targetLevel 异常时的兜底与对账 */
export type PayConfirmPaidHints = {
  fallbackPlanId?: string | null;
  fallbackTargetLevel?: "pro" | "enterprise" | null;
};

export type WebhookEvent =
  | { kind: "payment_succeeded"; orderId: string }
  | { kind: "payment_failed"; orderId: string }
  | { kind: "payment_canceled"; orderId: string };
