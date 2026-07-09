/**
 * V78 P1 — Execution inventory (declarative)
 */
import {
  EXECUTION_UPSTREAM_DEPENDENCIES,
  isExecutionUpstreamAligned,
} from "./execution.dependencies";
import {
  EXECUTION_SCOPE_CATALOG,
  isExecutionScopeCoverageComplete,
} from "./execution.scope";
import type {
  ExecutionGovernance,
  ExecutionGovernanceManifest,
  ExecutionInventoryManifest,
  ExecutionInventoryReport,
  ExecutionInventorySignals,
  ExecutionRole,
  ExecutionRoleKind,
  ExecutionRoleManifest,
  ExecutionTopology,
  ExecutionTopologyKind,
  ExecutionTopologyManifest,
} from "./execution.types";
import { V78_EXECUTION_FREEZE_VERSION, V78_EXECUTION_VERSION } from "./execution.types";

const REQUIRED_ROLE_KINDS: ExecutionRoleKind[] = [
  "executor",
  "dispatcher",
  "runner",
  "monitor",
  "coordinator",
  "governance",
  "topology",
  "workspace",
];

const REQUIRED_TOPOLOGY_KINDS: ExecutionTopologyKind[] = [
  "hub",
  "node",
  "edge",
  "leaf",
  "boundary",
  "session",
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

export const EXECUTION_ROLE_CATALOG: ExecutionRole[] = [
  {
    id: "EXE-ROL-001",
    name: "primary-executor",
    kind: "executor",
    status: "registered",
    scopeRef: "EXE-SCP-001",
    topologyRef: "EXE-TOP-001",
    planningRef: "PLN-CTX-001",
    required: true,
    description: "Primary declarative execution role from planning baseline",
  },
  {
    id: "EXE-ROL-002",
    name: "topology-dispatcher",
    kind: "topology",
    status: "registered",
    scopeRef: "EXE-SCP-003",
    topologyRef: "EXE-TOP-002",
    planningRef: "PLN-CTX-002",
    required: true,
    description: "Topology graph execution dispatcher role",
  },
  {
    id: "EXE-ROL-003",
    name: "scope-runner",
    kind: "runner",
    status: "registered",
    scopeRef: "EXE-SCP-006",
    topologyRef: "EXE-TOP-003",
    planningRef: "PLN-CTX-003",
    required: true,
    description: "Scope boundary execution runner role",
  },
  {
    id: "EXE-ROL-004",
    name: "dependency-monitor",
    kind: "monitor",
    status: "registered",
    scopeRef: "EXE-SCP-003",
    topologyRef: "EXE-TOP-004",
    planningRef: "PLN-CTX-004",
    required: true,
    description: "Upstream dependency execution monitor role",
  },
  {
    id: "EXE-ROL-005",
    name: "session-coordinator",
    kind: "coordinator",
    status: "registered",
    scopeRef: "EXE-SCP-006",
    topologyRef: "EXE-TOP-005",
    planningRef: "PLN-CTX-005",
    required: true,
    description: "Session lifecycle execution coordinator role",
  },
  {
    id: "EXE-ROL-006",
    name: "domain-dispatcher",
    kind: "dispatcher",
    status: "registered",
    scopeRef: "EXE-SCP-004",
    topologyRef: "EXE-TOP-006",
    planningRef: "PLN-CTX-006",
    required: true,
    description: "Domain execution dispatcher role",
  },
  {
    id: "EXE-ROL-007",
    name: "governance-operator",
    kind: "governance",
    status: "registered",
    scopeRef: "EXE-SCP-006",
    topologyRef: "EXE-TOP-007",
    planningRef: "PLN-CTX-007",
    required: true,
    description: "Governance inventory execution operator role",
  },
  {
    id: "EXE-ROL-008",
    name: "workspace-executor",
    kind: "workspace",
    status: "registered",
    scopeRef: "EXE-SCP-008",
    topologyRef: "EXE-TOP-008",
    planningRef: "PLN-CTX-008",
    required: true,
    description: "Declarative workspace execution role — no runtime execution",
  },
];

export const EXECUTION_TOPOLOGY_CATALOG: ExecutionTopology[] = [
  {
    id: "EXE-TOP-001",
    name: "execution-global-root",
    kind: "global",
    status: "registered",
    roleRef: "EXE-ROL-001",
    scopeRef: "EXE-SCP-001",
    dependencyRef: "EXE-DEP-001",
    required: true,
    description: "Root global execution topology from planning freeze",
  },
  {
    id: "EXE-TOP-002",
    name: "topology-graph-node",
    kind: "node",
    status: "registered",
    roleRef: "EXE-ROL-002",
    scopeRef: "EXE-SCP-003",
    dependencyRef: "EXE-DEP-003",
    required: true,
    description: "Acyclic execution topology graph node",
  },
  {
    id: "EXE-TOP-003",
    name: "scope-boundary-edge",
    kind: "edge",
    status: "registered",
    roleRef: "EXE-ROL-003",
    scopeRef: "EXE-SCP-006",
    dependencyRef: "EXE-DEP-004",
    required: true,
    description: "Scope boundary execution topology edge",
  },
  {
    id: "EXE-TOP-004",
    name: "dependency-lock-leaf",
    kind: "leaf",
    status: "registered",
    roleRef: "EXE-ROL-004",
    scopeRef: "EXE-SCP-003",
    dependencyRef: "EXE-DEP-005",
    required: true,
    description: "Dependency lock execution topology leaf",
  },
  {
    id: "EXE-TOP-005",
    name: "session-lifecycle-node",
    kind: "session",
    status: "registered",
    roleRef: "EXE-ROL-005",
    scopeRef: "EXE-SCP-004",
    dependencyRef: "EXE-DEP-006",
    required: true,
    description: "Session lifecycle execution node",
  },
  {
    id: "EXE-TOP-006",
    name: "domain-dispatch-node",
    kind: "domain",
    status: "registered",
    roleRef: "EXE-ROL-006",
    scopeRef: "EXE-SCP-002",
    dependencyRef: "EXE-DEP-007",
    required: true,
    description: "Domain execution dispatch node",
  },
  {
    id: "EXE-TOP-007",
    name: "governance-hub",
    kind: "hub",
    status: "registered",
    roleRef: "EXE-ROL-007",
    scopeRef: "EXE-SCP-006",
    dependencyRef: "EXE-DEP-004",
    required: true,
    description: "Governance execution topology hub",
  },
  {
    id: "EXE-TOP-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    roleRef: "EXE-ROL-008",
    scopeRef: "EXE-SCP-008",
    dependencyRef: "EXE-DEP-008",
    required: true,
    description: "Declarative-only execution boundary — no runtime execution",
  },
];

export const EXECUTION_GOVERNANCE_CATALOG: ExecutionGovernance[] = [
  {
    id: "EXE-GOV-001",
    name: "planning-freeze-policy",
    kind: "freeze",
    status: "frozen",
    scopeRef: "EXE-SCP-001",
    roleRef: "EXE-ROL-001",
    rule: "upstream-planning-freeze-intact",
    required: true,
    description: "Require V77 planning freeze intact for execution",
  },
  {
    id: "EXE-GOV-002",
    name: "topology-acyclic-audit",
    kind: "audit",
    status: "registered",
    scopeRef: "EXE-SCP-003",
    roleRef: "EXE-ROL-002",
    rule: "execution-topology-acyclic",
    required: true,
    description: "Audit execution topology acyclicity",
  },
  {
    id: "EXE-GOV-003",
    name: "scope-compliance",
    kind: "compliance",
    status: "registered",
    scopeRef: "EXE-SCP-006",
    roleRef: "EXE-ROL-003",
    rule: "execution-scope-documented",
    required: true,
    description: "Execution scope compliance rule",
  },
  {
    id: "EXE-GOV-004",
    name: "dependency-policy",
    kind: "policy",
    status: "registered",
    scopeRef: "EXE-SCP-003",
    roleRef: "EXE-ROL-004",
    rule: "upstream-dependency-declared",
    required: true,
    description: "Dependency execution policy rule",
  },
  {
    id: "EXE-GOV-005",
    name: "session-scope-governance",
    kind: "scope",
    status: "registered",
    scopeRef: "EXE-SCP-006",
    roleRef: "EXE-ROL-005",
    rule: "session-scope-bounded",
    required: true,
    description: "Session execution scope governance",
  },
  {
    id: "EXE-GOV-006",
    name: "version-lock-governance",
    kind: "version",
    status: "registered",
    scopeRef: "EXE-SCP-007",
    roleRef: "EXE-ROL-006",
    rule: "version-lock-must-match-upstream",
    required: true,
    description: "Execution version lock governance rule",
  },
  {
    id: "EXE-GOV-007",
    name: "rollback-readiness",
    kind: "rollback",
    status: "registered",
    scopeRef: "EXE-SCP-005",
    roleRef: "EXE-ROL-007",
    rule: "rollback-index-documented",
    required: true,
    description: "Execution rollback readiness governance",
  },
  {
    id: "EXE-GOV-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    scopeRef: "EXE-SCP-008",
    roleRef: "EXE-ROL-008",
    rule: "declarative-only-no-runtime",
    required: true,
    description: "Execution boundary — no runtime execution",
  },
];

const PLANNING_CONTEXT_IDS = new Set([
  "PLN-CTX-001",
  "PLN-CTX-002",
  "PLN-CTX-003",
  "PLN-CTX-004",
  "PLN-CTX-005",
  "PLN-CTX-006",
  "PLN-CTX-007",
  "PLN-CTX-008",
]);

function scopeIds(): Set<string> {
  return new Set(EXECUTION_SCOPE_CATALOG.map((s) => s.id));
}

function roleIds(): Set<string> {
  return new Set(EXECUTION_ROLE_CATALOG.map((r) => r.id));
}

function topologyIds(): Set<string> {
  return new Set(EXECUTION_TOPOLOGY_CATALOG.map((t) => t.id));
}

function dependencyIds(): Set<string> {
  return new Set(EXECUTION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
}

export function isExecutionInventoryRefsAligned(): boolean {
  const scopes = scopeIds();
  const roles = roleIds();
  const topology = topologyIds();
  const deps = dependencyIds();

  const rolesAligned = EXECUTION_ROLE_CATALOG.every(
    (r) =>
      scopes.has(r.scopeRef) &&
      topology.has(r.topologyRef) &&
      PLANNING_CONTEXT_IDS.has(r.planningRef),
  );
  const topologyAligned = EXECUTION_TOPOLOGY_CATALOG.every(
    (t) => scopes.has(t.scopeRef) && roles.has(t.roleRef) && deps.has(t.dependencyRef),
  );
  const governanceAligned = EXECUTION_GOVERNANCE_CATALOG.every(
    (g) => scopes.has(g.scopeRef) && roles.has(g.roleRef) && g.rule.length > 0,
  );

  return rolesAligned && topologyAligned && governanceAligned;
}

export function buildExecutionRoleManifest(): ExecutionRoleManifest {
  const roles = EXECUTION_ROLE_CATALOG;
  const kinds = new Set(roles.map((r) => r.kind));
  const catalogComplete =
    roles.length === 8 && REQUIRED_ROLE_KINDS.every((k) => kinds.has(k));

  return {
    version: V78_EXECUTION_VERSION,
    entryCount: roles.length,
    kindCount: kinds.size,
    catalogComplete,
    roles,
    summary: [
      `execution-roles count=${roles.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionTopologyManifest(): ExecutionTopologyManifest {
  const topology = EXECUTION_TOPOLOGY_CATALOG;
  const kinds = new Set(topology.map((t) => t.kind));
  const catalogComplete =
    topology.length === 8 && REQUIRED_TOPOLOGY_KINDS.every((k) => kinds.has(k));

  return {
    version: V78_EXECUTION_VERSION,
    entryCount: topology.length,
    kindCount: kinds.size,
    catalogComplete,
    topology,
    summary: [
      `execution-topology count=${topology.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionGovernanceManifest(): ExecutionGovernanceManifest {
  const governance = EXECUTION_GOVERNANCE_CATALOG;
  const kinds = new Set(governance.map((g) => g.kind));
  const catalogComplete =
    governance.length === 8 && REQUIRED_GOVERNANCE_KINDS.every((k) => kinds.has(k));

  return {
    version: V78_EXECUTION_VERSION,
    entryCount: governance.length,
    kindCount: kinds.size,
    catalogComplete,
    governance,
    summary: [
      `execution-governance count=${governance.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionInventoryManifest(): ExecutionInventoryManifest {
  const roles = buildExecutionRoleManifest();
  const topology = buildExecutionTopologyManifest();
  const governance = buildExecutionGovernanceManifest();

  const inventoryComplete =
    roles.catalogComplete &&
    topology.catalogComplete &&
    governance.catalogComplete &&
    isExecutionInventoryRefsAligned() &&
    isExecutionUpstreamAligned() &&
    isExecutionScopeCoverageComplete();

  return {
    version: V78_EXECUTION_VERSION,
    roles,
    topology,
    governance,
    inventoryComplete,
    summary: [
      `execution-inventory complete=${inventoryComplete}`,
      `roles=${roles.entryCount}`,
      `topology=${topology.entryCount}`,
      `governance=${governance.entryCount}`,
    ].join(" "),
  };
}

const DEFAULT_SIGNALS: ExecutionInventorySignals = {
  inventoryComplete: true,
  upstreamAligned: true,
  scopeCoverageComplete: true,
  freezeVersionDeclared: true,
};

export function buildExecutionInventory(input?: {
  deploymentId?: string;
  signals?: ExecutionInventorySignals;
}): ExecutionInventoryReport {
  const deploymentId = input?.deploymentId ?? "v78-execution-inventory-default";
  const manifest = buildExecutionInventoryManifest();
  const upstreamAligned = isExecutionUpstreamAligned();
  const scopeCoverageComplete = isExecutionScopeCoverageComplete();

  const signals: ExecutionInventorySignals = {
    ...DEFAULT_SIGNALS,
    inventoryComplete: manifest.inventoryComplete,
    upstreamAligned,
    scopeCoverageComplete,
    freezeVersionDeclared: V78_EXECUTION_FREEZE_VERSION.length > 0,
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
    version: V78_EXECUTION_VERSION,
    freezeVersion: V78_EXECUTION_FREEZE_VERSION,
    reportId: `execution-inventory-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamPlanningFreeze: "v77-planning-freeze-1",
    upstreamPlanningSignoff: "v77-planning-signoff-1",
    manifest,
    inventoryReady,
    readinessScore: inventoryReady ? 100 : 0,
    summary: [
      `execution-inventory ready=${inventoryReady}`,
      `roles=${manifest.roles.entryCount}`,
      `topology=${manifest.topology.entryCount}`,
      `governance=${manifest.governance.entryCount}`,
      `upstreamAligned=${upstreamAligned}`,
    ].join(" "),
  };
}

export function assertExecutionInventoryPass(
  report: ExecutionInventoryReport,
): asserts report is ExecutionInventoryReport & { inventoryReady: true } {
  if (!report.inventoryReady) {
    throw new Error(`V78 execution inventory not ready: ${report.summary}`);
  }
}

export function getExecutionRoleById(id: string): ExecutionRole | undefined {
  return EXECUTION_ROLE_CATALOG.find((r) => r.id === id);
}

export function getExecutionTopologyById(id: string): ExecutionTopology | undefined {
  return EXECUTION_TOPOLOGY_CATALOG.find((t) => t.id === id);
}

export function getExecutionGovernanceById(id: string): ExecutionGovernance | undefined {
  return EXECUTION_GOVERNANCE_CATALOG.find((g) => g.id === id);
}

export function getExecutionRolesByKind(kind: ExecutionRoleKind): ExecutionRole[] {
  return EXECUTION_ROLE_CATALOG.filter((r) => r.kind === kind);
}
