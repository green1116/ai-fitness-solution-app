/**
 * V59.5 — Plan-aware API rate limiting (per-user, per-org, per-plan)
 */

import { rateLimit, type RateLimitResult } from "@/lib/rate-limit";
import { getActiveSubscription } from "@/lib/billing/subscription.service";
import type { SaasPlan } from "@/lib/saas/types";

export class RateLimitError extends Error {
  readonly code = "RATE_LIMITED";
  readonly status = 429;
  readonly retryAfterSec: number;

  constructor(message: string, retryAfterSec: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

export type PlanRateLimitConfig = {
  userPerMinute: number;
  orgPerMinute: number;
};

/** BASIC: low | PRO: medium | ENTERPRISE: high */
export const PLAN_RATE_LIMITS: Record<SaasPlan, PlanRateLimitConfig> = {
  BASIC: { userPerMinute: 30, orgPerMinute: 100 },
  PRO: { userPerMinute: 120, orgPerMinute: 500 },
  ENTERPRISE: { userPerMinute: 600, orgPerMinute: 3000 },
};

const WINDOW_MS = 60_000;

export function resolvePlanRateLimits(plan: SaasPlan): PlanRateLimitConfig {
  return PLAN_RATE_LIMITS[plan];
}

export async function resolveOrganizationPlan(organizationId: string): Promise<SaasPlan> {
  const sub = await getActiveSubscription(organizationId);
  const plan = sub?.plan?.toUpperCase() as SaasPlan | undefined;
  if (plan && plan in PLAN_RATE_LIMITS) return plan;
  return "BASIC";
}

function checkLimit(key: string, limit: number): RateLimitResult {
  return rateLimit(key, limit, WINDOW_MS);
}

export async function enforceRateLimit(input: {
  userId: string;
  organizationId: string;
  endpoint: string;
  plan?: SaasPlan;
}): Promise<{ plan: SaasPlan; remaining: { user: number; org: number } }> {
  const plan = input.plan ?? (await resolveOrganizationPlan(input.organizationId));
  const limits = resolvePlanRateLimits(plan);

  const userKey = `rl:user:${input.userId}:${input.endpoint}`;
  const orgKey = `rl:org:${input.organizationId}:${input.endpoint}`;

  const userResult = checkLimit(userKey, limits.userPerMinute);
  if (!userResult.ok) {
    throw new RateLimitError(
      `User rate limit exceeded for ${input.endpoint}`,
      userResult.retryAfterSec,
    );
  }

  const orgResult = checkLimit(orgKey, limits.orgPerMinute);
  if (!orgResult.ok) {
    throw new RateLimitError(
      `Organization rate limit exceeded for ${input.endpoint}`,
      orgResult.retryAfterSec,
    );
  }

  return {
    plan,
    remaining: { user: userResult.remaining, org: orgResult.remaining },
  };
}

export function peekRateLimitState(key: string): number {
  return rateLimit(key, Number.MAX_SAFE_INTEGER, WINDOW_MS).remaining;
}
