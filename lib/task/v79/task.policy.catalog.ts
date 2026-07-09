/**
 * V79 P2 — Task policy catalog (declarative)
 */
import { TASK_UPSTREAM_DEPENDENCIES } from "./task.dependencies";
import {
  TASK_GOVERNANCE_CATALOG,
  TASK_ROLE_CATALOG,
  TASK_TOPOLOGY_CATALOG,
} from "./task.inventory";
import { TASK_SCOPE_CATALOG } from "./task.scope";
import { TASK_STATE_CATALOG } from "./task.state";
import type {
  TaskPolicyCatalogEntry,
  TaskPolicyCatalogManifest,
  TaskPolicyEnforcement,
  TaskPolicyGate,
  TaskPolicyGateManifest,
} from "./task.policy";
import { V79_TASK_POLICY_VERSION } from "./task.policy";

const REQUIRED_KINDS: TaskPolicyCatalogEntry["kind"][] = [
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
  "version",
];

export const TASK_POLICY_CATALOG_ENTRIES: TaskPolicyCatalogEntry[] = [
  {
    id: "TSK-PLC-001",
    kind: "boundary",
    priority: 1,
    roleRef: "TSK-ROL-008",
    stateRef: "TSK-STA-008",
    topologyRef: "TSK-TOP-008",
    governanceRef: "TSK-GOV-008",
    dependencyRef: "TSK-DEP-008",
    scopeRef: "TSK-SCP-008",
    enforcement: "gate",
    passCondition: "declarative-only-no-runtime",
    blockCondition: "runtime-task-engine-detected",
    required: true,
    description: "Boundary policy — declarative-only with no runtime task engine",
  },
  {
    id: "TSK-PLC-002",
    kind: "role",
    priority: 2,
    roleRef: "TSK-ROL-001",
    stateRef: "TSK-STA-001",
    topologyRef: "TSK-TOP-001",
    governanceRef: "TSK-GOV-001",
    dependencyRef: "TSK-DEP-001",
    scopeRef: "TSK-SCP-001",
    enforcement: "declarative",
    passCondition: "task-role-defined",
    blockCondition: "role-undefined",
    required: true,
    description: "Role policy — primary creator role from execution baseline",
  },
  {
    id: "TSK-PLC-003",
    kind: "state",
    priority: 3,
    roleRef: "TSK-ROL-003",
    stateRef: "TSK-STA-004",
    topologyRef: "TSK-TOP-003",
    governanceRef: "TSK-GOV-003",
    dependencyRef: "TSK-DEP-003",
    scopeRef: "TSK-SCP-004",
    enforcement: "gate",
    passCondition: "task-state-documented",
    blockCondition: "state-transition-violation",
    required: true,
    description: "State policy — enforce declared task lifecycle states",
  },
  {
    id: "TSK-PLC-004",
    kind: "topology",
    priority: 4,
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-003",
    topologyRef: "TSK-TOP-002",
    governanceRef: "TSK-GOV-002",
    dependencyRef: "TSK-DEP-004",
    scopeRef: "TSK-SCP-003",
    enforcement: "gate",
    passCondition: "task-topology-acyclic",
    blockCondition: "topology-cycle-detected",
    required: true,
    description: "Topology policy — enforce acyclic task graph",
  },
  {
    id: "TSK-PLC-005",
    kind: "scope",
    priority: 5,
    roleRef: "TSK-ROL-005",
    stateRef: "TSK-STA-006",
    topologyRef: "TSK-TOP-005",
    governanceRef: "TSK-GOV-005",
    dependencyRef: "TSK-DEP-006",
    scopeRef: "TSK-SCP-006",
    enforcement: "declarative",
    passCondition: "task-scope-bounded",
    blockCondition: "scope-violation",
    required: true,
    description: "Scope policy — bound tasks within declared scopes",
  },
  {
    id: "TSK-PLC-006",
    kind: "dependency",
    priority: 6,
    roleRef: "TSK-ROL-004",
    stateRef: "TSK-STA-005",
    topologyRef: "TSK-TOP-004",
    governanceRef: "TSK-GOV-004",
    dependencyRef: "TSK-DEP-005",
    scopeRef: "TSK-SCP-007",
    enforcement: "gate",
    passCondition: "upstream-dependency-intact",
    blockCondition: "dependency-violation",
    required: true,
    description: "Dependency policy — honor upstream execution locks",
  },
  {
    id: "TSK-PLC-007",
    kind: "governance",
    priority: 7,
    roleRef: "TSK-ROL-007",
    stateRef: "TSK-STA-007",
    topologyRef: "TSK-TOP-007",
    governanceRef: "TSK-GOV-007",
    dependencyRef: "TSK-DEP-002",
    scopeRef: "TSK-SCP-006",
    enforcement: "gate",
    passCondition: "governance-rules-documented",
    blockCondition: "governance-violation",
    required: true,
    description: "Governance policy — require task governance rules documented",
  },
  {
    id: "TSK-PLC-008",
    kind: "version",
    priority: 8,
    roleRef: "TSK-ROL-006",
    stateRef: "TSK-STA-002",
    topologyRef: "TSK-TOP-006",
    governanceRef: "TSK-GOV-006",
    dependencyRef: "TSK-DEP-007",
    scopeRef: "TSK-SCP-005",
    enforcement: "audit-only",
    passCondition: "version-lock-consistent",
    blockCondition: "version-drift-detected",
    required: true,
    description: "Version policy — task version lock must match upstream",
  },
];

export const TASK_POLICY_GATE_CATALOG: TaskPolicyGate[] = [
  {
    id: "TSK-PLG-001",
    policyRef: "TSK-PLC-001",
    gateKind: "boundary",
    verifyScript: "declarative:no-runtime-task-engine",
    required: true,
    description: "Boundary gate — no runtime task engine",
  },
  {
    id: "TSK-PLG-002",
    policyRef: "TSK-PLC-002",
    gateKind: "role",
    verifyScript: "declarative:task-role-defined",
    required: true,
    description: "Role policy gate",
  },
  {
    id: "TSK-PLG-003",
    policyRef: "TSK-PLC-003",
    gateKind: "state",
    verifyScript: "declarative:task-state-documented",
    required: true,
    description: "State lifecycle gate",
  },
  {
    id: "TSK-PLG-004",
    policyRef: "TSK-PLC-004",
    gateKind: "topology",
    verifyScript: "declarative:task-topology-acyclic",
    required: true,
    description: "Topology acyclic gate",
  },
  {
    id: "TSK-PLG-005",
    policyRef: "TSK-PLC-005",
    gateKind: "scope",
    verifyScript: "declarative:task-scope-bounded",
    required: true,
    description: "Scope boundary gate",
  },
  {
    id: "TSK-PLG-006",
    policyRef: "TSK-PLC-006",
    gateKind: "dependency",
    verifyScript: "declarative:upstream-dependency-intact",
    required: true,
    description: "Dependency upstream gate",
  },
  {
    id: "TSK-PLG-007",
    policyRef: "TSK-PLC-007",
    gateKind: "governance",
    verifyScript: "declarative:task-governance",
    required: true,
    description: "Governance rules gate",
  },
  {
    id: "TSK-PLG-008",
    policyRef: "TSK-PLC-008",
    gateKind: "version",
    verifyScript: "declarative:version-lock-consistent",
    required: true,
    description: "Version lock gate",
  },
];

export function isTaskPolicyCatalogRefsAligned(): boolean {
  const scopeIds = new Set(TASK_SCOPE_CATALOG.map((s) => s.id));
  const roleIds = new Set(TASK_ROLE_CATALOG.map((r) => r.id));
  const stateIds = new Set(TASK_STATE_CATALOG.map((s) => s.id));
  const topologyIds = new Set(TASK_TOPOLOGY_CATALOG.map((t) => t.id));
  const governanceIds = new Set(TASK_GOVERNANCE_CATALOG.map((g) => g.id));
  const dependencyIds = new Set(TASK_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const catalogIds = new Set(TASK_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const kinds = new Set(TASK_POLICY_CATALOG_ENTRIES.map((p) => p.kind));

  const catalogAligned = TASK_POLICY_CATALOG_ENTRIES.every(
    (p) =>
      scopeIds.has(p.scopeRef) &&
      roleIds.has(p.roleRef) &&
      stateIds.has(p.stateRef) &&
      topologyIds.has(p.topologyRef) &&
      governanceIds.has(p.governanceRef) &&
      dependencyIds.has(p.dependencyRef),
  );

  const gatesAligned = TASK_POLICY_GATE_CATALOG.every((g) => catalogIds.has(g.policyRef));
  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));
  const prioritiesUnique =
    new Set(TASK_POLICY_CATALOG_ENTRIES.map((p) => p.priority)).size ===
    TASK_POLICY_CATALOG_ENTRIES.length;

  return (
    catalogAligned &&
    gatesAligned &&
    kindsComplete &&
    prioritiesUnique &&
    TASK_POLICY_CATALOG_ENTRIES.length === 8
  );
}

export function buildTaskPolicyCatalogManifest(): TaskPolicyCatalogManifest {
  const policies = TASK_POLICY_CATALOG_ENTRIES;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete =
    policies.length === 8 && kinds.size === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_POLICY_VERSION,
    entryCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `task-policy-catalog count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskPolicyGateManifest(): TaskPolicyGateManifest {
  const gates = TASK_POLICY_GATE_CATALOG;
  const catalogComplete = gates.length >= 8;

  return {
    version: V79_TASK_POLICY_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `task-policy-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskPolicyCatalogEntryById(
  id: string,
): TaskPolicyCatalogEntry | undefined {
  return TASK_POLICY_CATALOG_ENTRIES.find((p) => p.id === id);
}

export function getTaskPolicyCatalogEntriesByKind(
  kind: TaskPolicyCatalogEntry["kind"],
): TaskPolicyCatalogEntry[] {
  return TASK_POLICY_CATALOG_ENTRIES.filter((p) => p.kind === kind);
}

export function getTaskPolicyGateByPolicyRef(policyRef: string): TaskPolicyGate | undefined {
  return TASK_POLICY_GATE_CATALOG.find((g) => g.policyRef === policyRef);
}

export function computeTaskDeclarativePolicyBlock(input: {
  kind: TaskPolicyCatalogEntry["kind"];
  enforcement: TaskPolicyEnforcement;
}): boolean {
  return input.kind === "boundary" && input.enforcement === "gate";
}
