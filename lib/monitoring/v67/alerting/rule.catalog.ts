/**
 * V67 P3 — Alert rule catalog with trigger conditions (declarative)
 */
import type { AlertRuleCatalogEntry, AlertRuleCatalogManifest } from "./taxonomy.types";
import { V67_ALERT_TAXONOMY_VERSION } from "./taxonomy.types";

export const ALERT_GOVERNANCE_RULE_CATALOG: AlertRuleCatalogEntry[] = [
  {
    id: "AGR-001",
    name: "production_health_degraded",
    typeRef: "ATY-002",
    severityTier: "P1",
    triggerKind: "threshold",
    condition: "health.overall != healthy",
    signal: "/api/production/health",
    aggregateKey: "service:production",
    required: true,
    description: "Health probe degraded",
  },
  {
    id: "AGR-002",
    name: "verify_chain_failure",
    typeRef: "ATY-007",
    severityTier: "P0",
    triggerKind: "threshold",
    condition: "verify.exit_code != 0",
    signal: "npm run verify:v66-deployment",
    aggregateKey: "deploy:verify-chain",
    required: true,
    description: "Deployment verify failed",
  },
  {
    id: "AGR-003",
    name: "prisma_preflight_failure",
    typeRef: "ATY-008",
    severityTier: "P0",
    triggerKind: "threshold",
    condition: "preflight.pass == false",
    signal: "npm run prisma:preflight",
    aggregateKey: "deploy:prisma",
    required: true,
    description: "Schema drift detected",
  },
  {
    id: "AGR-004",
    name: "slo_availability_breach",
    typeRef: "ATY-009",
    severityTier: "P1",
    triggerKind: "threshold",
    condition: "sli.availability < slo.objective",
    signal: "slo:availability",
    aggregateKey: "slo:availability",
    required: true,
    description: "Availability SLO breach",
  },
  {
    id: "AGR-005",
    name: "slo_latency_breach",
    typeRef: "ATY-010",
    severityTier: "P2",
    triggerKind: "threshold",
    condition: "sli.latency_p95 > slo.objective",
    signal: "slo:latency-p95",
    aggregateKey: "slo:latency",
    required: true,
    description: "Latency SLO breach",
  },
  {
    id: "AGR-006",
    name: "error_rate_spike",
    typeRef: "ATY-004",
    severityTier: "P1",
    triggerKind: "anomaly",
    condition: "error_rate > 1% for 5m",
    signal: "sli:error-rate",
    aggregateKey: "api:error-rate",
    required: true,
    description: "Elevated 5xx rate",
  },
  {
    id: "AGR-007",
    name: "security_gate_blocked",
    typeRef: "ATY-005",
    severityTier: "P0",
    triggerKind: "threshold",
    condition: "security_gate.status == blocked",
    signal: "security-gate:blocked",
    aggregateKey: "security:gate",
    required: true,
    description: "Security gate blocked deploy",
  },
  {
    id: "AGR-008",
    name: "env_audit_failure",
    typeRef: "ATY-006",
    severityTier: "P0",
    triggerKind: "threshold",
    condition: "env_audit.pass == false",
    signal: "npm run v92:env-audit",
    aggregateKey: "security:env",
    required: true,
    description: "Env audit failed",
  },
  {
    id: "AGR-009",
    name: "service_unreachable",
    typeRef: "ATY-001",
    severityTier: "P0",
    triggerKind: "absence",
    condition: "health_probe.missing for 2m",
    signal: "health:absence",
    aggregateKey: "service:production",
    required: true,
    description: "Health probe absent",
  },
  {
    id: "AGR-010",
    name: "oncall_escalation_timeout",
    typeRef: "ATY-011",
    severityTier: "P2",
    triggerKind: "threshold",
    condition: "ack.elapsed_minutes > escalation_sla",
    signal: "oncall:escalation",
    aggregateKey: "oncall:escalation",
    required: false,
    description: "Ack SLA exceeded",
  },
  {
    id: "AGR-011",
    name: "monitoring_taxonomy_verify",
    typeRef: "ATY-012",
    severityTier: "P4",
    triggerKind: "manual",
    condition: "verify.exit_code == 0",
    signal: "npm run verify:v67-p3-alert-taxonomy",
    aggregateKey: "monitoring:verify",
    required: true,
    description: "P3 taxonomy verify gate",
  },
  {
    id: "AGR-012",
    name: "incident_lifecycle_stalled",
    typeRef: "ATY-007",
    severityTier: "P1",
    triggerKind: "composite",
    condition: "incident.state == open AND elapsed > 30m",
    signal: "incident:lifecycle",
    aggregateKey: "incident:open",
    required: true,
    description: "Open incident without progression",
  },
];

export function buildAlertRuleCatalogManifest(): AlertRuleCatalogManifest {
  const rules = ALERT_GOVERNANCE_RULE_CATALOG;
  const triggerKinds = new Set(rules.map((r) => r.triggerKind));
  const catalogComplete = rules.length >= 10 && triggerKinds.size >= 4;

  return {
    version: V67_ALERT_TAXONOMY_VERSION,
    ruleCount: rules.length,
    triggerKindCount: triggerKinds.size,
    catalogComplete,
    rules,
    summary: [
      `alert-rules count=${rules.length}`,
      `triggerKinds=${triggerKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getRulesBySeverityTier(
  tier: AlertRuleCatalogEntry["severityTier"],
): AlertRuleCatalogEntry[] {
  return ALERT_GOVERNANCE_RULE_CATALOG.filter((r) => r.severityTier === tier);
}

export function getRulesByTypeRef(typeRef: string): AlertRuleCatalogEntry[] {
  return ALERT_GOVERNANCE_RULE_CATALOG.filter((r) => r.typeRef === typeRef);
}
