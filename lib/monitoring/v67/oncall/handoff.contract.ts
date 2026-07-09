/**
 * V67 P5 — Handoff contract (declarative shift & escalation handoff rules)
 */
import type { HandoffContractManifest, HandoffRule } from "./governance.types";
import { V67_ONCALL_GOVERNANCE_VERSION } from "./governance.types";

export const HANDOFF_RULE_CATALOG: HandoffRule[] = [
  {
    id: "HO-001",
    kind: "shift-end",
    fromRole: "platform-oncall",
    toRole: "platform-oncall",
    fromFoundationRef: "OC-001",
    toFoundationRef: "OC-001",
    triggerCondition: "shift.end && open_incidents > 0",
    requiredArtifacts: ["incident-summary", "timeline", "action-items"],
    required: true,
    description: "Primary shift-end handoff with open incident context",
  },
  {
    id: "HO-002",
    kind: "escalation",
    fromRole: "platform-oncall",
    toRole: "deployer-oncall",
    fromFoundationRef: "OC-001",
    toFoundationRef: "OC-002",
    triggerCondition: "ack.timeout || escalation.policy.ESC-001",
    requiredArtifacts: ["incident-id", "severity", "escalation-reason"],
    required: true,
    description: "Primary to secondary escalation handoff",
  },
  {
    id: "HO-003",
    kind: "escalation",
    fromRole: "deployer-oncall",
    toRole: "platform-lead",
    fromFoundationRef: "OC-002",
    toFoundationRef: "OC-004",
    triggerCondition: "mitigation.stalled || escalation.policy.ESC-002",
    requiredArtifacts: ["incident-id", "mitigation-status", "customer-impact"],
    required: true,
    description: "Secondary to platform lead escalation handoff",
  },
  {
    id: "HO-004",
    kind: "incident-transfer",
    fromRole: "monitoring-oncall",
    toRole: "platform-oncall",
    fromFoundationRef: "OC-006",
    toFoundationRef: "OC-001",
    triggerCondition: "alert.type.slo_breach && severity >= P1",
    requiredArtifacts: ["alert-context", "slo-ref", "burn-rate"],
    required: true,
    description: "SLO breach transfer from monitoring to platform on-call",
  },
  {
    id: "HO-005",
    kind: "incident-transfer",
    fromRole: "platform-oncall",
    toRole: "security-oncall",
    fromFoundationRef: "OC-001",
    toFoundationRef: "OC-003",
    triggerCondition: "incident.type.security",
    requiredArtifacts: ["security-context", "audit-trail"],
    required: true,
    description: "Security incident transfer to security on-call",
  },
  {
    id: "HO-006",
    kind: "role-delegation",
    fromRole: "incident-commander",
    toRole: "dr-oncall",
    fromFoundationRef: "OC-008",
    toFoundationRef: "OC-007",
    triggerCondition: "incident.type.dr || rto.breach",
    requiredArtifacts: ["dr-runbook-ref", "recovery-point", "rto-status"],
    required: true,
    description: "Commander delegates DR incidents to dr-oncall",
  },
  {
    id: "HO-007",
    kind: "shift-end",
    fromRole: "monitoring-oncall",
    toRole: "monitoring-oncall",
    fromFoundationRef: "OC-006",
    toFoundationRef: "OC-006",
    triggerCondition: "shift.end",
    requiredArtifacts: ["alert-queue-snapshot", "suppression-state"],
    required: true,
    description: "Monitoring shift-end handoff with alert queue state",
  },
  {
    id: "HO-008",
    kind: "escalation",
    fromRole: "platform-lead",
    toRole: "executive-escalation",
    fromFoundationRef: "OC-004",
    toFoundationRef: "OC-005",
    triggerCondition: "escalation.policy.ESC-003 || customer.impact.major",
    requiredArtifacts: ["executive-summary", "business-impact", "comms-draft"],
    required: false,
    description: "Executive escalation handoff for major incidents",
  },
];

export function buildHandoffContractManifest(): HandoffContractManifest {
  const rules = HANDOFF_RULE_CATALOG;
  const kinds = new Set(rules.map((r) => r.kind));
  const contractComplete = rules.length >= 6 && kinds.size >= 3;

  return {
    version: V67_ONCALL_GOVERNANCE_VERSION,
    ruleCount: rules.length,
    kindCount: kinds.size,
    contractComplete,
    rules,
    summary: [
      `handoff-rules count=${rules.length}`,
      `kinds=${kinds.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getHandoffRulesByKind(kind: HandoffRule["kind"]): HandoffRule[] {
  return HANDOFF_RULE_CATALOG.filter((r) => r.kind === kind);
}
