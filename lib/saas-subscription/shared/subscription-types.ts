export const SAAS_SUBSCRIPTION_VERSION = "v48-saas-subscription-p6" as const;
export const SAAS_SUBSCRIPTION_P6_TAG = "v48-saas-subscription-p6" as const;

export const UNLIMITED_QUOTA = -1 as const;

export const SUBSCRIPTION_ERROR_CODES = {
  FEATURE_NOT_ENABLED: "FEATURE_NOT_ENABLED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  SUBSCRIPTION_NOT_FOUND: "SUBSCRIPTION_NOT_FOUND",
  ENTITLEMENT_NOT_FOUND: "ENTITLEMENT_NOT_FOUND",
} as const;

export type SubscriptionErrorCode =
  (typeof SUBSCRIPTION_ERROR_CODES)[keyof typeof SUBSCRIPTION_ERROR_CODES];

export interface TenantEntitlements {
  tenantId: string;
  planCode: string;
  features: Record<string, boolean>;
  quotas: Record<string, number>;
  source: "plan" | "grant";
}

export interface QuotaCheckResult {
  allowed: boolean;
  remaining?: number | null;
  reason?: string;
}

export interface ConsumeQuotaResult {
  tenantId: string;
  quotaKey: string;
  used: number;
  remaining: number | null;
}
