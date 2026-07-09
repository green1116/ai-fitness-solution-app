/**
 * V76 P1 — Collaboration inventory (declarative)
 */
import { isCollaborationUpstreamAligned } from "./collaboration.dependencies";
import {
  COLLABORATION_SCOPE_CATALOG,
  isCollaborationScopeCoverageComplete,
} from "./collaboration.scope";
import type {
  CollaborationConstraint,
  CollaborationConstraintManifest,
  CollaborationContext,
  CollaborationContextManifest,
  CollaborationInput,
  CollaborationInputManifest,
  CollaborationInventoryManifest,
  CollaborationInventoryReport,
  CollaborationInventorySignals,
  CollaborationOutput,
  CollaborationOutputManifest,
  CollaborationPolicy,
  CollaborationPolicyManifest,
  CollaborationSource,
  CollaborationSourceManifest,
} from "./collaboration.types";
import { V76_COLLABORATION_FREEZE_VERSION, V76_COLLABORATION_VERSION } from "./collaboration.types";

export const COLLABORATION_INPUT_CATALOG: CollaborationInput[] = [
  {
    id: "COL-INP-001",
    name: "agent-freeze-signal",
    kind: "agent",
    status: "registered",
    sourceRef: "COL-SRC-001",
    scopeRef: "COL-SCP-001",
    required: true,
    description: "V75 agent freeze readiness signal — shared role baseline",
  },
  {
    id: "COL-INP-002",
    name: "topology-acyclic-metric",
    kind: "metric",
    status: "registered",
    sourceRef: "COL-SRC-002",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Collaboration topology acyclic graph metric input",
  },
  {
    id: "COL-INP-003",
    name: "communication-contract-signal",
    kind: "signal",
    status: "registered",
    sourceRef: "COL-SRC-003",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Inter-agent communication contract enforcement signal",
  },
  {
    id: "COL-INP-004",
    name: "delegation-boundary-signal",
    kind: "signal",
    status: "registered",
    sourceRef: "COL-SRC-004",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Delegation boundary coverage signal",
  },
  {
    id: "COL-INP-005",
    name: "coordination-readiness-signal",
    kind: "signal",
    status: "registered",
    sourceRef: "COL-SRC-005",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Coordination policy readiness escalation signal",
  },
  {
    id: "COL-INP-006",
    name: "session-state-context",
    kind: "context",
    status: "registered",
    sourceRef: "COL-SRC-006",
    scopeRef: "COL-SCP-004",
    required: true,
    description: "Collaboration session state context input",
  },
  {
    id: "COL-INP-007",
    name: "governance-checklist-metric",
    kind: "metric",
    status: "registered",
    sourceRef: "COL-SRC-007",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Governance inventory pass metric",
  },
  {
    id: "COL-INP-008",
    name: "catalog-constraint-input",
    kind: "constraint",
    status: "registered",
    sourceRef: "COL-SRC-008",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "Collaboration inventory catalog completeness constraint input",
  },
];

export const COLLABORATION_OUTPUT_CATALOG: CollaborationOutput[] = [
  {
    id: "COL-OUT-001",
    name: "proceed-collaboration-recommendation",
    kind: "recommendation",
    status: "registered",
    inputRef: "COL-INP-001",
    scopeRef: "COL-SCP-001",
    required: true,
    description: "Recommend proceeding when agent freeze signal passes",
  },
  {
    id: "COL-OUT-002",
    name: "block-acyclic-violation",
    kind: "flag",
    status: "registered",
    inputRef: "COL-INP-002",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Flag collaboration topology cycle violation",
  },
  {
    id: "COL-OUT-003",
    name: "enforce-communication-contract",
    kind: "action",
    status: "registered",
    inputRef: "COL-INP-003",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Declarative communication contract enforcement action",
  },
  {
    id: "COL-OUT-004",
    name: "delegation-skip-action",
    kind: "action",
    status: "registered",
    inputRef: "COL-INP-004",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Skip incompatible delegation boundary pair action",
  },
  {
    id: "COL-OUT-005",
    name: "coordination-escalation",
    kind: "escalation",
    status: "registered",
    inputRef: "COL-INP-005",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Escalate coordination readiness threshold breach",
  },
  {
    id: "COL-OUT-006",
    name: "session-transition-audit",
    kind: "audit",
    status: "registered",
    inputRef: "COL-INP-006",
    scopeRef: "COL-SCP-004",
    required: true,
    description: "Audit collaboration session state transition",
  },
  {
    id: "COL-OUT-007",
    name: "governance-waiver-flag",
    kind: "flag",
    status: "registered",
    inputRef: "COL-INP-007",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Flag governance waiver required",
  },
  {
    id: "COL-OUT-008",
    name: "inventory-ready-handoff",
    kind: "handoff",
    status: "registered",
    inputRef: "COL-INP-008",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "Hand off to coordination when inventory constraints pass",
  },
];

export const COLLABORATION_CONTEXT_CATALOG: CollaborationContext[] = [
  {
    id: "COL-CTX-001",
    name: "shared-role-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "AGT-001",
    scopeRef: "COL-SCP-001",
    required: true,
    description: "Shared role collaboration context from agent baseline",
  },
  {
    id: "COL-CTX-002",
    name: "topology-graph-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "AGT-002",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Collaboration topology graph context",
  },
  {
    id: "COL-CTX-003",
    name: "communication-contract-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "AGT-003",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Communication contract collaboration context",
  },
  {
    id: "COL-CTX-004",
    name: "delegation-boundary-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "AGT-004",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Delegation boundary collaboration context",
  },
  {
    id: "COL-CTX-005",
    name: "coordination-policy-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "AGT-005",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Coordination policy collaboration context",
  },
  {
    id: "COL-CTX-006",
    name: "session-management-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "AGT-006",
    scopeRef: "COL-SCP-004",
    required: true,
    description: "Session management collaboration context",
  },
  {
    id: "COL-CTX-007",
    name: "governance-inventory-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "AGT-007",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Governance inventory collaboration context",
  },
  {
    id: "COL-CTX-008",
    name: "collaboration-inventory-context",
    status: "registered",
    deploymentId: "v76-collaboration-default",
    agentRef: "COL-001",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "V76 collaboration inventory foundation context",
  },
];

export const COLLABORATION_CONSTRAINT_CATALOG: CollaborationConstraint[] = [
  {
    id: "COL-CST-001",
    name: "no-runtime-execution",
    constraintKind: "delegation-boundary",
    status: "frozen",
    policyRef: "COL-POL-001",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "Collaboration layer must not execute runtime multi-agent orchestration",
  },
  {
    id: "COL-CST-002",
    name: "upstream-agent-freeze-intact",
    constraintKind: "version-lock",
    status: "frozen",
    policyRef: "COL-POL-002",
    scopeRef: "COL-SCP-001",
    required: true,
    description: "V75 agent freeze must remain intact",
  },
  {
    id: "COL-CST-003",
    name: "acyclic-topology-required",
    constraintKind: "graph",
    status: "frozen",
    policyRef: "COL-POL-003",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Collaboration topology graph must be acyclic",
  },
  {
    id: "COL-CST-004",
    name: "communication-contract-required",
    constraintKind: "contract",
    status: "frozen",
    policyRef: "COL-POL-004",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Communication contract must pass before collaboration proceeds",
  },
  {
    id: "COL-CST-005",
    name: "delegation-boundary-required",
    constraintKind: "boundary",
    status: "frozen",
    policyRef: "COL-POL-005",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Delegation boundary must be complete",
  },
  {
    id: "COL-CST-006",
    name: "coordination-readiness-bounded",
    constraintKind: "risk",
    status: "frozen",
    policyRef: "COL-POL-006",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Coordination readiness must be within declared bounds",
  },
  {
    id: "COL-CST-007",
    name: "governance-checklist-required",
    constraintKind: "audit",
    status: "frozen",
    policyRef: "COL-POL-007",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Governance inventory checklist must be complete",
  },
  {
    id: "COL-CST-008",
    name: "inventory-catalog-complete",
    constraintKind: "catalog",
    status: "frozen",
    policyRef: "COL-POL-008",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "Collaboration inventory catalog must be complete",
  },
];

export const COLLABORATION_POLICY_CATALOG: CollaborationPolicy[] = [
  {
    id: "COL-POL-001",
    name: "declarative-only-policy",
    policyKind: "boundary",
    status: "frozen",
    sourceRef: "COL-SRC-008",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "All collaboration is declarative — no runtime multi-agent execution",
  },
  {
    id: "COL-POL-002",
    name: "agent-freeze-policy",
    policyKind: "upstream",
    status: "frozen",
    sourceRef: "COL-SRC-001",
    scopeRef: "COL-SCP-001",
    required: true,
    description: "Honor V75 agent freeze upstream lock",
  },
  {
    id: "COL-POL-003",
    name: "topology-acyclic-policy",
    policyKind: "graph",
    status: "frozen",
    sourceRef: "COL-SRC-002",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Reject cyclic collaboration topology paths",
  },
  {
    id: "COL-POL-004",
    name: "communication-contract-policy",
    policyKind: "contract",
    status: "frozen",
    sourceRef: "COL-SRC-003",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Enforce inter-agent communication contracts declaratively",
  },
  {
    id: "COL-POL-005",
    name: "delegation-boundary-policy",
    policyKind: "delegation",
    status: "frozen",
    sourceRef: "COL-SRC-004",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Honor delegation boundaries per collaboration matrix",
  },
  {
    id: "COL-POL-006",
    name: "coordination-readiness-policy",
    policyKind: "coordination",
    status: "frozen",
    sourceRef: "COL-SRC-005",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Escalate when coordination readiness exceeds threshold",
  },
  {
    id: "COL-POL-007",
    name: "governance-inventory-policy",
    policyKind: "governance",
    status: "frozen",
    sourceRef: "COL-SRC-007",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Require governance inventory pass for collaboration decisions",
  },
  {
    id: "COL-POL-008",
    name: "inventory-completeness-policy",
    policyKind: "catalog",
    status: "frozen",
    sourceRef: "COL-SRC-008",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "Require full collaboration inventory before sign-off",
  },
];

export const COLLABORATION_SOURCE_CATALOG: CollaborationSource[] = [
  {
    id: "COL-SRC-001",
    name: "v75-agent-freeze",
    upstreamVersion: "v75-agent-freeze-1",
    status: "frozen",
    agentRef: "AGT-001",
    scopeRef: "COL-SCP-001",
    required: true,
    description: "V75 agent freeze upstream source",
  },
  {
    id: "COL-SRC-002",
    name: "v75-agent-signoff",
    upstreamVersion: "v75-agent-signoff-1",
    status: "frozen",
    agentRef: "AGT-008",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "V75 agent sign-off upstream source",
  },
  {
    id: "COL-SRC-003",
    name: "v75-agent-policy",
    upstreamVersion: "v75-agent-policy-catalog-1",
    status: "frozen",
    agentRef: "AGT-002",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "V75 agent policy catalog source",
  },
  {
    id: "COL-SRC-004",
    name: "v75-agent-context",
    upstreamVersion: "v75-agent-context-catalog-1",
    status: "frozen",
    agentRef: "AGT-003",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "V75 agent context catalog source",
  },
  {
    id: "COL-SRC-005",
    name: "v75-agent-compliance",
    upstreamVersion: "v75-agent-compliance-catalog-1",
    status: "frozen",
    agentRef: "AGT-007",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "V75 agent compliance catalog source",
  },
  {
    id: "COL-SRC-006",
    name: "v75-agent-simulation",
    upstreamVersion: "v75-agent-simulation-catalog-1",
    status: "frozen",
    agentRef: "AGT-006",
    scopeRef: "COL-SCP-004",
    required: true,
    description: "V75 agent simulation catalog source",
  },
  {
    id: "COL-SRC-007",
    name: "v75-agent-evaluation",
    upstreamVersion: "v75-agent-evaluation-catalog-1",
    status: "frozen",
    agentRef: "AGT-005",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "V75 agent evaluation catalog source",
  },
  {
    id: "COL-SRC-008",
    name: "v76-collaboration-inventory",
    upstreamVersion: "v76-collaboration-inventory-1",
    status: "declared",
    agentRef: "COL-001",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "V76 P1 collaboration inventory self-reference source",
  },
];

function scopeIds(): Set<string> {
  return new Set(COLLABORATION_SCOPE_CATALOG.map((s) => s.id));
}

function sourceIds(): Set<string> {
  return new Set(COLLABORATION_SOURCE_CATALOG.map((s) => s.id));
}

function policyIds(): Set<string> {
  return new Set(COLLABORATION_POLICY_CATALOG.map((p) => p.id));
}

export function isCollaborationInventoryRefsAligned(): boolean {
  const scopes = scopeIds();
  const sources = sourceIds();
  const policies = policyIds();
  const inputIds = new Set(COLLABORATION_INPUT_CATALOG.map((i) => i.id));

  const inputsAligned = COLLABORATION_INPUT_CATALOG.every(
    (i) => scopes.has(i.scopeRef) && sources.has(i.sourceRef),
  );
  const outputsAligned = COLLABORATION_OUTPUT_CATALOG.every(
    (o) => scopes.has(o.scopeRef) && inputIds.has(o.inputRef),
  );
  const contextsAligned = COLLABORATION_CONTEXT_CATALOG.every((c) => scopes.has(c.scopeRef));
  const constraintsAligned = COLLABORATION_CONSTRAINT_CATALOG.every(
    (c) => scopes.has(c.scopeRef) && policies.has(c.policyRef),
  );
  const policiesAligned = COLLABORATION_POLICY_CATALOG.every(
    (p) => scopes.has(p.scopeRef) && sources.has(p.sourceRef),
  );
  const sourcesAligned = COLLABORATION_SOURCE_CATALOG.every((s) => scopes.has(s.scopeRef));

  return (
    inputsAligned &&
    outputsAligned &&
    contextsAligned &&
    constraintsAligned &&
    policiesAligned &&
    sourcesAligned
  );
}

export function buildCollaborationInputManifest(): CollaborationInputManifest {
  const inputs = COLLABORATION_INPUT_CATALOG;
  const kinds = new Set(inputs.map((i) => i.kind));
  const catalogComplete = inputs.length >= 6 && kinds.size >= 4;

  return {
    version: V76_COLLABORATION_VERSION,
    entryCount: inputs.length,
    kindCount: kinds.size,
    catalogComplete,
    inputs,
    summary: [
      `collaboration-inputs count=${inputs.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationOutputManifest(): CollaborationOutputManifest {
  const outputs = COLLABORATION_OUTPUT_CATALOG;
  const kinds = new Set(outputs.map((o) => o.kind));
  const catalogComplete = outputs.length >= 6 && kinds.size >= 4;

  return {
    version: V76_COLLABORATION_VERSION,
    entryCount: outputs.length,
    kindCount: kinds.size,
    catalogComplete,
    outputs,
    summary: [
      `collaboration-outputs count=${outputs.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationContextManifest(): CollaborationContextManifest {
  const contexts = COLLABORATION_CONTEXT_CATALOG;
  const catalogComplete = contexts.length >= 6;

  return {
    version: V76_COLLABORATION_VERSION,
    entryCount: contexts.length,
    catalogComplete,
    contexts,
    summary: [
      `collaboration-contexts count=${contexts.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationConstraintManifest(): CollaborationConstraintManifest {
  const constraints = COLLABORATION_CONSTRAINT_CATALOG;
  const catalogComplete = constraints.length >= 6;

  return {
    version: V76_COLLABORATION_VERSION,
    entryCount: constraints.length,
    catalogComplete,
    constraints,
    summary: [
      `collaboration-constraints count=${constraints.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationPolicyManifest(): CollaborationPolicyManifest {
  const policies = COLLABORATION_POLICY_CATALOG;
  const catalogComplete = policies.length >= 6;

  return {
    version: V76_COLLABORATION_VERSION,
    entryCount: policies.length,
    catalogComplete,
    policies,
    summary: [
      `collaboration-policies count=${policies.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationSourceManifest(): CollaborationSourceManifest {
  const sources = COLLABORATION_SOURCE_CATALOG;
  const catalogComplete = sources.length >= 6;

  return {
    version: V76_COLLABORATION_VERSION,
    entryCount: sources.length,
    catalogComplete,
    sources,
    summary: [
      `collaboration-sources count=${sources.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationInventoryManifest(): CollaborationInventoryManifest {
  const inputs = buildCollaborationInputManifest();
  const outputs = buildCollaborationOutputManifest();
  const contexts = buildCollaborationContextManifest();
  const constraints = buildCollaborationConstraintManifest();
  const policies = buildCollaborationPolicyManifest();
  const sources = buildCollaborationSourceManifest();

  const inventoryComplete =
    inputs.catalogComplete &&
    outputs.catalogComplete &&
    contexts.catalogComplete &&
    constraints.catalogComplete &&
    policies.catalogComplete &&
    sources.catalogComplete &&
    isCollaborationInventoryRefsAligned() &&
    isCollaborationUpstreamAligned() &&
    isCollaborationScopeCoverageComplete();

  return {
    version: V76_COLLABORATION_VERSION,
    inputs,
    outputs,
    contexts,
    constraints,
    policies,
    sources,
    inventoryComplete,
    summary: [
      `collaboration-inventory complete=${inventoryComplete}`,
      `inputs=${inputs.entryCount}`,
      `outputs=${outputs.entryCount}`,
      `contexts=${contexts.entryCount}`,
      `constraints=${constraints.entryCount}`,
      `policies=${policies.entryCount}`,
      `sources=${sources.entryCount}`,
    ].join(" "),
  };
}

const DEFAULT_SIGNALS: CollaborationInventorySignals = {
  inventoryComplete: true,
  upstreamAligned: true,
  scopeCoverageComplete: true,
  freezeVersionDeclared: true,
};

export function buildCollaborationInventory(input?: {
  deploymentId?: string;
  signals?: CollaborationInventorySignals;
}): CollaborationInventoryReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-inventory-default";
  const manifest = buildCollaborationInventoryManifest();
  const upstreamAligned = isCollaborationUpstreamAligned();
  const scopeCoverageComplete = isCollaborationScopeCoverageComplete();

  const signals: CollaborationInventorySignals = {
    ...DEFAULT_SIGNALS,
    inventoryComplete: manifest.inventoryComplete,
    upstreamAligned,
    scopeCoverageComplete,
    freezeVersionDeclared: V76_COLLABORATION_FREEZE_VERSION.length > 0,
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
    version: V76_COLLABORATION_VERSION,
    freezeVersion: V76_COLLABORATION_FREEZE_VERSION,
    reportId: `collaboration-inventory-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamAgentFreeze: "v75-agent-freeze-1",
    upstreamAgentSignoff: "v75-agent-signoff-1",
    manifest,
    inventoryReady,
    readinessScore: inventoryReady ? 100 : 0,
    summary: [
      `collaboration-inventory ready=${inventoryReady}`,
      `inputs=${manifest.inputs.entryCount}`,
      `outputs=${manifest.outputs.entryCount}`,
      `contexts=${manifest.contexts.entryCount}`,
      `constraints=${manifest.constraints.entryCount}`,
      `policies=${manifest.policies.entryCount}`,
      `sources=${manifest.sources.entryCount}`,
      `upstreamAligned=${upstreamAligned}`,
    ].join(" "),
  };
}

export function assertCollaborationInventoryPass(
  report: CollaborationInventoryReport,
): asserts report is CollaborationInventoryReport & { inventoryReady: true } {
  if (!report.inventoryReady) {
    throw new Error(`V76 collaboration inventory not ready: ${report.summary}`);
  }
}

export function getCollaborationInputById(id: string): CollaborationInput | undefined {
  return COLLABORATION_INPUT_CATALOG.find((i) => i.id === id);
}

export function getCollaborationOutputById(id: string): CollaborationOutput | undefined {
  return COLLABORATION_OUTPUT_CATALOG.find((o) => o.id === id);
}

export function getCollaborationSourceById(id: string): CollaborationSource | undefined {
  return COLLABORATION_SOURCE_CATALOG.find((s) => s.id === id);
}

export function getCollaborationPolicyById(id: string): CollaborationPolicy | undefined {
  return COLLABORATION_POLICY_CATALOG.find((p) => p.id === id);
}
