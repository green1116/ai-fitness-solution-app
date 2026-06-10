import type { PAYMENT_READINESS_VERSION } from "../shared/types";

export const PAYMENT_GATEWAY_RUNTIME_VERSION = "v10.1-payment-gateway-runtime-1" as const;

export type PaymentGatewayId =
  | "stripe"
  | "paypal"
  | "alipay"
  | "wechat"
  | "enterprise-procurement";

export type ReadinessStubMode = "readiness-stub";

export interface CheckoutInput {
  orderId: string;
  amount: number;
  currency: string;
  customerId: string;
  returnUrl: string;
}

export interface CheckoutResult {
  mode: ReadinessStubMode;
  gatewayId: PaymentGatewayId;
  checkoutId: string;
  checkoutUrl: string;
  expiresAt: string;
  status: "created";
}

export interface VerifyPaymentInput {
  paymentId: string;
  orderId: string;
}

export interface VerifyPaymentResult {
  mode: ReadinessStubMode;
  gatewayId: PaymentGatewayId;
  paymentId: string;
  orderId: string;
  verified: boolean;
  status: "succeeded" | "pending" | "failed";
}

export interface RefundPaymentInput {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RefundPaymentResult {
  mode: ReadinessStubMode;
  gatewayId: PaymentGatewayId;
  refundId: string;
  paymentId: string;
  amount: number;
  status: "pending" | "succeeded";
}

export interface SyncSubscriptionInput {
  subscriptionId: string;
  externalSubscriptionId: string;
}

export interface SyncSubscriptionResult {
  mode: ReadinessStubMode;
  gatewayId: PaymentGatewayId;
  subscriptionId: string;
  externalSubscriptionId: string;
  synced: boolean;
  status: "active" | "past-due" | "cancelled";
}

export interface PaymentGatewayAdapter {
  gatewayId: PaymentGatewayId;
  displayName: string;
  readinessLevel: "stub" | "contract-ready";
  createCheckout(input: CheckoutInput): CheckoutResult;
  verifyPayment(input: VerifyPaymentInput): VerifyPaymentResult;
  refundPayment(input: RefundPaymentInput): RefundPaymentResult;
  syncSubscription(input: SyncSubscriptionInput): SyncSubscriptionResult;
}

export interface PaymentGatewayRuntimePayload {
  version: typeof PAYMENT_GATEWAY_RUNTIME_VERSION;
  readinessVersion: typeof PAYMENT_READINESS_VERSION;
  adapters: PaymentGatewayAdapter[];
  supportedGateways: PaymentGatewayId[];
  summary: string;
}
