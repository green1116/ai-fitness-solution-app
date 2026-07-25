/**
 * Product P10 — Plan types
 */

import type { PLAN_TIERS } from "../subscription/subscription.constants";

export type PlanTier = (typeof PLAN_TIERS)[number];
export type PlanMetadata = Record<string, unknown>;

export type SubscriptionPlan = {
  id: string;
  tier: PlanTier;
  name: string;
  description: string;
  features: string[];
  detail: string;
  metadata: PlanMetadata;
  createdAt: string;
};

export type RegisterPlanInput = {
  id?: string;
  tier: PlanTier;
  name: string;
  description?: string;
  features?: string[];
  metadata?: PlanMetadata;
};
