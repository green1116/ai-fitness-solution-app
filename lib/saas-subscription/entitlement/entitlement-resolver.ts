import { getPlanByCode } from "@/lib/saas-foundation/subscription/plan-catalog";
import {
  deleteTenantEntitlementsCache,
  getTenantEntitlementsFromCache,
  setTenantEntitlementsCache,
} from "../cache/subscription-cache";
import { SUBSCRIPTION_ERROR_CODES, SaasSubscriptionError } from "../shared/subscription-errors";
import type { TenantEntitlements } from "../shared/subscription-types";
import { UNLIMITED_QUOTA } from "../shared/subscription-types";

const DEFAULT_PLAN_CODE = "trial";
const tenantPlanRegistry = new Map<string, string>();
const grantOverrides = new Map<string, { features?: Record<string, boolean>; quotas?: Record<string, number> }>();

export function setTenantPlanCode(tenantId: string, planCode: string): void {
  tenantPlanRegistry.set(tenantId, planCode);
  deleteTenantEntitlementsCache(tenantId);
}

export function getTenantPlanCode(tenantId: string): string | undefined {
  return tenantPlanRegistry.get(tenantId);
}

export function clearTenantPlanRegistry(): void {
  tenantPlanRegistry.clear();
  grantOverrides.clear();
}

export function setTenantGrantOverride(
  tenantId: string,
  override: { features?: Record<string, boolean>; quotas?: Record<string, number> },
): void {
  grantOverrides.set(tenantId, override);
  deleteTenantEntitlementsCache(tenantId);
}

function applyRuntimeQuotaPolicy(planCode: string, quotas: Record<string, number>): Record<string, number> {
  if (planCode !== "enterprise") return { ...quotas };
  return Object.fromEntries(Object.keys(quotas).map((key) => [key, UNLIMITED_QUOTA]));
}

export function buildEntitlementsFromPlan(tenantId: string, planCode: string): TenantEntitlements {
  const plan = getPlanByCode(planCode);
  if (!plan) {
    throw new SaasSubscriptionError(SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND, `Plan not found: ${planCode}`);
  }

  const override = grantOverrides.get(tenantId);
  return {
    tenantId,
    planCode: plan.code,
    features: { ...(plan.features as Record<string, boolean>), ...(override?.features ?? {}) },
    quotas: {
      ...applyRuntimeQuotaPolicy(plan.code, plan.quotas as Record<string, number>),
      ...(override?.quotas ?? {}),
    },
    source: override ? "grant" : "plan",
  };
}

export async function resolveEntitlements(tenantId: string): Promise<TenantEntitlements> {
  if (!tenantId?.trim()) {
    throw new SaasSubscriptionError(SUBSCRIPTION_ERROR_CODES.ENTITLEMENT_NOT_FOUND, "tenantId is required");
  }

  const cached = getTenantEntitlementsFromCache(tenantId);
  if (cached) return cached;

  const planCode = getTenantPlanCode(tenantId) ?? DEFAULT_PLAN_CODE;
  const entitlements = buildEntitlementsFromPlan(tenantId, planCode);
  setTenantEntitlementsCache(tenantId, entitlements);
  return entitlements;
}

export function resolveEntitlementsSync(tenantId: string): TenantEntitlements {
  const cached = getTenantEntitlementsFromCache(tenantId);
  if (cached) return cached;
  const planCode = getTenantPlanCode(tenantId) ?? DEFAULT_PLAN_CODE;
  const entitlements = buildEntitlementsFromPlan(tenantId, planCode);
  setTenantEntitlementsCache(tenantId, entitlements);
  return entitlements;
}
