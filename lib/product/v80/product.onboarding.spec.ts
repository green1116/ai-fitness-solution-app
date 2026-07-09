/**
 * V80 PRODUCT P1 — Onboarding flow (org → first PDF → value activation)
 */
import type { ProductOnboardingStep } from "./productization.types";

export const PRODUCT_ONBOARDING_FLOW: ProductOnboardingStep[] = [
  {
    id: "PRD-ONB-001",
    order: 1,
    stage: "signup",
    title: "Create operator account",
    userAction: "Enter org name, plan, admin email",
    apiRoute: "/api/v80/tenant/run",
    deliverable: "workspaceId",
    timeToValue: "< 2 min",
    required: true,
  },
  {
    id: "PRD-ONB-002",
    order: 2,
    stage: "setup",
    title: "Confirm entitlements",
    userAction: "View tier features & limits",
    apiRoute: "/api/v80/entitlements",
    deliverable: "feature map",
    timeToValue: "< 1 min",
    required: true,
  },
  {
    id: "PRD-ONB-003",
    order: 3,
    stage: "first-run",
    title: "Upload first tender",
    userAction: "Submit enterprise-gym RFP",
    apiRoute: "/api/v80/tender/intake",
    deliverable: "tenderId + quoteId",
    timeToValue: "< 5 min",
    required: true,
  },
  {
    id: "PRD-ONB-004",
    order: 4,
    stage: "first-run",
    title: "Generate first PDF",
    userAction: "Download plan PDF OR run autopilot (PRO+)",
    apiRoute: "/api/v80/pdf?type=plan",
    deliverable: "plan-pdf buffer",
    timeToValue: "< 3 min",
    required: true,
  },
  {
    id: "PRD-ONB-005",
    order: 5,
    stage: "activation",
    title: "Value activation checkpoint",
    userAction: "Complete first meaningful deliverable",
    apiRoute: "/api/v80/ops/health",
    deliverable: "integrity ok + artifact count ≥ 1",
    timeToValue: "< 15 min total",
    required: true,
  },
  {
    id: "PRD-ONB-006",
    order: 6,
    stage: "expansion",
    title: "Upgrade path trigger",
    userAction: "Hit budget/proposal gate → upgrade CTA",
    apiRoute: "/api/v80/budget/calculate",
    deliverable: "FEATURE_GATE → FitScale upsell",
    timeToValue: "on first gate",
    required: true,
  },
];

export function isProductOnboardingComplete(): boolean {
  const stages = new Set(PRODUCT_ONBOARDING_FLOW.map((s) => s.stage));
  return (
    PRODUCT_ONBOARDING_FLOW.length === 6 &&
    stages.has("signup") &&
    stages.has("activation") &&
    stages.has("expansion") &&
    PRODUCT_ONBOARDING_FLOW.every((s, i) => s.order === i + 1)
  );
}

export function getOnboardingActivationStep() {
  return PRODUCT_ONBOARDING_FLOW.find((s) => s.stage === "activation");
}
