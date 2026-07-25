/**
 * Product Billing — Plan types
 */

import type { BILLING_PLAN_TIERS } from "../foundation/foundation.constants";

export type BillingPlanTier = (typeof BILLING_PLAN_TIERS)[number];
export type PlanMetadata = Record<string, unknown>;

export type BillingPlan = {
  id: string;
  code: string;
  name: string;
  tier: BillingPlanTier;
  amountCents: number;
  currency: string;
  interval: "MONTHLY" | "YEARLY";
  active: boolean;
  detail: string;
  metadata: PlanMetadata;
  createdAt: string;
};

export type RegisterBillingPlanInput = {
  id?: string;
  code: string;
  name: string;
  tier: BillingPlanTier;
  amountCents: number;
  currency?: string;
  interval?: "MONTHLY" | "YEARLY";
  metadata?: PlanMetadata;
};
