import type { EntitlementLimits, ProductDefinition, ProductTier } from "./types";

const STARTER_ENTITLEMENTS: EntitlementLimits = {
  planGeneration: 10,
  budgetGeneration: 5,
  proposalPdf: true,
  tenderPackage: false,
  workspaceLimit: 1,
  userLimit: 3,
  supportLevel: "email",
  supportResponseHours: 48,
};

const PROFESSIONAL_ENTITLEMENTS: EntitlementLimits = {
  planGeneration: 100,
  budgetGeneration: 50,
  proposalPdf: true,
  tenderPackage: true,
  workspaceLimit: 5,
  userLimit: 25,
  supportLevel: "priority-email",
  supportResponseHours: 24,
};

const ENTERPRISE_ENTITLEMENTS: EntitlementLimits = {
  planGeneration: "unlimited",
  budgetGeneration: "unlimited",
  proposalPdf: true,
  tenderPackage: true,
  workspaceLimit: "unlimited",
  userLimit: "unlimited",
  supportLevel: "dedicated",
  supportResponseHours: 4,
};

function buildPlan(
  tier: ProductTier,
  name: string,
  tagline: string,
  description: string,
  entitlements: EntitlementLimits,
): ProductDefinition {
  return {
    id: `plan-${tier}`,
    tier,
    name,
    tagline,
    description,
    entitlements,
    pricingModel: "custom",
    pricingLabel: "Custom pricing — contact sales",
  };
}

export function buildProductPlans(): ProductDefinition[] {
  return [
    buildPlan(
      "starter",
      "Starter",
      "Essential AI fitness planning for small teams",
      "Entry tier for teams beginning AI-assisted fitness solution planning with core generation capabilities.",
      STARTER_ENTITLEMENTS,
    ),
    buildPlan(
      "professional",
      "Professional",
      "Advanced planning and tender workflows for growing organizations",
      "Mid tier with expanded generation limits, tender package support, and priority assistance.",
      PROFESSIONAL_ENTITLEMENTS,
    ),
    buildPlan(
      "enterprise",
      "Enterprise",
      "Full-scale AI Fitness Solution for enterprise deployments",
      "Top tier with unlimited generation, full tender package entitlements, and dedicated support.",
      ENTERPRISE_ENTITLEMENTS,
    ),
  ];
}

export function buildProductPlan(tier: ProductTier): ProductDefinition {
  const plan = buildProductPlans().find((p) => p.tier === tier);
  if (!plan) {
    throw new Error(`Unknown product tier: ${tier}`);
  }
  return plan;
}
