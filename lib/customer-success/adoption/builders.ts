import type { AdoptionMetric } from "./types";

export function buildAdoptionMetrics(input?: { deploymentId?: string }): AdoptionMetric[] {
  const deploymentId = input?.deploymentId ?? "adoption-default";
  return [
    {
      metricId: `adopt-feature-${deploymentId}`,
      category: "feature",
      adoptionRate: 0.72,
      activeUsers: 18,
      totalUsers: 25,
      trend: "up",
    },
    {
      metricId: `adopt-proposal-${deploymentId}`,
      category: "proposal",
      adoptionRate: 0.65,
      activeUsers: 13,
      totalUsers: 20,
      trend: "stable",
    },
    {
      metricId: `adopt-delivery-${deploymentId}`,
      category: "delivery",
      adoptionRate: 0.58,
      activeUsers: 7,
      totalUsers: 12,
      trend: "up",
    },
  ];
}
