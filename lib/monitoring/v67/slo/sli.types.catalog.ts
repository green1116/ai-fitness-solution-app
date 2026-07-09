/**
 * V67 P4 — SLI type catalog (declarative, aligned with P1 foundation)
 */
import type { SliTypeDefinition, SliTypeManifest } from "./governance.types";
import { V67_SLO_GOVERNANCE_VERSION } from "./governance.types";

export const SLI_TYPE_CATALOG: SliTypeDefinition[] = [
  {
    id: "SLIT-001",
    foundationRef: "SLI-001",
    kind: "availability",
    name: "api_availability",
    unit: "percent",
    window: "30d",
    goodEvent: "http_status < 500",
    validEvent: "http_request_total",
    required: true,
    description: "Successful requests over total requests",
  },
  {
    id: "SLIT-002",
    foundationRef: "SLI-002",
    kind: "latency",
    name: "api_latency_p95",
    unit: "ms",
    window: "1h",
    goodEvent: "response_time_ms <= 500",
    validEvent: "http_request_duration",
    required: true,
    description: "P95 API response latency",
  },
  {
    id: "SLIT-003",
    foundationRef: "SLI-003",
    kind: "correctness",
    name: "error_rate",
    unit: "percent",
    window: "5m",
    goodEvent: "http_status < 500",
    validEvent: "http_response_total",
    required: true,
    description: "5xx error rate SLI",
  },
  {
    id: "SLIT-004",
    foundationRef: "SLI-004",
    kind: "operational",
    name: "health_check_pass_rate",
    unit: "percent",
    window: "24h",
    goodEvent: "health.overall == healthy",
    validEvent: "health_check_total",
    required: true,
    description: "Production health probe reliability",
  },
  {
    id: "SLIT-005",
    foundationRef: "SLI-005",
    kind: "operational",
    name: "verify_chain_pass_rate",
    unit: "percent",
    window: "24h",
    goodEvent: "verify.exit_code == 0",
    validEvent: "verify_run_total",
    required: true,
    description: "Deployment verify chain pass rate",
  },
  {
    id: "SLIT-006",
    foundationRef: "SLI-006",
    kind: "operational",
    name: "incident_mttr",
    unit: "minutes",
    window: "30d",
    goodEvent: "resolved_within_sla",
    validEvent: "incident_total",
    required: false,
    description: "Mean time to resolve incidents",
  },
  {
    id: "SLIT-007",
    foundationRef: "SLI-001",
    kind: "throughput",
    name: "api_throughput_stability",
    unit: "percent",
    window: "1h",
    goodEvent: "throughput_within_baseline",
    validEvent: "request_rate_sample",
    required: false,
    description: "Request rate stability vs baseline",
  },
  {
    id: "SLIT-008",
    foundationRef: "SLI-004",
    kind: "freshness",
    name: "health_data_freshness",
    unit: "seconds",
    window: "5m",
    goodEvent: "health_data_age < 120",
    validEvent: "health_poll_total",
    required: false,
    description: "Health data staleness threshold",
  },
];

export function buildSliTypeManifest(): SliTypeManifest {
  const types = SLI_TYPE_CATALOG;
  const kinds = new Set(types.map((t) => t.kind));
  const catalogComplete = types.length >= 6 && kinds.size >= 4;

  return {
    version: V67_SLO_GOVERNANCE_VERSION,
    typeCount: types.length,
    kindCount: kinds.size,
    catalogComplete,
    types,
    summary: [
      `sli-types count=${types.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getSliTypesByKind(kind: SliTypeDefinition["kind"]): SliTypeDefinition[] {
  return SLI_TYPE_CATALOG.filter((t) => t.kind === kind);
}

export function getSliTypeByFoundationRef(ref: string): SliTypeDefinition | undefined {
  return SLI_TYPE_CATALOG.find((t) => t.foundationRef === ref);
}
