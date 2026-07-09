/**
 * V80 PRODUCT P2 — Expansion engine (BASIC → PRO → ENTERPRISE)
 */
import { PRODUCT_PACKAGING_TIERS } from "./product.packaging.spec";
import type { ExpansionPath } from "./growth.types";

export const EXPANSION_PATHS: ExpansionPath[] = [
  {
    id: "PRD-EXP-001",
    fromPlan: "BASIC",
    toPlan: "PRO",
    triggerRule: "FEATURE_GATE on budget OR autopilot OR proposal API",
    unlockFeatures: ["budgetGeneration", "tenderPackage", "proposalPdf"],
    pricingDelta: "+$250/mo ($49 → $299)",
    salesMotion: "self-serve",
    required: true,
  },
  {
    id: "PRD-EXP-002",
    fromPlan: "BASIC",
    toPlan: "PRO",
    triggerRule: "planGeneration usage ≥ 8/10 monthly limit",
    unlockFeatures: ["budgetGeneration", "tenderPackage"],
    pricingDelta: "+$250/mo",
    salesMotion: "self-serve",
    required: true,
  },
  {
    id: "PRD-EXP-003",
    fromPlan: "PRO",
    toPlan: "ENTERPRISE",
    triggerRule: "USAGE_LIMIT on tenderPackage OR bundle download gate",
    unlockFeatures: ["apiAccess", "enterprise-bundle", "integrity-governance", "unlimited users"],
    pricingDelta: "custom ACV (annual contract)",
    salesMotion: "sales-assist",
    required: true,
  },
  {
    id: "PRD-EXP-004",
    fromPlan: "PRO",
    toPlan: "ENTERPRISE",
    triggerRule: "workspaceLimit ≥ 5 OR multi-site GTM motion detected",
    unlockFeatures: ["unlimited workspaces", "ops-dashboard"],
    pricingDelta: "custom ACV",
    salesMotion: "enterprise-contract",
    required: true,
  },
  {
    id: "PRD-EXP-005",
    fromPlan: "BASIC",
    toPlan: "ENTERPRISE",
    triggerRule: "Direct enterprise inbound — skip PRO (sales-assist only)",
    unlockFeatures: ["all modules"],
    pricingDelta: "custom ACV — bypass self-serve",
    salesMotion: "enterprise-contract",
    required: true,
  },
];

export function isExpansionEngineComplete(): boolean {
  const packagingPlans = new Set(PRODUCT_PACKAGING_TIERS.map((p) => p.plan));
  const paths = new Set(EXPANSION_PATHS.map((e) => `${e.fromPlan}->${e.toPlan}`));
  return (
    EXPANSION_PATHS.length === 5 &&
    paths.has("BASIC->PRO") &&
    paths.has("PRO->ENTERPRISE") &&
    packagingPlans.has("BASIC") &&
    packagingPlans.has("PRO") &&
    packagingPlans.has("ENTERPRISE")
  );
}

export function getExpansionFromPlan(plan: ExpansionPath["fromPlan"]) {
  return EXPANSION_PATHS.filter((e) => e.fromPlan === plan);
}
