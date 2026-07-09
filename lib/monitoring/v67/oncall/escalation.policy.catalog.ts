/**
 * V67 P5 — Escalation policy catalog (declarative)
 */
import type { EscalationPolicyEntry, EscalationPolicyManifest } from "./governance.types";
import { V67_ONCALL_GOVERNANCE_VERSION } from "./governance.types";

export const ESCALATION_POLICY_CATALOG: EscalationPolicyEntry[] = [
  {
    id: "ESC-001",
    name: "p0_primary_to_secondary",
    severityRef: "P0",
    fromStage: "l1",
    toStage: "l2",
    foundationOncallRef: "OC-002",
    triggerKind: "timeout",
    timeoutMinutes: 5,
    lifecycleAction: "escalate",
    required: true,
    description: "P0 unacknowledged → secondary on-call within 5 min",
  },
  {
    id: "ESC-002",
    name: "p0_secondary_to_escalation",
    severityRef: "P0",
    fromStage: "l2",
    toStage: "l3",
    foundationOncallRef: "OC-004",
    triggerKind: "timeout",
    timeoutMinutes: 15,
    lifecycleAction: "escalate",
    required: true,
    description: "P0 still unmitigated → platform lead within 15 min",
  },
  {
    id: "ESC-003",
    name: "p0_executive_breach",
    severityRef: "P0",
    fromStage: "l3",
    toStage: "executive",
    foundationOncallRef: "OC-005",
    triggerKind: "severity",
    timeoutMinutes: 60,
    lifecycleAction: "escalate",
    required: true,
    description: "Extended P0 outage → executive escalation",
  },
  {
    id: "ESC-004",
    name: "p1_primary_timeout",
    severityRef: "P1",
    fromStage: "l1",
    toStage: "l2",
    foundationOncallRef: "OC-002",
    triggerKind: "timeout",
    timeoutMinutes: 15,
    lifecycleAction: "escalate",
    required: true,
    description: "P1 acknowledgement SLA breach → secondary",
  },
  {
    id: "ESC-005",
    name: "security_incident_escalation",
    severityRef: "P0",
    fromStage: "l1",
    toStage: "l2",
    foundationOncallRef: "OC-003",
    triggerKind: "severity",
    timeoutMinutes: 0,
    lifecycleAction: "escalate",
    required: true,
    description: "Security incidents route directly to security on-call",
  },
  {
    id: "ESC-006",
    name: "slo_breach_escalation",
    severityRef: "P1",
    fromStage: "none",
    toStage: "l1",
    foundationOncallRef: "OC-006",
    triggerKind: "slo-breach",
    timeoutMinutes: 0,
    lifecycleAction: "trigger",
    required: true,
    description: "SLO breach triggers monitoring on-call",
  },
  {
    id: "ESC-007",
    name: "dr_incident_escalation",
    severityRef: "P0",
    fromStage: "l1",
    toStage: "l2",
    foundationOncallRef: "OC-007",
    triggerKind: "lifecycle",
    timeoutMinutes: 30,
    lifecycleAction: "escalate",
    required: true,
    description: "DR incidents escalate to dr-oncall after 30 min",
  },
  {
    id: "ESC-008",
    name: "manual_commander_escalation",
    severityRef: "P2",
    fromStage: "l1",
    toStage: "l2",
    foundationOncallRef: "OC-008",
    triggerKind: "manual",
    timeoutMinutes: 0,
    lifecycleAction: "escalate",
    required: true,
    description: "Incident commander may manually escalate P2+",
  },
];

export function buildEscalationPolicyManifest(): EscalationPolicyManifest {
  const policies = ESCALATION_POLICY_CATALOG;
  const triggerKinds = new Set(policies.map((p) => p.triggerKind));
  const catalogComplete = policies.length >= 6 && triggerKinds.size >= 4;

  return {
    version: V67_ONCALL_GOVERNANCE_VERSION,
    policyCount: policies.length,
    triggerKindCount: triggerKinds.size,
    catalogComplete,
    policies,
    summary: [
      `escalation-policies count=${policies.length}`,
      `triggerKinds=${triggerKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getEscalationPoliciesBySeverity(
  severityRef: EscalationPolicyEntry["severityRef"],
): EscalationPolicyEntry[] {
  return ESCALATION_POLICY_CATALOG.filter((p) => p.severityRef === severityRef);
}
