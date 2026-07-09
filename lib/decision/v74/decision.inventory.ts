/**
 * V74 P1 — Decision engine inventory (declarative)
 */
import { isDecisionUpstreamAligned } from "./decision.dependencies";
import { DECISION_SCOPE_CATALOG, isDecisionScopeCoverageComplete } from "./decision.scope";
import type {
  DecisionConstraint,
  DecisionConstraintManifest,
  DecisionContext,
  DecisionContextManifest,
  DecisionInput,
  DecisionInputManifest,
  DecisionInventoryManifest,
  DecisionInventoryReport,
  DecisionInventorySignals,
  DecisionOutput,
  DecisionOutputManifest,
  DecisionPolicy,
  DecisionPolicyManifest,
  DecisionSource,
  DecisionSourceManifest,
} from "./decision.types";
import { V74_DECISION_FREEZE_VERSION, V74_DECISION_VERSION } from "./decision.types";

export const DECISION_INPUT_CATALOG: DecisionInput[] = [
  {
    id: "DEC-INP-001",
    name: "knowledge-freeze-signal",
    kind: "knowledge",
    sourceRef: "DEC-SRC-001",
    scopeRef: "DEC-SCP-001",
    required: true,
    description: "V73 knowledge freeze readiness signal input",
  },
  {
    id: "DEC-INP-002",
    name: "dependency-acyclic-metric",
    kind: "metric",
    sourceRef: "DEC-SRC-002",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Knowledge dependency acyclic graph metric input",
  },
  {
    id: "DEC-INP-003",
    name: "policy-gate-signal",
    kind: "policy",
    sourceRef: "DEC-SRC-003",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Knowledge policy gate enforcement signal",
  },
  {
    id: "DEC-INP-004",
    name: "compatibility-matrix-signal",
    kind: "signal",
    sourceRef: "DEC-SRC-004",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Knowledge compatibility matrix coverage signal",
  },
  {
    id: "DEC-INP-005",
    name: "governance-risk-signal",
    kind: "signal",
    sourceRef: "DEC-SRC-005",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Knowledge governance risk escalation signal",
  },
  {
    id: "DEC-INP-006",
    name: "lifecycle-state-context",
    kind: "context",
    sourceRef: "DEC-SRC-006",
    scopeRef: "DEC-SCP-007",
    required: true,
    description: "Knowledge lifecycle state context input",
  },
  {
    id: "DEC-INP-007",
    name: "compliance-checklist-metric",
    kind: "metric",
    sourceRef: "DEC-SRC-007",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Knowledge compliance checklist pass metric",
  },
  {
    id: "DEC-INP-008",
    name: "catalog-constraint-input",
    kind: "constraint",
    sourceRef: "DEC-SRC-008",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "Decision inventory catalog completeness constraint input",
  },
];

export const DECISION_OUTPUT_CATALOG: DecisionOutput[] = [
  {
    id: "DEC-OUT-001",
    name: "proceed-freeze-recommendation",
    kind: "recommendation",
    inputRef: "DEC-INP-001",
    scopeRef: "DEC-SCP-001",
    required: true,
    description: "Recommend proceeding when knowledge freeze signal passes",
  },
  {
    id: "DEC-OUT-002",
    name: "block-acyclic-violation",
    kind: "flag",
    inputRef: "DEC-INP-002",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Flag dependency cycle violation",
  },
  {
    id: "DEC-OUT-003",
    name: "enforce-policy-gate",
    kind: "action",
    inputRef: "DEC-INP-003",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Declarative policy gate enforcement action",
  },
  {
    id: "DEC-OUT-004",
    name: "compatibility-skip-action",
    kind: "action",
    inputRef: "DEC-INP-004",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Skip incompatible knowledge version pair action",
  },
  {
    id: "DEC-OUT-005",
    name: "governance-escalation",
    kind: "escalation",
    inputRef: "DEC-INP-005",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Escalate governance risk threshold breach",
  },
  {
    id: "DEC-OUT-006",
    name: "lifecycle-transition-audit",
    kind: "audit",
    inputRef: "DEC-INP-006",
    scopeRef: "DEC-SCP-007",
    required: true,
    description: "Audit lifecycle state transition decision",
  },
  {
    id: "DEC-OUT-007",
    name: "compliance-waiver-flag",
    kind: "flag",
    inputRef: "DEC-INP-007",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Flag compliance waiver required",
  },
  {
    id: "DEC-OUT-008",
    name: "inventory-ready-recommendation",
    kind: "recommendation",
    inputRef: "DEC-INP-008",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "Recommend inventory readiness when constraints pass",
  },
];

export const DECISION_CONTEXT_CATALOG: DecisionContext[] = [
  {
    id: "DEC-CTX-001",
    name: "platform-global-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-001",
    scopeRef: "DEC-SCP-001",
    required: true,
    description: "Platform-wide decision context from intelligence baseline",
  },
  {
    id: "DEC-CTX-002",
    name: "dependency-graph-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-002",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Knowledge dependency graph decision context",
  },
  {
    id: "DEC-CTX-003",
    name: "policy-enforcement-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-003",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Policy enforcement decision context",
  },
  {
    id: "DEC-CTX-004",
    name: "compatibility-matrix-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-004",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Compatibility matrix decision context",
  },
  {
    id: "DEC-CTX-005",
    name: "governance-risk-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-005",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Governance risk escalation decision context",
  },
  {
    id: "DEC-CTX-006",
    name: "lifecycle-management-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-006",
    scopeRef: "DEC-SCP-007",
    required: true,
    description: "Lifecycle management decision context",
  },
  {
    id: "DEC-CTX-007",
    name: "compliance-audit-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-007",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Compliance audit decision context",
  },
  {
    id: "DEC-CTX-008",
    name: "decision-inventory-context",
    deploymentId: "v74-decision-default",
    knowledgeRef: "KNW-008",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "V74 decision inventory foundation context",
  },
];

export const DECISION_CONSTRAINT_CATALOG: DecisionConstraint[] = [
  {
    id: "DEC-CST-001",
    name: "no-runtime-mutation",
    constraintKind: "boundary",
    policyRef: "DEC-POL-001",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "Decision layer must not mutate runtime state",
  },
  {
    id: "DEC-CST-002",
    name: "upstream-freeze-intact",
    constraintKind: "version-lock",
    policyRef: "DEC-POL-002",
    scopeRef: "DEC-SCP-001",
    required: true,
    description: "V73 knowledge freeze must remain intact",
  },
  {
    id: "DEC-CST-003",
    name: "acyclic-dependency-required",
    constraintKind: "graph",
    policyRef: "DEC-POL-003",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Knowledge dependency graph must be acyclic",
  },
  {
    id: "DEC-CST-004",
    name: "policy-gate-required",
    constraintKind: "governance",
    policyRef: "DEC-POL-004",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Policy gate must pass before decision proceeds",
  },
  {
    id: "DEC-CST-005",
    name: "compatibility-matrix-required",
    constraintKind: "version",
    policyRef: "DEC-POL-005",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Compatibility matrix must be complete",
  },
  {
    id: "DEC-CST-006",
    name: "governance-risk-bounded",
    constraintKind: "risk",
    policyRef: "DEC-POL-006",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Governance risk must be within declared bounds",
  },
  {
    id: "DEC-CST-007",
    name: "compliance-checklist-required",
    constraintKind: "audit",
    policyRef: "DEC-POL-007",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Compliance checklist must be complete",
  },
  {
    id: "DEC-CST-008",
    name: "inventory-catalog-complete",
    constraintKind: "catalog",
    policyRef: "DEC-POL-008",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "Decision inventory catalog must be complete",
  },
];

export const DECISION_POLICY_CATALOG: DecisionPolicy[] = [
  {
    id: "DEC-POL-001",
    name: "declarative-only-policy",
    policyKind: "boundary",
    sourceRef: "DEC-SRC-008",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "All decisions are declarative — no runtime enforcement",
  },
  {
    id: "DEC-POL-002",
    name: "knowledge-freeze-policy",
    policyKind: "upstream",
    sourceRef: "DEC-SRC-001",
    scopeRef: "DEC-SCP-001",
    required: true,
    description: "Honor V73 knowledge freeze upstream lock",
  },
  {
    id: "DEC-POL-003",
    name: "dependency-acyclic-policy",
    policyKind: "graph",
    sourceRef: "DEC-SRC-002",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Reject cyclic knowledge dependency paths",
  },
  {
    id: "DEC-POL-004",
    name: "policy-gate-enforcement",
    policyKind: "governance",
    sourceRef: "DEC-SRC-003",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Enforce knowledge policy gates declaratively",
  },
  {
    id: "DEC-POL-005",
    name: "compatibility-skip-policy",
    policyKind: "version",
    sourceRef: "DEC-SRC-004",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Skip incompatible version pairs per matrix",
  },
  {
    id: "DEC-POL-006",
    name: "governance-risk-policy",
    policyKind: "risk",
    sourceRef: "DEC-SRC-005",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Escalate when governance risk exceeds threshold",
  },
  {
    id: "DEC-POL-007",
    name: "compliance-audit-policy",
    policyKind: "audit",
    sourceRef: "DEC-SRC-007",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Require compliance checklist pass for freeze decisions",
  },
  {
    id: "DEC-POL-008",
    name: "inventory-completeness-policy",
    policyKind: "catalog",
    sourceRef: "DEC-SRC-008",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "Require full decision inventory before sign-off",
  },
];

export const DECISION_SOURCE_CATALOG: DecisionSource[] = [
  {
    id: "DEC-SRC-001",
    name: "v73-knowledge-freeze",
    upstreamVersion: "v73-knowledge-freeze-1",
    knowledgeRef: "KNW-001",
    scopeRef: "DEC-SCP-001",
    required: true,
    description: "V73 knowledge freeze upstream source",
  },
  {
    id: "DEC-SRC-002",
    name: "v73-knowledge-dependency",
    upstreamVersion: "v73-knowledge-dependency-1",
    knowledgeRef: "KNW-002",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "V73 knowledge dependency graph source",
  },
  {
    id: "DEC-SRC-003",
    name: "v73-knowledge-policy",
    upstreamVersion: "v73-knowledge-policy-1",
    knowledgeRef: "KNW-003",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "V73 knowledge policy source",
  },
  {
    id: "DEC-SRC-004",
    name: "v73-knowledge-compatibility",
    upstreamVersion: "v73-knowledge-compatibility-1",
    knowledgeRef: "KNW-004",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "V73 knowledge compatibility matrix source",
  },
  {
    id: "DEC-SRC-005",
    name: "v73-knowledge-governance",
    upstreamVersion: "v73-knowledge-governance-1",
    knowledgeRef: "KNW-005",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "V73 knowledge governance source",
  },
  {
    id: "DEC-SRC-006",
    name: "v73-knowledge-lifecycle",
    upstreamVersion: "v73-knowledge-lifecycle-1",
    knowledgeRef: "KNW-006",
    scopeRef: "DEC-SCP-007",
    required: true,
    description: "V73 knowledge lifecycle source",
  },
  {
    id: "DEC-SRC-007",
    name: "v73-knowledge-compliance",
    upstreamVersion: "v73-knowledge-compliance-1",
    knowledgeRef: "KNW-007",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "V73 knowledge compliance source",
  },
  {
    id: "DEC-SRC-008",
    name: "v74-decision-inventory",
    upstreamVersion: "v74-decision-inventory-1",
    knowledgeRef: "KNW-008",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "V74 P1 decision inventory self-reference source",
  },
];

function scopeIds(): Set<string> {
  return new Set(DECISION_SCOPE_CATALOG.map((s) => s.id));
}

function sourceIds(): Set<string> {
  return new Set(DECISION_SOURCE_CATALOG.map((s) => s.id));
}

function policyIds(): Set<string> {
  return new Set(DECISION_POLICY_CATALOG.map((p) => p.id));
}

export function isDecisionInventoryRefsAligned(): boolean {
  const scopes = scopeIds();
  const sources = sourceIds();
  const policies = policyIds();
  const inputIds = new Set(DECISION_INPUT_CATALOG.map((i) => i.id));

  const inputsAligned = DECISION_INPUT_CATALOG.every(
    (i) => scopes.has(i.scopeRef) && sources.has(i.sourceRef),
  );
  const outputsAligned = DECISION_OUTPUT_CATALOG.every(
    (o) => scopes.has(o.scopeRef) && inputIds.has(o.inputRef),
  );
  const contextsAligned = DECISION_CONTEXT_CATALOG.every(
    (c) => scopes.has(c.scopeRef),
  );
  const constraintsAligned = DECISION_CONSTRAINT_CATALOG.every(
    (c) => scopes.has(c.scopeRef) && policies.has(c.policyRef),
  );
  const policiesAligned = DECISION_POLICY_CATALOG.every(
    (p) => scopes.has(p.scopeRef) && sources.has(p.sourceRef),
  );
  const sourcesAligned = DECISION_SOURCE_CATALOG.every((s) => scopes.has(s.scopeRef));

  return (
    inputsAligned &&
    outputsAligned &&
    contextsAligned &&
    constraintsAligned &&
    policiesAligned &&
    sourcesAligned
  );
}

export function buildDecisionInputManifest(): DecisionInputManifest {
  const inputs = DECISION_INPUT_CATALOG;
  const kinds = new Set(inputs.map((i) => i.kind));
  const catalogComplete = inputs.length >= 6 && kinds.size >= 4;

  return {
    version: V74_DECISION_VERSION,
    entryCount: inputs.length,
    kindCount: kinds.size,
    catalogComplete,
    inputs,
    summary: [
      `decision-inputs count=${inputs.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDecisionOutputManifest(): DecisionOutputManifest {
  const outputs = DECISION_OUTPUT_CATALOG;
  const kinds = new Set(outputs.map((o) => o.kind));
  const catalogComplete = outputs.length >= 6 && kinds.size >= 4;

  return {
    version: V74_DECISION_VERSION,
    entryCount: outputs.length,
    kindCount: kinds.size,
    catalogComplete,
    outputs,
    summary: [
      `decision-outputs count=${outputs.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDecisionContextManifest(): DecisionContextManifest {
  const contexts = DECISION_CONTEXT_CATALOG;
  const catalogComplete = contexts.length >= 6;

  return {
    version: V74_DECISION_VERSION,
    entryCount: contexts.length,
    catalogComplete,
    contexts,
    summary: [
      `decision-contexts count=${contexts.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDecisionConstraintManifest(): DecisionConstraintManifest {
  const constraints = DECISION_CONSTRAINT_CATALOG;
  const catalogComplete = constraints.length >= 6;

  return {
    version: V74_DECISION_VERSION,
    entryCount: constraints.length,
    catalogComplete,
    constraints,
    summary: [
      `decision-constraints count=${constraints.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDecisionPolicyManifest(): DecisionPolicyManifest {
  const policies = DECISION_POLICY_CATALOG;
  const catalogComplete = policies.length >= 6;

  return {
    version: V74_DECISION_VERSION,
    entryCount: policies.length,
    catalogComplete,
    policies,
    summary: [
      `decision-policies count=${policies.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDecisionSourceManifest(): DecisionSourceManifest {
  const sources = DECISION_SOURCE_CATALOG;
  const catalogComplete = sources.length >= 6;

  return {
    version: V74_DECISION_VERSION,
    entryCount: sources.length,
    catalogComplete,
    sources,
    summary: [
      `decision-sources count=${sources.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildDecisionInventoryManifest(): DecisionInventoryManifest {
  const inputs = buildDecisionInputManifest();
  const outputs = buildDecisionOutputManifest();
  const contexts = buildDecisionContextManifest();
  const constraints = buildDecisionConstraintManifest();
  const policies = buildDecisionPolicyManifest();
  const sources = buildDecisionSourceManifest();

  const inventoryComplete =
    inputs.catalogComplete &&
    outputs.catalogComplete &&
    contexts.catalogComplete &&
    constraints.catalogComplete &&
    policies.catalogComplete &&
    sources.catalogComplete &&
    isDecisionInventoryRefsAligned() &&
    isDecisionUpstreamAligned() &&
    isDecisionScopeCoverageComplete();

  return {
    version: V74_DECISION_VERSION,
    inputs,
    outputs,
    contexts,
    constraints,
    policies,
    sources,
    inventoryComplete,
    summary: [
      `decision-inventory complete=${inventoryComplete}`,
      `inputs=${inputs.entryCount}`,
      `outputs=${outputs.entryCount}`,
      `contexts=${contexts.entryCount}`,
      `constraints=${constraints.entryCount}`,
      `policies=${policies.entryCount}`,
      `sources=${sources.entryCount}`,
    ].join(" "),
  };
}

const DEFAULT_SIGNALS: DecisionInventorySignals = {
  inventoryComplete: true,
  upstreamAligned: true,
  scopeCoverageComplete: true,
  freezeVersionDeclared: true,
};

export function buildDecisionInventory(input?: {
  deploymentId?: string;
  signals?: DecisionInventorySignals;
}): DecisionInventoryReport {
  const deploymentId = input?.deploymentId ?? "v74-decision-inventory-default";
  const manifest = buildDecisionInventoryManifest();
  const upstreamAligned = isDecisionUpstreamAligned();
  const scopeCoverageComplete = isDecisionScopeCoverageComplete();

  const signals: DecisionInventorySignals = {
    ...DEFAULT_SIGNALS,
    inventoryComplete: manifest.inventoryComplete,
    upstreamAligned,
    scopeCoverageComplete,
    freezeVersionDeclared: V74_DECISION_FREEZE_VERSION.length > 0,
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
    version: V74_DECISION_VERSION,
    freezeVersion: V74_DECISION_FREEZE_VERSION,
    reportId: `decision-inventory-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamKnowledgeFreeze: "v73-knowledge-freeze-1",
    upstreamKnowledgeSignoff: "v73-knowledge-signoff-1",
    manifest,
    inventoryReady,
    readinessScore: inventoryReady ? 100 : 0,
    summary: [
      `decision-inventory ready=${inventoryReady}`,
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

export function assertDecisionInventoryPass(
  report: DecisionInventoryReport,
): asserts report is DecisionInventoryReport & { inventoryReady: true } {
  if (!report.inventoryReady) {
    throw new Error(`V74 decision inventory not ready: ${report.summary}`);
  }
}

export function getDecisionInputById(id: string): DecisionInput | undefined {
  return DECISION_INPUT_CATALOG.find((i) => i.id === id);
}

export function getDecisionOutputById(id: string): DecisionOutput | undefined {
  return DECISION_OUTPUT_CATALOG.find((o) => o.id === id);
}

export function getDecisionSourceById(id: string): DecisionSource | undefined {
  return DECISION_SOURCE_CATALOG.find((s) => s.id === id);
}

export function getDecisionPolicyById(id: string): DecisionPolicy | undefined {
  return DECISION_POLICY_CATALOG.find((p) => p.id === id);
}
