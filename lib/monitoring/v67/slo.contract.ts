/**
 * V67 P1 — SLI/SLO contract catalog (declarative, read-only)
 */
import type { SloContractManifest, SliDefinition, SloDefinition } from "./foundation.types";
import { V67_MONITORING_FOUNDATION_VERSION } from "./foundation.types";

export const SLI_CATALOG: SliDefinition[] = [
  {
    id: "SLI-001",
    name: "api_availability",
    measurement: "successful_requests / total_requests",
    window: "30d",
    target: 99.9,
    unit: "percent",
    required: true,
  },
  {
    id: "SLI-002",
    name: "api_latency_p95",
    measurement: "p95(response_time_ms)",
    window: "1h",
    target: 500,
    unit: "ms",
    required: true,
  },
  {
    id: "SLI-003",
    name: "error_rate",
    measurement: "5xx_responses / total_responses",
    window: "5m",
    target: 1,
    unit: "percent",
    required: true,
  },
  {
    id: "SLI-004",
    name: "health_check_pass_rate",
    measurement: "healthy_checks / total_checks",
    window: "24h",
    target: 99,
    unit: "percent",
    required: true,
  },
  {
    id: "SLI-005",
    name: "verify_chain_pass_rate",
    measurement: "verify_pass / verify_total",
    window: "24h",
    target: 100,
    unit: "percent",
    required: true,
  },
  {
    id: "SLI-006",
    name: "incident_mttr",
    measurement: "mean(resolved_at - opened_at)",
    window: "30d",
    target: 60,
    unit: "minutes",
    required: false,
  },
];

export const SLO_CATALOG: SloDefinition[] = [
  {
    id: "SLO-001",
    name: "production_availability",
    sliRef: "SLI-001",
    objective: 99.9,
    window: "30d",
    required: true,
    description: "Production API availability objective",
  },
  {
    id: "SLO-002",
    name: "production_latency_p95",
    sliRef: "SLI-002",
    objective: 500,
    window: "1h",
    required: true,
    description: "P95 API latency under 500ms",
  },
  {
    id: "SLO-003",
    name: "production_error_budget",
    sliRef: "SLI-003",
    objective: 1,
    window: "5m",
    required: true,
    description: "Error rate below 1% rolling window",
  },
  {
    id: "SLO-004",
    name: "health_probe_reliability",
    sliRef: "SLI-004",
    objective: 99,
    window: "24h",
    required: true,
    description: "Health probe pass rate objective",
  },
  {
    id: "SLO-005",
    name: "deployment_verify_reliability",
    sliRef: "SLI-005",
    objective: 100,
    window: "24h",
    required: true,
    description: "Verify chain must pass before deploy",
  },
  {
    id: "SLO-006",
    name: "incident_response_time",
    sliRef: "SLI-006",
    objective: 60,
    window: "30d",
    required: false,
    description: "Mean time to resolve incidents",
  },
];

export function buildSloContractManifest(): SloContractManifest {
  const slis = SLI_CATALOG;
  const slos = SLO_CATALOG;
  const contractComplete =
    slis.length >= 5 && slos.length >= 5 && slos.every((s) => slis.some((i) => i.id === s.sliRef));

  return {
    version: V67_MONITORING_FOUNDATION_VERSION,
    sliCount: slis.length,
    sloCount: slos.length,
    contractComplete,
    slis,
    slos,
    summary: [
      `slo-contract slis=${slis.length}`,
      `slos=${slos.length}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}
