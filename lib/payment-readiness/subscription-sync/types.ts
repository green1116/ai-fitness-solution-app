import type { PAYMENT_READINESS_VERSION } from "../shared/types";

export const SUBSCRIPTION_SYNC_RUNTIME_VERSION = "v10.1-subscription-sync-runtime-1" as const;

export type SubscriptionSyncAction =
  | "activate"
  | "renew"
  | "suspend"
  | "cancel"
  | "expire";

export type SubscriptionSyncStatus =
  | "active"
  | "renewing"
  | "suspended"
  | "cancelled"
  | "expired";

export interface SubscriptionSyncTransition {
  action: SubscriptionSyncAction;
  fromStatus: SubscriptionSyncStatus | "none";
  toStatus: SubscriptionSyncStatus;
  description: string;
  reversible: boolean;
}

export interface SubscriptionSyncEvent {
  eventId: string;
  subscriptionId: string;
  action: SubscriptionSyncAction;
  fromStatus: SubscriptionSyncStatus | "none";
  toStatus: SubscriptionSyncStatus;
  occurredAt: string;
  mode: "readiness-stub";
}

export interface SubscriptionSyncRuntimePayload {
  version: typeof SUBSCRIPTION_SYNC_RUNTIME_VERSION;
  readinessVersion: typeof PAYMENT_READINESS_VERSION;
  transitions: SubscriptionSyncTransition[];
  lifecycle: SubscriptionSyncEvent[];
  summary: string;
}
