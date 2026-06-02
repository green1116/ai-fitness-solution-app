import type { ProductFeature, ProductTier } from "./types";

export function buildProductFeatures(): ProductFeature[] {
  return [
    {
      id: "feat-plan-generation",
      key: "planGeneration",
      label: "Plan Generation",
      description: "AI-assisted fitness solution plan generation entitlement.",
      category: "generation",
      tiers: { starter: 10, professional: 100, enterprise: "unlimited" },
    },
    {
      id: "feat-budget-generation",
      key: "budgetGeneration",
      label: "Budget Generation",
      description: "Automated budget generation for fitness solution proposals.",
      category: "generation",
      tiers: { starter: 5, professional: 50, enterprise: "unlimited" },
    },
    {
      id: "feat-proposal-pdf",
      key: "proposalPdf",
      label: "Proposal PDF",
      description: "Export proposal documents as PDF.",
      category: "export",
      tiers: { starter: true, professional: true, enterprise: true },
    },
    {
      id: "feat-tender-package",
      key: "tenderPackage",
      label: "Tender Package",
      description: "Full tender package generation and export.",
      category: "export",
      tiers: { starter: false, professional: true, enterprise: true },
    },
    {
      id: "feat-workspace-limits",
      key: "workspaceLimit",
      label: "Workspace Limits",
      description: "Number of workspaces available per account.",
      category: "collaboration",
      tiers: { starter: 1, professional: 5, enterprise: "unlimited" },
    },
    {
      id: "feat-user-limits",
      key: "userLimit",
      label: "User Limits",
      description: "Number of users per workspace.",
      category: "collaboration",
      tiers: { starter: 3, professional: 25, enterprise: "unlimited" },
    },
    {
      id: "feat-support-limits",
      key: "supportLevel",
      label: "Support Limits",
      description: "Support channel and response time entitlement.",
      category: "support",
      tiers: { starter: 48, professional: 24, enterprise: 4 },
    },
  ];
}

export function getFeaturesForTier(tier: ProductTier): ProductFeature[] {
  return buildProductFeatures().filter((feature) => {
    const value = feature.tiers[tier];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    return value === "unlimited";
  });
}

export function getFeatureIdsForTier(tier: ProductTier): string[] {
  return getFeaturesForTier(tier).map((f) => f.id);
}
