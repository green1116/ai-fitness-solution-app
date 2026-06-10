import type { REVENUE_FOUNDATION_VERSION } from "../shared/types";

export const ORDER_RUNTIME_VERSION = "v10.0-order-runtime-1" as const;

export type OrderProductTier = "free" | "pro" | "enterprise";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type OrderLifecycleStage =
  | "created"
  | "payment-pending"
  | "confirmed"
  | "provisioned"
  | "fulfilled"
  | "closed";

export interface OrderModel {
  orderId: string;
  customerId: string;
  productTier: OrderProductTier;
  productName: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLifecycleEvent {
  eventId: string;
  orderId: string;
  stage: OrderLifecycleStage;
  status: OrderStatus;
  occurredAt: string;
  note: string;
}

export interface OrderLifecycle {
  lifecycleId: string;
  orderId: string;
  currentStage: OrderLifecycleStage;
  events: OrderLifecycleEvent[];
}

export interface OrderSummary {
  summaryId: string;
  orderId: string;
  productTier: OrderProductTier;
  status: OrderStatus;
  amount: number;
  currency: string;
  lifecycleStage: OrderLifecycleStage;
  summary: string;
}

export interface OrderRuntimePayload {
  version: typeof ORDER_RUNTIME_VERSION;
  foundationVersion: typeof REVENUE_FOUNDATION_VERSION;
  order: OrderModel;
  lifecycle: OrderLifecycle;
  summary: OrderSummary;
}
