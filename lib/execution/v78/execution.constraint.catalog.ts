/**
 * V78 P4 — Execution constraint catalog (declarative)
 */
import { EXECUTION_CONTEXT_CATALOG_ENTRIES } from "./execution.context.catalog";
import { EXECUTION_GOVERNANCE_CATALOG } from "./execution.inventory";
import { EXECUTION_POLICY_CATALOG_ENTRIES } from "./execution.policy.catalog";
import { EXECUTION_SCOPE_CATALOG } from "./execution.scope";
import type {
  ExecutionConstraintCatalogEntry,
  ExecutionConstraintCatalogManifest,
  ExecutionConstraintKind,
  ExecutionConstraintValidation,
  ExecutionConstraintValidationManifest,
} from "./execution.constraint";
import { V78_EXECUTION_CONSTRAINT_VERSION } from "./execution.constraint";

const REQUIRED_KINDS: ExecutionConstraintKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const EXECUTION_CONSTRAINT_CATALOG_ENTRIES: ExecutionConstraintCatalogEntry[] = [
  {
    id: "EXE-CON-001",
    kind: "shared",
    purpose: "Require V77 planning freeze intact for shared execution baseline",
    scopeRef: "EXE-SCP-001",
    level: "L1",
    trigger: "execution-eval-start",
    condition: "upstream-planning-freeze-intact",
    resolution: "block-until-pass",
    priority: "high",
    validation: "EXE-CNV-001",
    inventoryGovernanceRef: "EXE-GOV-001",
    contextRef: "EXE-CTX-001",
    policyRef: "EXE-PLC-002",
    required: true,
    description: "Shared constraint — planning freeze baseline",
  },
  {
    id: "EXE-CON-002",
    kind: "role",
    purpose: "Require execution role assignment completeness",
    scopeRef: "EXE-SCP-003",
    level: "L1",
    trigger: "role-assignment-check",
    condition: "execution-role-defined",
    resolution: "block-until-pass",
    priority: "high",
    validation: "EXE-CNV-002",
    inventoryGovernanceRef: "EXE-GOV-002",
    contextRef: "EXE-CTX-002",
    policyRef: "EXE-PLC-002",
    required: true,
    description: "Role constraint — role assignment required",
  },
  {
    id: "EXE-CON-003",
    kind: "topology",
    purpose: "Require acyclic execution topology graph",
    scopeRef: "EXE-SCP-003",
    level: "L1",
    trigger: "topology-graph-evaluated",
    condition: "acyclic-topology-required",
    resolution: "reject-cycle",
    priority: "critical",
    validation: "EXE-CNV-003",
    inventoryGovernanceRef: "EXE-GOV-002",
    contextRef: "EXE-CTX-003",
    policyRef: "EXE-PLC-003",
    required: true,
    description: "Topology constraint — acyclic graph required",
  },
  {
    id: "EXE-CON-004",
    kind: "scope",
    purpose: "Require execution scope boundary completeness",
    scopeRef: "EXE-SCP-006",
    level: "L1",
    trigger: "scope-boundary-check",
    condition: "execution-scope-bounded",
    resolution: "escalate-to-governance",
    priority: "high",
    validation: "EXE-CNV-004",
    inventoryGovernanceRef: "EXE-GOV-005",
    contextRef: "EXE-CTX-004",
    policyRef: "EXE-PLC-004",
    required: true,
    description: "Scope constraint — boundary completeness",
  },
  {
    id: "EXE-CON-005",
    kind: "dependency",
    purpose: "Require upstream dependency locks intact",
    scopeRef: "EXE-SCP-007",
    level: "L1",
    trigger: "dependency-lock-check",
    condition: "upstream-dependency-intact",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "EXE-CNV-005",
    inventoryGovernanceRef: "EXE-GOV-004",
    contextRef: "EXE-CTX-005",
    policyRef: "EXE-PLC-005",
    required: true,
    description: "Dependency constraint — upstream locks required",
  },
  {
    id: "EXE-CON-006",
    kind: "governance",
    purpose: "Require execution governance rules documented",
    scopeRef: "EXE-SCP-006",
    level: "L1",
    trigger: "governance-rules-gate",
    condition: "governance-rules-documented",
    resolution: "block-until-pass",
    priority: "high",
    validation: "EXE-CNV-006",
    inventoryGovernanceRef: "EXE-GOV-007",
    contextRef: "EXE-CTX-006",
    policyRef: "EXE-PLC-006",
    required: true,
    description: "Governance constraint — rules documented",
  },
  {
    id: "EXE-CON-007",
    kind: "workspace",
    purpose: "Verify execution inventory catalog completeness",
    scopeRef: "EXE-SCP-008",
    level: "L2",
    trigger: "post-catalog-verify",
    condition: "inventory-catalog-complete",
    resolution: "record-audit-trail",
    priority: "high",
    validation: "EXE-CNV-007",
    inventoryGovernanceRef: "EXE-GOV-003",
    contextRef: "EXE-CTX-007",
    policyRef: "EXE-PLC-007",
    required: true,
    description: "Workspace constraint — inventory catalog complete",
  },
  {
    id: "EXE-CON-008",
    kind: "boundary",
    purpose: "Enforce declarative-only boundary with no runtime execution",
    scopeRef: "EXE-SCP-008",
    level: "critical",
    trigger: "execution-boundary-eval",
    condition: "no-runtime-execution",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "EXE-CNV-008",
    inventoryGovernanceRef: "EXE-GOV-008",
    contextRef: "EXE-CTX-008",
    policyRef: "EXE-PLC-001",
    required: true,
    description: "Boundary constraint — no runtime execution",
  },
];

export const EXECUTION_CONSTRAINT_VALIDATION_CATALOG: ExecutionConstraintValidation[] = [
  {
    id: "EXE-CNV-001",
    constraintRef: "EXE-CON-001",
    validationKind: "shared",
    passCondition: "upstream-freeze-intact",
    required: true,
    description: "Shared constraint validation — planning freeze intact",
  },
  {
    id: "EXE-CNV-002",
    constraintRef: "EXE-CON-002",
    validationKind: "role",
    passCondition: "role-assignment-verified",
    required: true,
    description: "Role constraint validation — assignment verified",
  },
  {
    id: "EXE-CNV-003",
    constraintRef: "EXE-CON-003",
    validationKind: "topology",
    passCondition: "acyclic-graph-verified",
    required: true,
    description: "Topology constraint validation — acyclic graph",
  },
  {
    id: "EXE-CNV-004",
    constraintRef: "EXE-CON-004",
    validationKind: "scope",
    passCondition: "scope-boundary-intact",
    required: true,
    description: "Scope constraint validation — boundary intact",
  },
  {
    id: "EXE-CNV-005",
    constraintRef: "EXE-CON-005",
    validationKind: "dependency",
    passCondition: "dependency-lock-intact",
    required: true,
    description: "Dependency constraint validation — locks intact",
  },
  {
    id: "EXE-CNV-006",
    constraintRef: "EXE-CON-006",
    validationKind: "governance",
    passCondition: "governance-rules-documented",
    required: true,
    description: "Governance constraint validation — rules documented",
  },
  {
    id: "EXE-CNV-007",
    constraintRef: "EXE-CON-007",
    validationKind: "workspace",
    passCondition: "inventory-catalog-complete",
    required: true,
    description: "Workspace constraint validation — catalog complete",
  },
  {
    id: "EXE-CNV-008",
    constraintRef: "EXE-CON-008",
    validationKind: "boundary",
    passCondition: "declarative-only-confirmed",
    required: true,
    description: "Boundary constraint validation — no runtime execution",
  },
];

export function isExecutionConstraintCatalogRefsAligned(): boolean {
  const inventoryGovernanceIds = new Set(EXECUTION_GOVERNANCE_CATALOG.map((g) => g.id));
  const contextIds = new Set(EXECUTION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const policyIds = new Set(EXECUTION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const scopeIds = new Set(EXECUTION_SCOPE_CATALOG.map((s) => s.id));
  const validationIds = new Set(EXECUTION_CONSTRAINT_VALIDATION_CATALOG.map((v) => v.id));
  const constraintIds = new Set(EXECUTION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(EXECUTION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.kind));

  const constraintsAligned = EXECUTION_CONSTRAINT_CATALOG_ENTRIES.every(
    (c) =>
      inventoryGovernanceIds.has(c.inventoryGovernanceRef) &&
      contextIds.has(c.contextRef) &&
      policyIds.has(c.policyRef) &&
      scopeIds.has(c.scopeRef) &&
      validationIds.has(c.validation),
  );

  const validationsAligned = EXECUTION_CONSTRAINT_VALIDATION_CATALOG.every((v) =>
    constraintIds.has(v.constraintRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    constraintsAligned &&
    validationsAligned &&
    kindsComplete &&
    EXECUTION_CONSTRAINT_CATALOG_ENTRIES.length === 8
  );
}

export function buildExecutionConstraintCatalogManifest(): ExecutionConstraintCatalogManifest {
  const constraints = EXECUTION_CONSTRAINT_CATALOG_ENTRIES;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete =
    constraints.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V78_EXECUTION_CONSTRAINT_VERSION,
    entryCount: constraints.length,
    kindCount: kinds.size,
    catalogComplete,
    constraints,
    summary: [
      `execution-constraint-catalog count=${constraints.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionConstraintValidationManifest(): ExecutionConstraintValidationManifest {
  const validations = EXECUTION_CONSTRAINT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V78_EXECUTION_CONSTRAINT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `execution-constraint-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExecutionConstraintCatalogEntryById(
  id: string,
): ExecutionConstraintCatalogEntry | undefined {
  return EXECUTION_CONSTRAINT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getExecutionConstraintCatalogEntriesByKind(
  kind: ExecutionConstraintKind,
): ExecutionConstraintCatalogEntry[] {
  return EXECUTION_CONSTRAINT_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getExecutionConstraintValidationByConstraintRef(
  constraintRef: string,
): ExecutionConstraintValidation | undefined {
  return EXECUTION_CONSTRAINT_VALIDATION_CATALOG.find((v) => v.constraintRef === constraintRef);
}

export function computeExecutionDeclarativeConstraintBlock(input: {
  kind: ExecutionConstraintKind;
  level: ExecutionConstraintCatalogEntry["level"];
}): boolean {
  return input.kind === "boundary" && input.level === "critical";
}
