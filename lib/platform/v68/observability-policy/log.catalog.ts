/**
 * V68 P7 — Log catalog (declarative)
 */
import type { LogCatalogEntry, LogCatalogManifest } from "./governance.types";
import { V68_OBSERVABILITY_POLICY_VERSION } from "./governance.types";

export const LOG_CATALOG: LogCatalogEntry[] = [
  {
    id: "OBS-LOG-001",
    serviceDefRef: "SVC-DEF-001",
    monitoringRef: "SH-001",
    level: "info",
    stream: "api.access",
    retentionDays: 30,
    required: true,
    description: "Production API access logs",
  },
  {
    id: "OBS-LOG-002",
    serviceDefRef: "SVC-DEF-001",
    monitoringRef: "SH-001",
    level: "error",
    stream: "api.error",
    retentionDays: 90,
    required: true,
    description: "Production API error logs",
  },
  {
    id: "OBS-LOG-003",
    serviceDefRef: "SVC-DEF-002",
    monitoringRef: "SH-002",
    level: "warn",
    stream: "health.probe",
    retentionDays: 14,
    required: true,
    description: "Health probe warning logs",
  },
  {
    id: "OBS-LOG-004",
    serviceDefRef: "SVC-DEF-003",
    monitoringRef: "SH-003",
    level: "info",
    stream: "incident.lifecycle",
    retentionDays: 365,
    required: true,
    description: "Incident lifecycle audit logs",
  },
  {
    id: "OBS-LOG-005",
    serviceDefRef: "SVC-DEF-004",
    monitoringRef: "SH-004",
    level: "warn",
    stream: "alert.routing",
    retentionDays: 60,
    required: true,
    description: "Alert routing decision logs",
  },
  {
    id: "OBS-LOG-006",
    serviceDefRef: "SVC-DEF-006",
    monitoringRef: "SH-006",
    level: "info",
    stream: "deploy.verify",
    retentionDays: 30,
    required: true,
    description: "Deployment verify chain logs",
  },
  {
    id: "OBS-LOG-007",
    serviceDefRef: "SVC-DEF-007",
    monitoringRef: "SH-007",
    level: "debug",
    stream: "readiness.probe",
    retentionDays: 7,
    required: true,
    description: "Readiness probe diagnostic logs",
  },
  {
    id: "OBS-LOG-008",
    serviceDefRef: "SVC-DEF-008",
    monitoringRef: "SH-008",
    level: "error",
    stream: "slo.breach",
    retentionDays: 180,
    required: true,
    description: "SLO breach and burn-rate logs",
  },
];

export function buildLogCatalogManifest(): LogCatalogManifest {
  const logs = LOG_CATALOG;
  const levels = new Set(logs.map((l) => l.level));
  const catalogComplete = logs.length >= 6 && levels.size >= 3;

  return {
    version: V68_OBSERVABILITY_POLICY_VERSION,
    entryCount: logs.length,
    levelCount: levels.size,
    catalogComplete,
    logs,
    summary: [
      `log-catalog count=${logs.length}`,
      `levels=${levels.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getLogsByServiceRef(serviceDefRef: string): LogCatalogEntry[] {
  return LOG_CATALOG.filter((l) => l.serviceDefRef === serviceDefRef);
}
