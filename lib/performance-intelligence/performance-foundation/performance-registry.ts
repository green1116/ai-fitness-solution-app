import { buildProjectDeliveryFoundationContext } from "@/lib/project-delivery-intelligence";
import { PI_CANONICAL_ID, type PerformanceStatus } from "../shared/constants";
import type { PerformanceRecord, PerformanceRegistry } from "../shared/types";
import { calculatePerformanceMetrics } from "./performance-metrics";

function resolvePerformanceStatus(score: number): PerformanceStatus {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 60) return "average";
  return "poor";
}

let cachedRegistry: PerformanceRegistry | undefined;

export function buildPerformanceRegistry(): PerformanceRegistry {
  if (cachedRegistry) return cachedRegistry;

  const foundation = buildProjectDeliveryFoundationContext();
  const records: PerformanceRecord[] = foundation.projects.records.map((project) => {
    const metrics = calculatePerformanceMetrics(foundation, project.projectId);

    return {
      performanceId: `pi-performance-${project.projectId}`,
      projectId: project.projectId,
      status: resolvePerformanceStatus(metrics.totalScore),
      score: metrics.totalScore,
      acceptanceScore: metrics.acceptanceScore,
      deliveryScore: metrics.deliveryScore,
      riskScore: metrics.riskScore,
    };
  });

  const averageScore =
    records.length === 0
      ? 0
      : Math.round(records.reduce((sum, record) => sum + record.score, 0) / records.length);

  cachedRegistry = {
    registryId: "pi-performance-registry-v46-p1",
    records,
    count: records.length,
    averageScore,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
