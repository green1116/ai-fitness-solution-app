import type { CustomerLifecycleStage, CustomerProfile, CustomerTier } from "./types";

const SAMPLES: Array<{ companyName: string; tier: CustomerTier; lifecycle: CustomerLifecycleStage; mrr: number }> = [
  { companyName: "某市体育局", tier: "enterprise", lifecycle: "active", mrr: 28_000 },
  { companyName: "某大学", tier: "professional", lifecycle: "expanding", mrr: 12_000 },
  { companyName: "某酒店集团", tier: "trial", lifecycle: "onboarding", mrr: 0 },
  { companyName: "某制造企业", tier: "professional", lifecycle: "at-risk", mrr: 8_000 },
];

export function buildCustomerProfiles(input?: { deploymentId?: string }): CustomerProfile[] {
  const deploymentId = input?.deploymentId ?? "customer-default";
  return SAMPLES.map((s, i) => ({
    customerId: `customer-${deploymentId}-${i + 1}`,
    companyName: s.companyName,
    tier: s.tier,
    lifecycleStage: s.lifecycle,
    mrrCny: s.mrr,
    mode: "readiness-stub" as const,
  }));
}
