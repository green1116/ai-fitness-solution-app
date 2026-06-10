import { buildCustomerProfiles } from "@/lib/revenue-operations/customer/builders";
import type { CustomerHealthScore, HealthStatus } from "./types";

function resolveStatus(overall: number): HealthStatus {
  if (overall >= 75) return "healthy";
  if (overall >= 50) return "warning";
  return "critical";
}

export function buildCustomerHealthScores(input?: { deploymentId?: string }): CustomerHealthScore[] {
  const deploymentId = input?.deploymentId ?? "health-default";
  const profiles = buildCustomerProfiles({ deploymentId });

  const scoreMap: Record<string, { usage: number; engagement: number; delivery: number; renewal: number }> = {
    enterprise: { usage: 88, engagement: 85, delivery: 92, renewal: 80 },
    professional: { usage: 72, engagement: 68, delivery: 75, renewal: 70 },
    trial: { usage: 45, engagement: 40, delivery: 50, renewal: 35 },
  };

  return profiles.map((p) => {
    const scores = scoreMap[p.tier] ?? scoreMap.professional;
    const lifecycleAdjust =
      p.lifecycleStage === "at-risk" ? -15 : p.lifecycleStage === "expanding" ? 10 : 0;
    const usageScore = Math.min(100, Math.max(0, scores.usage + lifecycleAdjust));
    const engagementScore = Math.min(100, Math.max(0, scores.engagement + lifecycleAdjust));
    const deliveryScore = Math.min(100, Math.max(0, scores.delivery));
    const renewalScore = Math.min(100, Math.max(0, scores.renewal + lifecycleAdjust));
    const overallScore = Math.round((usageScore + engagementScore + deliveryScore + renewalScore) / 4);

    return {
      customerId: p.customerId,
      companyName: p.companyName,
      usageScore,
      engagementScore,
      deliveryScore,
      renewalScore,
      overallScore,
      status: resolveStatus(overallScore),
      mode: "readiness-stub" as const,
    };
  });
}
