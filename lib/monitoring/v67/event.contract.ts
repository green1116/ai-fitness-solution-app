/**
 * V67 P1 — Incident event contract catalog (declarative, read-only)
 */
import type { EventContractManifest, IncidentEventDefinition } from "./foundation.types";
import { V67_MONITORING_FOUNDATION_VERSION } from "./foundation.types";

export const INCIDENT_EVENT_CATALOG: IncidentEventDefinition[] = [
  {
    id: "EVT-001",
    kind: "availability",
    severity: "critical",
    status: "open",
    source: "lib/portal/v60/health/system-health.engine.ts",
    required: true,
    description: "Service availability degradation — frozen reference",
  },
  {
    id: "EVT-002",
    kind: "latency",
    severity: "high",
    status: "open",
    source: "sli:api-latency-p95",
    required: true,
    description: "API latency above SLO threshold",
  },
  {
    id: "EVT-003",
    kind: "error-rate",
    severity: "high",
    status: "open",
    source: "sli:error-rate",
    required: true,
    description: "Elevated HTTP 5xx error rate",
  },
  {
    id: "EVT-004",
    kind: "security",
    severity: "critical",
    status: "open",
    source: "lib/deployment/v66/security.gates.ts",
    required: true,
    description: "Security gate blocked — V66 frozen reference",
  },
  {
    id: "EVT-005",
    kind: "deployment",
    severity: "high",
    status: "open",
    source: "lib/deployment/v66/escalation.map.ts",
    required: true,
    description: "Deployment incident — V66 ops reference",
  },
  {
    id: "EVT-006",
    kind: "slo-breach",
    severity: "medium",
    status: "acknowledged",
    source: "slo:availability",
    required: true,
    description: "SLO objective breached",
  },
  {
    id: "EVT-007",
    kind: "deployment",
    severity: "medium",
    status: "mitigating",
    source: "lib/deployment/v66/rollback.guard.ts",
    required: true,
    description: "Rollback guard tripped",
  },
  {
    id: "EVT-008",
    kind: "availability",
    severity: "low",
    status: "resolved",
    source: "lib/deployment/v66/deployment.log.formatter.ts",
    required: false,
    description: "Structured deployment log event — observability reference",
  },
  {
    id: "EVT-009",
    kind: "security",
    severity: "high",
    status: "open",
    source: "npm run v92:env-audit",
    required: true,
    description: "Environment security audit failure",
  },
  {
    id: "EVT-010",
    kind: "deployment",
    severity: "info" as IncidentEventDefinition["severity"],
    status: "resolved",
    source: "npm run verify:v67-p1-monitoring-foundation",
    required: true,
    description: "Monitoring foundation verify passed",
  },
];

export function buildEventContractManifest(): EventContractManifest {
  const events = INCIDENT_EVENT_CATALOG;
  const kinds = new Set(events.map((e) => e.kind));
  const contractComplete = events.length >= 8 && kinds.size >= 5;

  return {
    version: V67_MONITORING_FOUNDATION_VERSION,
    eventCount: events.length,
    kindCount: kinds.size,
    contractComplete,
    events,
    summary: [
      `event-contract events=${events.length}`,
      `kinds=${kinds.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getEventsByKind(kind: IncidentEventDefinition["kind"]): IncidentEventDefinition[] {
  return INCIDENT_EVENT_CATALOG.filter((e) => e.kind === kind);
}
