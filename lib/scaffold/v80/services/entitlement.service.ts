/** @scaffold BLP-API-002 → entitlement resolution */
import { V80RuntimeError } from "../runtime/errors";
import { v80Persist, type V80Plan } from "../runtime/store";

const PLAN_FEATURES: Record<
  V80Plan,
  { tier: V80Plan; features: Record<string, boolean | number>; limits: Record<string, number> }
> = {
  BASIC: {
    tier: "BASIC",
    features: { planGeneration: true, budgetGeneration: false, tenderPackage: false, proposalPdf: false },
    limits: { planGeneration: 3, budgetGeneration: 0, tenderPackage: 0 },
  },
  PRO: {
    tier: "PRO",
    features: { planGeneration: true, budgetGeneration: true, tenderPackage: true, proposalPdf: true },
    limits: { planGeneration: 20, budgetGeneration: 10, tenderPackage: 5 },
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    features: { planGeneration: true, budgetGeneration: true, tenderPackage: true, proposalPdf: true },
    limits: { planGeneration: 9999, budgetGeneration: 9999, tenderPackage: 9999 },
  },
};

export async function resolveEntitlements(organizationId: string) {
  const org = await v80Persist.getOrg(organizationId);
  if (!org) {
    throw new V80RuntimeError("Subscription missing", "NO_SUBSCRIPTION", 404);
  }

  const spec = PLAN_FEATURES[org.plan];
  const usage = await v80Persist.getUsageMap(organizationId);

  return {
    organizationId,
    tier: spec.tier,
    features: spec.features,
    limits: spec.limits,
    usage,
  };
}
