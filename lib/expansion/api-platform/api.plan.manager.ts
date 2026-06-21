/**
 * V60 P4 — API plan manager (plan-based limits, billing integration read-only)
 */

import { checkFeatureAccess } from "@/lib/feature-flags/feature-gate";
import { resolvePlanRateLimits } from "@/lib/security/rate-limit";
import type { SaasPlan } from "@/lib/saas/types";
import { API_ACCESS_PLANS, type ApiEndpointDefinition } from "./api.registry";

export type ApiKeyRecord = {
  keyId: string;
  organizationId: string;
  label: string;
  planId: string;
  createdAt: string;
  lastUsedAt?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __apiKeys: Map<string, ApiKeyRecord> | undefined;
}

function getKeyStore(): Map<string, ApiKeyRecord> {
  globalThis.__apiKeys ||= new Map();
  return globalThis.__apiKeys;
}

export function createApiKey(input: {
  organizationId: string;
  label: string;
  planId: string;
}): ApiKeyRecord {
  const keyId = `ak_${input.organizationId.slice(0, 8)}_${Date.now().toString(36)}`;
  const record: ApiKeyRecord = {
    keyId,
    organizationId: input.organizationId,
    label: input.label,
    planId: input.planId,
    createdAt: new Date().toISOString(),
  };
  getKeyStore().set(keyId, record);
  return record;
}

export function resolveApiKey(keyId: string): ApiKeyRecord | undefined {
  return getKeyStore().get(keyId);
}

export function resolvePlanForSaasTier(plan: SaasPlan): string {
  if (plan === "ENTERPRISE") return "enterprise_api";
  if (plan === "PRO") return "pro_api";
  return "basic_api";
}

export async function validateApiAccess(input: {
  organizationId: string;
  endpoint: string;
  saasPlan?: SaasPlan;
}): Promise<{ allowed: boolean; reason?: string; rateLimit?: number }> {
  const featureCheck = await checkFeatureAccess(input.organizationId, "canUseAPI");
  if (!featureCheck.allowed) {
    return { allowed: false, reason: featureCheck.reason ?? "API access requires ENTERPRISE plan" };
  }

  const planId = resolvePlanForSaasTier(featureCheck.plan);
  const apiPlan = API_ACCESS_PLANS[planId];
  if (!apiPlan) {
    return { allowed: false, reason: "API plan not configured" };
  }

  if (!apiPlan.allowedEndpoints.includes(input.endpoint) && apiPlan.allowedEndpoints.length > 0) {
    const wildcard = apiPlan.allowedEndpoints.includes("*");
    if (!wildcard) {
      return { allowed: false, reason: `Endpoint not included in ${apiPlan.name}` };
    }
  }

  const rateLimits = resolvePlanRateLimits(featureCheck.plan);
  return {
    allowed: true,
    rateLimit: Math.min(apiPlan.rateLimitPerMinute, rateLimits.orgPerMinute),
  };
}

export function listEndpointsForPlan(planId: string): ApiEndpointDefinition[] {
  const plan = API_ACCESS_PLANS[planId];
  if (!plan) return [];
  return plan.allowedEndpoints.map((path) => ({
    path,
    method: "POST" as const,
    feature: "canUseAPI" as const,
    description: path,
  }));
}

export function clearApiKeysForTests(): void {
  globalThis.__apiKeys = new Map();
}
