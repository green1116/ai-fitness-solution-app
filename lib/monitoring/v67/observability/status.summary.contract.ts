/**
 * V67 P6 — Status summary contract (declarative rollup rules)
 */
import type {
  DeclarativeHealthInput,
  DeclarativeHealthResult,
  HealthStatus,
  StatusSummaryEntry,
  StatusSummaryManifest,
} from "./governance.types";
import { V67_OBSERVABILITY_DASHBOARD_VERSION } from "./governance.types";

export const STATUS_SUMMARY_CATALOG: StatusSummaryEntry[] = [
  {
    id: "SS-001",
    scope: "global",
    name: "production_global_status",
    sourceRefs: ["SH-001", "SH-002", "SH-008"],
    rollupRule: "worst_of(services)",
    healthMapping: "healthy=all_healthy; degraded=any_degraded; unhealthy=any_unhealthy",
    required: true,
    description: "Global production status rollup",
  },
  {
    id: "SS-002",
    scope: "service",
    name: "api_service_status",
    sourceRefs: ["SH-001"],
    rollupRule: "direct(SH-001)",
    healthMapping: "slo:SLOT-001 && sli:SLIT-001",
    required: true,
    description: "API service status from SLO/SLI alignment",
  },
  {
    id: "SS-003",
    scope: "slo",
    name: "slo_compliance_summary",
    sourceRefs: ["SLOT-001", "SLOT-002", "SLOT-003"],
    rollupRule: "all_slo_met",
    healthMapping: "healthy=all_met; degraded=any_at_risk; unhealthy=any_breached",
    required: true,
    description: "Critical SLO compliance rollup",
  },
  {
    id: "SS-004",
    scope: "incident",
    name: "active_incident_summary",
    sourceRefs: ["SH-003", "MV-006"],
    rollupRule: "count(open_incidents)",
    healthMapping: "healthy=0; degraded=1-2; unhealthy>=3",
    required: true,
    description: "Active incident count summary",
  },
  {
    id: "SS-005",
    scope: "oncall",
    name: "oncall_response_summary",
    sourceRefs: ["SH-005", "OR-001", "OR-006"],
    rollupRule: "response_sla_met",
    healthMapping: "healthy=sla_met; degraded=sla_at_risk; unhealthy=sla_breached",
    required: true,
    description: "On-call response SLA summary",
  },
  {
    id: "SS-006",
    scope: "service",
    name: "deployment_health_summary",
    sourceRefs: ["SH-006", "SH-007"],
    rollupRule: "all_probes_pass",
    healthMapping: "healthy=verify_pass; degraded=partial; unhealthy=verify_fail",
    required: true,
    description: "Deployment and readiness health summary",
  },
  {
    id: "SS-007",
    scope: "slo",
    name: "error_budget_summary",
    sourceRefs: ["SLOT-001", "SLOT-003", "EB-001", "EB-003"],
    rollupRule: "budget_remaining_percent",
    healthMapping: "healthy=>50%; degraded=10-50%; unhealthy=<10%",
    required: true,
    description: "Error budget remaining rollup",
  },
  {
    id: "SS-008",
    scope: "global",
    name: "alert_taxonomy_summary",
    sourceRefs: ["SH-004", "SH-008", "MV-008"],
    rollupRule: "firing_by_severity",
    healthMapping: "healthy=no_p0_p1; degraded=p2_active; unhealthy=p0_or_p1_firing",
    required: true,
    description: "Alert severity distribution summary",
  },
];

export function buildStatusSummaryManifest(): StatusSummaryManifest {
  const entries = STATUS_SUMMARY_CATALOG;
  const scopes = new Set(entries.map((e) => e.scope));
  const contractComplete = entries.length >= 6 && scopes.size >= 4;

  return {
    version: V67_OBSERVABILITY_DASHBOARD_VERSION,
    entryCount: entries.length,
    scopeCount: scopes.size,
    contractComplete,
    entries,
    summary: [
      `status-summary count=${entries.length}`,
      `scopes=${scopes.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getStatusSummaryByScope(scope: StatusSummaryEntry["scope"]): StatusSummaryEntry[] {
  return STATUS_SUMMARY_CATALOG.filter((e) => e.scope === scope);
}

export function computeDeclarativeHealthScore(
  input: DeclarativeHealthInput,
): DeclarativeHealthResult {
  const availabilityMet = input.availabilityPercent >= input.sloObjectivePercent;
  const errorRateOk = input.errorRatePercent < 100 - input.sloObjectivePercent;

  let status: HealthStatus = "healthy";
  if (!availabilityMet || !errorRateOk) {
    status = input.availabilityPercent < input.sloObjectivePercent - 1 ? "unhealthy" : "degraded";
  }

  const score = Math.min(
    100,
    Math.round((input.availabilityPercent / input.sloObjectivePercent) * 100),
  );

  return { status, score };
}
