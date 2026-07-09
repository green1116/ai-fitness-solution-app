/**
 * V75 P4 — Agent constraint catalog (declarative)
 */
import { AGENT_CONTEXT_CATALOG_ENTRIES } from "./agent.context.catalog";
import { AGENT_CONSTRAINT_CATALOG } from "./agent.inventory";
import { AGENT_POLICY_CATALOG_ENTRIES } from "./agent.policy.catalog";
import { AGENT_SCOPE_CATALOG } from "./agent.scope";
import type {
  AgentConstraintCatalogEntry,
  AgentConstraintCatalogManifest,
  AgentConstraintTypeKind,
  AgentConstraintValidation,
  AgentConstraintValidationManifest,
} from "./agent.constraint";
import { V75_AGENT_CONSTRAINT_VERSION } from "./agent.constraint";

const REQUIRED_TYPES: AgentConstraintTypeKind[] = [
  "hardRule",
  "softRule",
  "priority",
  "conflict",
  "dependency",
  "limit",
  "precondition",
  "postcondition",
];

export const AGENT_CONSTRAINT_CATALOG_ENTRIES: AgentConstraintCatalogEntry[] = [
  {
    id: "AGT-CON-001",
    type: "hardRule",
    purpose: "Enforce declarative-only boundary with no runtime execution",
    scopeRef: "AGT-SCP-008",
    level: "critical",
    trigger: "orchestration-eval-start",
    condition: "no-runtime-execution",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "AGT-CNV-001",
    inventoryConstraintRef: "AGT-CST-001",
    contextRef: "AGT-CTX-005",
    policyRef: "AGT-PLC-001",
    required: true,
    description: "HardRule — no runtime execution constraint",
  },
  {
    id: "AGT-CON-002",
    type: "softRule",
    purpose: "Recommend business alignment without hard block",
    scopeRef: "AGT-SCP-002",
    level: "L2",
    trigger: "business-objective-check",
    condition: "objective-alignment-uncertain",
    resolution: "warn-and-continue",
    priority: "medium",
    validation: "AGT-CNV-002",
    inventoryConstraintRef: "AGT-CST-002",
    contextRef: "AGT-CTX-002",
    policyRef: "AGT-PLC-002",
    required: true,
    description: "SoftRule — business alignment advisory constraint",
  },
  {
    id: "AGT-CON-003",
    type: "priority",
    purpose: "Rank compliance readiness by declared priority",
    scopeRef: "AGT-SCP-006",
    level: "L2",
    trigger: "priority-ranking-required",
    condition: "multiple-candidates-ranked",
    resolution: "select-highest-priority",
    priority: "high",
    validation: "AGT-CNV-003",
    inventoryConstraintRef: "AGT-CST-006",
    contextRef: "AGT-CTX-003",
    policyRef: "AGT-PLC-005",
    required: true,
    description: "Priority — compliance readiness ranking constraint",
  },
  {
    id: "AGT-CON-004",
    type: "conflict",
    purpose: "Detect and resolve conflicting agent outputs",
    scopeRef: "AGT-SCP-006",
    level: "L1",
    trigger: "output-conflict-detected",
    condition: "mutually-exclusive-outputs",
    resolution: "escalate-to-governance",
    priority: "high",
    validation: "AGT-CNV-004",
    inventoryConstraintRef: "AGT-CST-004",
    contextRef: "AGT-CTX-003",
    policyRef: "AGT-PLC-004",
    required: true,
    description: "Conflict — policy gate conflict resolution constraint",
  },
  {
    id: "AGT-CON-005",
    type: "dependency",
    purpose: "Require acyclic agent dependency before orchestration",
    scopeRef: "AGT-SCP-003",
    level: "L1",
    trigger: "dependency-graph-evaluated",
    condition: "acyclic-graph-required",
    resolution: "reject-cycle",
    priority: "critical",
    validation: "AGT-CNV-005",
    inventoryConstraintRef: "AGT-CST-003",
    contextRef: "AGT-CTX-004",
    policyRef: "AGT-PLC-003",
    required: true,
    description: "Dependency — acyclic orchestration graph constraint",
  },
  {
    id: "AGT-CON-006",
    type: "limit",
    purpose: "Bound orchestration cost within declared limits",
    scopeRef: "AGT-SCP-003",
    level: "L3",
    trigger: "cost-threshold-check",
    condition: "cost-within-budget",
    resolution: "audit-and-truncate",
    priority: "medium",
    validation: "AGT-CNV-006",
    inventoryConstraintRef: "AGT-CST-005",
    contextRef: "AGT-CTX-004",
    policyRef: "AGT-PLC-004",
    required: true,
    description: "Limit — context integrity evaluation cost bound",
  },
  {
    id: "AGT-CON-007",
    type: "precondition",
    purpose: "Require evaluation pass before proceeding",
    scopeRef: "AGT-SCP-006",
    level: "L1",
    trigger: "pre-orchestration-gate",
    condition: "evaluation-checklist-complete",
    resolution: "block-until-pass",
    priority: "high",
    validation: "AGT-CNV-007",
    inventoryConstraintRef: "AGT-CST-007",
    contextRef: "AGT-CTX-008",
    policyRef: "AGT-PLC-008",
    required: true,
    description: "Precondition — evaluation checklist gate constraint",
  },
  {
    id: "AGT-CON-008",
    type: "postcondition",
    purpose: "Verify inventory catalog completeness after orchestration",
    scopeRef: "AGT-SCP-001",
    level: "L2",
    trigger: "post-orchestration-verify",
    condition: "inventory-catalog-complete",
    resolution: "record-audit-trail",
    priority: "high",
    validation: "AGT-CNV-008",
    inventoryConstraintRef: "AGT-CST-008",
    contextRef: "AGT-CTX-001",
    policyRef: "AGT-PLC-008",
    required: true,
    description: "Postcondition — inventory completeness verification constraint",
  },
];

export const AGENT_CONSTRAINT_VALIDATION_CATALOG: AgentConstraintValidation[] = [
  {
    id: "AGT-CNV-001",
    constraintRef: "AGT-CON-001",
    validationKind: "hard-rule",
    passCondition: "declarative-only-confirmed",
    required: true,
    description: "HardRule validation — no runtime execution",
  },
  {
    id: "AGT-CNV-002",
    constraintRef: "AGT-CON-002",
    validationKind: "soft-rule",
    passCondition: "advisory-logged",
    required: true,
    description: "SoftRule validation — advisory logged",
  },
  {
    id: "AGT-CNV-003",
    constraintRef: "AGT-CON-003",
    validationKind: "priority",
    passCondition: "priority-ranking-applied",
    required: true,
    description: "Priority validation — ranking applied",
  },
  {
    id: "AGT-CNV-004",
    constraintRef: "AGT-CON-004",
    validationKind: "conflict",
    passCondition: "conflict-resolved-or-escalated",
    required: true,
    description: "Conflict validation — resolved or escalated",
  },
  {
    id: "AGT-CNV-005",
    constraintRef: "AGT-CON-005",
    validationKind: "dependency",
    passCondition: "acyclic-graph-verified",
    required: true,
    description: "Dependency validation — acyclic graph",
  },
  {
    id: "AGT-CNV-006",
    constraintRef: "AGT-CON-006",
    validationKind: "limit",
    passCondition: "cost-within-bounds",
    required: true,
    description: "Limit validation — cost within bounds",
  },
  {
    id: "AGT-CNV-007",
    constraintRef: "AGT-CON-007",
    validationKind: "precondition",
    passCondition: "precondition-met",
    required: true,
    description: "Precondition validation — gate passed",
  },
  {
    id: "AGT-CNV-008",
    constraintRef: "AGT-CON-008",
    validationKind: "postcondition",
    passCondition: "postcondition-verified",
    required: true,
    description: "Postcondition validation — catalog complete",
  },
];

export function isAgentConstraintCatalogRefsAligned(): boolean {
  const inventoryConstraintIds = new Set(AGENT_CONSTRAINT_CATALOG.map((c) => c.id));
  const contextIds = new Set(AGENT_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const policyIds = new Set(AGENT_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const scopeIds = new Set(AGENT_SCOPE_CATALOG.map((s) => s.id));
  const validationIds = new Set(AGENT_CONSTRAINT_VALIDATION_CATALOG.map((v) => v.id));
  const constraintIds = new Set(AGENT_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const types = new Set(AGENT_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.type));

  const constraintsAligned = AGENT_CONSTRAINT_CATALOG_ENTRIES.every(
    (c) =>
      inventoryConstraintIds.has(c.inventoryConstraintRef) &&
      contextIds.has(c.contextRef) &&
      policyIds.has(c.policyRef) &&
      scopeIds.has(c.scopeRef) &&
      validationIds.has(c.validation),
  );

  const validationsAligned = AGENT_CONSTRAINT_VALIDATION_CATALOG.every((v) =>
    constraintIds.has(v.constraintRef),
  );

  const typesComplete = REQUIRED_TYPES.every((t) => types.has(t));

  return (
    constraintsAligned &&
    validationsAligned &&
    typesComplete &&
    AGENT_CONSTRAINT_CATALOG_ENTRIES.length === 8
  );
}

export function buildAgentConstraintCatalogManifest(): AgentConstraintCatalogManifest {
  const constraints = AGENT_CONSTRAINT_CATALOG_ENTRIES;
  const types = new Set(constraints.map((c) => c.type));
  const catalogComplete =
    constraints.length === 8 && REQUIRED_TYPES.every((t) => types.has(t));

  return {
    version: V75_AGENT_CONSTRAINT_VERSION,
    entryCount: constraints.length,
    typeCount: types.size,
    catalogComplete,
    constraints,
    summary: [
      `agent-constraint-catalog count=${constraints.length}`,
      `types=${types.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentConstraintValidationManifest(): AgentConstraintValidationManifest {
  const validations = AGENT_CONSTRAINT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V75_AGENT_CONSTRAINT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `agent-constraint-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAgentConstraintCatalogEntryById(
  id: string,
): AgentConstraintCatalogEntry | undefined {
  return AGENT_CONSTRAINT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getAgentConstraintCatalogEntriesByType(
  type: AgentConstraintTypeKind,
): AgentConstraintCatalogEntry[] {
  return AGENT_CONSTRAINT_CATALOG_ENTRIES.filter((c) => c.type === type);
}

export function getAgentConstraintValidationByConstraintRef(
  constraintRef: string,
): AgentConstraintValidation | undefined {
  return AGENT_CONSTRAINT_VALIDATION_CATALOG.find((v) => v.constraintRef === constraintRef);
}

export function computeAgentDeclarativeConstraintBlock(input: {
  type: AgentConstraintTypeKind;
  level: AgentConstraintCatalogEntry["level"];
}): boolean {
  return input.type === "hardRule" && input.level === "critical";
}
