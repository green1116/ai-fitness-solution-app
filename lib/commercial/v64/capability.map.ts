/**
 * V64 P1 — Capability mapping (product tiers ↔ runtime gates; read-only bridge)
 */
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { PLAN_FEATURE_MATRIX } from "@/lib/feature-flags/feature.service";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";
import type { ProductTier } from "@/lib/productization/catalog";

import type { CapabilityBinding, CapabilityMap, TierCapabilityRow } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export const PRODUCT_TO_SAAS_PLAN: Record<ProductTier, SaasPlan> = {
  starter: "BASIC",
  professional: "PRO",
  enterprise: "ENTERPRISE",
};

export const SAAS_TO_PRODUCT_TIER: Record<SaasPlan, ProductTier> = {
  BASIC: "starter",
  PRO: "professional",
  ENTERPRISE: "enterprise",
};

export const PRODUCT_TO_USER_TIER: Record<ProductTier, UserTier> = {
  starter: "free",
  professional: "pro",
  enterprise: "enterprise",
};

export const USER_TO_PRODUCT_TIER: Partial<Record<UserTier, ProductTier>> = {
  free: "starter",
  pro: "professional",
  enterprise: "enterprise",
};

export const PRODUCT_FEATURE_TO_CAPABILITY: CapabilityBinding[] = [
  {
    productFeatureKey: "planGeneration",
    featureFlagKey: "canGenerateQuote",
    usageType: "QUOTE",
    description: "AI plan / quote generation",
  },
  {
    productFeatureKey: "budgetGeneration",
    featureFlagKey: "canGenerateBudget",
    usageType: "BUDGET",
    description: "Budget generation",
  },
  {
    productFeatureKey: "tenderPackage",
    featureFlagKey: "canGenerateTender",
    usageType: "TENDER",
    description: "Tender package generation",
  },
  {
    productFeatureKey: "proposalPdf",
    featureFlagKey: "canExportPDF",
    usageType: "PDF",
    description: "Proposal PDF export",
  },
  {
    productFeatureKey: "workspaceLimit",
    featureFlagKey: null,
    usageType: null,
    description: "Workspace quota (catalog entitlement)",
  },
  {
    productFeatureKey: "userLimit",
    featureFlagKey: null,
    usageType: null,
    description: "User quota (catalog entitlement)",
  },
  {
    productFeatureKey: "supportLevel",
    featureFlagKey: null,
    usageType: null,
    description: "Support SLA (catalog entitlement)",
  },
];

const ALL_PRODUCT_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

export function resolveSaasPlanForProductTier(tier: ProductTier): SaasPlan {
  return PRODUCT_TO_SAAS_PLAN[tier];
}

export function resolveProductTierForSaasPlan(plan: SaasPlan): ProductTier {
  return SAAS_TO_PRODUCT_TIER[plan];
}

export function resolveUserTierForProductTier(tier: ProductTier): UserTier {
  return PRODUCT_TO_USER_TIER[tier];
}

export function featureKeysForSaasPlan(plan: SaasPlan): FeatureKey[] {
  const flags = PLAN_FEATURE_MATRIX[plan];
  return (Object.keys(flags) as FeatureKey[]).filter((k) => flags[k]);
}

export function buildTierCapabilityRow(tier: ProductTier): TierCapabilityRow {
  const saasPlan = resolveSaasPlanForProductTier(tier);
  const userTier = resolveUserTierForProductTier(tier);
  return {
    productTier: tier,
    saasPlan,
    userTier,
    featureFlags: featureKeysForSaasPlan(saasPlan),
    capabilities: PRODUCT_FEATURE_TO_CAPABILITY,
  };
}

export function buildCapabilityMap(input?: { deploymentId?: string }): CapabilityMap {
  const deploymentId = input?.deploymentId ?? "v64-commercial-foundation-default";
  const tiers = ALL_PRODUCT_TIERS.map(buildTierCapabilityRow);
  return {
    version: V64_COMMERCIAL_FOUNDATION_VERSION,
    mapId: `capability-map-${deploymentId}`,
    tiers,
    summary: `capability-map tiers=${tiers.length} bindings=${PRODUCT_FEATURE_TO_CAPABILITY.length}`,
  };
}
