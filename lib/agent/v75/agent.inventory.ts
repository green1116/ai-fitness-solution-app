/**
 * V75 P1 — Agent inventory (declarative)
 */
import { isAgentUpstreamAligned } from "./agent.dependencies";
import { AGENT_SCOPE_CATALOG, isAgentScopeCoverageComplete } from "./agent.scope";
import type {
  AgentConstraint,
  AgentConstraintManifest,
  AgentContext,
  AgentContextManifest,
  AgentInput,
  AgentInputManifest,
  AgentInventoryManifest,
  AgentInventoryReport,
  AgentInventorySignals,
  AgentOutput,
  AgentOutputManifest,
  AgentPolicy,
  AgentPolicyManifest,
  AgentSource,
  AgentSourceManifest,
} from "./agent.types";
import { V75_AGENT_FREEZE_VERSION, V75_AGENT_VERSION } from "./agent.types";

export const AGENT_INPUT_CATALOG: AgentInput[] = [
  {
    id: "AGT-INP-001",
    name: "decision-freeze-signal",
    kind: "decision",
    status: "registered",
    sourceRef: "AGT-SRC-001",
    scopeRef: "AGT-SCP-001",
    required: true,
    description: "V74 decision freeze readiness signal input",
  },
  {
    id: "AGT-INP-002",
    name: "orchestration-acyclic-metric",
    kind: "metric",
    status: "registered",
    sourceRef: "AGT-SRC-002",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Agent dependency acyclic graph metric input",
  },
  {
    id: "AGT-INP-003",
    name: "policy-gate-signal",
    kind: "policy",
    status: "registered",
    sourceRef: "AGT-SRC-003",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Decision policy gate enforcement signal",
  },
  {
    id: "AGT-INP-004",
    name: "context-integrity-signal",
    kind: "signal",
    status: "registered",
    sourceRef: "AGT-SRC-004",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Decision context integrity coverage signal",
  },
  {
    id: "AGT-INP-005",
    name: "compliance-readiness-signal",
    kind: "signal",
    status: "registered",
    sourceRef: "AGT-SRC-005",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Decision compliance readiness escalation signal",
  },
  {
    id: "AGT-INP-006",
    name: "session-state-context",
    kind: "context",
    status: "registered",
    sourceRef: "AGT-SRC-006",
    scopeRef: "AGT-SCP-004",
    required: true,
    description: "Agent session state context input",
  },
  {
    id: "AGT-INP-007",
    name: "evaluation-score-metric",
    kind: "metric",
    status: "registered",
    sourceRef: "AGT-SRC-007",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Decision evaluation score pass metric",
  },
  {
    id: "AGT-INP-008",
    name: "catalog-constraint-input",
    kind: "constraint",
    status: "registered",
    sourceRef: "AGT-SRC-008",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "Agent inventory catalog completeness constraint input",
  },
];

export const AGENT_OUTPUT_CATALOG: AgentOutput[] = [
  {
    id: "AGT-OUT-001",
    name: "proceed-orchestration-recommendation",
    kind: "recommendation",
    status: "registered",
    inputRef: "AGT-INP-001",
    scopeRef: "AGT-SCP-001",
    required: true,
    description: "Recommend proceeding when decision freeze signal passes",
  },
  {
    id: "AGT-OUT-002",
    name: "block-acyclic-violation",
    kind: "flag",
    status: "registered",
    inputRef: "AGT-INP-002",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Flag agent dependency cycle violation",
  },
  {
    id: "AGT-OUT-003",
    name: "enforce-policy-gate",
    kind: "action",
    status: "registered",
    inputRef: "AGT-INP-003",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Declarative policy gate enforcement action",
  },
  {
    id: "AGT-OUT-004",
    name: "context-skip-action",
    kind: "action",
    status: "registered",
    inputRef: "AGT-INP-004",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Skip incompatible decision context pair action",
  },
  {
    id: "AGT-OUT-005",
    name: "compliance-escalation",
    kind: "escalation",
    status: "registered",
    inputRef: "AGT-INP-005",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Escalate compliance readiness threshold breach",
  },
  {
    id: "AGT-OUT-006",
    name: "session-transition-audit",
    kind: "audit",
    status: "registered",
    inputRef: "AGT-INP-006",
    scopeRef: "AGT-SCP-004",
    required: true,
    description: "Audit agent session state transition",
  },
  {
    id: "AGT-OUT-007",
    name: "evaluation-waiver-flag",
    kind: "flag",
    status: "registered",
    inputRef: "AGT-INP-007",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Flag evaluation waiver required",
  },
  {
    id: "AGT-OUT-008",
    name: "inventory-ready-handoff",
    kind: "handoff",
    status: "registered",
    inputRef: "AGT-INP-008",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "Hand off to orchestration when inventory constraints pass",
  },
];

export const AGENT_CONTEXT_CATALOG: AgentContext[] = [
  {
    id: "AGT-CTX-001",
    name: "platform-global-context",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "DEC-001",
    scopeRef: "AGT-SCP-001",
    required: true,
    description: "Platform-wide agent context from decision baseline",
  },
  {
    id: "AGT-CTX-002",
    name: "orchestration-graph-context",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "DEC-002",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Agent orchestration graph context",
  },
  {
    id: "AGT-CTX-003",
    name: "policy-enforcement-context",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "DEC-003",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Policy enforcement agent context",
  },
  {
    id: "AGT-CTX-004",
    name: "decision-context-bridge",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "DEC-004",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Decision context bridge agent context",
  },
  {
    id: "AGT-CTX-005",
    name: "compliance-audit-context",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "DEC-007",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Compliance audit agent context",
  },
  {
    id: "AGT-CTX-006",
    name: "session-management-context",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "DEC-005",
    scopeRef: "AGT-SCP-004",
    required: true,
    description: "Session management agent context",
  },
  {
    id: "AGT-CTX-007",
    name: "evaluation-bridge-context",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "DEC-006",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Evaluation bridge agent context",
  },
  {
    id: "AGT-CTX-008",
    name: "agent-inventory-context",
    status: "registered",
    deploymentId: "v75-agent-default",
    decisionRef: "AGT-001",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "V75 agent inventory foundation context",
  },
];

export const AGENT_CONSTRAINT_CATALOG: AgentConstraint[] = [
  {
    id: "AGT-CST-001",
    name: "no-runtime-execution",
    constraintKind: "boundary",
    status: "frozen",
    policyRef: "AGT-POL-001",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "Agent layer must not execute runtime orchestration",
  },
  {
    id: "AGT-CST-002",
    name: "upstream-decision-freeze-intact",
    constraintKind: "version-lock",
    status: "frozen",
    policyRef: "AGT-POL-002",
    scopeRef: "AGT-SCP-001",
    required: true,
    description: "V74 decision freeze must remain intact",
  },
  {
    id: "AGT-CST-003",
    name: "acyclic-dependency-required",
    constraintKind: "graph",
    status: "frozen",
    policyRef: "AGT-POL-003",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Agent dependency graph must be acyclic",
  },
  {
    id: "AGT-CST-004",
    name: "policy-gate-required",
    constraintKind: "governance",
    status: "frozen",
    policyRef: "AGT-POL-004",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Policy gate must pass before orchestration proceeds",
  },
  {
    id: "AGT-CST-005",
    name: "context-integrity-required",
    constraintKind: "version",
    status: "frozen",
    policyRef: "AGT-POL-005",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Decision context integrity must be complete",
  },
  {
    id: "AGT-CST-006",
    name: "compliance-readiness-bounded",
    constraintKind: "risk",
    status: "frozen",
    policyRef: "AGT-POL-006",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Compliance readiness must be within declared bounds",
  },
  {
    id: "AGT-CST-007",
    name: "evaluation-check-required",
    constraintKind: "audit",
    status: "frozen",
    policyRef: "AGT-POL-007",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Evaluation checklist must be complete",
  },
  {
    id: "AGT-CST-008",
    name: "inventory-catalog-complete",
    constraintKind: "catalog",
    status: "frozen",
    policyRef: "AGT-POL-008",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "Agent inventory catalog must be complete",
  },
];

export const AGENT_POLICY_CATALOG: AgentPolicy[] = [
  {
    id: "AGT-POL-001",
    name: "declarative-only-policy",
    policyKind: "boundary",
    status: "frozen",
    sourceRef: "AGT-SRC-008",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "All agents are declarative — no runtime orchestration",
  },
  {
    id: "AGT-POL-002",
    name: "decision-freeze-policy",
    policyKind: "upstream",
    status: "frozen",
    sourceRef: "AGT-SRC-001",
    scopeRef: "AGT-SCP-001",
    required: true,
    description: "Honor V74 decision freeze upstream lock",
  },
  {
    id: "AGT-POL-003",
    name: "dependency-acyclic-policy",
    policyKind: "graph",
    status: "frozen",
    sourceRef: "AGT-SRC-002",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Reject cyclic agent dependency paths",
  },
  {
    id: "AGT-POL-004",
    name: "policy-gate-enforcement",
    policyKind: "governance",
    status: "frozen",
    sourceRef: "AGT-SRC-003",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Enforce decision policy gates declaratively",
  },
  {
    id: "AGT-POL-005",
    name: "context-integrity-policy",
    policyKind: "version",
    status: "frozen",
    sourceRef: "AGT-SRC-004",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Skip incompatible context pairs per integrity matrix",
  },
  {
    id: "AGT-POL-006",
    name: "compliance-readiness-policy",
    policyKind: "risk",
    status: "frozen",
    sourceRef: "AGT-SRC-005",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Escalate when compliance readiness exceeds threshold",
  },
  {
    id: "AGT-POL-007",
    name: "evaluation-audit-policy",
    policyKind: "audit",
    status: "frozen",
    sourceRef: "AGT-SRC-007",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Require evaluation pass for orchestration decisions",
  },
  {
    id: "AGT-POL-008",
    name: "inventory-completeness-policy",
    policyKind: "catalog",
    status: "frozen",
    sourceRef: "AGT-SRC-008",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "Require full agent inventory before sign-off",
  },
];

export const AGENT_SOURCE_CATALOG: AgentSource[] = [
  {
    id: "AGT-SRC-001",
    name: "v74-decision-freeze",
    upstreamVersion: "v74-decision-freeze-1",
    status: "frozen",
    decisionRef: "DEC-001",
    scopeRef: "AGT-SCP-001",
    required: true,
    description: "V74 decision freeze upstream source",
  },
  {
    id: "AGT-SRC-002",
    name: "v74-decision-signoff",
    upstreamVersion: "v74-decision-signoff-1",
    status: "frozen",
    decisionRef: "DEC-008",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "V74 decision sign-off upstream source",
  },
  {
    id: "AGT-SRC-003",
    name: "v74-decision-policy",
    upstreamVersion: "v74-decision-policy-catalog-1",
    status: "frozen",
    decisionRef: "DEC-002",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "V74 decision policy catalog source",
  },
  {
    id: "AGT-SRC-004",
    name: "v74-decision-context",
    upstreamVersion: "v74-decision-context-catalog-1",
    status: "frozen",
    decisionRef: "DEC-003",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "V74 decision context catalog source",
  },
  {
    id: "AGT-SRC-005",
    name: "v74-decision-compliance",
    upstreamVersion: "v74-decision-compliance-catalog-1",
    status: "frozen",
    decisionRef: "DEC-007",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "V74 decision compliance catalog source",
  },
  {
    id: "AGT-SRC-006",
    name: "v74-decision-simulation",
    upstreamVersion: "v74-decision-simulation-catalog-1",
    status: "frozen",
    decisionRef: "DEC-006",
    scopeRef: "AGT-SCP-004",
    required: true,
    description: "V74 decision simulation catalog source",
  },
  {
    id: "AGT-SRC-007",
    name: "v74-decision-evaluation",
    upstreamVersion: "v74-decision-evaluation-catalog-1",
    status: "frozen",
    decisionRef: "DEC-005",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "V74 decision evaluation catalog source",
  },
  {
    id: "AGT-SRC-008",
    name: "v75-agent-inventory",
    upstreamVersion: "v75-agent-inventory-1",
    status: "declared",
    decisionRef: "AGT-001",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "V75 P1 agent inventory self-reference source",
  },
];

function scopeIds(): Set<string> {
  return new Set(AGENT_SCOPE_CATALOG.map((s) => s.id));
}

function sourceIds(): Set<string> {
  return new Set(AGENT_SOURCE_CATALOG.map((s) => s.id));
}

function policyIds(): Set<string> {
  return new Set(AGENT_POLICY_CATALOG.map((p) => p.id));
}

export function isAgentInventoryRefsAligned(): boolean {
  const scopes = scopeIds();
  const sources = sourceIds();
  const policies = policyIds();
  const inputIds = new Set(AGENT_INPUT_CATALOG.map((i) => i.id));

  const inputsAligned = AGENT_INPUT_CATALOG.every(
    (i) => scopes.has(i.scopeRef) && sources.has(i.sourceRef),
  );
  const outputsAligned = AGENT_OUTPUT_CATALOG.every(
    (o) => scopes.has(o.scopeRef) && inputIds.has(o.inputRef),
  );
  const contextsAligned = AGENT_CONTEXT_CATALOG.every((c) => scopes.has(c.scopeRef));
  const constraintsAligned = AGENT_CONSTRAINT_CATALOG.every(
    (c) => scopes.has(c.scopeRef) && policies.has(c.policyRef),
  );
  const policiesAligned = AGENT_POLICY_CATALOG.every(
    (p) => scopes.has(p.scopeRef) && sources.has(p.sourceRef),
  );
  const sourcesAligned = AGENT_SOURCE_CATALOG.every((s) => scopes.has(s.scopeRef));

  return (
    inputsAligned &&
    outputsAligned &&
    contextsAligned &&
    constraintsAligned &&
    policiesAligned &&
    sourcesAligned
  );
}

export function buildAgentInputManifest(): AgentInputManifest {
  const inputs = AGENT_INPUT_CATALOG;
  const kinds = new Set(inputs.map((i) => i.kind));
  const catalogComplete = inputs.length >= 6 && kinds.size >= 4;

  return {
    version: V75_AGENT_VERSION,
    entryCount: inputs.length,
    kindCount: kinds.size,
    catalogComplete,
    inputs,
    summary: [
      `agent-inputs count=${inputs.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentOutputManifest(): AgentOutputManifest {
  const outputs = AGENT_OUTPUT_CATALOG;
  const kinds = new Set(outputs.map((o) => o.kind));
  const catalogComplete = outputs.length >= 6 && kinds.size >= 4;

  return {
    version: V75_AGENT_VERSION,
    entryCount: outputs.length,
    kindCount: kinds.size,
    catalogComplete,
    outputs,
    summary: [
      `agent-outputs count=${outputs.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentContextManifest(): AgentContextManifest {
  const contexts = AGENT_CONTEXT_CATALOG;
  const catalogComplete = contexts.length >= 6;

  return {
    version: V75_AGENT_VERSION,
    entryCount: contexts.length,
    catalogComplete,
    contexts,
    summary: [
      `agent-contexts count=${contexts.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentConstraintManifest(): AgentConstraintManifest {
  const constraints = AGENT_CONSTRAINT_CATALOG;
  const catalogComplete = constraints.length >= 6;

  return {
    version: V75_AGENT_VERSION,
    entryCount: constraints.length,
    catalogComplete,
    constraints,
    summary: [
      `agent-constraints count=${constraints.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentPolicyManifest(): AgentPolicyManifest {
  const policies = AGENT_POLICY_CATALOG;
  const catalogComplete = policies.length >= 6;

  return {
    version: V75_AGENT_VERSION,
    entryCount: policies.length,
    catalogComplete,
    policies,
    summary: [
      `agent-policies count=${policies.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentSourceManifest(): AgentSourceManifest {
  const sources = AGENT_SOURCE_CATALOG;
  const catalogComplete = sources.length >= 6;

  return {
    version: V75_AGENT_VERSION,
    entryCount: sources.length,
    catalogComplete,
    sources,
    summary: [
      `agent-sources count=${sources.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentInventoryManifest(): AgentInventoryManifest {
  const inputs = buildAgentInputManifest();
  const outputs = buildAgentOutputManifest();
  const contexts = buildAgentContextManifest();
  const constraints = buildAgentConstraintManifest();
  const policies = buildAgentPolicyManifest();
  const sources = buildAgentSourceManifest();

  const inventoryComplete =
    inputs.catalogComplete &&
    outputs.catalogComplete &&
    contexts.catalogComplete &&
    constraints.catalogComplete &&
    policies.catalogComplete &&
    sources.catalogComplete &&
    isAgentInventoryRefsAligned() &&
    isAgentUpstreamAligned() &&
    isAgentScopeCoverageComplete();

  return {
    version: V75_AGENT_VERSION,
    inputs,
    outputs,
    contexts,
    constraints,
    policies,
    sources,
    inventoryComplete,
    summary: [
      `agent-inventory complete=${inventoryComplete}`,
      `inputs=${inputs.entryCount}`,
      `outputs=${outputs.entryCount}`,
      `contexts=${contexts.entryCount}`,
      `constraints=${constraints.entryCount}`,
      `policies=${policies.entryCount}`,
      `sources=${sources.entryCount}`,
    ].join(" "),
  };
}

const DEFAULT_SIGNALS: AgentInventorySignals = {
  inventoryComplete: true,
  upstreamAligned: true,
  scopeCoverageComplete: true,
  freezeVersionDeclared: true,
};

export function buildAgentInventory(input?: {
  deploymentId?: string;
  signals?: AgentInventorySignals;
}): AgentInventoryReport {
  const deploymentId = input?.deploymentId ?? "v75-agent-inventory-default";
  const manifest = buildAgentInventoryManifest();
  const upstreamAligned = isAgentUpstreamAligned();
  const scopeCoverageComplete = isAgentScopeCoverageComplete();

  const signals: AgentInventorySignals = {
    ...DEFAULT_SIGNALS,
    inventoryComplete: manifest.inventoryComplete,
    upstreamAligned,
    scopeCoverageComplete,
    freezeVersionDeclared: V75_AGENT_FREEZE_VERSION.length > 0,
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
    version: V75_AGENT_VERSION,
    freezeVersion: V75_AGENT_FREEZE_VERSION,
    reportId: `agent-inventory-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamDecisionFreeze: "v74-decision-freeze-1",
    upstreamDecisionSignoff: "v74-decision-signoff-1",
    manifest,
    inventoryReady,
    readinessScore: inventoryReady ? 100 : 0,
    summary: [
      `agent-inventory ready=${inventoryReady}`,
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

export function assertAgentInventoryPass(
  report: AgentInventoryReport,
): asserts report is AgentInventoryReport & { inventoryReady: true } {
  if (!report.inventoryReady) {
    throw new Error(`V75 agent inventory not ready: ${report.summary}`);
  }
}

export function getAgentInputById(id: string): AgentInput | undefined {
  return AGENT_INPUT_CATALOG.find((i) => i.id === id);
}

export function getAgentOutputById(id: string): AgentOutput | undefined {
  return AGENT_OUTPUT_CATALOG.find((o) => o.id === id);
}

export function getAgentSourceById(id: string): AgentSource | undefined {
  return AGENT_SOURCE_CATALOG.find((s) => s.id === id);
}

export function getAgentPolicyById(id: string): AgentPolicy | undefined {
  return AGENT_POLICY_CATALOG.find((p) => p.id === id);
}
