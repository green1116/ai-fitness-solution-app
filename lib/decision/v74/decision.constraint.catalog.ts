/**
 * V74 P4 — Decision constraint catalog (declarative)
 */
import { CONTEXT_CATALOG_ENTRIES } from "./decision.context.catalog";
import { DECISION_CONSTRAINT_CATALOG } from "./decision.inventory";
import { POLICY_CATALOG_ENTRIES } from "./decision.policy.catalog";
import type {
  ConstraintCatalogEntry,
  ConstraintCatalogManifest,
  ConstraintTypeKind,
  ConstraintValidation,
  ConstraintValidationManifest,
} from "./decision.constraint";
import { V74_DECISION_CONSTRAINT_VERSION } from "./decision.constraint";

const REQUIRED_TYPES: ConstraintTypeKind[] = [
  "hardRule",
  "softRule",
  "priority",
  "conflict",
  "dependency",
  "limit",
  "precondition",
  "postcondition",
];

export const CONSTRAINT_CATALOG_ENTRIES: ConstraintCatalogEntry[] = [
  {
    id: "DEC-CON-001",
    type: "hardRule",
    purpose: "Enforce declarative-only boundary with no runtime mutation",
    level: "critical",
    trigger: "decision-evaluation-start",
    condition: "no-runtime-side-effects",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "DEC-CNV-001",
    inventoryConstraintRef: "DEC-CST-001",
    contextRef: "DEC-CTX-005",
    policyRef: "DEC-PLC-001",
    required: true,
    description: "HardRule — no runtime mutation constraint",
  },
  {
    id: "DEC-CON-002",
    type: "softRule",
    purpose: "Recommend business alignment without hard block",
    level: "L2",
    trigger: "business-objective-check",
    condition: "objective-alignment-uncertain",
    resolution: "warn-and-continue",
    priority: "medium",
    validation: "DEC-CNV-002",
    inventoryConstraintRef: "DEC-CST-002",
    contextRef: "DEC-CTX-002",
    policyRef: "DEC-PLC-002",
    required: true,
    description: "SoftRule — business alignment advisory constraint",
  },
  {
    id: "DEC-CON-003",
    type: "priority",
    purpose: "Rank governance risk decisions by declared priority",
    level: "L2",
    trigger: "priority-ranking-required",
    condition: "multiple-candidates-ranked",
    resolution: "select-highest-priority",
    priority: "high",
    validation: "DEC-CNV-003",
    inventoryConstraintRef: "DEC-CST-006",
    contextRef: "DEC-CTX-003",
    policyRef: "DEC-PLC-005",
    required: true,
    description: "Priority — governance risk ranking constraint",
  },
  {
    id: "DEC-CON-004",
    type: "conflict",
    purpose: "Detect and resolve conflicting decision outputs",
    level: "L1",
    trigger: "output-conflict-detected",
    condition: "mutually-exclusive-outputs",
    resolution: "escalate-to-governance",
    priority: "high",
    validation: "DEC-CNV-004",
    inventoryConstraintRef: "DEC-CST-004",
    contextRef: "DEC-CTX-003",
    policyRef: "DEC-PLC-004",
    required: true,
    description: "Conflict — policy gate conflict resolution constraint",
  },
  {
    id: "DEC-CON-005",
    type: "dependency",
    purpose: "Require acyclic knowledge dependency before decision",
    level: "L1",
    trigger: "dependency-graph-evaluated",
    condition: "acyclic-graph-required",
    resolution: "reject-cycle",
    priority: "critical",
    validation: "DEC-CNV-005",
    inventoryConstraintRef: "DEC-CST-003",
    contextRef: "DEC-CTX-004",
    policyRef: "DEC-PLC-003",
    required: true,
    description: "Dependency — acyclic knowledge graph constraint",
  },
  {
    id: "DEC-CON-006",
    type: "limit",
    purpose: "Bound evaluation cost within declared limits",
    level: "L3",
    trigger: "cost-threshold-check",
    condition: "cost-within-budget",
    resolution: "audit-and-truncate",
    priority: "medium",
    validation: "DEC-CNV-006",
    inventoryConstraintRef: "DEC-CST-005",
    contextRef: "DEC-CTX-004",
    policyRef: "DEC-PLC-004",
    required: true,
    description: "Limit — compatibility evaluation cost bound",
  },
  {
    id: "DEC-CON-007",
    type: "precondition",
    purpose: "Require compliance checklist pass before proceeding",
    level: "L1",
    trigger: "pre-decision-gate",
    condition: "compliance-checklist-complete",
    resolution: "block-until-pass",
    priority: "high",
    validation: "DEC-CNV-007",
    inventoryConstraintRef: "DEC-CST-007",
    contextRef: "DEC-CTX-008",
    policyRef: "DEC-PLC-008",
    required: true,
    description: "Precondition — compliance checklist gate constraint",
  },
  {
    id: "DEC-CON-008",
    type: "postcondition",
    purpose: "Verify inventory catalog completeness after evaluation",
    level: "L2",
    trigger: "post-decision-verify",
    condition: "inventory-catalog-complete",
    resolution: "record-audit-trail",
    priority: "high",
    validation: "DEC-CNV-008",
    inventoryConstraintRef: "DEC-CST-008",
    contextRef: "DEC-CTX-001",
    policyRef: "DEC-PLC-008",
    required: true,
    description: "Postcondition — inventory completeness verification constraint",
  },
];

export const CONSTRAINT_VALIDATION_CATALOG: ConstraintValidation[] = [
  {
    id: "DEC-CNV-001",
    constraintRef: "DEC-CON-001",
    validationKind: "hard-rule",
    passCondition: "declarative-only-confirmed",
    required: true,
    description: "HardRule validation — no runtime mutation",
  },
  {
    id: "DEC-CNV-002",
    constraintRef: "DEC-CON-002",
    validationKind: "soft-rule",
    passCondition: "advisory-logged",
    required: true,
    description: "SoftRule validation — advisory logged",
  },
  {
    id: "DEC-CNV-003",
    constraintRef: "DEC-CON-003",
    validationKind: "priority",
    passCondition: "priority-ranking-applied",
    required: true,
    description: "Priority validation — ranking applied",
  },
  {
    id: "DEC-CNV-004",
    constraintRef: "DEC-CON-004",
    validationKind: "conflict",
    passCondition: "conflict-resolved-or-escalated",
    required: true,
    description: "Conflict validation — resolved or escalated",
  },
  {
    id: "DEC-CNV-005",
    constraintRef: "DEC-CON-005",
    validationKind: "dependency",
    passCondition: "acyclic-graph-verified",
    required: true,
    description: "Dependency validation — acyclic graph",
  },
  {
    id: "DEC-CNV-006",
    constraintRef: "DEC-CON-006",
    validationKind: "limit",
    passCondition: "cost-within-bounds",
    required: true,
    description: "Limit validation — cost within bounds",
  },
  {
    id: "DEC-CNV-007",
    constraintRef: "DEC-CON-007",
    validationKind: "precondition",
    passCondition: "precondition-met",
    required: true,
    description: "Precondition validation — gate passed",
  },
  {
    id: "DEC-CNV-008",
    constraintRef: "DEC-CON-008",
    validationKind: "postcondition",
    passCondition: "postcondition-verified",
    required: true,
    description: "Postcondition validation — catalog complete",
  },
];

export function isDecisionConstraintCatalogRefsAligned(): boolean {
  const inventoryConstraintIds = new Set(DECISION_CONSTRAINT_CATALOG.map((c) => c.id));
  const contextIds = new Set(CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const policyIds = new Set(POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const validationIds = new Set(CONSTRAINT_VALIDATION_CATALOG.map((v) => v.id));
  const constraintIds = new Set(CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const types = new Set(CONSTRAINT_CATALOG_ENTRIES.map((c) => c.type));

  const constraintsAligned = CONSTRAINT_CATALOG_ENTRIES.every(
    (c) =>
      inventoryConstraintIds.has(c.inventoryConstraintRef) &&
      contextIds.has(c.contextRef) &&
      policyIds.has(c.policyRef) &&
      validationIds.has(c.validation),
  );

  const validationsAligned = CONSTRAINT_VALIDATION_CATALOG.every((v) =>
    constraintIds.has(v.constraintRef),
  );

  const typesComplete = REQUIRED_TYPES.every((t) => types.has(t));

  return (
    constraintsAligned &&
    validationsAligned &&
    typesComplete &&
    CONSTRAINT_CATALOG_ENTRIES.length === 8
  );
}

export function buildConstraintCatalogManifest(): ConstraintCatalogManifest {
  const constraints = CONSTRAINT_CATALOG_ENTRIES;
  const types = new Set(constraints.map((c) => c.type));
  const catalogComplete =
    constraints.length === 8 && REQUIRED_TYPES.every((t) => types.has(t));

  return {
    version: V74_DECISION_CONSTRAINT_VERSION,
    entryCount: constraints.length,
    typeCount: types.size,
    catalogComplete,
    constraints,
    summary: [
      `decision-constraint-catalog count=${constraints.length}`,
      `types=${types.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildConstraintValidationManifest(): ConstraintValidationManifest {
  const validations = CONSTRAINT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V74_DECISION_CONSTRAINT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `decision-constraint-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getConstraintCatalogEntryById(id: string): ConstraintCatalogEntry | undefined {
  return CONSTRAINT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getConstraintCatalogEntriesByType(
  type: ConstraintTypeKind,
): ConstraintCatalogEntry[] {
  return CONSTRAINT_CATALOG_ENTRIES.filter((c) => c.type === type);
}

export function getConstraintValidationByConstraintRef(
  constraintRef: string,
): ConstraintValidation | undefined {
  return CONSTRAINT_VALIDATION_CATALOG.find((v) => v.constraintRef === constraintRef);
}

export function computeDeclarativeConstraintBlock(input: {
  type: ConstraintTypeKind;
  level: ConstraintCatalogEntry["level"];
}): boolean {
  return input.type === "hardRule" && input.level === "critical";
}
