/**
 * V67 P3 — Alert type taxonomy catalog (declarative)
 */
import type { AlertTypeDefinition, AlertTypeManifest } from "./taxonomy.types";
import { V67_ALERT_TAXONOMY_VERSION } from "./taxonomy.types";

export const ALERT_TYPE_CATALOG: AlertTypeDefinition[] = [
  {
    id: "ATY-001",
    category: "availability",
    label: "service_down",
    defaultSeverity: "P0",
    required: true,
    description: "Service unreachable or health probe failing",
  },
  {
    id: "ATY-002",
    category: "availability",
    label: "health_degraded",
    defaultSeverity: "P1",
    required: true,
    description: "Overall health degraded — /api/production/health reference",
  },
  {
    id: "ATY-003",
    category: "performance",
    label: "latency_breach",
    defaultSeverity: "P1",
    required: true,
    description: "P95 latency above SLO threshold",
  },
  {
    id: "ATY-004",
    category: "performance",
    label: "error_rate_spike",
    defaultSeverity: "P1",
    required: true,
    description: "5xx error rate above threshold",
  },
  {
    id: "ATY-005",
    category: "security",
    label: "security_gate_blocked",
    defaultSeverity: "P0",
    required: true,
    description: "Deployment security gate blocked",
  },
  {
    id: "ATY-006",
    category: "security",
    label: "env_audit_failure",
    defaultSeverity: "P0",
    required: true,
    description: "Production env audit failure",
  },
  {
    id: "ATY-007",
    category: "deployment",
    label: "verify_chain_failure",
    defaultSeverity: "P0",
    required: true,
    description: "V66/V67 verify chain failed",
  },
  {
    id: "ATY-008",
    category: "deployment",
    label: "prisma_preflight_failure",
    defaultSeverity: "P0",
    required: true,
    description: "Prisma preflight or migration safety failure",
  },
  {
    id: "ATY-009",
    category: "slo",
    label: "slo_availability_breach",
    defaultSeverity: "P1",
    required: true,
    description: "Availability SLO objective breached",
  },
  {
    id: "ATY-010",
    category: "slo",
    label: "slo_latency_breach",
    defaultSeverity: "P2",
    required: true,
    description: "Latency SLO objective breached",
  },
  {
    id: "ATY-011",
    category: "operational",
    label: "oncall_escalation_timeout",
    defaultSeverity: "P2",
    required: false,
    description: "On-call acknowledgement SLA exceeded",
  },
  {
    id: "ATY-012",
    category: "informational",
    label: "monitoring_verify_pass",
    defaultSeverity: "P4",
    required: true,
    description: "V67 monitoring verify gate passed",
  },
];

export function buildAlertTypeManifest(): AlertTypeManifest {
  const types = ALERT_TYPE_CATALOG;
  const categories = new Set(types.map((t) => t.category));
  const catalogComplete = types.length >= 10 && categories.size >= 6;

  return {
    version: V67_ALERT_TAXONOMY_VERSION,
    typeCount: types.length,
    categoryCount: categories.size,
    catalogComplete,
    types,
    summary: [
      `alert-types count=${types.length}`,
      `categories=${categories.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAlertTypesByCategory(
  category: AlertTypeDefinition["category"],
): AlertTypeDefinition[] {
  return ALERT_TYPE_CATALOG.filter((t) => t.category === category);
}
