import type { RenewalProfile } from "./types";

export function buildRenewalProfile(input?: { deploymentId?: string }): RenewalProfile {
  const deploymentId = input?.deploymentId ?? "customer-success-default";
  return {
    profileId: `renewal-profile-${deploymentId}`,
    renewalProbability: 78,
    expansionOpportunity: 62,
    riskIndicators: [
      "Tender package usage below enterprise benchmark",
      "Two inactive users in last 14 days",
    ],
    recommendations: [
      "Schedule executive business review before renewal window",
      "Enable tender package training for power users",
      "Propose Professional-to-Enterprise expansion workshop",
    ],
    summary: `renewal-profile probability=78% expansion=62% risks=2 recommendations=3`,
  };
}
