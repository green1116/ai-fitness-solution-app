/**
 * V71 P6 — Workflow lifecycle states catalog (declarative)
 */
import { ORCHESTRATION_CATALOG } from "./orchestration.catalog";
import { GOVERNANCE_RULE_CATALOG } from "./governance.rules";
import type {
  LifecycleState,
  LifecycleStateManifest,
  LifecycleTransition,
  LifecycleTransitionManifest,
  SupportPolicy,
  SupportPolicyManifest,
} from "./lifecycle.management";
import { V71_WORKFLOW_LIFECYCLE_VERSION } from "./lifecycle.management";

export const LIFECYCLE_STATE_CATALOG: LifecycleState[] = [
  {
    id: "ORC-LCS-001",
    orchestrationRef: "ORC-001",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "LTS-12m",
    endOfLife: "n/a",
    supportPolicy: "ORC-LCS-SUP-001",
    required: true,
    description: "Delivery lifecycle orchestration active lifecycle",
  },
  {
    id: "ORC-LCS-002",
    orchestrationRef: "ORC-002",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "ORC-LCS-SUP-002",
    required: true,
    description: "Dependency resolution orchestration active lifecycle",
  },
  {
    id: "ORC-LCS-003",
    orchestrationRef: "ORC-003",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "ORC-LCS-SUP-003",
    required: true,
    description: "Policy gate orchestration active lifecycle",
  },
  {
    id: "ORC-LCS-004",
    orchestrationRef: "ORC-004",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "ORC-LCS-SUP-004",
    required: true,
    description: "Compatibility scan orchestration active lifecycle",
  },
  {
    id: "ORC-LCS-005",
    orchestrationRef: "ORC-005",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "14d",
    endOfLife: "n/a",
    supportPolicy: "ORC-LCS-SUP-005",
    required: true,
    description: "Upgrade plan orchestration maintenance lifecycle",
  },
  {
    id: "ORC-LCS-006",
    orchestrationRef: "ORC-006",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "7d",
    endOfLife: "n/a",
    supportPolicy: "ORC-LCS-SUP-006",
    required: true,
    description: "Lifecycle transition orchestration maintenance lifecycle",
  },
  {
    id: "ORC-LCS-007",
    orchestrationRef: "ORC-007",
    state: "deprecated",
    active: false,
    deprecated: true,
    maintenance: false,
    archived: false,
    retention: "30d",
    endOfLife: "2026-12-31",
    supportPolicy: "ORC-LCS-SUP-007",
    required: true,
    description: "Compliance audit orchestration deprecated lifecycle",
  },
  {
    id: "ORC-LCS-008",
    orchestrationRef: "ORC-008",
    state: "archived",
    active: false,
    deprecated: false,
    maintenance: false,
    archived: true,
    retention: "expired",
    endOfLife: "2025-06-01",
    supportPolicy: "ORC-LCS-SUP-008",
    required: true,
    description: "Sign-off freeze orchestration archived lifecycle",
  },
];

export const LIFECYCLE_TRANSITION_CATALOG: LifecycleTransition[] = [
  {
    id: "ORC-LCS-TRN-001",
    orchestrationRef: "ORC-001",
    fromState: "active",
    toState: "maintenance",
    trigger: "scheduled orchestration maintenance",
    retention: "LTS-12m",
    required: true,
    description: "Delivery lifecycle active to maintenance transition",
  },
  {
    id: "ORC-LCS-TRN-002",
    orchestrationRef: "ORC-002",
    fromState: "active",
    toState: "deprecated",
    trigger: "successor workflow published",
    retention: "90d",
    required: true,
    description: "Dependency resolution active to deprecated transition",
  },
  {
    id: "ORC-LCS-TRN-003",
    orchestrationRef: "ORC-003",
    fromState: "active",
    toState: "maintenance",
    trigger: "policy gate upgrade window",
    retention: "90d",
    required: true,
    description: "Policy gate active to maintenance transition",
  },
  {
    id: "ORC-LCS-TRN-004",
    orchestrationRef: "ORC-004",
    fromState: "maintenance",
    toState: "active",
    trigger: "compatibility scan pass",
    retention: "90d",
    required: true,
    description: "Compatibility scan maintenance to active transition",
  },
  {
    id: "ORC-LCS-TRN-005",
    orchestrationRef: "ORC-005",
    fromState: "maintenance",
    toState: "active",
    trigger: "manual upgrade plan approved",
    retention: "14d",
    required: true,
    description: "Upgrade plan maintenance to active transition",
  },
  {
    id: "ORC-LCS-TRN-006",
    orchestrationRef: "ORC-006",
    fromState: "maintenance",
    toState: "active",
    trigger: "lifecycle state advance verified",
    retention: "7d",
    required: true,
    description: "Lifecycle transition maintenance to active transition",
  },
  {
    id: "ORC-LCS-TRN-007",
    orchestrationRef: "ORC-007",
    fromState: "deprecated",
    toState: "archived",
    trigger: "endOfLife reached",
    retention: "0d",
    required: true,
    description: "Compliance audit deprecated to archived transition",
  },
  {
    id: "ORC-LCS-TRN-008",
    orchestrationRef: "ORC-008",
    fromState: "archived",
    toState: "archived",
    trigger: "no further transitions",
    retention: "expired",
    required: true,
    description: "Sign-off freeze terminal archived state",
  },
  {
    id: "ORC-LCS-TRN-009",
    orchestrationRef: "ORC-001",
    fromState: "maintenance",
    toState: "active",
    trigger: "verify:v71-p1 pass",
    retention: "indefinite",
    required: true,
    description: "Delivery lifecycle maintenance to active transition",
  },
];

export const SUPPORT_POLICY_CATALOG: SupportPolicy[] = [
  {
    id: "ORC-LCS-SUP-001",
    orchestrationRef: "ORC-001",
    policyKind: "lts-orchestration",
    retention: "LTS-12m",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "LTS delivery lifecycle support policy",
  },
  {
    id: "ORC-LCS-SUP-002",
    orchestrationRef: "ORC-002",
    policyKind: "standard-workflow",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Standard dependency workflow support policy",
  },
  {
    id: "ORC-LCS-SUP-003",
    orchestrationRef: "ORC-003",
    policyKind: "standard-policy-gate",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Policy gate workflow support policy",
  },
  {
    id: "ORC-LCS-SUP-004",
    orchestrationRef: "ORC-004",
    policyKind: "standard-compatibility",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Compatibility scan support policy",
  },
  {
    id: "ORC-LCS-SUP-005",
    orchestrationRef: "ORC-005",
    policyKind: "manual-upgrade-window",
    retention: "14d",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Manual upgrade plan support policy",
  },
  {
    id: "ORC-LCS-SUP-006",
    orchestrationRef: "ORC-006",
    policyKind: "transition-window",
    retention: "7d",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Lifecycle transition window support policy",
  },
  {
    id: "ORC-LCS-SUP-007",
    orchestrationRef: "ORC-007",
    policyKind: "audit-limited",
    retention: "30d",
    endOfLife: "2026-12-31",
    active: false,
    required: true,
    description: "Compliance audit limited support policy",
  },
  {
    id: "ORC-LCS-SUP-008",
    orchestrationRef: "ORC-008",
    policyKind: "none",
    retention: "expired",
    endOfLife: "2025-06-01",
    active: false,
    required: true,
    description: "No support — archived end of life",
  },
];

function isExclusiveStateFlags(state: LifecycleState): boolean {
  const flags = [state.active, state.deprecated, state.maintenance, state.archived];
  return flags.filter(Boolean).length === 1;
}

export function isWorkflowLifecycleRefsAligned(): boolean {
  const orchestrationIds = new Set(ORCHESTRATION_CATALOG.map((o) => o.id));
  const governanceRuleCount = GOVERNANCE_RULE_CATALOG.length;
  const policyIds = new Set(SUPPORT_POLICY_CATALOG.map((p) => p.id));

  const statesAligned = LIFECYCLE_STATE_CATALOG.every(
    (s) =>
      orchestrationIds.has(s.orchestrationRef) &&
      policyIds.has(s.supportPolicy) &&
      isExclusiveStateFlags(s),
  );

  const transitionsAligned = LIFECYCLE_TRANSITION_CATALOG.every((t) =>
    orchestrationIds.has(t.orchestrationRef),
  );

  const policiesAligned = SUPPORT_POLICY_CATALOG.every((p) =>
    orchestrationIds.has(p.orchestrationRef),
  );

  const coverageComplete =
    LIFECYCLE_STATE_CATALOG.every((s) =>
      SUPPORT_POLICY_CATALOG.some((p) => p.id === s.supportPolicy),
    ) &&
    LIFECYCLE_STATE_CATALOG.every((s) =>
      LIFECYCLE_TRANSITION_CATALOG.some((t) => t.orchestrationRef === s.orchestrationRef),
    ) &&
    LIFECYCLE_STATE_CATALOG.length >= 6 &&
    governanceRuleCount >= 6;

  return statesAligned && transitionsAligned && policiesAligned && coverageComplete;
}

export function buildLifecycleStateManifest(): LifecycleStateManifest {
  const states = LIFECYCLE_STATE_CATALOG;
  const kinds = new Set(states.map((s) => s.state));
  const catalogComplete =
    states.length >= 6 && kinds.size >= 4 && states.every(isExclusiveStateFlags);

  return {
    version: V71_WORKFLOW_LIFECYCLE_VERSION,
    stateCount: states.length,
    kindCount: kinds.size,
    catalogComplete,
    states,
    summary: [
      `workflow-lifecycle-states count=${states.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildLifecycleTransitionManifest(): LifecycleTransitionManifest {
  const transitions = LIFECYCLE_TRANSITION_CATALOG;
  const catalogComplete = transitions.length >= 6;

  return {
    version: V71_WORKFLOW_LIFECYCLE_VERSION,
    entryCount: transitions.length,
    catalogComplete,
    transitions,
    summary: [
      `workflow-lifecycle-transitions count=${transitions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildSupportPolicyManifest(): SupportPolicyManifest {
  const policies = SUPPORT_POLICY_CATALOG;
  const catalogComplete = policies.length >= 6;

  return {
    version: V71_WORKFLOW_LIFECYCLE_VERSION,
    entryCount: policies.length,
    catalogComplete,
    policies,
    summary: [
      `workflow-support-policies count=${policies.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getLifecycleStateById(id: string): LifecycleState | undefined {
  return LIFECYCLE_STATE_CATALOG.find((s) => s.id === id);
}

export function getLifecycleStatesByKind(
  kind: LifecycleState["state"],
): LifecycleState[] {
  return LIFECYCLE_STATE_CATALOG.filter((s) => s.state === kind);
}

export function getLifecycleStateByOrchestrationRef(
  orchestrationRef: string,
): LifecycleState | undefined {
  return LIFECYCLE_STATE_CATALOG.find((s) => s.orchestrationRef === orchestrationRef);
}

export function getTransitionsByOrchestrationRef(
  orchestrationRef: string,
): LifecycleTransition[] {
  return LIFECYCLE_TRANSITION_CATALOG.filter(
    (t) => t.orchestrationRef === orchestrationRef,
  );
}

export function getSupportPolicyById(id: string): SupportPolicy | undefined {
  return SUPPORT_POLICY_CATALOG.find((p) => p.id === id);
}

export function computeDeclarativeLifecycleTerminal(input: {
  archived: boolean;
  endOfLife: string;
}): boolean {
  return input.archived && input.endOfLife !== "n/a";
}
