/**
 * V77 P1 — Planning inventory (declarative)
 */
import {
  PLANNING_UPSTREAM_DEPENDENCIES,
  isPlanningUpstreamAligned,
} from "./planning.dependencies";
import {
  PLANNING_SCOPE_CATALOG,
  isPlanningScopeCoverageComplete,
} from "./planning.scope";
import type {
  PlanningGovernance,
  PlanningGovernanceManifest,
  PlanningInventoryManifest,
  PlanningInventoryReport,
  PlanningInventorySignals,
  PlanningRole,
  PlanningRoleKind,
  PlanningRoleManifest,
  PlanningTopology,
  PlanningTopologyKind,
  PlanningTopologyManifest,
} from "./planning.types";
import { V77_PLANNING_FREEZE_VERSION, V77_PLANNING_VERSION } from "./planning.types";

const REQUIRED_ROLE_KINDS: PlanningRoleKind[] = [
  "planner",
  "coordinator",
  "executor",
  "reviewer",
  "delegator",
  "governance",
  "topology",
  "workspace",
];

const REQUIRED_TOPOLOGY_KINDS: PlanningTopologyKind[] = [
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

export const PLANNING_ROLE_CATALOG: PlanningRole[] = [
  {
    id: "PLN-ROL-001",
    name: "primary-planner",
    kind: "planner",
    status: "registered",
    scopeRef: "PLN-SCP-001",
    topologyRef: "PLN-TOP-001",
    collaborationRef: "COL-CTX-001",
    required: true,
    description: "Primary declarative planning role from collaboration baseline",
  },
  {
    id: "PLN-ROL-002",
    name: "topology-coordinator",
    kind: "topology",
    status: "registered",
    scopeRef: "PLN-SCP-003",
    topologyRef: "PLN-TOP-002",
    collaborationRef: "COL-CTX-002",
    required: true,
    description: "Topology graph planning coordinator role",
  },
  {
    id: "PLN-ROL-003",
    name: "communication-planner",
    kind: "coordinator",
    status: "registered",
    scopeRef: "PLN-SCP-006",
    topologyRef: "PLN-TOP-003",
    collaborationRef: "COL-CTX-003",
    required: true,
    description: "Communication contract planning coordinator role",
  },
  {
    id: "PLN-ROL-004",
    name: "delegation-executor",
    kind: "delegator",
    status: "registered",
    scopeRef: "PLN-SCP-003",
    topologyRef: "PLN-TOP-004",
    collaborationRef: "COL-CTX-004",
    required: true,
    description: "Delegation boundary planning executor role",
  },
  {
    id: "PLN-ROL-005",
    name: "coordination-reviewer",
    kind: "reviewer",
    status: "registered",
    scopeRef: "PLN-SCP-006",
    topologyRef: "PLN-TOP-005",
    collaborationRef: "COL-CTX-005",
    required: true,
    description: "Coordination readiness planning reviewer role",
  },
  {
    id: "PLN-ROL-006",
    name: "session-executor",
    kind: "executor",
    status: "registered",
    scopeRef: "PLN-SCP-004",
    topologyRef: "PLN-TOP-006",
    collaborationRef: "COL-CTX-006",
    required: true,
    description: "Session lifecycle planning executor role",
  },
  {
    id: "PLN-ROL-007",
    name: "governance-operator",
    kind: "governance",
    status: "registered",
    scopeRef: "PLN-SCP-006",
    topologyRef: "PLN-TOP-007",
    collaborationRef: "COL-CTX-007",
    required: true,
    description: "Governance inventory planning operator role",
  },
  {
    id: "PLN-ROL-008",
    name: "workspace-planner",
    kind: "workspace",
    status: "registered",
    scopeRef: "PLN-SCP-008",
    topologyRef: "PLN-TOP-008",
    collaborationRef: "COL-CTX-008",
    required: true,
    description: "Declarative workspace planning role — no runtime execution",
  },
];

export const PLANNING_TOPOLOGY_CATALOG: PlanningTopology[] = [
  {
    id: "PLN-TOP-001",
    name: "planning-global-root",
    kind: "global",
    status: "registered",
    roleRef: "PLN-ROL-001",
    scopeRef: "PLN-SCP-001",
    dependencyRef: "PLN-DEP-001",
    required: true,
    description: "Root global planning topology from collaboration freeze",
  },
  {
    id: "PLN-TOP-002",
    name: "topology-graph-node",
    kind: "node",
    status: "registered",
    roleRef: "PLN-ROL-002",
    scopeRef: "PLN-SCP-003",
    dependencyRef: "PLN-DEP-003",
    required: true,
    description: "Acyclic planning topology graph node",
  },
  {
    id: "PLN-TOP-003",
    name: "communication-edge",
    kind: "edge",
    status: "registered",
    roleRef: "PLN-ROL-003",
    scopeRef: "PLN-SCP-006",
    dependencyRef: "PLN-DEP-004",
    required: true,
    description: "Communication contract planning topology edge",
  },
  {
    id: "PLN-TOP-004",
    name: "delegation-boundary-leaf",
    kind: "leaf",
    status: "registered",
    roleRef: "PLN-ROL-004",
    scopeRef: "PLN-SCP-003",
    dependencyRef: "PLN-DEP-005",
    required: true,
    description: "Delegation boundary planning topology leaf",
  },
  {
    id: "PLN-TOP-005",
    name: "coordination-session-node",
    kind: "session",
    status: "registered",
    roleRef: "PLN-ROL-005",
    scopeRef: "PLN-SCP-004",
    dependencyRef: "PLN-DEP-006",
    required: true,
    description: "Coordination readiness planning session node",
  },
  {
    id: "PLN-TOP-006",
    name: "lifecycle-domain-node",
    kind: "domain",
    status: "registered",
    roleRef: "PLN-ROL-006",
    scopeRef: "PLN-SCP-002",
    dependencyRef: "PLN-DEP-007",
    required: true,
    description: "Session lifecycle planning domain node",
  },
  {
    id: "PLN-TOP-007",
    name: "governance-hub",
    kind: "hub",
    status: "registered",
    roleRef: "PLN-ROL-007",
    scopeRef: "PLN-SCP-006",
    dependencyRef: "PLN-DEP-004",
    required: true,
    description: "Governance planning topology hub",
  },
  {
    id: "PLN-TOP-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    roleRef: "PLN-ROL-008",
    scopeRef: "PLN-SCP-008",
    dependencyRef: "PLN-DEP-008",
    required: true,
    description: "Declarative-only planning boundary — no runtime execution",
  },
];

export const PLANNING_GOVERNANCE_CATALOG: PlanningGovernance[] = [
  {
    id: "PLN-GOV-001",
    name: "collaboration-freeze-policy",
    kind: "freeze",
    status: "frozen",
    scopeRef: "PLN-SCP-001",
    roleRef: "PLN-ROL-001",
    rule: "upstream-collaboration-freeze-intact",
    required: true,
    description: "Require V76 collaboration freeze intact for planning",
  },
  {
    id: "PLN-GOV-002",
    name: "topology-acyclic-audit",
    kind: "audit",
    status: "registered",
    scopeRef: "PLN-SCP-003",
    roleRef: "PLN-ROL-002",
    rule: "planning-topology-acyclic",
    required: true,
    description: "Audit planning topology acyclicity",
  },
  {
    id: "PLN-GOV-003",
    name: "communication-compliance",
    kind: "compliance",
    status: "registered",
    scopeRef: "PLN-SCP-006",
    roleRef: "PLN-ROL-003",
    rule: "communication-contract-documented",
    required: true,
    description: "Planning communication compliance rule",
  },
  {
    id: "PLN-GOV-004",
    name: "delegation-policy",
    kind: "policy",
    status: "registered",
    scopeRef: "PLN-SCP-003",
    roleRef: "PLN-ROL-004",
    rule: "delegation-boundary-declared",
    required: true,
    description: "Delegation planning policy rule",
  },
  {
    id: "PLN-GOV-005",
    name: "coordination-scope-governance",
    kind: "scope",
    status: "registered",
    scopeRef: "PLN-SCP-006",
    roleRef: "PLN-ROL-005",
    rule: "coordination-scope-bounded",
    required: true,
    description: "Coordination planning scope governance",
  },
  {
    id: "PLN-GOV-006",
    name: "version-lock-governance",
    kind: "version",
    status: "registered",
    scopeRef: "PLN-SCP-007",
    roleRef: "PLN-ROL-006",
    rule: "version-lock-must-match-upstream",
    required: true,
    description: "Planning version lock governance rule",
  },
  {
    id: "PLN-GOV-007",
    name: "rollback-readiness",
    kind: "rollback",
    status: "registered",
    scopeRef: "PLN-SCP-005",
    roleRef: "PLN-ROL-007",
    rule: "rollback-index-documented",
    required: true,
    description: "Planning rollback readiness governance",
  },
  {
    id: "PLN-GOV-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    scopeRef: "PLN-SCP-008",
    roleRef: "PLN-ROL-008",
    rule: "declarative-only-no-runtime",
    required: true,
    description: "Planning boundary — no runtime multi-agent execution",
  },
];

const COLLABORATION_CONTEXT_IDS = new Set([
  "COL-CTX-001",
  "COL-CTX-002",
  "COL-CTX-003",
  "COL-CTX-004",
  "COL-CTX-005",
  "COL-CTX-006",
  "COL-CTX-007",
  "COL-CTX-008",
]);

function scopeIds(): Set<string> {
  return new Set(PLANNING_SCOPE_CATALOG.map((s) => s.id));
}

function roleIds(): Set<string> {
  return new Set(PLANNING_ROLE_CATALOG.map((r) => r.id));
}

function topologyIds(): Set<string> {
  return new Set(PLANNING_TOPOLOGY_CATALOG.map((t) => t.id));
}

function dependencyIds(): Set<string> {
  return new Set(PLANNING_UPSTREAM_DEPENDENCIES.map((d) => d.id));
}

export function isPlanningInventoryRefsAligned(): boolean {
  const scopes = scopeIds();
  const roles = roleIds();
  const topology = topologyIds();
  const deps = dependencyIds();

  const rolesAligned = PLANNING_ROLE_CATALOG.every(
    (r) =>
      scopes.has(r.scopeRef) &&
      topology.has(r.topologyRef) &&
      COLLABORATION_CONTEXT_IDS.has(r.collaborationRef),
  );
  const topologyAligned = PLANNING_TOPOLOGY_CATALOG.every(
    (t) => scopes.has(t.scopeRef) && roles.has(t.roleRef) && deps.has(t.dependencyRef),
  );
  const governanceAligned = PLANNING_GOVERNANCE_CATALOG.every(
    (g) => scopes.has(g.scopeRef) && roles.has(g.roleRef) && g.rule.length > 0,
  );

  return rolesAligned && topologyAligned && governanceAligned;
}

export function buildPlanningRoleManifest(): PlanningRoleManifest {
  const roles = PLANNING_ROLE_CATALOG;
  const kinds = new Set(roles.map((r) => r.kind));
  const catalogComplete =
    roles.length === 8 && REQUIRED_ROLE_KINDS.every((k) => kinds.has(k));

  return {
    version: V77_PLANNING_VERSION,
    entryCount: roles.length,
    kindCount: kinds.size,
    catalogComplete,
    roles,
    summary: [
      `planning-roles count=${roles.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningTopologyManifest(): PlanningTopologyManifest {
  const topology = PLANNING_TOPOLOGY_CATALOG;
  const kinds = new Set(topology.map((t) => t.kind));
  const catalogComplete =
    topology.length === 8 && REQUIRED_TOPOLOGY_KINDS.every((k) => kinds.has(k));

  return {
    version: V77_PLANNING_VERSION,
    entryCount: topology.length,
    kindCount: kinds.size,
    catalogComplete,
    topology,
    summary: [
      `planning-topology count=${topology.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningGovernanceManifest(): PlanningGovernanceManifest {
  const governance = PLANNING_GOVERNANCE_CATALOG;
  const kinds = new Set(governance.map((g) => g.kind));
  const catalogComplete =
    governance.length === 8 && REQUIRED_GOVERNANCE_KINDS.every((k) => kinds.has(k));

  return {
    version: V77_PLANNING_VERSION,
    entryCount: governance.length,
    kindCount: kinds.size,
    catalogComplete,
    governance,
    summary: [
      `planning-governance count=${governance.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningInventoryManifest(): PlanningInventoryManifest {
  const roles = buildPlanningRoleManifest();
  const topology = buildPlanningTopologyManifest();
  const governance = buildPlanningGovernanceManifest();

  const inventoryComplete =
    roles.catalogComplete &&
    topology.catalogComplete &&
    governance.catalogComplete &&
    isPlanningInventoryRefsAligned() &&
    isPlanningUpstreamAligned() &&
    isPlanningScopeCoverageComplete();

  return {
    version: V77_PLANNING_VERSION,
    roles,
    topology,
    governance,
    inventoryComplete,
    summary: [
      `planning-inventory complete=${inventoryComplete}`,
      `roles=${roles.entryCount}`,
      `topology=${topology.entryCount}`,
      `governance=${governance.entryCount}`,
    ].join(" "),
  };
}

const DEFAULT_SIGNALS: PlanningInventorySignals = {
  inventoryComplete: true,
  upstreamAligned: true,
  scopeCoverageComplete: true,
  freezeVersionDeclared: true,
};

export function buildPlanningInventory(input?: {
  deploymentId?: string;
  signals?: PlanningInventorySignals;
}): PlanningInventoryReport {
  const deploymentId = input?.deploymentId ?? "v77-planning-inventory-default";
  const manifest = buildPlanningInventoryManifest();
  const upstreamAligned = isPlanningUpstreamAligned();
  const scopeCoverageComplete = isPlanningScopeCoverageComplete();

  const signals: PlanningInventorySignals = {
    ...DEFAULT_SIGNALS,
    inventoryComplete: manifest.inventoryComplete,
    upstreamAligned,
    scopeCoverageComplete,
    freezeVersionDeclared: V77_PLANNING_FREEZE_VERSION.length > 0,
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
    version: V77_PLANNING_VERSION,
    freezeVersion: V77_PLANNING_FREEZE_VERSION,
    reportId: `planning-inventory-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamCollaborationFreeze: "v76-collaboration-freeze-1",
    upstreamCollaborationSignoff: "v76-collaboration-signoff-1",
    manifest,
    inventoryReady,
    readinessScore: inventoryReady ? 100 : 0,
    summary: [
      `planning-inventory ready=${inventoryReady}`,
      `roles=${manifest.roles.entryCount}`,
      `topology=${manifest.topology.entryCount}`,
      `governance=${manifest.governance.entryCount}`,
      `upstreamAligned=${upstreamAligned}`,
    ].join(" "),
  };
}

export function assertPlanningInventoryPass(
  report: PlanningInventoryReport,
): asserts report is PlanningInventoryReport & { inventoryReady: true } {
  if (!report.inventoryReady) {
    throw new Error(`V77 planning inventory not ready: ${report.summary}`);
  }
}

export function getPlanningRoleById(id: string): PlanningRole | undefined {
  return PLANNING_ROLE_CATALOG.find((r) => r.id === id);
}

export function getPlanningTopologyById(id: string): PlanningTopology | undefined {
  return PLANNING_TOPOLOGY_CATALOG.find((t) => t.id === id);
}

export function getPlanningGovernanceById(id: string): PlanningGovernance | undefined {
  return PLANNING_GOVERNANCE_CATALOG.find((g) => g.id === id);
}

export function getPlanningRolesByKind(kind: PlanningRoleKind): PlanningRole[] {
  return PLANNING_ROLE_CATALOG.filter((r) => r.kind === kind);
}
