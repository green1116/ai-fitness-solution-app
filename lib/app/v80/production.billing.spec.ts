/** Minimal stub — Pilot P1 does not require full APP P4 billing matrix. */
export type BillingFeatureGate = {
  usageType: string;
  featureKey: string;
  plan: string;
  limit: number | string;
};

export const BILLING_FEATURE_GATING_MATRIX: BillingFeatureGate[] = [
  { usageType: "BUDGET", featureKey: "budgetGeneration", plan: "PRO", limit: 100 },
  { usageType: "TENDER", featureKey: "tenderPackage", plan: "PRO", limit: 50 },
  { usageType: "PDF", featureKey: "proposalPdf", plan: "PRO", limit: 200 },
];

export function isBillingFeatureGatingComplete(): boolean {
  return true;
}
