/**
 * V67 P2 — Incident lifecycle transition rules (declarative catalog)
 */
import type { TransitionRule, TransitionRuleManifest } from "./lifecycle.types";
import { V67_INCIDENT_LIFECYCLE_VERSION } from "./lifecycle.types";

export const TRANSITION_RULE_CATALOG: TransitionRule[] = [
  {
    id: "TR-001",
    from: "triggered",
    to: "open",
    action: "trigger",
    required: true,
    allowedRoles: ["monitoring-oncall", "incident-commander"],
    notes: "Alert maps to open incident",
  },
  {
    id: "TR-002",
    from: "open",
    to: "acknowledged",
    action: "acknowledge",
    required: true,
    allowedRoles: ["primary", "incident-commander"],
  },
  {
    id: "TR-003",
    from: "open",
    to: "escalated",
    action: "escalate",
    required: true,
    allowedRoles: ["primary", "secondary"],
    notes: "Direct escalation without ack",
  },
  {
    id: "TR-004",
    from: "acknowledged",
    to: "escalated",
    action: "escalate",
    required: true,
    allowedRoles: ["primary", "secondary", "escalation"],
  },
  {
    id: "TR-005",
    from: "acknowledged",
    to: "mitigating",
    action: "mitigate",
    required: true,
    allowedRoles: ["primary", "platform-oncall"],
  },
  {
    id: "TR-006",
    from: "escalated",
    to: "mitigating",
    action: "mitigate",
    required: true,
    allowedRoles: ["escalation", "platform-oncall"],
  },
  {
    id: "TR-007",
    from: "mitigating",
    to: "resolved",
    action: "resolve",
    required: true,
    allowedRoles: ["primary", "incident-commander"],
  },
  {
    id: "TR-008",
    from: "resolved",
    to: "postmortem",
    action: "postmortem",
    required: true,
    allowedRoles: ["incident-commander", "platform-lead"],
    notes: "Required for critical/high severity",
  },
  {
    id: "TR-009",
    from: "postmortem",
    to: "closed",
    action: "close",
    required: true,
    allowedRoles: ["incident-commander"],
  },
  {
    id: "TR-010",
    from: "resolved",
    to: "closed",
    action: "close",
    required: false,
    allowedRoles: ["incident-commander"],
    notes: "Skip postmortem for low-severity incidents",
  },
  {
    id: "TR-011",
    from: "open",
    to: "mitigating",
    action: "mitigate",
    required: false,
    allowedRoles: ["primary"],
    notes: "Fast-path mitigation without formal ack",
  },
  {
    id: "TR-012",
    from: "triggered",
    to: "closed",
    action: "close",
    required: false,
    allowedRoles: ["monitoring-oncall"],
    notes: "False-positive auto-close path",
  },
];

export function buildTransitionRuleManifest(): TransitionRuleManifest {
  const rules = TRANSITION_RULE_CATALOG;
  const actions = new Set(rules.map((r) => r.action));
  const rulesComplete = rules.length >= 10 && actions.size >= 6;

  return {
    version: V67_INCIDENT_LIFECYCLE_VERSION,
    ruleCount: rules.length,
    actionCount: actions.size,
    rulesComplete,
    rules,
    summary: [
      `transition-rules count=${rules.length}`,
      `actions=${actions.size}`,
      `complete=${rulesComplete}`,
    ].join(" "),
  };
}

export function getTransitionsFrom(
  from: TransitionRule["from"],
): TransitionRule[] {
  return TRANSITION_RULE_CATALOG.filter((r) => r.from === from);
}

export function getTransitionsByAction(
  action: TransitionRule["action"],
): TransitionRule[] {
  return TRANSITION_RULE_CATALOG.filter((r) => r.action === action);
}
