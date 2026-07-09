/**
 * V73 P6 — Knowledge lifecycle states catalog (declarative)
 */
import { GOVERNANCE_RULE_CATALOG } from "./governance.rules";
import { KNOWLEDGE_CATALOG } from "./knowledge.catalog";
import type {
  Archived,
  EndOfLife,
  LifecycleState,
  LifecycleStateManifest,
  SupportPolicy,
  SupportPolicyManifest,
  Transition,
  TransitionManifest,
} from "./lifecycle.management";
import { V73_KNOWLEDGE_LIFECYCLE_VERSION } from "./lifecycle.management";

export const LIFECYCLE_STATE_CATALOG: LifecycleState[] = [
  {
    id: "KNW-LCS-001",
    knowledgeRef: "KNW-001",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "LTS-12m",
    endOfLife: "n/a",
    supportPolicy: "KNW-LCS-SUP-001",
    required: true,
    description: "Operational intelligence baseline knowledge active lifecycle",
  },
  {
    id: "KNW-LCS-002",
    knowledgeRef: "KNW-002",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "KNW-LCS-SUP-002",
    required: true,
    description: "Signal dependency graph knowledge active lifecycle",
  },
  {
    id: "KNW-LCS-003",
    knowledgeRef: "KNW-003",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "KNW-LCS-SUP-003",
    required: true,
    description: "Intelligence policy gate knowledge active lifecycle",
  },
  {
    id: "KNW-LCS-004",
    knowledgeRef: "KNW-004",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "KNW-LCS-SUP-004",
    required: true,
    description: "Compatibility matrix guide knowledge active lifecycle",
  },
  {
    id: "KNW-LCS-005",
    knowledgeRef: "KNW-005",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "14d",
    endOfLife: "n/a",
    supportPolicy: "KNW-LCS-SUP-005",
    required: true,
    description: "Governance risk escalation knowledge maintenance lifecycle",
  },
  {
    id: "KNW-LCS-006",
    knowledgeRef: "KNW-006",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "7d",
    endOfLife: "n/a",
    supportPolicy: "KNW-LCS-SUP-006",
    required: true,
    description: "Lifecycle state reference knowledge maintenance lifecycle",
  },
  {
    id: "KNW-LCS-007",
    knowledgeRef: "KNW-007",
    state: "deprecated",
    active: false,
    deprecated: true,
    maintenance: false,
    archived: false,
    retention: "30d",
    endOfLife: "2026-12-31",
    supportPolicy: "KNW-LCS-SUP-007",
    required: true,
    description: "Compliance checklist reference knowledge deprecated lifecycle",
  },
  {
    id: "KNW-LCS-008",
    knowledgeRef: "KNW-008",
    state: "archived",
    active: false,
    deprecated: false,
    maintenance: false,
    archived: true,
    retention: "expired",
    endOfLife: "2025-06-01",
    supportPolicy: "KNW-LCS-SUP-008",
    required: true,
    description: "Knowledge foundation catalog draft archived lifecycle",
  },
];

export const LIFECYCLE_TRANSITION_CATALOG: Transition[] = [
  {
    id: "KNW-LCS-TRN-001",
    knowledgeRef: "KNW-001",
    fromState: "active",
    toState: "maintenance",
    trigger: "scheduled knowledge maintenance",
    retention: "LTS-12m",
    required: true,
    description: "Operational baseline active to maintenance transition",
  },
  {
    id: "KNW-LCS-TRN-002",
    knowledgeRef: "KNW-002",
    fromState: "active",
    toState: "deprecated",
    trigger: "successor document published",
    retention: "90d",
    required: true,
    description: "Signal dependency active to deprecated transition",
  },
  {
    id: "KNW-LCS-TRN-003",
    knowledgeRef: "KNW-003",
    fromState: "active",
    toState: "maintenance",
    trigger: "policy gate upgrade window",
    retention: "90d",
    required: true,
    description: "Policy gate knowledge active to maintenance transition",
  },
  {
    id: "KNW-LCS-TRN-004",
    knowledgeRef: "KNW-004",
    fromState: "maintenance",
    toState: "active",
    trigger: "compatibility scan pass",
    retention: "90d",
    required: true,
    description: "Compatibility guide maintenance to active transition",
  },
  {
    id: "KNW-LCS-TRN-005",
    knowledgeRef: "KNW-005",
    fromState: "maintenance",
    toState: "active",
    trigger: "manual governance review approved",
    retention: "14d",
    required: true,
    description: "Governance risk maintenance to active transition",
  },
  {
    id: "KNW-LCS-TRN-006",
    knowledgeRef: "KNW-006",
    fromState: "maintenance",
    toState: "active",
    trigger: "lifecycle state advance verified",
    retention: "7d",
    required: true,
    description: "Lifecycle reference maintenance to active transition",
  },
  {
    id: "KNW-LCS-TRN-007",
    knowledgeRef: "KNW-007",
    fromState: "deprecated",
    toState: "archived",
    trigger: "endOfLife reached",
    retention: "0d",
    required: true,
    description: "Compliance checklist deprecated to archived transition",
  },
  {
    id: "KNW-LCS-TRN-008",
    knowledgeRef: "KNW-008",
    fromState: "archived",
    toState: "archived",
    trigger: "no further transitions",
    retention: "expired",
    required: true,
    description: "Knowledge foundation catalog terminal archived state",
  },
  {
    id: "KNW-LCS-TRN-009",
    knowledgeRef: "KNW-001",
    fromState: "maintenance",
    toState: "active",
    trigger: "verify:v73-p1 pass",
    retention: "indefinite",
    required: true,
    description: "Operational baseline maintenance to active transition",
  },
];

export const SUPPORT_POLICY_CATALOG: SupportPolicy[] = [
  {
    id: "KNW-LCS-SUP-001",
    knowledgeRef: "KNW-001",
    policyKind: "lts-document",
    retention: "LTS-12m",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "LTS operational intelligence baseline support policy",
  },
  {
    id: "KNW-LCS-SUP-002",
    knowledgeRef: "KNW-002",
    policyKind: "standard-document",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Standard signal dependency document support policy",
  },
  {
    id: "KNW-LCS-SUP-003",
    knowledgeRef: "KNW-003",
    policyKind: "standard-policy-gate",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Policy gate knowledge support policy",
  },
  {
    id: "KNW-LCS-SUP-004",
    knowledgeRef: "KNW-004",
    policyKind: "standard-compatibility",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Compatibility matrix guide support policy",
  },
  {
    id: "KNW-LCS-SUP-005",
    knowledgeRef: "KNW-005",
    policyKind: "manual-governance-window",
    retention: "14d",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Manual governance review support policy",
  },
  {
    id: "KNW-LCS-SUP-006",
    knowledgeRef: "KNW-006",
    policyKind: "transition-window",
    retention: "7d",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Lifecycle transition window support policy",
  },
  {
    id: "KNW-LCS-SUP-007",
    knowledgeRef: "KNW-007",
    policyKind: "audit-limited",
    retention: "30d",
    endOfLife: "2026-12-31",
    active: false,
    required: true,
    description: "Compliance checklist limited support policy",
  },
  {
    id: "KNW-LCS-SUP-008",
    knowledgeRef: "KNW-008",
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

export function isKnowledgeLifecycleRefsAligned(): boolean {
  const knowledgeIds = new Set(KNOWLEDGE_CATALOG.map((k) => k.id));
  const governanceRuleCount = GOVERNANCE_RULE_CATALOG.length;
  const policyIds = new Set(SUPPORT_POLICY_CATALOG.map((p) => p.id));

  const statesAligned = LIFECYCLE_STATE_CATALOG.every(
    (s) =>
      knowledgeIds.has(s.knowledgeRef) &&
      policyIds.has(s.supportPolicy) &&
      isExclusiveStateFlags(s),
  );

  const transitionsAligned = LIFECYCLE_TRANSITION_CATALOG.every((t) =>
    knowledgeIds.has(t.knowledgeRef),
  );

  const policiesAligned = SUPPORT_POLICY_CATALOG.every((p) =>
    knowledgeIds.has(p.knowledgeRef),
  );

  const coverageComplete =
    LIFECYCLE_STATE_CATALOG.every((s) =>
      SUPPORT_POLICY_CATALOG.some((p) => p.id === s.supportPolicy),
    ) &&
    LIFECYCLE_STATE_CATALOG.every((s) =>
      LIFECYCLE_TRANSITION_CATALOG.some((t) => t.knowledgeRef === s.knowledgeRef),
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
    version: V73_KNOWLEDGE_LIFECYCLE_VERSION,
    stateCount: states.length,
    kindCount: kinds.size,
    catalogComplete,
    states,
    summary: [
      `knowledge-lifecycle-states count=${states.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTransitionManifest(): TransitionManifest {
  const transitions = LIFECYCLE_TRANSITION_CATALOG;
  const catalogComplete = transitions.length >= 6;

  return {
    version: V73_KNOWLEDGE_LIFECYCLE_VERSION,
    entryCount: transitions.length,
    catalogComplete,
    transitions,
    summary: [
      `knowledge-lifecycle-transitions count=${transitions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildSupportPolicyManifest(): SupportPolicyManifest {
  const policies = SUPPORT_POLICY_CATALOG;
  const catalogComplete = policies.length >= 6;

  return {
    version: V73_KNOWLEDGE_LIFECYCLE_VERSION,
    entryCount: policies.length,
    catalogComplete,
    policies,
    summary: [
      `knowledge-support-policies count=${policies.length}`,
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

export function getLifecycleStateByKnowledgeRef(
  knowledgeRef: string,
): LifecycleState | undefined {
  return LIFECYCLE_STATE_CATALOG.find((s) => s.knowledgeRef === knowledgeRef);
}

export function getTransitionsByKnowledgeRef(knowledgeRef: string): Transition[] {
  return LIFECYCLE_TRANSITION_CATALOG.filter((t) => t.knowledgeRef === knowledgeRef);
}

export function getSupportPolicyById(id: string): SupportPolicy | undefined {
  return SUPPORT_POLICY_CATALOG.find((p) => p.id === id);
}

export function computeDeclarativeLifecycleTerminal(input: {
  archived: Archived;
  endOfLife: EndOfLife;
}): boolean {
  return input.archived && input.endOfLife !== "n/a";
}
