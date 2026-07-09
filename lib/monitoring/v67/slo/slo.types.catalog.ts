/**
 * V67 P4 — SLO type catalog (declarative, aligned with P1 foundation)
 */
import type { SloTypeDefinition, SloTypeManifest } from "./governance.types";
import { V67_SLO_GOVERNANCE_VERSION } from "./governance.types";

export const SLO_TYPE_CATALOG: SloTypeDefinition[] = [
  {
    id: "SLOT-001",
    foundationRef: "SLO-001",
    sliRef: "SLIT-001",
    name: "production_availability",
    tier: "critical",
    objective: 99.9,
    window: "30d",
    alertRuleRef: "AGR-004",
    required: true,
    description: "Production API availability objective",
  },
  {
    id: "SLOT-002",
    foundationRef: "SLO-002",
    sliRef: "SLIT-002",
    name: "production_latency_p95",
    tier: "critical",
    objective: 500,
    window: "1h",
    alertRuleRef: "AGR-005",
    required: true,
    description: "P95 latency under 500ms",
  },
  {
    id: "SLOT-003",
    foundationRef: "SLO-003",
    sliRef: "SLIT-003",
    name: "production_error_budget",
    tier: "critical",
    objective: 1,
    window: "5m",
    alertRuleRef: "AGR-006",
    required: true,
    description: "Error rate below 1%",
  },
  {
    id: "SLOT-004",
    foundationRef: "SLO-004",
    sliRef: "SLIT-004",
    name: "health_probe_reliability",
    tier: "standard",
    objective: 99,
    window: "24h",
    alertRuleRef: "AGR-001",
    required: true,
    description: "Health probe pass rate",
  },
  {
    id: "SLOT-005",
    foundationRef: "SLO-005",
    sliRef: "SLIT-005",
    name: "deployment_verify_reliability",
    tier: "standard",
    objective: 100,
    window: "24h",
    alertRuleRef: "AGR-002",
    required: true,
    description: "Verify chain must pass",
  },
  {
    id: "SLOT-006",
    foundationRef: "SLO-006",
    sliRef: "SLIT-006",
    name: "incident_response_time",
    tier: "best-effort",
    objective: 60,
    window: "30d",
    alertRuleRef: "AGR-012",
    required: false,
    description: "MTTR under 60 minutes",
  },
  {
    id: "SLOT-007",
    foundationRef: "SLO-001",
    sliRef: "SLIT-007",
    name: "throughput_stability",
    tier: "best-effort",
    objective: 95,
    window: "1h",
    required: false,
    description: "Throughput stability objective",
  },
  {
    id: "SLOT-008",
    foundationRef: "SLO-004",
    sliRef: "SLIT-008",
    name: "health_data_freshness",
    tier: "standard",
    objective: 120,
    window: "5m",
    required: false,
    description: "Health data freshness under 120s",
  },
];

export function buildSloTypeManifest(): SloTypeManifest {
  const types = SLO_TYPE_CATALOG;
  const tiers = new Set(types.map((t) => t.tier));
  const catalogComplete =
    types.length >= 6 &&
    tiers.size >= 3 &&
    types.every((t) => t.sliRef.startsWith("SLIT-"));

  return {
    version: V67_SLO_GOVERNANCE_VERSION,
    typeCount: types.length,
    tierCount: tiers.size,
    catalogComplete,
    types,
    summary: [
      `slo-types count=${types.length}`,
      `tiers=${tiers.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getSloTypesByTier(tier: SloTypeDefinition["tier"]): SloTypeDefinition[] {
  return SLO_TYPE_CATALOG.filter((t) => t.tier === tier);
}
