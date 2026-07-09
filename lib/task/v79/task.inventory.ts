/**
 * V79 P1 — Task inventory (declarative)
 */
import { TASK_UPSTREAM_DEPENDENCIES, isTaskUpstreamAligned } from "./task.dependencies";
import { TASK_SCOPE_CATALOG, isTaskScopeCoverageComplete } from "./task.scope";
import {
  TASK_STATE_CATALOG,
  buildTaskStateManifest,
  isTaskStateCoverageComplete,
} from "./task.state";
import type {
  TaskGovernance,
  TaskGovernanceManifest,
  TaskInventoryManifest,
  TaskInventoryReport,
  TaskInventorySignals,
  TaskRole,
  TaskRoleKind,
  TaskRoleManifest,
  TaskTopology,
  TaskTopologyKind,
  TaskTopologyManifest,
} from "./task.types";
import { V79_TASK_FREEZE_VERSION, V79_TASK_VERSION } from "./task.types";

const REQUIRED_ROLE_KINDS: TaskRoleKind[] = [
  "creator",
  "assigner",
  "executor",
  "monitor",
  "coordinator",
  "governance",
  "topology",
  "boundary",
];

const REQUIRED_TOPOLOGY_KINDS: TaskTopologyKind[] = [
  "hub",
  "node",
  "edge",
  "leaf",
  "boundary",
  "pipeline",
  "domain",
  "global",
];

const REQUIRED_GOVERNANCE_KINDS = [
  "policy",
  "audit",
  "compliance",
  "freeze",
  "rollback",
  "version",
  "scope",
  "boundary",
] as const;

export const TASK_ROLE_CATALOG: TaskRole[] = [
  {
    id: "TSK-ROL-001",
    name: "task-creator",
    kind: "creator",
    status: "registered",
    scopeRef: "TSK-SCP-001",
    topologyRef: "TSK-TOP-001",
    executionRef: "EXE-ROL-001",
    required: true,
    description: "Primary declarative task creator role from execution baseline",
  },
  {
    id: "TSK-ROL-002",
    name: "topology-assigner",
    kind: "topology",
    status: "registered",
    scopeRef: "TSK-SCP-003",
    topologyRef: "TSK-TOP-002",
    executionRef: "EXE-ROL-002",
    required: true,
    description: "Topology graph task assignment role",
  },
  {
    id: "TSK-ROL-003",
    name: "scope-executor",
    kind: "executor",
    status: "registered",
    scopeRef: "TSK-SCP-006",
    topologyRef: "TSK-TOP-003",
    executionRef: "EXE-ROL-003",
    required: true,
    description: "Scope boundary task executor role",
  },
  {
    id: "TSK-ROL-004",
    name: "dependency-monitor",
    kind: "monitor",
    status: "registered",
    scopeRef: "TSK-SCP-003",
    topologyRef: "TSK-TOP-004",
    executionRef: "EXE-ROL-004",
    required: true,
    description: "Upstream dependency task monitor role",
  },
  {
    id: "TSK-ROL-005",
    name: "session-coordinator",
    kind: "coordinator",
    status: "registered",
    scopeRef: "TSK-SCP-006",
    topologyRef: "TSK-TOP-005",
    executionRef: "EXE-ROL-005",
    required: true,
    description: "Session lifecycle task coordinator role",
  },
  {
    id: "TSK-ROL-006",
    name: "domain-assigner",
    kind: "assigner",
    status: "registered",
    scopeRef: "TSK-SCP-004",
    topologyRef: "TSK-TOP-006",
    executionRef: "EXE-ROL-006",
    required: true,
    description: "Domain task assignment role",
  },
  {
    id: "TSK-ROL-007",
    name: "governance-operator",
    kind: "governance",
    status: "registered",
    scopeRef: "TSK-SCP-006",
    topologyRef: "TSK-TOP-007",
    executionRef: "EXE-ROL-007",
    required: true,
    description: "Governance inventory task operator role",
  },
  {
    id: "TSK-ROL-008",
    name: "boundary-guardian",
    kind: "boundary",
    status: "registered",
    scopeRef: "TSK-SCP-008",
    topologyRef: "TSK-TOP-008",
    executionRef: "EXE-ROL-008",
    required: true,
    description: "Declarative task boundary — no runtime task engine",
  },
];

export const TASK_TOPOLOGY_CATALOG: TaskTopology[] = [
  {
    id: "TSK-TOP-001",
    name: "task-global-root",
    kind: "global",
    status: "registered",
    roleRef: "TSK-ROL-001",
    scopeRef: "TSK-SCP-001",
    dependencyRef: "TSK-DEP-001",
    required: true,
    description: "Root global task topology from execution freeze",
  },
  {
    id: "TSK-TOP-002",
    name: "topology-graph-node",
    kind: "node",
    status: "registered",
    roleRef: "TSK-ROL-002",
    scopeRef: "TSK-SCP-003",
    dependencyRef: "TSK-DEP-003",
    required: true,
    description: "Acyclic task topology graph node",
  },
  {
    id: "TSK-TOP-003",
    name: "scope-boundary-edge",
    kind: "edge",
    status: "registered",
    roleRef: "TSK-ROL-003",
    scopeRef: "TSK-SCP-006",
    dependencyRef: "TSK-DEP-004",
    required: true,
    description: "Scope boundary task topology edge",
  },
  {
    id: "TSK-TOP-004",
    name: "dependency-lock-leaf",
    kind: "leaf",
    status: "registered",
    roleRef: "TSK-ROL-004",
    scopeRef: "TSK-SCP-003",
    dependencyRef: "TSK-DEP-005",
    required: true,
    description: "Dependency lock task topology leaf",
  },
  {
    id: "TSK-TOP-005",
    name: "session-lifecycle-node",
    kind: "pipeline",
    status: "registered",
    roleRef: "TSK-ROL-005",
    scopeRef: "TSK-SCP-004",
    dependencyRef: "TSK-DEP-006",
    required: true,
    description: "Session lifecycle task pipeline node",
  },
  {
    id: "TSK-TOP-006",
    name: "domain-dispatch-node",
    kind: "domain",
    status: "registered",
    roleRef: "TSK-ROL-006",
    scopeRef: "TSK-SCP-002",
    dependencyRef: "TSK-DEP-007",
    required: true,
    description: "Domain task dispatch node",
  },
  {
    id: "TSK-TOP-007",
    name: "governance-hub",
    kind: "hub",
    status: "registered",
    roleRef: "TSK-ROL-007",
    scopeRef: "TSK-SCP-006",
    dependencyRef: "TSK-DEP-004",
    required: true,
    description: "Governance task topology hub",
  },
  {
    id: "TSK-TOP-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    roleRef: "TSK-ROL-008",
    scopeRef: "TSK-SCP-008",
    dependencyRef: "TSK-DEP-008",
    required: true,
    description: "Declarative-only task boundary — no runtime task engine",
  },
];

export const TASK_GOVERNANCE_CATALOG: TaskGovernance[] = [
  {
    id: "TSK-GOV-001",
    name: "execution-freeze-policy",
    kind: "freeze",
    status: "frozen",
    scopeRef: "TSK-SCP-001",
    roleRef: "TSK-ROL-001",
    rule: "upstream-execution-freeze-intact",
    required: true,
    description: "Require V78 execution freeze intact for tasks",
  },
  {
    id: "TSK-GOV-002",
    name: "topology-acyclic-audit",
    kind: "audit",
    status: "registered",
    scopeRef: "TSK-SCP-003",
    roleRef: "TSK-ROL-002",
    rule: "task-topology-acyclic",
    required: true,
    description: "Audit task topology acyclicity",
  },
  {
    id: "TSK-GOV-003",
    name: "state-compliance",
    kind: "compliance",
    status: "registered",
    scopeRef: "TSK-SCP-006",
    roleRef: "TSK-ROL-003",
    rule: "task-state-documented",
    required: true,
    description: "Task state lifecycle compliance rule",
  },
  {
    id: "TSK-GOV-004",
    name: "dependency-policy",
    kind: "policy",
    status: "registered",
    scopeRef: "TSK-SCP-003",
    roleRef: "TSK-ROL-004",
    rule: "upstream-dependency-declared",
    required: true,
    description: "Dependency task policy rule",
  },
  {
    id: "TSK-GOV-005",
    name: "session-scope-governance",
    kind: "scope",
    status: "registered",
    scopeRef: "TSK-SCP-006",
    roleRef: "TSK-ROL-005",
    rule: "session-scope-bounded",
    required: true,
    description: "Session task scope governance",
  },
  {
    id: "TSK-GOV-006",
    name: "version-lock-governance",
    kind: "version",
    status: "registered",
    scopeRef: "TSK-SCP-007",
    roleRef: "TSK-ROL-006",
    rule: "version-lock-must-match-upstream",
    required: true,
    description: "Task version lock governance rule",
  },
  {
    id: "TSK-GOV-007",
    name: "rollback-readiness",
    kind: "rollback",
    status: "registered",
    scopeRef: "TSK-SCP-005",
    roleRef: "TSK-ROL-007",
    rule: "rollback-index-documented",
    required: true,
    description: "Task rollback readiness governance",
  },
  {
    id: "TSK-GOV-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    scopeRef: "TSK-SCP-008",
    roleRef: "TSK-ROL-008",
    rule: "declarative-only-no-runtime",
    required: true,
    description: "Task boundary — no runtime task engine",
  },
];

const EXECUTION_ROLE_IDS = new Set([
  "EXE-ROL-001",
  "EXE-ROL-002",
  "EXE-ROL-003",
  "EXE-ROL-004",
  "EXE-ROL-005",
  "EXE-ROL-006",
  "EXE-ROL-007",
  "EXE-ROL-008",
]);

function scopeIds(): Set<string> {
  return new Set(TASK_SCOPE_CATALOG.map((s) => s.id));
}

function roleIds(): Set<string> {
  return new Set(TASK_ROLE_CATALOG.map((r) => r.id));
}

function topologyIds(): Set<string> {
  return new Set(TASK_TOPOLOGY_CATALOG.map((t) => t.id));
}

function dependencyIds(): Set<string> {
  return new Set(TASK_UPSTREAM_DEPENDENCIES.map((d) => d.id));
}

export function isTaskInventoryRefsAligned(): boolean {
  const scopes = scopeIds();
  const roles = roleIds();
  const topology = topologyIds();
  const deps = dependencyIds();

  const rolesAligned = TASK_ROLE_CATALOG.every(
    (r) =>
      scopes.has(r.scopeRef) &&
      topology.has(r.topologyRef) &&
      EXECUTION_ROLE_IDS.has(r.executionRef),
  );
  const statesAligned = TASK_STATE_CATALOG.every(
    (s) => scopes.has(s.scopeRef) && roles.has(s.roleRef) && s.transitionRule.length > 0,
  );
  const topologyAligned = TASK_TOPOLOGY_CATALOG.every(
    (t) => scopes.has(t.scopeRef) && roles.has(t.roleRef) && deps.has(t.dependencyRef),
  );
  const governanceAligned = TASK_GOVERNANCE_CATALOG.every(
    (g) => scopes.has(g.scopeRef) && roles.has(g.roleRef) && g.rule.length > 0,
  );

  return rolesAligned && statesAligned && topologyAligned && governanceAligned;
}

export function buildTaskRoleManifest(): TaskRoleManifest {
  const roles = TASK_ROLE_CATALOG;
  const kinds = new Set(roles.map((r) => r.kind));
  const catalogComplete =
    roles.length === 8 && REQUIRED_ROLE_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_VERSION,
    entryCount: roles.length,
    kindCount: kinds.size,
    catalogComplete,
    roles,
    summary: [
      `task-roles count=${roles.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskTopologyManifest(): TaskTopologyManifest {
  const topology = TASK_TOPOLOGY_CATALOG;
  const kinds = new Set(topology.map((t) => t.kind));
  const catalogComplete =
    topology.length === 8 && REQUIRED_TOPOLOGY_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_VERSION,
    entryCount: topology.length,
    kindCount: kinds.size,
    catalogComplete,
    topology,
    summary: [
      `task-topology count=${topology.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskGovernanceManifest(): TaskGovernanceManifest {
  const governance = TASK_GOVERNANCE_CATALOG;
  const kinds = new Set(governance.map((g) => g.kind));
  const catalogComplete =
    governance.length === 8 && REQUIRED_GOVERNANCE_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_VERSION,
    entryCount: governance.length,
    kindCount: kinds.size,
    catalogComplete,
    governance,
    summary: [
      `task-governance count=${governance.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskInventoryManifest(): TaskInventoryManifest {
  const roles = buildTaskRoleManifest();
  const states = buildTaskStateManifest();
  const topology = buildTaskTopologyManifest();
  const governance = buildTaskGovernanceManifest();

  const inventoryComplete =
    roles.catalogComplete &&
    states.catalogComplete &&
    topology.catalogComplete &&
    governance.catalogComplete &&
    isTaskInventoryRefsAligned() &&
    isTaskUpstreamAligned() &&
    isTaskScopeCoverageComplete() &&
    isTaskStateCoverageComplete();

  return {
    version: V79_TASK_VERSION,
    roles,
    states,
    topology,
    governance,
    inventoryComplete,
    summary: [
      `task-inventory complete=${inventoryComplete}`,
      `roles=${roles.entryCount}`,
      `states=${states.entryCount}`,
      `topology=${topology.entryCount}`,
      `governance=${governance.entryCount}`,
    ].join(" "),
  };
}

const DEFAULT_SIGNALS: TaskInventorySignals = {
  inventoryComplete: true,
  upstreamAligned: true,
  scopeCoverageComplete: true,
  freezeVersionDeclared: true,
};

export function buildTaskInventory(input?: {
  deploymentId?: string;
  signals?: TaskInventorySignals;
}): TaskInventoryReport {
  const deploymentId = input?.deploymentId ?? "v79-task-inventory-default";
  const manifest = buildTaskInventoryManifest();
  const upstreamAligned = isTaskUpstreamAligned();
  const scopeCoverageComplete = isTaskScopeCoverageComplete();

  const signals: TaskInventorySignals = {
    ...DEFAULT_SIGNALS,
    inventoryComplete: manifest.inventoryComplete,
    upstreamAligned,
    scopeCoverageComplete,
    freezeVersionDeclared: V79_TASK_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const inventoryReady =
    manifest.inventoryComplete &&
    upstreamAligned &&
    scopeCoverageComplete &&
    signals.inventoryComplete !== false &&
    signals.upstreamAligned !== false &&
    signals.freezeVersionDeclared !== false;

  return {
    version: V79_TASK_VERSION,
    freezeVersion: V79_TASK_FREEZE_VERSION,
    reportId: `task-inventory-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamExecutionFreeze: "v78-execution-freeze-1",
    upstreamExecutionSignoff: "v78-execution-signoff-1",
    manifest,
    inventoryReady,
    readinessScore: inventoryReady ? 100 : 0,
    summary: [
      `task-inventory ready=${inventoryReady}`,
      `roles=${manifest.roles.entryCount}`,
      `states=${manifest.states.entryCount}`,
      `topology=${manifest.topology.entryCount}`,
      `governance=${manifest.governance.entryCount}`,
      `upstreamAligned=${upstreamAligned}`,
    ].join(" "),
  };
}

export function assertTaskInventoryPass(
  report: TaskInventoryReport,
): asserts report is TaskInventoryReport & { inventoryReady: true } {
  if (!report.inventoryReady) {
    throw new Error(`V79 task inventory not ready: ${report.summary}`);
  }
}

export function getTaskRoleById(id: string): TaskRole | undefined {
  return TASK_ROLE_CATALOG.find((r) => r.id === id);
}

export function getTaskTopologyById(id: string): TaskTopology | undefined {
  return TASK_TOPOLOGY_CATALOG.find((t) => t.id === id);
}

export function getTaskGovernanceById(id: string): TaskGovernance | undefined {
  return TASK_GOVERNANCE_CATALOG.find((g) => g.id === id);
}

export function getTaskRolesByKind(kind: TaskRoleKind): TaskRole[] {
  return TASK_ROLE_CATALOG.filter((r) => r.kind === kind);
}

export { buildTaskStateManifest };
