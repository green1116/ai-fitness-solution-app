/**
 * V77 P5 — Planning evaluation catalog (declarative)
 */
import { PLANNING_CONSTRAINT_CATALOG_ENTRIES } from "./planning.constraint.catalog";
import { PLANNING_CONTEXT_CATALOG_ENTRIES } from "./planning.context.catalog";
import { PLANNING_UPSTREAM_DEPENDENCIES } from "./planning.dependencies";
import {
  PLANNING_ROLE_CATALOG,
  PLANNING_TOPOLOGY_CATALOG,
} from "./planning.inventory";
import type {
  PlanningEvaluationCatalogEntry,
  PlanningEvaluationCatalogManifest,
  PlanningEvaluationKind,
  PlanningEvaluationValidation,
  PlanningEvaluationValidationManifest,
} from "./planning.evaluation";
import { V77_PLANNING_EVALUATION_VERSION } from "./planning.evaluation";

const REQUIRED_KINDS: PlanningEvaluationKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const PLANNING_EVALUATION_CATALOG_ENTRIES: PlanningEvaluationCatalogEntry[] = [
  {
    id: "PLN-EVAL-001",
    kind: "shared",
    purpose: "Evaluate shared planning baseline readiness",
    roleRef: "PLN-ROL-001",
    topologyRef: "PLN-TOP-001",
    dependencyRef: "PLN-DEP-001",
    metrics: ["freeze-intact-ratio", "shared-planner-coverage"],
    threshold: "freeze-intact=true",
    passRule: "upstream-collaboration-freeze-intact",
    priority: "high",
    validation: "PLN-EVL-001",
    constraintRef: "PLN-CON-001",
    contextRef: "PLN-CTX-001",
    required: true,
    description: "Shared evaluation — collaboration freeze baseline rules",
  },
  {
    id: "PLN-EVAL-002",
    kind: "role",
    purpose: "Evaluate planning role assignment completeness",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    dependencyRef: "PLN-DEP-002",
    metrics: ["role-coverage", "assignment-count"],
    threshold: "role-coverage=100",
    passRule: "planning-role-defined",
    priority: "high",
    validation: "PLN-EVL-002",
    constraintRef: "PLN-CON-002",
    contextRef: "PLN-CTX-002",
    required: true,
    description: "Role evaluation — role assignment rules",
  },
  {
    id: "PLN-EVAL-003",
    kind: "topology",
    purpose: "Evaluate planning topology acyclicity",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    dependencyRef: "PLN-DEP-003",
    metrics: ["cycle-count", "topology-depth"],
    threshold: "cycle-count=0",
    passRule: "acyclic-topology-required",
    priority: "critical",
    validation: "PLN-EVL-003",
    constraintRef: "PLN-CON-003",
    contextRef: "PLN-CTX-003",
    required: true,
    description: "Topology evaluation — acyclic graph rules",
  },
  {
    id: "PLN-EVAL-004",
    kind: "scope",
    purpose: "Evaluate planning scope boundary completeness",
    roleRef: "PLN-ROL-005",
    topologyRef: "PLN-TOP-005",
    dependencyRef: "PLN-DEP-006",
    metrics: ["scope-coverage", "boundary-violations"],
    threshold: "scope-coverage=100",
    passRule: "planning-scope-bounded",
    priority: "high",
    validation: "PLN-EVL-004",
    constraintRef: "PLN-CON-004",
    contextRef: "PLN-CTX-004",
    required: true,
    description: "Scope evaluation — boundary completeness rules",
  },
  {
    id: "PLN-EVAL-005",
    kind: "dependency",
    purpose: "Evaluate upstream dependency lock integrity",
    roleRef: "PLN-ROL-004",
    topologyRef: "PLN-TOP-004",
    dependencyRef: "PLN-DEP-005",
    metrics: ["dependency-lock-count", "upstream-drift"],
    threshold: "upstream-drift=0",
    passRule: "upstream-dependency-intact",
    priority: "critical",
    validation: "PLN-EVL-005",
    constraintRef: "PLN-CON-005",
    contextRef: "PLN-CTX-005",
    required: true,
    description: "Dependency evaluation — upstream lock rules",
  },
  {
    id: "PLN-EVAL-006",
    kind: "governance",
    purpose: "Evaluate planning governance rules completeness",
    roleRef: "PLN-ROL-007",
    topologyRef: "PLN-TOP-007",
    dependencyRef: "PLN-DEP-004",
    metrics: ["governance-rules-count", "checklist-complete"],
    threshold: "checklist-complete=100",
    passRule: "governance-rules-documented",
    priority: "high",
    validation: "PLN-EVL-006",
    constraintRef: "PLN-CON-006",
    contextRef: "PLN-CTX-006",
    required: true,
    description: "Governance evaluation — rules completeness rules",
  },
  {
    id: "PLN-EVAL-007",
    kind: "workspace",
    purpose: "Evaluate planning inventory catalog completeness",
    roleRef: "PLN-ROL-006",
    topologyRef: "PLN-TOP-006",
    dependencyRef: "PLN-DEP-008",
    metrics: ["catalog-complete-ratio", "inventory-entry-count"],
    threshold: "catalog-complete=100",
    passRule: "inventory-catalog-complete",
    priority: "high",
    validation: "PLN-EVL-007",
    constraintRef: "PLN-CON-007",
    contextRef: "PLN-CTX-007",
    required: true,
    description: "Workspace evaluation — inventory catalog rules",
  },
  {
    id: "PLN-EVAL-008",
    kind: "boundary",
    purpose: "Evaluate declarative-only boundary with no runtime planning",
    roleRef: "PLN-ROL-008",
    topologyRef: "PLN-TOP-008",
    dependencyRef: "PLN-DEP-008",
    metrics: ["declarative-only", "runtime-exclusion"],
    threshold: "declarative-only=true",
    passRule: "no-runtime-planning",
    priority: "critical",
    validation: "PLN-EVL-008",
    constraintRef: "PLN-CON-008",
    contextRef: "PLN-CTX-008",
    required: true,
    description: "Boundary evaluation — no runtime planning rules",
  },
];

export const PLANNING_EVALUATION_VALIDATION_CATALOG: PlanningEvaluationValidation[] = [
  {
    id: "PLN-EVL-001",
    evaluationRef: "PLN-EVAL-001",
    validationKind: "shared",
    passCondition: "shared-rules-documented",
    required: true,
    description: "Shared evaluation validation — rules documented",
  },
  {
    id: "PLN-EVL-002",
    evaluationRef: "PLN-EVAL-002",
    validationKind: "role",
    passCondition: "role-rules-documented",
    required: true,
    description: "Role evaluation validation — rules documented",
  },
  {
    id: "PLN-EVL-003",
    evaluationRef: "PLN-EVAL-003",
    validationKind: "topology",
    passCondition: "topology-rules-documented",
    required: true,
    description: "Topology evaluation validation — rules documented",
  },
  {
    id: "PLN-EVL-004",
    evaluationRef: "PLN-EVAL-004",
    validationKind: "scope",
    passCondition: "scope-rules-documented",
    required: true,
    description: "Scope evaluation validation — rules documented",
  },
  {
    id: "PLN-EVL-005",
    evaluationRef: "PLN-EVAL-005",
    validationKind: "dependency",
    passCondition: "dependency-rules-documented",
    required: true,
    description: "Dependency evaluation validation — rules documented",
  },
  {
    id: "PLN-EVL-006",
    evaluationRef: "PLN-EVAL-006",
    validationKind: "governance",
    passCondition: "governance-rules-documented",
    required: true,
    description: "Governance evaluation validation — rules documented",
  },
  {
    id: "PLN-EVL-007",
    evaluationRef: "PLN-EVAL-007",
    validationKind: "workspace",
    passCondition: "workspace-rules-documented",
    required: true,
    description: "Workspace evaluation validation — rules documented",
  },
  {
    id: "PLN-EVL-008",
    evaluationRef: "PLN-EVAL-008",
    validationKind: "boundary",
    passCondition: "declarative-boundary-documented",
    required: true,
    description: "Boundary evaluation validation — no-runtime rules documented",
  },
];

export function isPlanningEvaluationCatalogRefsAligned(): boolean {
  const roleIds = new Set(PLANNING_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(PLANNING_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(PLANNING_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const constraintIds = new Set(PLANNING_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(PLANNING_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(PLANNING_EVALUATION_VALIDATION_CATALOG.map((v) => v.id));
  const evaluationIds = new Set(PLANNING_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const kinds = new Set(PLANNING_EVALUATION_CATALOG_ENTRIES.map((e) => e.kind));

  const evaluationsAligned = PLANNING_EVALUATION_CATALOG_ENTRIES.every(
    (e) =>
      constraintIds.has(e.constraintRef) &&
      contextIds.has(e.contextRef) &&
      validationIds.has(e.validation) &&
      roleIds.has(e.roleRef) &&
      topologyIds.has(e.topologyRef) &&
      depIds.has(e.dependencyRef) &&
      e.metrics.length >= 1 &&
      e.passRule.length > 0,
  );

  const validationsAligned = PLANNING_EVALUATION_VALIDATION_CATALOG.every((v) =>
    evaluationIds.has(v.evaluationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    evaluationsAligned &&
    validationsAligned &&
    kindsComplete &&
    PLANNING_EVALUATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildPlanningEvaluationCatalogManifest(): PlanningEvaluationCatalogManifest {
  const evaluations = PLANNING_EVALUATION_CATALOG_ENTRIES;
  const kinds = new Set(evaluations.map((e) => e.kind));
  const catalogComplete =
    evaluations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V77_PLANNING_EVALUATION_VERSION,
    entryCount: evaluations.length,
    kindCount: kinds.size,
    catalogComplete,
    evaluations,
    summary: [
      `planning-evaluation-catalog count=${evaluations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningEvaluationValidationManifest(): PlanningEvaluationValidationManifest {
  const validations = PLANNING_EVALUATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V77_PLANNING_EVALUATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `planning-evaluation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPlanningEvaluationCatalogEntryById(
  id: string,
): PlanningEvaluationCatalogEntry | undefined {
  return PLANNING_EVALUATION_CATALOG_ENTRIES.find((e) => e.id === id);
}

export function getPlanningEvaluationCatalogEntriesByKind(
  kind: PlanningEvaluationKind,
): PlanningEvaluationCatalogEntry[] {
  return PLANNING_EVALUATION_CATALOG_ENTRIES.filter((e) => e.kind === kind);
}

export function getPlanningEvaluationValidationByEvaluationRef(
  evaluationRef: string,
): PlanningEvaluationValidation | undefined {
  return PLANNING_EVALUATION_VALIDATION_CATALOG.find((v) => v.evaluationRef === evaluationRef);
}

export function computePlanningDeclarativeEvaluationDeclared(input: {
  kind: PlanningEvaluationKind;
  threshold: string;
}): boolean {
  return input.kind === "boundary" && input.threshold.length > 0;
}
