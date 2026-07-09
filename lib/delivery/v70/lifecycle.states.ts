/**
 * V70 P6 — Lifecycle states catalog (declarative)
 */
import { RELEASE_CATALOG } from "./release.catalog";
import { UPGRADE_PLAN_CATALOG } from "./upgrade.plan";
import type {
  LifecycleState,
  LifecycleStateManifest,
  LifecycleTransition,
  LifecycleTransitionManifest,
  SupportPolicy,
  SupportPolicyManifest,
} from "./lifecycle.management";
import { V70_LIFECYCLE_MANAGEMENT_VERSION } from "./lifecycle.management";

export const LIFECYCLE_STATE_CATALOG: LifecycleState[] = [
  {
    id: "DLV-LCS-001",
    releaseRef: "DLV-REL-001",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "LTS-12m",
    endOfLife: "n/a",
    supportPolicy: "DLV-LCS-SUP-001",
    required: true,
    description: "Technical governance baseline active lifecycle",
  },
  {
    id: "DLV-LCS-002",
    releaseRef: "DLV-REL-002",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "LTS-12m",
    endOfLife: "n/a",
    supportPolicy: "DLV-LCS-SUP-002",
    required: true,
    description: "Platform governance baseline active lifecycle",
  },
  {
    id: "DLV-LCS-003",
    releaseRef: "DLV-REL-003",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "DLV-LCS-SUP-003",
    required: true,
    description: "Application runtime active lifecycle",
  },
  {
    id: "DLV-LCS-004",
    releaseRef: "DLV-REL-004",
    state: "active",
    active: true,
    deprecated: false,
    maintenance: false,
    archived: false,
    retention: "90d",
    endOfLife: "n/a",
    supportPolicy: "DLV-LCS-SUP-004",
    required: true,
    description: "API surface active lifecycle",
  },
  {
    id: "DLV-LCS-005",
    releaseRef: "DLV-REL-005",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "n/a",
    endOfLife: "n/a",
    supportPolicy: "DLV-LCS-SUP-005",
    required: true,
    description: "Delivery foundation in build maintenance lifecycle",
  },
  {
    id: "DLV-LCS-006",
    releaseRef: "DLV-REL-006",
    state: "maintenance",
    active: false,
    deprecated: false,
    maintenance: true,
    archived: false,
    retention: "14d",
    endOfLife: "n/a",
    supportPolicy: "DLV-LCS-SUP-006",
    required: true,
    description: "Staging candidate maintenance lifecycle",
  },
  {
    id: "DLV-LCS-007",
    releaseRef: "DLV-REL-007",
    state: "deprecated",
    active: false,
    deprecated: true,
    maintenance: false,
    archived: false,
    retention: "7d",
    endOfLife: "2026-12-31",
    supportPolicy: "DLV-LCS-SUP-007",
    required: true,
    description: "Canary probe deprecated lifecycle",
  },
  {
    id: "DLV-LCS-008",
    releaseRef: "DLV-REL-008",
    state: "archived",
    active: false,
    deprecated: false,
    maintenance: false,
    archived: true,
    retention: "expired",
    endOfLife: "2025-01-01",
    supportPolicy: "DLV-LCS-SUP-008",
    required: true,
    description: "Legacy portal archived lifecycle",
  },
];

export const LIFECYCLE_TRANSITION_CATALOG: LifecycleTransition[] = [
  {
    id: "DLV-LCS-TRN-001",
    releaseRef: "DLV-REL-005",
    fromState: "maintenance",
    toState: "active",
    trigger: "verify:v70-p1 pass",
    retention: "indefinite",
    required: true,
    description: "Delivery foundation build to active transition",
  },
  {
    id: "DLV-LCS-TRN-002",
    releaseRef: "DLV-REL-006",
    fromState: "maintenance",
    toState: "active",
    trigger: "staging promotion approved",
    retention: "14d",
    required: true,
    description: "Staging candidate to active transition",
  },
  {
    id: "DLV-LCS-TRN-003",
    releaseRef: "DLV-REL-007",
    fromState: "deprecated",
    toState: "archived",
    trigger: "endOfLife reached",
    retention: "0d",
    required: true,
    description: "Canary deprecated to archived transition",
  },
  {
    id: "DLV-LCS-TRN-004",
    releaseRef: "DLV-REL-003",
    fromState: "active",
    toState: "maintenance",
    trigger: "scheduled maintenance window",
    retention: "90d",
    required: true,
    description: "Application active to maintenance transition",
  },
  {
    id: "DLV-LCS-TRN-005",
    releaseRef: "DLV-REL-003",
    fromState: "maintenance",
    toState: "active",
    trigger: "maintenance complete",
    retention: "90d",
    required: true,
    description: "Application maintenance to active transition",
  },
  {
    id: "DLV-LCS-TRN-006",
    releaseRef: "DLV-REL-001",
    fromState: "active",
    toState: "deprecated",
    trigger: "successor freeze published",
    retention: "LTS-12m",
    required: true,
    description: "Governance active to deprecated transition",
  },
  {
    id: "DLV-LCS-TRN-007",
    releaseRef: "DLV-REL-008",
    fromState: "archived",
    toState: "archived",
    trigger: "no further transitions",
    retention: "expired",
    required: true,
    description: "Legacy portal terminal archived state",
  },
  {
    id: "DLV-LCS-TRN-008",
    releaseRef: "DLV-REL-004",
    fromState: "active",
    toState: "deprecated",
    trigger: "api breaking change announced",
    retention: "30d",
    required: true,
    description: "API surface active to deprecated transition",
  },
  {
    id: "DLV-LCS-TRN-009",
    releaseRef: "DLV-REL-002",
    fromState: "active",
    toState: "deprecated",
    trigger: "technical governance successor published",
    retention: "LTS-12m",
    required: true,
    description: "Platform baseline active to deprecated transition",
  },
];

export const SUPPORT_POLICY_CATALOG: SupportPolicy[] = [
  {
    id: "DLV-LCS-SUP-001",
    releaseRef: "DLV-REL-001",
    policyKind: "lts-governance",
    retention: "LTS-12m",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "LTS governance support policy",
  },
  {
    id: "DLV-LCS-SUP-002",
    releaseRef: "DLV-REL-002",
    policyKind: "lts-platform",
    retention: "LTS-12m",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "LTS platform support policy",
  },
  {
    id: "DLV-LCS-SUP-003",
    releaseRef: "DLV-REL-003",
    policyKind: "standard-production",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "Standard production support policy",
  },
  {
    id: "DLV-LCS-SUP-004",
    releaseRef: "DLV-REL-004",
    policyKind: "standard-api",
    retention: "90d",
    endOfLife: "n/a",
    active: true,
    required: true,
    description: "API standard support policy",
  },
  {
    id: "DLV-LCS-SUP-005",
    releaseRef: "DLV-REL-005",
    policyKind: "internal-build",
    retention: "n/a",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Internal build support policy",
  },
  {
    id: "DLV-LCS-SUP-006",
    releaseRef: "DLV-REL-006",
    policyKind: "staging-window",
    retention: "14d",
    endOfLife: "n/a",
    active: false,
    required: true,
    description: "Staging window support policy",
  },
  {
    id: "DLV-LCS-SUP-007",
    releaseRef: "DLV-REL-007",
    policyKind: "canary-limited",
    retention: "7d",
    endOfLife: "2026-12-31",
    active: false,
    required: true,
    description: "Canary limited support policy",
  },
  {
    id: "DLV-LCS-SUP-008",
    releaseRef: "DLV-REL-008",
    policyKind: "none",
    retention: "expired",
    endOfLife: "2025-01-01",
    active: false,
    required: true,
    description: "No support — archived end of life",
  },
];

function isExclusiveStateFlags(state: LifecycleState): boolean {
  const flags = [state.active, state.deprecated, state.maintenance, state.archived];
  return flags.filter(Boolean).length === 1;
}

export function isLifecycleManagementRefsAligned(): boolean {
  const releaseIds = new Set(RELEASE_CATALOG.map((r) => r.id));
  const planReleaseRefs = new Set(UPGRADE_PLAN_CATALOG.map((p) => p.releaseRef));
  const policyIds = new Set(SUPPORT_POLICY_CATALOG.map((p) => p.id));

  const statesAligned = LIFECYCLE_STATE_CATALOG.every(
    (s) =>
      releaseIds.has(s.releaseRef) &&
      policyIds.has(s.supportPolicy) &&
      isExclusiveStateFlags(s),
  );

  const transitionsAligned = LIFECYCLE_TRANSITION_CATALOG.every((t) =>
    releaseIds.has(t.releaseRef),
  );

  const policiesAligned = SUPPORT_POLICY_CATALOG.every((p) =>
    releaseIds.has(p.releaseRef),
  );

  const coverageComplete =
    LIFECYCLE_STATE_CATALOG.every((s) =>
      SUPPORT_POLICY_CATALOG.some((p) => p.id === s.supportPolicy),
    ) &&
    LIFECYCLE_STATE_CATALOG.every((s) =>
      LIFECYCLE_TRANSITION_CATALOG.some((t) => t.releaseRef === s.releaseRef),
    ) &&
    LIFECYCLE_STATE_CATALOG.length >= 6 &&
    planReleaseRefs.size >= 6;

  return statesAligned && transitionsAligned && policiesAligned && coverageComplete;
}

export function buildLifecycleStateManifest(): LifecycleStateManifest {
  const states = LIFECYCLE_STATE_CATALOG;
  const kinds = new Set(states.map((s) => s.state));
  const catalogComplete =
    states.length >= 6 && kinds.size >= 4 && states.every(isExclusiveStateFlags);

  return {
    version: V70_LIFECYCLE_MANAGEMENT_VERSION,
    stateCount: states.length,
    kindCount: kinds.size,
    catalogComplete,
    states,
    summary: [
      `lifecycle-states count=${states.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildLifecycleTransitionManifest(): LifecycleTransitionManifest {
  const transitions = LIFECYCLE_TRANSITION_CATALOG;
  const catalogComplete = transitions.length >= 6;

  return {
    version: V70_LIFECYCLE_MANAGEMENT_VERSION,
    entryCount: transitions.length,
    catalogComplete,
    transitions,
    summary: [
      `lifecycle-transitions count=${transitions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildSupportPolicyManifest(): SupportPolicyManifest {
  const policies = SUPPORT_POLICY_CATALOG;
  const catalogComplete = policies.length >= 6;

  return {
    version: V70_LIFECYCLE_MANAGEMENT_VERSION,
    entryCount: policies.length,
    catalogComplete,
    policies,
    summary: [
      `support-policies count=${policies.length}`,
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

export function getLifecycleStateByReleaseRef(
  releaseRef: string,
): LifecycleState | undefined {
  return LIFECYCLE_STATE_CATALOG.find((s) => s.releaseRef === releaseRef);
}

export function getTransitionsByReleaseRef(
  releaseRef: string,
): LifecycleTransition[] {
  return LIFECYCLE_TRANSITION_CATALOG.filter((t) => t.releaseRef === releaseRef);
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
