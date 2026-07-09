/**
 * V67 P1 — Alert contract catalog (declarative, read-only)
 */
import type { AlertContractManifest, AlertRuleDefinition } from "./foundation.types";
import { V67_MONITORING_FOUNDATION_VERSION } from "./foundation.types";

export const ALERT_RULE_CATALOG: AlertRuleDefinition[] = [
  {
    id: "ALT-001",
    name: "production_health_degraded",
    severity: "high",
    channel: "oncall",
    signal: "/api/production/health",
    required: true,
    description: "System health overall degraded — frozen route reference",
  },
  {
    id: "ALT-002",
    name: "verify_chain_failure",
    severity: "critical",
    channel: "oncall",
    signal: "npm run verify:v66-deployment",
    required: true,
    description: "Deployment verify chain failed",
  },
  {
    id: "ALT-003",
    name: "prisma_preflight_failure",
    severity: "critical",
    channel: "oncall",
    signal: "npm run prisma:preflight",
    required: true,
    description: "Schema drift or migration safety failure",
  },
  {
    id: "ALT-004",
    name: "slo_availability_breach",
    severity: "high",
    channel: "webhook",
    signal: "slo:availability",
    required: true,
    description: "Availability SLO below objective",
  },
  {
    id: "ALT-005",
    name: "slo_latency_breach",
    severity: "medium",
    channel: "webhook",
    signal: "slo:latency-p95",
    required: true,
    description: "Latency SLO below objective",
  },
  {
    id: "ALT-006",
    name: "error_rate_spike",
    severity: "high",
    channel: "oncall",
    signal: "sli:error-rate",
    required: true,
    description: "5xx error rate above threshold",
  },
  {
    id: "ALT-007",
    name: "security_gate_blocked",
    severity: "critical",
    channel: "email",
    signal: "security-gate:blocked",
    required: true,
    description: "Deployment security gate blocked",
  },
  {
    id: "ALT-008",
    name: "deployment_incident_open",
    severity: "high",
    channel: "oncall",
    signal: "incident:open",
    required: true,
    description: "Open incident requiring response",
  },
  {
    id: "ALT-009",
    name: "oncall_escalation_timeout",
    severity: "medium",
    channel: "declarative",
    signal: "oncall:escalation",
    required: false,
    description: "Primary on-call did not acknowledge within SLA",
  },
  {
    id: "ALT-010",
    name: "monitoring_foundation_verify_fail",
    severity: "medium",
    channel: "declarative",
    signal: "npm run verify:v67-p1-monitoring-foundation",
    required: true,
    description: "V67 P1 foundation verify gate",
  },
  {
    id: "ALT-011",
    name: "staging_health_info",
    severity: "low",
    channel: "declarative",
    signal: "health:staging",
    required: false,
    description: "Informational staging health notice",
  },
];

export function buildAlertContractManifest(): AlertContractManifest {
  const rules = ALERT_RULE_CATALOG;
  const severities = new Set(rules.map((r) => r.severity));
  const contractComplete = rules.length >= 8 && severities.size >= 4;

  return {
    version: V67_MONITORING_FOUNDATION_VERSION,
    ruleCount: rules.length,
    severityCount: severities.size,
    contractComplete,
    rules,
    summary: [
      `alert-contract rules=${rules.length}`,
      `severities=${severities.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getAlertRulesBySeverity(
  severity: AlertRuleDefinition["severity"],
): AlertRuleDefinition[] {
  return ALERT_RULE_CATALOG.filter((r) => r.severity === severity);
}
