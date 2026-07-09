/**
 * V78 P5 — Execution evaluation catalog (declarative)
 */
import { EXECUTION_CONSTRAINT_CATALOG_ENTRIES } from "./execution.constraint.catalog";
import { EXECUTION_CONTEXT_CATALOG_ENTRIES } from "./execution.context.catalog";
import { EXECUTION_UPSTREAM_DEPENDENCIES } from "./execution.dependencies";
import {
  EXECUTION_ROLE_CATALOG,
  EXECUTION_TOPOLOGY_CATALOG,
} from "./execution.inventory";
import type {
  ExecutionEvaluationCatalogEntry,
  ExecutionEvaluationCatalogManifest,
  ExecutionEvaluationKind,
  ExecutionEvaluationValidation,
  ExecutionEvaluationValidationManifest,
} from "./execution.evaluation";
import { V78_EXECUTION_EVALUATION_VERSION } from "./execution.evaluation";

const REQUIRED_KINDS: ExecutionEvaluationKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const EXECUTION_EVALUATION_CATALOG_ENTRIES: ExecutionEvaluationCatalogEntry[] = [
  {
    id: "EXE-EVAL-001",
    kind: "shared",
    purpose: "Evaluate shared execution baseline readiness",
    roleRef: "EXE-ROL-001",
    topologyRef: "EXE-TOP-001",
    dependencyRef: "EXE-DEP-001",
    metrics: ["freeze-intact-ratio", "shared-executor-coverage"],
    threshold: "freeze-intact=true",
    passRule: "upstream-planning-freeze-intact",
    priority: "high",
    validation: "EXE-EVL-001",
    constraintRef: "EXE-CON-001",
    contextRef: "EXE-CTX-001",
    required: true,
    description: "Shared evaluation — planning freeze baseline rules",
  },
  {
    id: "EXE-EVAL-002",
    kind: "role",
    purpose: "Evaluate execution role assignment completeness",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    dependencyRef: "EXE-DEP-002",
    metrics: ["role-coverage", "assignment-count"],
    threshold: "role-coverage=100",
    passRule: "execution-role-defined",
    priority: "high",
    validation: "EXE-EVL-002",
    constraintRef: "EXE-CON-002",
    contextRef: "EXE-CTX-002",
    required: true,
    description: "Role evaluation — role assignment rules",
  },
  {
    id: "EXE-EVAL-003",
    kind: "topology",
    purpose: "Evaluate execution topology acyclicity",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    dependencyRef: "EXE-DEP-003",
    metrics: ["cycle-count", "topology-depth"],
    threshold: "cycle-count=0",
    passRule: "acyclic-topology-required",
    priority: "critical",
    validation: "EXE-EVL-003",
    constraintRef: "EXE-CON-003",
    contextRef: "EXE-CTX-003",
    required: true,
    description: "Topology evaluation — acyclic graph rules",
  },
  {
    id: "EXE-EVAL-004",
    kind: "scope",
    purpose: "Evaluate execution scope boundary completeness",
    roleRef: "EXE-ROL-003",
    topologyRef: "EXE-TOP-003",
    dependencyRef: "EXE-DEP-006",
    metrics: ["scope-coverage", "boundary-violations"],
    threshold: "scope-coverage=100",
    passRule: "execution-scope-bounded",
    priority: "high",
    validation: "EXE-EVL-004",
    constraintRef: "EXE-CON-004",
    contextRef: "EXE-CTX-004",
    required: true,
    description: "Scope evaluation — boundary completeness rules",
  },
  {
    id: "EXE-EVAL-005",
    kind: "dependency",
    purpose: "Evaluate upstream dependency lock integrity",
    roleRef: "EXE-ROL-004",
    topologyRef: "EXE-TOP-004",
    dependencyRef: "EXE-DEP-005",
    metrics: ["dependency-lock-count", "upstream-drift"],
    threshold: "upstream-drift=0",
    passRule: "upstream-dependency-intact",
    priority: "critical",
    validation: "EXE-EVL-005",
    constraintRef: "EXE-CON-005",
    contextRef: "EXE-CTX-005",
    required: true,
    description: "Dependency evaluation — upstream lock rules",
  },
  {
    id: "EXE-EVAL-006",
    kind: "governance",
    purpose: "Evaluate execution governance rules completeness",
    roleRef: "EXE-ROL-007",
    topologyRef: "EXE-TOP-007",
    dependencyRef: "EXE-DEP-004",
    metrics: ["governance-rules-count", "checklist-complete"],
    threshold: "checklist-complete=100",
    passRule: "governance-rules-documented",
    priority: "high",
    validation: "EXE-EVL-006",
    constraintRef: "EXE-CON-006",
    contextRef: "EXE-CTX-006",
    required: true,
    description: "Governance evaluation — rules completeness rules",
  },
  {
    id: "EXE-EVAL-007",
    kind: "workspace",
    purpose: "Evaluate execution inventory catalog completeness",
    roleRef: "EXE-ROL-006",
    topologyRef: "EXE-TOP-006",
    dependencyRef: "EXE-DEP-008",
    metrics: ["catalog-complete-ratio", "inventory-entry-count"],
    threshold: "catalog-complete=100",
    passRule: "inventory-catalog-complete",
    priority: "high",
    validation: "EXE-EVL-007",
    constraintRef: "EXE-CON-007",
    contextRef: "EXE-CTX-007",
    required: true,
    description: "Workspace evaluation — inventory catalog rules",
  },
  {
    id: "EXE-EVAL-008",
    kind: "boundary",
    purpose: "Evaluate declarative-only boundary with no runtime execution",
    roleRef: "EXE-ROL-008",
    topologyRef: "EXE-TOP-008",
    dependencyRef: "EXE-DEP-008",
    metrics: ["declarative-only", "runtime-exclusion"],
    threshold: "declarative-only=true",
    passRule: "no-runtime-execution",
    priority: "critical",
    validation: "EXE-EVL-008",
    constraintRef: "EXE-CON-008",
    contextRef: "EXE-CTX-008",
    required: true,
    description: "Boundary evaluation — no runtime execution rules",
  },
];

export const EXECUTION_EVALUATION_VALIDATION_CATALOG: ExecutionEvaluationValidation[] = [
  {
    id: "EXE-EVL-001",
    evaluationRef: "EXE-EVAL-001",
    validationKind: "shared",
    passCondition: "shared-rules-documented",
    required: true,
    description: "Shared evaluation validation — rules documented",
  },
  {
    id: "EXE-EVL-002",
    evaluationRef: "EXE-EVAL-002",
    validationKind: "role",
    passCondition: "role-rules-documented",
    required: true,
    description: "Role evaluation validation — rules documented",
  },
  {
    id: "EXE-EVL-003",
    evaluationRef: "EXE-EVAL-003",
    validationKind: "topology",
    passCondition: "topology-rules-documented",
    required: true,
    description: "Topology evaluation validation — rules documented",
  },
  {
    id: "EXE-EVL-004",
    evaluationRef: "EXE-EVAL-004",
    validationKind: "scope",
    passCondition: "scope-rules-documented",
    required: true,
    description: "Scope evaluation validation — rules documented",
  },
  {
    id: "EXE-EVL-005",
    evaluationRef: "EXE-EVAL-005",
    validationKind: "dependency",
    passCondition: "dependency-rules-documented",
    required: true,
    description: "Dependency evaluation validation — rules documented",
  },
  {
    id: "EXE-EVL-006",
    evaluationRef: "EXE-EVAL-006",
    validationKind: "governance",
    passCondition: "governance-rules-documented",
    required: true,
    description: "Governance evaluation validation — rules documented",
  },
  {
    id: "EXE-EVL-007",
    evaluationRef: "EXE-EVAL-007",
    validationKind: "workspace",
    passCondition: "workspace-rules-documented",
    required: true,
    description: "Workspace evaluation validation — rules documented",
  },
  {
    id: "EXE-EVL-008",
    evaluationRef: "EXE-EVAL-008",
    validationKind: "boundary",
    passCondition: "declarative-boundary-documented",
    required: true,
    description: "Boundary evaluation validation — no-runtime rules documented",
  },
];

export function isExecutionEvaluationCatalogRefsAligned(): boolean {
  const roleIds = new Set(EXECUTION_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(EXECUTION_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(EXECUTION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const constraintIds = new Set(EXECUTION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(EXECUTION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(EXECUTION_EVALUATION_VALIDATION_CATALOG.map((v) => v.id));
  const evaluationIds = new Set(EXECUTION_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const kinds = new Set(EXECUTION_EVALUATION_CATALOG_ENTRIES.map((e) => e.kind));

  const evaluationsAligned = EXECUTION_EVALUATION_CATALOG_ENTRIES.every(
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

  const validationsAligned = EXECUTION_EVALUATION_VALIDATION_CATALOG.every((v) =>
    evaluationIds.has(v.evaluationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    evaluationsAligned &&
    validationsAligned &&
    kindsComplete &&
    EXECUTION_EVALUATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildExecutionEvaluationCatalogManifest(): ExecutionEvaluationCatalogManifest {
  const evaluations = EXECUTION_EVALUATION_CATALOG_ENTRIES;
  const kinds = new Set(evaluations.map((e) => e.kind));
  const catalogComplete =
    evaluations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V78_EXECUTION_EVALUATION_VERSION,
    entryCount: evaluations.length,
    kindCount: kinds.size,
    catalogComplete,
    evaluations,
    summary: [
      `execution-evaluation-catalog count=${evaluations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionEvaluationValidationManifest(): ExecutionEvaluationValidationManifest {
  const validations = EXECUTION_EVALUATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V78_EXECUTION_EVALUATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `execution-evaluation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExecutionEvaluationCatalogEntryById(
  id: string,
): ExecutionEvaluationCatalogEntry | undefined {
  return EXECUTION_EVALUATION_CATALOG_ENTRIES.find((e) => e.id === id);
}

export function getExecutionEvaluationCatalogEntriesByKind(
  kind: ExecutionEvaluationKind,
): ExecutionEvaluationCatalogEntry[] {
  return EXECUTION_EVALUATION_CATALOG_ENTRIES.filter((e) => e.kind === kind);
}

export function getExecutionEvaluationValidationByEvaluationRef(
  evaluationRef: string,
): ExecutionEvaluationValidation | undefined {
  return EXECUTION_EVALUATION_VALIDATION_CATALOG.find((v) => v.evaluationRef === evaluationRef);
}

export function computeExecutionDeclarativeEvaluationDeclared(input: {
  kind: ExecutionEvaluationKind;
  threshold: string;
}): boolean {
  return input.kind === "boundary" && input.threshold.length > 0;
}
