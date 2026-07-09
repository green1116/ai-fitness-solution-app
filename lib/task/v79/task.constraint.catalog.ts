/**
 * V79 P4 — Task constraint catalog (declarative)
 */
import { TASK_CONTEXT_CATALOG_ENTRIES } from "./task.context.catalog";
import { TASK_GOVERNANCE_CATALOG } from "./task.inventory";
import { TASK_POLICY_CATALOG_ENTRIES } from "./task.policy.catalog";
import { TASK_SCOPE_CATALOG } from "./task.scope";
import type {
  TaskConstraintCatalogEntry,
  TaskConstraintCatalogManifest,
  TaskConstraintKind,
  TaskConstraintValidation,
  TaskConstraintValidationManifest,
} from "./task.constraint";
import { V79_TASK_CONSTRAINT_VERSION } from "./task.constraint";

const REQUIRED_KINDS: TaskConstraintKind[] = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
];

export const TASK_CONSTRAINT_CATALOG_ENTRIES: TaskConstraintCatalogEntry[] = [
  {
    id: "TSK-CON-001",
    kind: "shared",
    purpose: "Require V78 execution freeze intact for shared task baseline",
    scopeRef: "TSK-SCP-001",
    level: "L1",
    trigger: "task-eval-start",
    condition: "upstream-execution-freeze-intact",
    resolution: "block-until-pass",
    priority: "high",
    validation: "TSK-CNV-001",
    inventoryGovernanceRef: "TSK-GOV-001",
    contextRef: "TSK-CTX-001",
    policyRef: "TSK-PLC-002",
    required: true,
    description: "Shared constraint — execution freeze baseline",
  },
  {
    id: "TSK-CON-002",
    kind: "role",
    purpose: "Require task role assignment completeness",
    scopeRef: "TSK-SCP-003",
    level: "L1",
    trigger: "role-assignment-check",
    condition: "task-role-defined",
    resolution: "block-until-pass",
    priority: "high",
    validation: "TSK-CNV-002",
    inventoryGovernanceRef: "TSK-GOV-002",
    contextRef: "TSK-CTX-002",
    policyRef: "TSK-PLC-002",
    required: true,
    description: "Role constraint — role assignment required",
  },
  {
    id: "TSK-CON-003",
    kind: "state",
    purpose: "Require task lifecycle state completeness",
    scopeRef: "TSK-SCP-004",
    level: "L1",
    trigger: "state-transition-check",
    condition: "task-state-documented",
    resolution: "block-until-pass",
    priority: "critical",
    validation: "TSK-CNV-003",
    inventoryGovernanceRef: "TSK-GOV-003",
    contextRef: "TSK-CTX-003",
    policyRef: "TSK-PLC-003",
    required: true,
    description: "State constraint — lifecycle states required",
  },
  {
    id: "TSK-CON-004",
    kind: "topology",
    purpose: "Require acyclic task topology graph",
    scopeRef: "TSK-SCP-003",
    level: "L1",
    trigger: "topology-graph-evaluated",
    condition: "acyclic-topology-required",
    resolution: "reject-cycle",
    priority: "critical",
    validation: "TSK-CNV-004",
    inventoryGovernanceRef: "TSK-GOV-002",
    contextRef: "TSK-CTX-004",
    policyRef: "TSK-PLC-004",
    required: true,
    description: "Topology constraint — acyclic graph required",
  },
  {
    id: "TSK-CON-005",
    kind: "scope",
    purpose: "Require task scope boundary completeness",
    scopeRef: "TSK-SCP-006",
    level: "L1",
    trigger: "scope-boundary-check",
    condition: "task-scope-bounded",
    resolution: "escalate-to-governance",
    priority: "high",
    validation: "TSK-CNV-005",
    inventoryGovernanceRef: "TSK-GOV-005",
    contextRef: "TSK-CTX-005",
    policyRef: "TSK-PLC-005",
    required: true,
    description: "Scope constraint — boundary completeness",
  },
  {
    id: "TSK-CON-006",
    kind: "dependency",
    purpose: "Require upstream dependency locks intact",
    scopeRef: "TSK-SCP-007",
    level: "L1",
    trigger: "dependency-lock-check",
    condition: "upstream-dependency-intact",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "TSK-CNV-006",
    inventoryGovernanceRef: "TSK-GOV-004",
    contextRef: "TSK-CTX-006",
    policyRef: "TSK-PLC-006",
    required: true,
    description: "Dependency constraint — upstream locks required",
  },
  {
    id: "TSK-CON-007",
    kind: "governance",
    purpose: "Require task governance rules documented",
    scopeRef: "TSK-SCP-006",
    level: "L1",
    trigger: "governance-rules-gate",
    condition: "governance-rules-documented",
    resolution: "block-until-pass",
    priority: "high",
    validation: "TSK-CNV-007",
    inventoryGovernanceRef: "TSK-GOV-007",
    contextRef: "TSK-CTX-007",
    policyRef: "TSK-PLC-007",
    required: true,
    description: "Governance constraint — rules documented",
  },
  {
    id: "TSK-CON-008",
    kind: "boundary",
    purpose: "Enforce declarative-only boundary with no runtime task engine",
    scopeRef: "TSK-SCP-008",
    level: "critical",
    trigger: "task-boundary-eval",
    condition: "no-runtime-task-engine",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "TSK-CNV-008",
    inventoryGovernanceRef: "TSK-GOV-008",
    contextRef: "TSK-CTX-008",
    policyRef: "TSK-PLC-001",
    required: true,
    description: "Boundary constraint — no runtime task engine",
  },
];

export const TASK_CONSTRAINT_VALIDATION_CATALOG: TaskConstraintValidation[] = [
  {
    id: "TSK-CNV-001",
    constraintRef: "TSK-CON-001",
    validationKind: "shared",
    passCondition: "upstream-freeze-intact",
    required: true,
    description: "Shared constraint validation — execution freeze intact",
  },
  {
    id: "TSK-CNV-002",
    constraintRef: "TSK-CON-002",
    validationKind: "role",
    passCondition: "role-assignment-verified",
    required: true,
    description: "Role constraint validation — assignment verified",
  },
  {
    id: "TSK-CNV-003",
    constraintRef: "TSK-CON-003",
    validationKind: "state",
    passCondition: "task-state-verified",
    required: true,
    description: "State constraint validation — lifecycle verified",
  },
  {
    id: "TSK-CNV-004",
    constraintRef: "TSK-CON-004",
    validationKind: "topology",
    passCondition: "acyclic-graph-verified",
    required: true,
    description: "Topology constraint validation — acyclic graph",
  },
  {
    id: "TSK-CNV-005",
    constraintRef: "TSK-CON-005",
    validationKind: "scope",
    passCondition: "scope-boundary-intact",
    required: true,
    description: "Scope constraint validation — boundary intact",
  },
  {
    id: "TSK-CNV-006",
    constraintRef: "TSK-CON-006",
    validationKind: "dependency",
    passCondition: "dependency-lock-intact",
    required: true,
    description: "Dependency constraint validation — locks intact",
  },
  {
    id: "TSK-CNV-007",
    constraintRef: "TSK-CON-007",
    validationKind: "governance",
    passCondition: "governance-rules-documented",
    required: true,
    description: "Governance constraint validation — rules documented",
  },
  {
    id: "TSK-CNV-008",
    constraintRef: "TSK-CON-008",
    validationKind: "boundary",
    passCondition: "declarative-only-confirmed",
    required: true,
    description: "Boundary constraint validation — no runtime task engine",
  },
];

export function isTaskConstraintCatalogRefsAligned(): boolean {
  const inventoryGovernanceIds = new Set(TASK_GOVERNANCE_CATALOG.map((g) => g.id));
  const contextIds = new Set(TASK_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const policyIds = new Set(TASK_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const scopeIds = new Set(TASK_SCOPE_CATALOG.map((s) => s.id));
  const validationIds = new Set(TASK_CONSTRAINT_VALIDATION_CATALOG.map((v) => v.id));
  const constraintIds = new Set(TASK_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(TASK_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.kind));

  const constraintsAligned = TASK_CONSTRAINT_CATALOG_ENTRIES.every(
    (c) =>
      inventoryGovernanceIds.has(c.inventoryGovernanceRef) &&
      contextIds.has(c.contextRef) &&
      policyIds.has(c.policyRef) &&
      scopeIds.has(c.scopeRef) &&
      validationIds.has(c.validation),
  );

  const validationsAligned = TASK_CONSTRAINT_VALIDATION_CATALOG.every((v) =>
    constraintIds.has(v.constraintRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    constraintsAligned &&
    validationsAligned &&
    kindsComplete &&
    TASK_CONSTRAINT_CATALOG_ENTRIES.length === 8
  );
}

export function buildTaskConstraintCatalogManifest(): TaskConstraintCatalogManifest {
  const constraints = TASK_CONSTRAINT_CATALOG_ENTRIES;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete =
    constraints.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_CONSTRAINT_VERSION,
    entryCount: constraints.length,
    kindCount: kinds.size,
    catalogComplete,
    constraints,
    summary: [
      `task-constraint-catalog count=${constraints.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskConstraintValidationManifest(): TaskConstraintValidationManifest {
  const validations = TASK_CONSTRAINT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V79_TASK_CONSTRAINT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `task-constraint-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskConstraintCatalogEntryById(
  id: string,
): TaskConstraintCatalogEntry | undefined {
  return TASK_CONSTRAINT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getTaskConstraintCatalogEntriesByKind(
  kind: TaskConstraintKind,
): TaskConstraintCatalogEntry[] {
  return TASK_CONSTRAINT_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getTaskConstraintValidationByConstraintRef(
  constraintRef: string,
): TaskConstraintValidation | undefined {
  return TASK_CONSTRAINT_VALIDATION_CATALOG.find((v) => v.constraintRef === constraintRef);
}

export function computeTaskDeclarativeConstraintBlock(input: {
  kind: TaskConstraintKind;
  level: TaskConstraintCatalogEntry["level"];
}): boolean {
  return input.kind === "boundary" && input.level === "critical";
}
