import type { ChurnRiskLevel, CustomerHealthTrend, RetentionProfile } from "./types";

function resolveChurnRisk(retentionRate: number): ChurnRiskLevel {
  if (retentionRate >= 85) return "low";
  if (retentionRate >= 70) return "medium";
  return "high";
}

export function buildRetentionProfile(input?: {
  deploymentId?: string;
  customerId?: string;
}): RetentionProfile {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  const customerId = input?.customerId ?? `customer-${deploymentId}`;
  const retentionRate = 88;

  return {
    profileId: `retention-profile-${deploymentId}`,
    customerId,
    retentionRate,
    churnRisk: resolveChurnRisk(retentionRate),
    customerHealth: "stable",
    engagementTrend: "improving",
    summary: `retention-profile rate=${retentionRate}% churnRisk=${resolveChurnRisk(retentionRate)} health=stable trend=improving`,
  };
}
