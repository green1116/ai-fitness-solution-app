import type { ProductTier } from "../catalog";
import type { BillingEntitlement } from "./types";

const ENTITLEMENT_MAP: Record<ProductTier, Omit<BillingEntitlement, "entitlementId" | "tier">> = {
  starter: {
    planGeneration: 10,
    budgetGeneration: 5,
    proposalPdf: true,
    tenderPackage: false,
    workspaceLimit: 1,
    userLimit: 3,
  },
  professional: {
    planGeneration: 100,
    budgetGeneration: 50,
    proposalPdf: true,
    tenderPackage: true,
    workspaceLimit: 5,
    userLimit: 25,
  },
  enterprise: {
    planGeneration: "unlimited",
    budgetGeneration: "unlimited",
    proposalPdf: true,
    tenderPackage: true,
    workspaceLimit: "unlimited",
    userLimit: "unlimited",
  },
};

export function buildEntitlements(): BillingEntitlement[] {
  return (["starter", "professional", "enterprise"] as const).map((tier) => ({
    entitlementId: `billing-entitlement-${tier}`,
    tier,
    ...ENTITLEMENT_MAP[tier],
  }));
}

export function buildEntitlementForTier(tier: ProductTier): BillingEntitlement {
  const entitlement = buildEntitlements().find((e) => e.tier === tier);
  if (!entitlement) {
    throw new Error(`Unknown billing entitlement tier: ${tier}`);
  }
  return entitlement;
}
