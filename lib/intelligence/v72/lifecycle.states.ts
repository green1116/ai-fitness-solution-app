/**
 * V72 P6 — Intelligence lifecycle states catalog (declarative)
 */
import { GOVERNANCE_RULE_CATALOG } from "./governance.rules";
import { INTELLIGENCE_CATALOG } from "./intelligence.catalog";
import type {
  LifecycleState,
  LifecycleStateManifest,
  SupportPolicy,
  SupportPolicyManifest,
  Transition,
  TransitionManifest,
} from "./lifecycle.management";
import { V72_INTELLIGENCE_LIFECYCLE_VERSION } from "./lifecycle.management";

export const LIFECYCLE_STATE_CATALOG: LifecycleState[] = [
  {
    id: "INT-LCS-001",
    intelligenceRef: "INT-001",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "LTS-12m",
    endOfLife: "n/a",
    supportPolicy: "INT-LCS-SUP-001",
    required: true,
    description: "Orchestration baseline insight active lifecycle",
  },
  {
    id: "INT-LCS-002",
    intelligenceRef: "INT-002",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "INT-LCS-SUP-002",
    required: true,
    description: "Dependency acyclic signal active lifecycle",
  },
  {
    id: "INT-LCS-003",
    intelligenceRef: "INT-003",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "INT-LCS-SUP-003",
    required: true,
    description: "Policy gate insight active lifecycle",
  },
  {
    id: "INT-LCS-004",
    intelligenceRef: "INT-004",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "INT-LCS-SUP-004",
    required: true,
    description: "Compatibility matrix insight active lifecycle",
  },
  {
    id: "INT-LCS-005",
    intelligenceRef: "INT-005",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "14d",
    endOfLife: "n/a",
    supportPolicy: "INT-LCS-SUP-005",
    required: true,
    description: "Governance risk escalation signal maintenance lifecycle",
  },
  {
    id: "INT-LCS-006",
    intelligenceRef: "INT-006",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "7d",
    endOfLife: "n/a",
    supportPolicy: "INT-LCS-SUP-006",
    required: true,
    description: "Lifecycle transition signal maintenance lifecycle",
  },
  {
    id: "INT-LCS-007",
    intelligenceRef: "INT-007",
    state: "deprecated",
    active: false,
    deprecated: true,
    maintenance: false,
    archived: false,
    retention: "30d",
    endOfLife: "2026-12-31",
    supportPolicy: "INT-LCS-SUP-007",
    required: true,
    description: "Compliance audit metric deprecated lifecycle",
  },
  {
    id: "INT-LCS-008",
    intelligenceRef: "INT-008",
    state: "archived",
    active: false,
    deprecated: false,
    maintenance: false,
    archived: true,
    retention: "expired",
    endOfLife: "2025-06-01",
    supportPolicy: "INT-LCS-SUP-008",
    required: true,
    description: "Sign-off freeze insight archived lifecycle",
  },
];

export const LIFECYCLE_TRANSITION_CATALOG: Transition[] = [
  {
    id: "INT-LCS-TRN-001",
    intelligenceRef: "INT-001",
    fromState: "active",
    toState: "maintenance",
    trigger: "scheduled insight maintenance",
    retention: "LTS-12m",
    required: true,
    description: "Orchestration baseline active to maintenance transition",
  },
  {
    id: "INT-LCS-TRN-002",
    intelligenceRef: "INT-002",
    fromState: "active",
    toState: "deprecated",
    trigger: "successor signal published",
    retention: "90d",
    required: true,
    description: "Dependency acyclic active to deprecated transition",
  },
  {
    id: "INT-LCS-TRN-003",
    intelligenceRef: "INT-003",
    fromState: "active",
    toState: "maintenance",
    trigger: "policy gate upgrade window",
    retention: "90d",
    required: true,
    description: "Policy gate active to maintenance transition",
  },
  {
    id: "INT-LCS-TRN-004",
    intelligenceRef: "INT-004",
    fromState: "maintenance",
    toState: "active",
    trigger: "compatibility scan pass",
    retention: "90d",
    required: true,
    description: "Compatibility matrix maintenance to active transition",
  },
  {
    id: "INT-LCS-TRN-005",
    intelligenceRef: "INT-005",
    fromState: "maintenance",
    toState: "active",
    trigger: "manual governance review approved",
    retention: "14d",
    required: true,
    description: "Governance risk maintenance to active transition",
  },
  {
    id: "INT-LCS-TRN-006",
    intelligenceRef: "INT-006",
    fromState: "maintenance",
    toState: "active",
    trigger: "lifecycle state advance verified",
    retention: "7d",
    required: true,
    description: "Lifecycle transition maintenance to active transition",
  },
  {
    id: "INT-LCS-TRN-007",
    intelligenceRef: "INT-007",
    fromState: "deprecated",
    toState: "archived",
    trigger: "endOfLife reached",
    retention: "0d",
    required: true,
    description: "Compliance audit deprecated to archived transition",
  },
  {
    id: "INT-LCS-TRN-008",
    intelligenceRef: "INT-008",
    fromState: "archived",
    toState: "archived",
    trigger: "no further transitions",
    retention: "expired",
    required: true,
    description: "Sign-off freeze terminal archived state",
  },
  {
    id: "INT-LCS-TRN-009",
    intelligenceRef: "INT-001",
    fromState: "maintenance",
    toState: "active",
    trigger: "verify:v72-p1 pass",
    retention: "indefinite",
    required: true,
    description: "Orchestration baseline maintenance to active transition",
  },
];

export const SUPPORT_POLICY_CATALOG: SupportPolicy[] = [
  {
    id: "INT-LCS-SUP-001",
    intelligenceRef: "INT-001",
    policyKind: "lts-insight",
    retention: "LTS-12m",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "LTS orchestration baseline insight support policy",
  },
  {
    id: "INT-LCS-SUP-002",
    intelligenceRef: "INT-002",
    policyKind: "standard-signal",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Standard dependency signal support policy",
  },
  {
    id: "INT-LCS-SUP-003",
    intelligenceRef: "INT-003",
    policyKind: "standard-policy-gate",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Policy gate insight support policy",
  },
  {
    id: "INT-LCS-SUP-004",
    intelligenceRef: "INT-004",
    policyKind: "standard-compatibility",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Compatibility matrix insight support policy",
  },
  {
    id: "INT-LCS-SUP-005",
    intelligenceRef: "INT-005",
    policyKind: "manual-governance-window",
    retention: "14d",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Manual governance review support policy",
  },
  {
    id: "INT-LCS-SUP-006",
    intelligenceRef: "INT-006",
    policyKind: "transition-window",
    retention: "7d",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Lifecycle transition window support policy",
  },
  {
    id: "INT-LCS-SUP-007",
    intelligenceRef: "INT-007",
    policyKind: "audit-limited",
    retention: "30d",
    endOfLife: "2026-12-31",
    active: false,
    required: true,
    description: "Compliance audit limited support policy",
  },
  {
    id: "INT-LCS-SUP-008",
    intelligenceRef: "INT-008",
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

export function isIntelligenceLifecycleRefsAligned(): boolean {
  const intelligenceIds = new Set(INTELLIGENCE_CATALOG.map((i) => i.id));
  const governanceRuleCount = GOVERNANCE_RULE_CATALOG.length;
  const policyIds = new Set(SUPPORT_POLICY_CATALOG.map((p) => p.id));

  const statesAligned = LIFECYCLE_STATE_CATALOG.every(
    (s) =>
      intelligenceIds.has(s.intelligenceRef) &&
      policyIds.has(s.supportPolicy) &&
      isExclusiveStateFlags(s),
  );

  const transitionsAligned = LIFECYCLE_TRANSITION_CATALOG.every((t) =>
    intelligenceIds.has(t.intelligenceRef),
  );

  const policiesAligned = SUPPORT_POLICY_CATALOG.every((p) =>
    intelligenceIds.has(p.intelligenceRef),
  );

  const coverageComplete =
    LIFECYCLE_STATE_CATALOG.every((s) =>
      SUPPORT_POLICY_CATALOG.some((p) => p.id === s.supportPolicy),
    ) &&
    LIFECYCLE_STATE_CATALOG.every((s) =>
      LIFECYCLE_TRANSITION_CATALOG.some((t) => t.intelligenceRef === s.intelligenceRef),
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
    version: V72_INTELLIGENCE_LIFECYCLE_VERSION,
    stateCount: states.length,
    kindCount: kinds.size,
    catalogComplete,
    states,
    summary: [
      `intelligence-lifecycle-states count=${states.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTransitionManifest(): TransitionManifest {
  const transitions = LIFECYCLE_TRANSITION_CATALOG;
  const catalogComplete = transitions.length >= 6;

  return {
    version: V72_INTELLIGENCE_LIFECYCLE_VERSION,
    entryCount: transitions.length,
    catalogComplete,
    transitions,
    summary: [
      `intelligence-lifecycle-transitions count=${transitions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildSupportPolicyManifest(): SupportPolicyManifest {
  const policies = SUPPORT_POLICY_CATALOG;
  const catalogComplete = policies.length >= 6;

  return {
    version: V72_INTELLIGENCE_LIFECYCLE_VERSION,
    entryCount: policies.length,
    catalogComplete,
    policies,
    summary: [
      `intelligence-support-policies count=${policies.length}`,
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

export function getLifecycleStateByIntelligenceRef(
  intelligenceRef: string,
): LifecycleState | undefined {
  return LIFECYCLE_STATE_CATALOG.find((s) => s.intelligenceRef === intelligenceRef);
}

export function getTransitionsByIntelligenceRef(
  intelligenceRef: string,
): Transition[] {
  return LIFECYCLE_TRANSITION_CATALOG.filter(
    (t) => t.intelligenceRef === intelligenceRef,
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
