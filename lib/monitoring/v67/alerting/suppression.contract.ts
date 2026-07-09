/**
 * V67 P3 — Alert suppression / aggregation / dedup contract (declarative)
 */
import type { SuppressionContractManifest, SuppressionRuleDefinition } from "./taxonomy.types";
import { V67_ALERT_TAXONOMY_VERSION } from "./taxonomy.types";

export const SUPPRESSION_RULE_CATALOG: SuppressionRuleDefinition[] = [
  {
    id: "SUP-001",
    kind: "dedup",
    label: "Same alert fingerprint dedup",
    window: "15m",
    scope: "alert.fingerprint",
    required: true,
    description: "Suppress duplicate alerts with identical fingerprint within window",
  },
  {
    id: "SUP-002",
    kind: "dedup",
    label: "Aggregate key dedup",
    window: "5m",
    scope: "alert.aggregateKey",
    required: true,
    description: "Collapse repeated alerts sharing aggregate key",
  },
  {
    id: "SUP-003",
    kind: "aggregation",
    label: "Service-level aggregation",
    window: "10m",
    scope: "service:production",
    required: true,
    description: "Group alerts by service before routing",
  },
  {
    id: "SUP-004",
    kind: "aggregation",
    label: "SLO breach aggregation",
    window: "30m",
    scope: "slo:*",
    required: true,
    description: "Aggregate SLO-related alerts per objective",
  },
  {
    id: "SUP-005",
    kind: "silence",
    label: "P4 informational silence",
    window: "1h",
    scope: "severity:P4",
    required: true,
    description: "Auto-silence informational alerts after logging",
  },
  {
    id: "SUP-006",
    kind: "silence",
    label: "Resolved incident silence",
    window: "24h",
    scope: "incident:resolved",
    required: true,
    description: "Suppress re-fire while incident in resolved/postmortem",
  },
  {
    id: "SUP-007",
    kind: "maintenance-window",
    label: "Declared maintenance suppression",
    window: "scheduled",
    scope: "deploy:maintenance",
    required: true,
    description: "Suppress non-security alerts during maintenance window",
  },
  {
    id: "SUP-008",
    kind: "maintenance-window",
    label: "Staging environment suppression",
    window: "continuous",
    scope: "env:staging",
    required: false,
    description: "Reduce alert noise from staging tier",
  },
  {
    id: "SUP-009",
    kind: "dedup",
    label: "Cross-rule dedup by signal",
    window: "10m",
    scope: "alert.signal",
    required: true,
    description: "Dedup alerts firing on same signal from multiple rules",
  },
  {
    id: "SUP-010",
    kind: "aggregation",
    label: "Incident correlation group",
    window: "15m",
    scope: "incident:correlation",
    required: true,
    description: "Group related alerts into single incident candidate",
  },
];

export function buildSuppressionContractManifest(): SuppressionContractManifest {
  const rules = SUPPRESSION_RULE_CATALOG;
  const kinds = new Set(rules.map((r) => r.kind));
  const contractComplete = rules.length >= 8 && kinds.size >= 4;

  return {
    version: V67_ALERT_TAXONOMY_VERSION,
    ruleCount: rules.length,
    kindCount: kinds.size,
    contractComplete,
    rules,
    summary: [
      `suppression-rules count=${rules.length}`,
      `kinds=${kinds.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getSuppressionByKind(
  kind: SuppressionRuleDefinition["kind"],
): SuppressionRuleDefinition[] {
  return SUPPRESSION_RULE_CATALOG.filter((r) => r.kind === kind);
}
