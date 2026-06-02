/**
 * V3.7-H4 Production Audit — incident trace layer
 */

import { classifyIncident, type IncidentSeverity } from "../hardening";
import { buildProductionDashboardFoundation } from "../dashboard";

export const INCIDENT_TRACE_VERSION = "3.7-h4-incident-trace-1" as const;

export type IncidentResolutionState = "open" | "monitoring" | "resolved" | "not-applicable";

export type IncidentTraceRecord = {
  incidentId: string;
  incidentLevel: IncidentSeverity;
  incidentReason: string;
  detectedAt: string;
  resolutionState: IncidentResolutionState;
  relatedSignals: string[];
};

function resolutionState(level: IncidentSeverity, releasable: boolean): IncidentResolutionState {
  if (level === "informational" && releasable) return "not-applicable";
  if (level === "fatal" || level === "degraded") return "open";
  if (level === "warning" || level === "recoverable") return "monitoring";
  return "resolved";
}

export function buildIncidentTrace(input?: { deploymentId?: string }): IncidentTraceRecord {
  const deploymentId = input?.deploymentId ?? "incident-default";
  const dashboard = buildProductionDashboardFoundation({ deploymentId });
  const snapshot = dashboard.snapshot;
  const incidentId = `INC-V37H4-${deploymentId.slice(0, 8)}`;
  const classified = classifyIncident({
    severity: snapshot.incidentLevel,
    domain: "production-audit",
    detail: dashboard.releaseControl.gateReason,
  });

  const relatedSignals = [
    `build=${snapshot.buildStatus}`,
    `tsc=${snapshot.tscStatus}`,
    `verification=${snapshot.verificationStatus}`,
    `freeze=${snapshot.freezeStatus}`,
    `hardening=${snapshot.hardeningStatus}`,
    `observability=${snapshot.observabilityStatus}`,
    `releaseReady=${dashboard.opsPanel.releaseReady}`,
    `confidence=${snapshot.releaseConfidence}`,
    `releasable=${snapshot.releasable}`,
  ];

  return {
    incidentId,
    incidentLevel: classified.severity,
    incidentReason: classified.detail,
    detectedAt: snapshot.capturedAt,
    resolutionState: resolutionState(classified.severity, snapshot.releasable),
    relatedSignals,
  };
}
