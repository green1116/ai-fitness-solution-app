/**
 * V67 P7 — Action item contract (declarative improvement items)
 */
import type { ActionItemContractManifest, ActionItemRule } from "./governance.types";
import { V67_POSTMORTEM_FOUNDATION_VERSION } from "./governance.types";

export const ACTION_ITEM_RULE_CATALOG: ActionItemRule[] = [
  {
    id: "AI-001",
    kind: "preventive",
    priority: "P0",
    name: "add_availability_guard",
    rcaRef: "RCA-001",
    ownerRole: "platform-oncall",
    dueDays: 14,
    verificationCriteria: "SLO SLOT-001 met for 30d post-fix",
    required: true,
    description: "Add guard to prevent availability regression",
  },
  {
    id: "AI-002",
    kind: "corrective",
    priority: "P1",
    name: "fix_latency_regression",
    rcaRef: "RCA-002",
    ownerRole: "deployer-oncall",
    dueDays: 7,
    verificationCriteria: "P95 latency below SLOT-002 objective",
    required: true,
    description: "Corrective fix for latency root cause",
  },
  {
    id: "AI-003",
    kind: "detective",
    priority: "P1",
    name: "enhance_error_rate_alert",
    rcaRef: "RCA-003",
    ownerRole: "monitoring-oncall",
    dueDays: 14,
    verificationCriteria: "Alert fires before SLO breach on test scenario",
    required: true,
    description: "Improve error rate detection before SLO breach",
  },
  {
    id: "AI-004",
    kind: "process",
    priority: "P0",
    name: "security_gate_hardening",
    rcaRef: "RCA-004",
    ownerRole: "security-oncall",
    dueDays: 30,
    verificationCriteria: "Security gate blocks repeat scenario",
    required: true,
    description: "Harden security gate process per RCA findings",
  },
  {
    id: "AI-005",
    kind: "preventive",
    priority: "P0",
    name: "verify_chain_gate",
    rcaRef: "RCA-005",
    ownerRole: "deployer-oncall",
    dueDays: 7,
    verificationCriteria: "verify:v66-deployment passes with new gate",
    required: true,
    description: "Add verify chain gate before rollout continuation",
  },
  {
    id: "AI-006",
    kind: "detective",
    priority: "P2",
    name: "slo_burn_rate_dashboard",
    rcaRef: "RCA-006",
    ownerRole: "monitoring-oncall",
    dueDays: 21,
    verificationCriteria: "DBD-002 shows burn-rate at risk state",
    required: true,
    description: "Dashboard visibility for SLO burn-rate at risk",
  },
  {
    id: "AI-007",
    kind: "process",
    priority: "P3",
    name: "manual_incident_runbook",
    rcaRef: "RCA-007",
    ownerRole: "incident-commander",
    dueDays: 30,
    verificationCriteria: "Runbook documented in ops catalog",
    required: true,
    description: "Document runbook for manual incident handling",
  },
  {
    id: "AI-008",
    kind: "corrective",
    priority: "P0",
    name: "major_incident_followup",
    rcaRef: "RCA-008",
    ownerRole: "platform-lead",
    dueDays: 14,
    verificationCriteria: "Postmortem published and action items tracked",
    required: true,
    description: "Major incident corrective actions with executive review",
  },
];

export function buildActionItemContractManifest(): ActionItemContractManifest {
  const rules = ACTION_ITEM_RULE_CATALOG;
  const kinds = new Set(rules.map((r) => r.kind));
  const contractComplete = rules.length >= 6 && kinds.size >= 3;

  return {
    version: V67_POSTMORTEM_FOUNDATION_VERSION,
    ruleCount: rules.length,
    kindCount: kinds.size,
    contractComplete,
    rules,
    summary: [
      `action-item rules=${rules.length}`,
      `kinds=${kinds.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getActionItemsByRcaRef(rcaRef: string): ActionItemRule[] {
  return ACTION_ITEM_RULE_CATALOG.filter((r) => r.rcaRef === rcaRef);
}

export function getActionItemsByKind(kind: ActionItemRule["kind"]): ActionItemRule[] {
  return ACTION_ITEM_RULE_CATALOG.filter((r) => r.kind === kind);
}
