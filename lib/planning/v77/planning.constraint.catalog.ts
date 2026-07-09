/**
 * V77 P4 — Planning constraint catalog (declarative)
 */
import { PLANNING_CONTEXT_CATALOG_ENTRIES } from "./planning.context.catalog";
import { PLANNING_GOVERNANCE_CATALOG } from "./planning.inventory";
import { PLANNING_POLICY_CATALOG_ENTRIES } from "./planning.policy.catalog";
import { PLANNING_SCOPE_CATALOG } from "./planning.scope";
import type {
  PlanningConstraintCatalogEntry,
  PlanningConstraintCatalogManifest,
  PlanningConstraintKind,
  PlanningConstraintValidation,
  PlanningConstraintValidationManifest,
} from "./planning.constraint";
import { V77_PLANNING_CONSTRAINT_VERSION } from "./planning.constraint";

const REQUIRED_KINDS: PlanningConstraintKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const PLANNING_CONSTRAINT_CATALOG_ENTRIES: PlanningConstraintCatalogEntry[] = [
  {
    id: "PLN-CON-001",
    kind: "shared",
    purpose: "Require V76 collaboration freeze intact for shared planning baseline",
    scopeRef: "PLN-SCP-001",
    level: "L1",
    trigger: "planning-eval-start",
    condition: "upstream-collaboration-freeze-intact",
    resolution: "block-until-pass",
    priority: "high",
    validation: "PLN-CNV-001",
    inventoryGovernanceRef: "PLN-GOV-001",
    contextRef: "PLN-CTX-001",
    policyRef: "PLN-PLC-002",
    required: true,
    description: "Shared constraint — collaboration freeze baseline",
  },
  {
    id: "PLN-CON-002",
    kind: "role",
    purpose: "Require planning role assignment completeness",
    scopeRef: "PLN-SCP-003",
    level: "L1",
    trigger: "role-assignment-check",
    condition: "planning-role-defined",
    resolution: "block-until-pass",
    priority: "high",
    validation: "PLN-CNV-002",
    inventoryGovernanceRef: "PLN-GOV-002",
    contextRef: "PLN-CTX-002",
    policyRef: "PLN-PLC-002",
    required: true,
    description: "Role constraint — role assignment required",
  },
  {
    id: "PLN-CON-003",
    kind: "topology",
    purpose: "Require acyclic planning topology graph",
    scopeRef: "PLN-SCP-003",
    level: "L1",
    trigger: "topology-graph-evaluated",
    condition: "acyclic-topology-required",
    resolution: "reject-cycle",
    priority: "critical",
    validation: "PLN-CNV-003",
    inventoryGovernanceRef: "PLN-GOV-002",
    contextRef: "PLN-CTX-003",
    policyRef: "PLN-PLC-003",
    required: true,
    description: "Topology constraint — acyclic graph required",
  },
  {
    id: "PLN-CON-004",
    kind: "scope",
    purpose: "Require planning scope boundary completeness",
    scopeRef: "PLN-SCP-006",
    level: "L1",
    trigger: "scope-boundary-check",
    condition: "planning-scope-bounded",
    resolution: "escalate-to-governance",
    priority: "high",
    validation: "PLN-CNV-004",
    inventoryGovernanceRef: "PLN-GOV-005",
    contextRef: "PLN-CTX-004",
    policyRef: "PLN-PLC-004",
    required: true,
    description: "Scope constraint — boundary completeness",
  },
  {
    id: "PLN-CON-005",
    kind: "dependency",
    purpose: "Require upstream dependency locks intact",
    scopeRef: "PLN-SCP-007",
    level: "L1",
    trigger: "dependency-lock-check",
    condition: "upstream-dependency-intact",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "PLN-CNV-005",
    inventoryGovernanceRef: "PLN-GOV-006",
    contextRef: "PLN-CTX-005",
    policyRef: "PLN-PLC-005",
    required: true,
    description: "Dependency constraint — upstream locks required",
  },
  {
    id: "PLN-CON-006",
    kind: "governance",
    purpose: "Require planning governance rules documented",
    scopeRef: "PLN-SCP-006",
    level: "L1",
    trigger: "governance-rules-gate",
    condition: "governance-rules-documented",
    resolution: "block-until-pass",
    priority: "high",
    validation: "PLN-CNV-006",
    inventoryGovernanceRef: "PLN-GOV-007",
    contextRef: "PLN-CTX-006",
    policyRef: "PLN-PLC-006",
    required: true,
    description: "Governance constraint — rules documented",
  },
  {
    id: "PLN-CON-007",
    kind: "workspace",
    purpose: "Verify planning inventory catalog completeness",
    scopeRef: "PLN-SCP-008",
    level: "L2",
    trigger: "post-catalog-verify",
    condition: "inventory-catalog-complete",
    resolution: "record-audit-trail",
    priority: "high",
    validation: "PLN-CNV-007",
    inventoryGovernanceRef: "PLN-GOV-003",
    contextRef: "PLN-CTX-007",
    policyRef: "PLN-PLC-007",
    required: true,
    description: "Workspace constraint — inventory catalog complete",
  },
  {
    id: "PLN-CON-008",
    kind: "boundary",
    purpose: "Enforce declarative-only boundary with no runtime planning",
    scopeRef: "PLN-SCP-008",
    level: "critical",
    trigger: "planning-boundary-eval",
    condition: "no-runtime-planning",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "PLN-CNV-008",
    inventoryGovernanceRef: "PLN-GOV-008",
    contextRef: "PLN-CTX-008",
    policyRef: "PLN-PLC-001",
    required: true,
    description: "Boundary constraint — no runtime planning execution",
  },
];

export const PLANNING_CONSTRAINT_VALIDATION_CATALOG: PlanningConstraintValidation[] = [
  {
    id: "PLN-CNV-001",
    constraintRef: "PLN-CON-001",
    validationKind: "shared",
    passCondition: "upstream-freeze-intact",
    required: true,
    description: "Shared constraint validation — collaboration freeze intact",
  },
  {
    id: "PLN-CNV-002",
    constraintRef: "PLN-CON-002",
    validationKind: "role",
    passCondition: "role-assignment-verified",
    required: true,
    description: "Role constraint validation — assignment verified",
  },
  {
    id: "PLN-CNV-003",
    constraintRef: "PLN-CON-003",
    validationKind: "topology",
    passCondition: "acyclic-graph-verified",
    required: true,
    description: "Topology constraint validation — acyclic graph",
  },
  {
    id: "PLN-CNV-004",
    constraintRef: "PLN-CON-004",
    validationKind: "scope",
    passCondition: "scope-boundary-intact",
    required: true,
    description: "Scope constraint validation — boundary intact",
  },
  {
    id: "PLN-CNV-005",
    constraintRef: "PLN-CON-005",
    validationKind: "dependency",
    passCondition: "dependency-lock-intact",
    required: true,
    description: "Dependency constraint validation — locks intact",
  },
  {
    id: "PLN-CNV-006",
    constraintRef: "PLN-CON-006",
    validationKind: "governance",
    passCondition: "governance-rules-documented",
    required: true,
    description: "Governance constraint validation — rules documented",
  },
  {
    id: "PLN-CNV-007",
    constraintRef: "PLN-CON-007",
    validationKind: "workspace",
    passCondition: "inventory-catalog-complete",
    required: true,
    description: "Workspace constraint validation — catalog complete",
  },
  {
    id: "PLN-CNV-008",
    constraintRef: "PLN-CON-008",
    validationKind: "boundary",
    passCondition: "declarative-only-confirmed",
    required: true,
    description: "Boundary constraint validation — no runtime planning",
  },
];

export function isPlanningConstraintCatalogRefsAligned(): boolean {
  const inventoryGovernanceIds = new Set(PLANNING_GOVERNANCE_CATALOG.map((g) => g.id));
  const contextIds = new Set(PLANNING_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const policyIds = new Set(PLANNING_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const scopeIds = new Set(PLANNING_SCOPE_CATALOG.map((s) => s.id));
  const validationIds = new Set(PLANNING_CONSTRAINT_VALIDATION_CATALOG.map((v) => v.id));
  const constraintIds = new Set(PLANNING_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(PLANNING_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.kind));

  const constraintsAligned = PLANNING_CONSTRAINT_CATALOG_ENTRIES.every(
    (c) =>
      inventoryGovernanceIds.has(c.inventoryGovernanceRef) &&
      contextIds.has(c.contextRef) &&
      policyIds.has(c.policyRef) &&
      scopeIds.has(c.scopeRef) &&
      validationIds.has(c.validation),
  );

  const validationsAligned = PLANNING_CONSTRAINT_VALIDATION_CATALOG.every((v) =>
    constraintIds.has(v.constraintRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    constraintsAligned &&
    validationsAligned &&
    kindsComplete &&
    PLANNING_CONSTRAINT_CATALOG_ENTRIES.length === 8
  );
}

export function buildPlanningConstraintCatalogManifest(): PlanningConstraintCatalogManifest {
  const constraints = PLANNING_CONSTRAINT_CATALOG_ENTRIES;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete =
    constraints.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V77_PLANNING_CONSTRAINT_VERSION,
    entryCount: constraints.length,
    kindCount: kinds.size,
    catalogComplete,
    constraints,
    summary: [
      `planning-constraint-catalog count=${constraints.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningConstraintValidationManifest(): PlanningConstraintValidationManifest {
  const validations = PLANNING_CONSTRAINT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V77_PLANNING_CONSTRAINT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `planning-constraint-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPlanningConstraintCatalogEntryById(
  id: string,
): PlanningConstraintCatalogEntry | undefined {
  return PLANNING_CONSTRAINT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getPlanningConstraintCatalogEntriesByKind(
  kind: PlanningConstraintKind,
): PlanningConstraintCatalogEntry[] {
  return PLANNING_CONSTRAINT_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getPlanningConstraintValidationByConstraintRef(
  constraintRef: string,
): PlanningConstraintValidation | undefined {
  return PLANNING_CONSTRAINT_VALIDATION_CATALOG.find((v) => v.constraintRef === constraintRef);
}

export function computePlanningDeclarativeConstraintBlock(input: {
  kind: PlanningConstraintKind;
  level: PlanningConstraintCatalogEntry["level"];
}): boolean {
  return input.kind === "boundary" && input.level === "critical";
}
