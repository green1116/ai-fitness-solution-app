/**
 * Post-Launch P3 — Incident Metrics
 */

import { listEscalationWorkflows } from "./incident.escalation";
import { listOperationsIncidents } from "./incident.model";
import { listIncidentResolutions } from "./incident.resolution";
import type { IncidentMetrics } from "./incident.types";

function nowIso(): string {
  return new Date().toISOString();
}

function avg(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return Math.round(
    values.reduce((sum, v) => sum + v, 0) / values.length,
  );
}

export function computeIncidentMetrics(filter?: {
  productionOperationId?: string;
  supportSlaProfileId?: string;
}): IncidentMetrics {
  const incidents = listOperationsIncidents({
    productionOperationId: filter?.productionOperationId,
    supportSlaProfileId: filter?.supportSlaProfileId,
  });

  const openCount = incidents.filter(
    (i) =>
      i.status === "OPEN" ||
      i.status === "ACKNOWLEDGED" ||
      i.status === "ESCALATED" ||
      i.status === "IN_PROGRESS",
  ).length;
  const escalatedCount = incidents.filter(
    (i) => i.status === "ESCALATED" || !!i.escalatedAt,
  ).length;
  const resolvedCount = incidents.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED",
  ).length;
  const closedCount = incidents.filter((i) => i.status === "CLOSED").length;
  const sev1Count = incidents.filter((i) => i.severity === "SEV1").length;
  const sev2Count = incidents.filter((i) => i.severity === "SEV2").length;

  const resolutions = listIncidentResolutions().filter((r) =>
    incidents.some((i) => i.id === r.operationsIncidentId),
  );
  const avgResponseMinutes = avg(resolutions.map((r) => r.responseMinutes));
  const avgResolutionMinutes = avg(
    resolutions.map((r) => r.resolutionMinutes),
  );

  const escalations = listEscalationWorkflows().filter((w) =>
    incidents.some((i) => i.id === w.operationsIncidentId),
  );
  const escalationCompleteRate =
    escalations.length === 0
      ? 0
      : Math.round(
          (escalations.filter((w) => w.complete && !w.failed).length /
            escalations.length) *
            100,
        );

  // Higher is better: reward resolution coverage and escalation completion
  let mttrScore = 40;
  if (incidents.length === 0) {
    mttrScore = 100;
  } else {
    mttrScore += Math.round((resolvedCount / incidents.length) * 30);
    mttrScore += Math.round(escalationCompleteRate * 0.2);
    if (avgResolutionMinutes !== undefined && avgResolutionMinutes <= 60) {
      mttrScore += 10;
    }
    if (sev1Count === 0) mttrScore += 5;
  }
  mttrScore = Math.max(0, Math.min(100, mttrScore));

  return {
    productionOperationId: filter?.productionOperationId,
    supportSlaProfileId: filter?.supportSlaProfileId,
    incidentCount: incidents.length,
    openCount,
    escalatedCount,
    resolvedCount,
    closedCount,
    sev1Count,
    sev2Count,
    avgResponseMinutes,
    avgResolutionMinutes,
    escalationCompleteRate,
    mttrScore,
    computedAt: nowIso(),
  };
}
