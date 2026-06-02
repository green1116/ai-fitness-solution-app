import type { EngagementProfile } from "./types";

export function buildEngagementProfile(input?: { deploymentId?: string }): EngagementProfile {
  const deploymentId = input?.deploymentId ?? "customer-success-default";
  return {
    profileId: `engagement-profile-${deploymentId}`,
    loginFrequency: 4.2,
    featureUsage: 68,
    projectActivity: 72,
    deliveryParticipation: 81,
    summary: `engagement-profile logins=4.2/wk featureUsage=68% projectActivity=72% deliveryParticipation=81%`,
  };
}
