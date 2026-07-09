/**
 * V68 P7 — Trace catalog (declarative)
 */
import type { TraceCatalogEntry, TraceCatalogManifest } from "./governance.types";
import { V68_OBSERVABILITY_POLICY_VERSION } from "./governance.types";

export const TRACE_CATALOG: TraceCatalogEntry[] = [
  {
    id: "OBS-TRC-001",
    serviceDefRef: "SVC-DEF-001",
    monitoringRef: "SH-001",
    spanKind: "server",
    samplingRate: 0.1,
    required: true,
    description: "Production API inbound request traces",
  },
  {
    id: "OBS-TRC-002",
    serviceDefRef: "SVC-DEF-001",
    monitoringRef: "SH-001",
    spanKind: "client",
    samplingRate: 0.05,
    required: true,
    description: "Production API outbound dependency traces",
  },
  {
    id: "OBS-TRC-003",
    serviceDefRef: "SVC-DEF-002",
    monitoringRef: "SH-002",
    spanKind: "internal",
    samplingRate: 0.01,
    required: true,
    description: "Health probe internal spans",
  },
  {
    id: "OBS-TRC-004",
    serviceDefRef: "SVC-DEF-003",
    monitoringRef: "SH-003",
    spanKind: "internal",
    samplingRate: 1.0,
    required: true,
    description: "Incident lifecycle state machine traces",
  },
  {
    id: "OBS-TRC-005",
    serviceDefRef: "SVC-DEF-004",
    monitoringRef: "SH-004",
    spanKind: "producer",
    samplingRate: 0.2,
    required: true,
    description: "Alert routing producer spans",
  },
  {
    id: "OBS-TRC-006",
    serviceDefRef: "SVC-DEF-006",
    monitoringRef: "SH-006",
    spanKind: "server",
    samplingRate: 1.0,
    required: true,
    description: "Deployment verify chain traces",
  },
  {
    id: "OBS-TRC-007",
    serviceDefRef: "SVC-DEF-007",
    monitoringRef: "SH-007",
    spanKind: "server",
    samplingRate: 0.5,
    required: true,
    description: "Readiness probe request traces",
  },
  {
    id: "OBS-TRC-008",
    serviceDefRef: "SVC-DEF-008",
    monitoringRef: "SH-008",
    spanKind: "consumer",
    samplingRate: 0.1,
    required: true,
    description: "SLO monitoring metric consumer traces",
  },
];

export function buildTraceCatalogManifest(): TraceCatalogManifest {
  const traces = TRACE_CATALOG;
  const spanKinds = new Set(traces.map((t) => t.spanKind));
  const catalogComplete = traces.length >= 6 && spanKinds.size >= 3;

  return {
    version: V68_OBSERVABILITY_POLICY_VERSION,
    entryCount: traces.length,
    spanKindCount: spanKinds.size,
    catalogComplete,
    traces,
    summary: [
      `trace-catalog count=${traces.length}`,
      `spanKinds=${spanKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTracesByServiceRef(serviceDefRef: string): TraceCatalogEntry[] {
  return TRACE_CATALOG.filter((t) => t.serviceDefRef === serviceDefRef);
}
