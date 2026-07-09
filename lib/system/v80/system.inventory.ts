/**
 * V80 P1 — System meta-orchestration inventory (declarative)
 */
import { SYSTEM_CROSS_LAYER_MAP, isSystemCrossLayerMapComplete } from "./system.crosslayer";
import { SYSTEM_STACK_DEPENDENCIES, isSystemStackUpstreamAligned } from "./system.dependencies";
import { SYSTEM_SCOPE_CATALOG, isSystemScopeCoverageComplete } from "./system.scope";
import type {
  SystemCrossLayerRole,
  SystemCrossLayerRoleKind,
  SystemGovernance,
  SystemGovernanceManifest,
  SystemInventoryManifest,
  SystemInventoryReport,
  SystemInventorySignals,
  SystemRoleManifest,
  SystemTopology,
  SystemTopologyKind,
  SystemTopologyManifest,
} from "./system.types";
import { V80_SYSTEM_FREEZE_VERSION, V80_SYSTEM_VERSION } from "./system.types";

const REQUIRED_ROLE_KINDS: SystemCrossLayerRoleKind[] = [
  "collaboration",
  "planning",
  "execution",
  "task",
  "meta",
  "coordinator",
  "governance",
  "boundary",
];

const REQUIRED_TOPOLOGY_KINDS: SystemTopologyKind[] = [
  "global",
  "hub",
  "node",
  "edge",
  "leaf",
  "pipeline",
  "domain",
  "boundary",
];

const REQUIRED_GOV_KINDS = [
  "freeze",
  "audit",
  "compliance",
  "policy",
  "rollback",
  "version",
  "scope",
  "boundary",
] as const;

export const SYSTEM_ROLE_CATALOG: SystemCrossLayerRole[] = [
  {
    id: "SYS-ROL-001",
    name: "v76-collaboration-bridge",
    kind: "collaboration",
    layerRef: "V76",
    status: "frozen",
    scopeRef: "SYS-SCP-003",
    topologyRef: "SYS-TOP-001",
    layerSignoffRef: "v76-collaboration-signoff-1",
    required: true,
    description: "Cross-layer collaboration role — V76 stack bridge",
  },
  {
    id: "SYS-ROL-002",
    name: "v77-planning-bridge",
    kind: "planning",
    layerRef: "V77",
    status: "frozen",
    scopeRef: "SYS-SCP-004",
    topologyRef: "SYS-TOP-002",
    layerSignoffRef: "v77-planning-signoff-1",
    required: true,
    description: "Cross-layer planning role — V77 stack bridge",
  },
  {
    id: "SYS-ROL-003",
    name: "v78-execution-bridge",
    kind: "execution",
    layerRef: "V78",
    status: "frozen",
    scopeRef: "SYS-SCP-005",
    topologyRef: "SYS-TOP-003",
    layerSignoffRef: "v78-execution-signoff-1",
    required: true,
    description: "Cross-layer execution role — V78 stack bridge",
  },
  {
    id: "SYS-ROL-004",
    name: "v79-task-bridge",
    kind: "task",
    layerRef: "V79",
    status: "frozen",
    scopeRef: "SYS-SCP-006",
    topologyRef: "SYS-TOP-004",
    layerSignoffRef: "v79-task-signoff-1",
    required: true,
    description: "Cross-layer task role — V79 stack bridge",
  },
  {
    id: "SYS-ROL-005",
    name: "meta-orchestrator",
    kind: "meta",
    layerRef: "V80",
    status: "registered",
    scopeRef: "SYS-SCP-007",
    topologyRef: "SYS-TOP-005",
    layerSignoffRef: "v80-system-meta-inventory-1",
    required: true,
    description: "System meta-orchestration coordinator role",
  },
  {
    id: "SYS-ROL-006",
    name: "stack-coordinator",
    kind: "coordinator",
    layerRef: "V80",
    status: "registered",
    scopeRef: "SYS-SCP-002",
    topologyRef: "SYS-TOP-006",
    layerSignoffRef: "v80-system-meta-inventory-1",
    required: true,
    description: "V76–V79 stack coordination role",
  },
  {
    id: "SYS-ROL-007",
    name: "governance-operator",
    kind: "governance",
    layerRef: "V80",
    status: "registered",
    scopeRef: "SYS-SCP-002",
    topologyRef: "SYS-TOP-007",
    layerSignoffRef: "v80-system-meta-inventory-1",
    required: true,
    description: "Cross-layer governance operator role",
  },
  {
    id: "SYS-ROL-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    layerRef: "V80",
    status: "frozen",
    scopeRef: "SYS-SCP-008",
    topologyRef: "SYS-TOP-008",
    layerSignoffRef: "v80-system-meta-inventory-1",
    required: true,
    description: "Declarative-only boundary — no runtime orchestration",
  },
];

export const SYSTEM_TOPOLOGY_CATALOG: SystemTopology[] = [
  {
    id: "SYS-TOP-001",
    name: "stack-global-root",
    kind: "global",
    status: "frozen",
    layerRef: "V76",
    roleRef: "SYS-ROL-001",
    scopeRef: "SYS-SCP-001",
    dependencyRef: "SYS-DEP-001",
    required: true,
    description: "Root global stack topology from V76 freeze",
  },
  {
    id: "SYS-TOP-002",
    name: "planning-stack-node",
    kind: "node",
    status: "frozen",
    layerRef: "V77",
    roleRef: "SYS-ROL-002",
    scopeRef: "SYS-SCP-004",
    dependencyRef: "SYS-DEP-003",
    required: true,
    description: "V77 planning stack topology node",
  },
  {
    id: "SYS-TOP-003",
    name: "execution-stack-pipeline",
    kind: "pipeline",
    status: "frozen",
    layerRef: "V78",
    roleRef: "SYS-ROL-003",
    scopeRef: "SYS-SCP-005",
    dependencyRef: "SYS-DEP-005",
    required: true,
    description: "V78 execution stack pipeline segment",
  },
  {
    id: "SYS-TOP-004",
    name: "task-stack-leaf",
    kind: "leaf",
    status: "frozen",
    layerRef: "V79",
    roleRef: "SYS-ROL-004",
    scopeRef: "SYS-SCP-006",
    dependencyRef: "SYS-DEP-007",
    required: true,
    description: "V79 task stack leaf node",
  },
  {
    id: "SYS-TOP-005",
    name: "meta-orchestration-hub",
    kind: "hub",
    status: "registered",
    layerRef: "V80",
    roleRef: "SYS-ROL-005",
    scopeRef: "SYS-SCP-007",
    dependencyRef: "SYS-DEP-008",
    required: true,
    description: "V80 meta-orchestration hub",
  },
  {
    id: "SYS-TOP-006",
    name: "stack-pipeline-edge",
    kind: "edge",
    status: "registered",
    layerRef: "V80",
    roleRef: "SYS-ROL-006",
    scopeRef: "SYS-SCP-002",
    dependencyRef: "SYS-DEP-006",
    required: true,
    description: "V76→V79 stack pipeline edge",
  },
  {
    id: "SYS-TOP-007",
    name: "governance-hub",
    kind: "domain",
    status: "registered",
    layerRef: "V80",
    roleRef: "SYS-ROL-007",
    scopeRef: "SYS-SCP-002",
    dependencyRef: "SYS-DEP-004",
    required: true,
    description: "Cross-layer governance domain hub",
  },
  {
    id: "SYS-TOP-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    layerRef: "V80",
    roleRef: "SYS-ROL-008",
    scopeRef: "SYS-SCP-008",
    dependencyRef: "SYS-DEP-008",
    required: true,
    description: "Declarative-only meta boundary — no runtime orchestration",
  },
];

export const SYSTEM_GOVERNANCE_CATALOG: SystemGovernance[] = [
  {
    id: "SYS-GOV-001",
    name: "v76-freeze-policy",
    kind: "freeze",
    status: "frozen",
    scopeRef: "SYS-SCP-003",
    roleRef: "SYS-ROL-001",
    rule: "v76-collaboration-freeze-intact",
    required: true,
    description: "Require V76 collaboration freeze intact",
  },
  {
    id: "SYS-GOV-002",
    name: "version-lock-governance",
    kind: "version",
    status: "registered",
    scopeRef: "SYS-SCP-007",
    roleRef: "SYS-ROL-005",
    rule: "layer-signoff-versions-locked",
    required: true,
    description: "Layer sign-off version lock governance",
  },
  {
    id: "SYS-GOV-003",
    name: "stack-audit",
    kind: "audit",
    status: "registered",
    scopeRef: "SYS-SCP-002",
    roleRef: "SYS-ROL-006",
    rule: "stack-layers-audited",
    required: true,
    description: "Audit V76–V79 stack layer completeness",
  },
  {
    id: "SYS-GOV-004",
    name: "cross-layer-compliance",
    kind: "compliance",
    status: "registered",
    scopeRef: "SYS-SCP-002",
    roleRef: "SYS-ROL-007",
    rule: "cross-layer-map-documented",
    required: true,
    description: "Cross-layer map compliance rule",
  },
  {
    id: "SYS-GOV-005",
    name: "global-scope-governance",
    kind: "scope",
    status: "registered",
    scopeRef: "SYS-SCP-001",
    roleRef: "SYS-ROL-007",
    rule: "global-scope-declared",
    required: true,
    description: "Global system scope governance rule",
  },
  {
    id: "SYS-GOV-006",
    name: "dependency-policy",
    kind: "policy",
    status: "registered",
    scopeRef: "SYS-SCP-001",
    roleRef: "SYS-ROL-007",
    rule: "stack-dependency-declared",
    required: true,
    description: "Stack dependency policy rule",
  },
  {
    id: "SYS-GOV-007",
    name: "rollback-readiness",
    kind: "rollback",
    status: "registered",
    scopeRef: "SYS-SCP-002",
    roleRef: "SYS-ROL-007",
    rule: "rollback-index-documented",
    required: true,
    description: "Stack rollback readiness governance",
  },
  {
    id: "SYS-GOV-008",
    name: "no-runtime-boundary",
    kind: "boundary",
    status: "frozen",
    scopeRef: "SYS-SCP-008",
    roleRef: "SYS-ROL-008",
    rule: "declarative-only-no-runtime",
    required: true,
    description: "Meta boundary — no runtime orchestration",
  },
];

const LAYER_SIGNOFF_REFS = new Set(
  SYSTEM_CROSS_LAYER_MAP.flatMap((e) => [e.signoffVersion, e.freezeVersion]),
);

export function isSystemInventoryRefsAligned(): boolean {
  const scopes = new Set(SYSTEM_SCOPE_CATALOG.map((s) => s.id));
  const roles = new Set(SYSTEM_ROLE_CATALOG.map((r) => r.id));
  const topology = new Set(SYSTEM_TOPOLOGY_CATALOG.map((t) => t.id));
  const deps = new Set(SYSTEM_STACK_DEPENDENCIES.map((d) => d.id));

  const rolesAligned = SYSTEM_ROLE_CATALOG.every(
    (r) =>
      scopes.has(r.scopeRef) &&
      topology.has(r.topologyRef) &&
      (LAYER_SIGNOFF_REFS.has(r.layerSignoffRef) || r.layerSignoffRef.startsWith("v80-")),
  );
  const topologyAligned = SYSTEM_TOPOLOGY_CATALOG.every(
    (t) => scopes.has(t.scopeRef) && roles.has(t.roleRef) && deps.has(t.dependencyRef),
  );
  const govAligned = SYSTEM_GOVERNANCE_CATALOG.every(
    (g) => scopes.has(g.scopeRef) && roles.has(g.roleRef) && g.rule.length > 0,
  );

  return rolesAligned && topologyAligned && govAligned;
}

export function buildSystemRoleManifest(): SystemRoleManifest {
  const roles = SYSTEM_ROLE_CATALOG;
  const kinds = new Set(roles.map((r) => r.kind));
  const catalogComplete =
    roles.length === 8 && REQUIRED_ROLE_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_VERSION,
    entryCount: roles.length,
    kindCount: kinds.size,
    catalogComplete,
    roles,
    summary: `system-roles count=${roles.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function buildSystemTopologyManifest(): SystemTopologyManifest {
  const topology = SYSTEM_TOPOLOGY_CATALOG;
  const kinds = new Set(topology.map((t) => t.kind));
  const catalogComplete =
    topology.length === 8 && REQUIRED_TOPOLOGY_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_VERSION,
    entryCount: topology.length,
    kindCount: kinds.size,
    catalogComplete,
    topology,
    summary: `system-topology count=${topology.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function buildSystemGovernanceManifest(): SystemGovernanceManifest {
  const governance = SYSTEM_GOVERNANCE_CATALOG;
  const kinds = new Set(governance.map((g) => g.kind));
  const catalogComplete =
    governance.length === 8 && REQUIRED_GOV_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_VERSION,
    entryCount: governance.length,
    kindCount: kinds.size,
    catalogComplete,
    governance,
    summary: `system-governance count=${governance.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function buildSystemInventoryManifest(): SystemInventoryManifest {
  const roles = buildSystemRoleManifest();
  const topology = buildSystemTopologyManifest();
  const governance = buildSystemGovernanceManifest();

  const inventoryComplete =
    roles.catalogComplete &&
    topology.catalogComplete &&
    governance.catalogComplete &&
    isSystemInventoryRefsAligned() &&
    isSystemStackUpstreamAligned() &&
    isSystemScopeCoverageComplete() &&
    isSystemCrossLayerMapComplete();

  return {
    version: V80_SYSTEM_VERSION,
    roles,
    topology,
    governance,
    inventoryComplete,
    summary: `system-inventory complete=${inventoryComplete} roles=${roles.entryCount} topology=${topology.entryCount} governance=${governance.entryCount}`,
  };
}

const DEFAULT_SIGNALS: SystemInventorySignals = {
  inventoryComplete: true,
  upstreamAligned: true,
  scopeCoverageComplete: true,
  crossLayerMapComplete: true,
  freezeVersionDeclared: true,
};

export function buildSystemInventory(input?: {
  deploymentId?: string;
  signals?: SystemInventorySignals;
}): SystemInventoryReport {
  const deploymentId = input?.deploymentId ?? "v80-system-meta-inventory-default";
  const manifest = buildSystemInventoryManifest();

  const signals: SystemInventorySignals = {
    ...DEFAULT_SIGNALS,
    inventoryComplete: manifest.inventoryComplete,
    upstreamAligned: isSystemStackUpstreamAligned(),
    scopeCoverageComplete: isSystemScopeCoverageComplete(),
    crossLayerMapComplete: isSystemCrossLayerMapComplete(),
    freezeVersionDeclared: V80_SYSTEM_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const inventoryReady =
    manifest.inventoryComplete &&
    signals.upstreamAligned !== false &&
    signals.scopeCoverageComplete !== false &&
    signals.crossLayerMapComplete !== false &&
    signals.inventoryComplete !== false &&
    signals.freezeVersionDeclared !== false;

  return {
    version: V80_SYSTEM_VERSION,
    freezeVersion: V80_SYSTEM_FREEZE_VERSION,
    reportId: `system-meta-inventory-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    stackLayers: ["V76", "V77", "V78", "V79"],
    manifest,
    inventoryReady,
    readinessScore: inventoryReady ? 100 : 0,
    summary: `system-meta-inventory ready=${inventoryReady} layers=4 roles=${manifest.roles.entryCount} topology=${manifest.topology.entryCount}`,
  };
}

export function assertSystemInventoryPass(
  report: SystemInventoryReport,
): asserts report is SystemInventoryReport & { inventoryReady: true } {
  if (!report.inventoryReady) {
    throw new Error(`V80 system meta inventory not ready: ${report.summary}`);
  }
}

export function getSystemRoleById(id: string): SystemCrossLayerRole | undefined {
  return SYSTEM_ROLE_CATALOG.find((r) => r.id === id);
}

export function getSystemTopologyById(id: string): SystemTopology | undefined {
  return SYSTEM_TOPOLOGY_CATALOG.find((t) => t.id === id);
}

export function getSystemGovernanceById(id: string): SystemGovernance | undefined {
  return SYSTEM_GOVERNANCE_CATALOG.find((g) => g.id === id);
}

export function getSystemRolesByKind(kind: SystemCrossLayerRoleKind): SystemCrossLayerRole[] {
  return SYSTEM_ROLE_CATALOG.filter((r) => r.kind === kind);
}
