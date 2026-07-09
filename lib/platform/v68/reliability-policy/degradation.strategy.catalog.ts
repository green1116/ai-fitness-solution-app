/**
 * V68 P6 — Degradation strategy catalog (declarative)
 */
import type { DegradationStrategyEntry, DegradationStrategyManifest } from "./governance.types";
import { V68_RELIABILITY_POLICY_VERSION } from "./governance.types";

export const DEGRADATION_STRATEGY_CATALOG: DegradationStrategyEntry[] = [
  {
    id: "REL-DEG-001",
    serviceDefRef: "SVC-DEF-001",
    failureRef: "REL-FAIL-001",
    kind: "circuit-break",
    triggerCondition: "error_rate > 5%",
    flagRef: "FF-DEF-001",
    required: true,
    description: "Circuit-break production API on total outage",
  },
  {
    id: "REL-DEG-002",
    serviceDefRef: "SVC-DEF-001",
    failureRef: "REL-FAIL-002",
    kind: "throttle",
    triggerCondition: "latency.p95 > 500ms",
    required: true,
    description: "Throttle API under major degradation",
  },
  {
    id: "REL-DEG-003",
    serviceDefRef: "SVC-DEF-002",
    failureRef: "REL-FAIL-003",
    kind: "fallback",
    triggerCondition: "health_probe.fail",
    required: true,
    description: "Fallback to cached health status",
  },
  {
    id: "REL-DEG-004",
    serviceDefRef: "SVC-DEF-004",
    failureRef: "REL-FAIL-006",
    kind: "feature-disable",
    triggerCondition: "slo.breach",
    flagRef: "FF-DEF-004",
    required: true,
    description: "Disable non-critical alert routing on SLO breach",
  },
  {
    id: "REL-DEG-005",
    serviceDefRef: "SVC-DEF-005",
    failureRef: "REL-FAIL-002",
    kind: "throttle",
    triggerCondition: "oncall.page_storm",
    flagRef: "FF-DEF-005",
    required: true,
    description: "Throttle on-call paging during storm",
  },
  {
    id: "REL-DEG-006",
    serviceDefRef: "SVC-DEF-006",
    failureRef: "REL-FAIL-007",
    kind: "read-only",
    triggerCondition: "verify.fail",
    flagRef: "FF-DEF-006",
    required: true,
    description: "Block rollout on verify failure — read-only mode",
  },
  {
    id: "REL-DEG-007",
    serviceDefRef: "SVC-DEF-007",
    failureRef: "REL-FAIL-008",
    kind: "fallback",
    triggerCondition: "capacity.pressure",
    required: true,
    description: "Fallback readiness checks under capacity pressure",
  },
  {
    id: "REL-DEG-008",
    serviceDefRef: "SVC-DEF-008",
    failureRef: "REL-FAIL-006",
    kind: "circuit-break",
    triggerCondition: "burn_rate.exhausted",
    flagRef: "FF-DEF-008",
    required: true,
    description: "Kill-switch SLO alerts on budget exhaustion",
  },
];

export function buildDegradationStrategyManifest(): DegradationStrategyManifest {
  const strategies = DEGRADATION_STRATEGY_CATALOG;
  const kinds = new Set(strategies.map((s) => s.kind));
  const catalogComplete = strategies.length >= 6 && kinds.size >= 4;

  return {
    version: V68_RELIABILITY_POLICY_VERSION,
    entryCount: strategies.length,
    kindCount: kinds.size,
    catalogComplete,
    strategies,
    summary: [
      `degradation-strategies count=${strategies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDegradationByServiceRef(serviceDefRef: string): DegradationStrategyEntry[] {
  return DEGRADATION_STRATEGY_CATALOG.filter((s) => s.serviceDefRef === serviceDefRef);
}
