/**
 * V80 APP P4 — Observability & governance (logs, audit, integrity, monitoring)
 */
import type { ObservabilitySpec } from "./production.types";

export const OBSERVABILITY_GOVERNANCE: ObservabilitySpec[] = [
  {
    id: "PRD-OBS-001",
    kind: "log",
    source: "app/api/** route handlers",
    sink: "structured JSON → Vercel Logs / Datadog",
    retention: "30d hot / 90d cold",
    governanceRef: "SYS-INT-002",
    required: true,
  },
  {
    id: "PRD-OBS-002",
    kind: "audit",
    source: "PdfDownloadLog + UsageRecord + LicenseBinding",
    sink: "Postgres audit tables",
    retention: "1y compliance",
    governanceRef: "SYS-INT-004",
    required: true,
  },
  {
    id: "PRD-OBS-003",
    kind: "metric",
    source: "API latency, PDF render duration, workflow step timing",
    sink: "metrics dashboard (p50/p95/p99)",
    retention: "14d rollup",
    governanceRef: "SYS-SIM-005",
    required: true,
  },
  {
    id: "PRD-OBS-004",
    kind: "integrity",
    source: "V80 kernel seal + APP blueprint readiness",
    sink: "/api/production/integrity",
    retention: "point-in-time snapshot",
    governanceRef: "SYS-CLS-006",
    required: true,
  },
  {
    id: "PRD-OBS-005",
    kind: "alert",
    source: "workflow failed, gate denied spike, PDF render error rate",
    sink: "PagerDuty / Slack webhook",
    retention: "90d incident log",
    governanceRef: "SYS-FAIL-004",
    required: true,
  },
  {
    id: "PRD-OBS-006",
    kind: "audit",
    source: "StripeWebhookEvent + Subscription changes",
    sink: "Postgres + billing audit trail",
    retention: "7y financial",
    governanceRef: "SYS-POL-002",
    required: true,
  },
];

export function isObservabilityGovernanceComplete(): boolean {
  const kinds = new Set(OBSERVABILITY_GOVERNANCE.map((o) => o.kind));
  return (
    OBSERVABILITY_GOVERNANCE.length === 6 &&
    kinds.has("log") &&
    kinds.has("audit") &&
    kinds.has("metric") &&
    kinds.has("integrity") &&
    kinds.has("alert")
  );
}

export function getObservabilityByKind(kind: ObservabilitySpec["kind"]) {
  return OBSERVABILITY_GOVERNANCE.filter((o) => o.kind === kind);
}
