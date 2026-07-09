/**
 * V79 P5 — Task evaluation catalog (declarative)
 */
import { TASK_CONSTRAINT_CATALOG_ENTRIES } from "./task.constraint.catalog";
import { TASK_CONTEXT_CATALOG_ENTRIES } from "./task.context.catalog";
import { TASK_UPSTREAM_DEPENDENCIES } from "./task.dependencies";
import { TASK_ROLE_CATALOG, TASK_TOPOLOGY_CATALOG } from "./task.inventory";
import { TASK_STATE_CATALOG } from "./task.state";
import type {
  TaskEvaluationCatalogEntry,
  TaskEvaluationCatalogManifest,
  TaskEvaluationKind,
  TaskEvaluationValidation,
  TaskEvaluationValidationManifest,
} from "./task.evaluation";
import { V79_TASK_EVALUATION_VERSION } from "./task.evaluation";

const REQUIRED_KINDS: TaskEvaluationKind[] = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
];

export const TASK_EVALUATION_CATALOG_ENTRIES: TaskEvaluationCatalogEntry[] = [
  {
    id: "TSK-EVAL-001",
    kind: "shared",
    purpose: "Evaluate shared task baseline readiness",
    roleRef: "TSK-ROL-001",
    stateRef: "TSK-STA-001",
    topologyRef: "TSK-TOP-001",
    dependencyRef: "TSK-DEP-001",
    metrics: ["freeze-intact-ratio", "shared-creator-coverage"],
    threshold: "freeze-intact=true",
    passRule: "upstream-execution-freeze-intact",
    priority: "high",
    validation: "TSK-EVL-001",
    constraintRef: "TSK-CON-001",
    contextRef: "TSK-CTX-001",
    required: true,
    description: "Shared evaluation — execution freeze baseline rules",
  },
  {
    id: "TSK-EVAL-002",
    kind: "role",
    purpose: "Evaluate task role assignment completeness",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-002",
    topologyRef: "TSK-TOP-002",
    dependencyRef: "TSK-DEP-002",
    metrics: ["role-coverage", "assignment-count"],
    threshold: "role-coverage=100",
    passRule: "task-role-defined",
    priority: "high",
    validation: "TSK-EVL-002",
    constraintRef: "TSK-CON-002",
    contextRef: "TSK-CTX-002",
    required: true,
    description: "Role evaluation — role assignment rules",
  },
  {
    id: "TSK-EVAL-003",
    kind: "state",
    purpose: "Evaluate task lifecycle state completeness",
    roleRef: "TSK-ROL-003",
    stateRef: "TSK-STA-004",
    topologyRef: "TSK-TOP-003",
    dependencyRef: "TSK-DEP-003",
    metrics: ["state-coverage", "transition-rule-count"],
    threshold: "state-coverage=100",
    passRule: "task-state-documented",
    priority: "critical",
    validation: "TSK-EVL-003",
    constraintRef: "TSK-CON-003",
    contextRef: "TSK-CTX-003",
    required: true,
    description: "State evaluation — lifecycle state rules",
  },
  {
    id: "TSK-EVAL-004",
    kind: "topology",
    purpose: "Evaluate task topology acyclicity",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-003",
    topologyRef: "TSK-TOP-002",
    dependencyRef: "TSK-DEP-004",
    metrics: ["cycle-count", "topology-depth"],
    threshold: "cycle-count=0",
    passRule: "acyclic-topology-required",
    priority: "critical",
    validation: "TSK-EVL-004",
    constraintRef: "TSK-CON-004",
    contextRef: "TSK-CTX-004",
    required: true,
    description: "Topology evaluation — acyclic graph rules",
  },
  {
    id: "TSK-EVAL-005",
    kind: "scope",
    purpose: "Evaluate task scope boundary completeness",
    roleRef: "TSK-ROL-005",
    stateRef: "TSK-STA-006",
    topologyRef: "TSK-TOP-005",
    dependencyRef: "TSK-DEP-006",
    metrics: ["scope-coverage", "boundary-violations"],
    threshold: "scope-coverage=100",
    passRule: "task-scope-bounded",
    priority: "high",
    validation: "TSK-EVL-005",
    constraintRef: "TSK-CON-005",
    contextRef: "TSK-CTX-005",
    required: true,
    description: "Scope evaluation — boundary completeness rules",
  },
  {
    id: "TSK-EVAL-006",
    kind: "dependency",
    purpose: "Evaluate upstream dependency lock integrity",
    roleRef: "TSK-ROL-004",
    stateRef: "TSK-STA-005",
    topologyRef: "TSK-TOP-004",
    dependencyRef: "TSK-DEP-005",
    metrics: ["dependency-lock-count", "upstream-drift"],
    threshold: "upstream-drift=0",
    passRule: "upstream-dependency-intact",
    priority: "critical",
    validation: "TSK-EVL-006",
    constraintRef: "TSK-CON-006",
    contextRef: "TSK-CTX-006",
    required: true,
    description: "Dependency evaluation — upstream lock rules",
  },
  {
    id: "TSK-EVAL-007",
    kind: "governance",
    purpose: "Evaluate task governance rules completeness",
    roleRef: "TSK-ROL-007",
    stateRef: "TSK-STA-007",
    topologyRef: "TSK-TOP-007",
    dependencyRef: "TSK-DEP-002",
    metrics: ["governance-rules-count", "checklist-complete"],
    threshold: "checklist-complete=100",
    passRule: "governance-rules-documented",
    priority: "high",
    validation: "TSK-EVL-007",
    constraintRef: "TSK-CON-007",
    contextRef: "TSK-CTX-007",
    required: true,
    description: "Governance evaluation — rules completeness rules",
  },
  {
    id: "TSK-EVAL-008",
    kind: "boundary",
    purpose: "Evaluate declarative-only boundary with no runtime task engine",
    roleRef: "TSK-ROL-008",
    stateRef: "TSK-STA-008",
    topologyRef: "TSK-TOP-008",
    dependencyRef: "TSK-DEP-008",
    metrics: ["declarative-only", "runtime-exclusion"],
    threshold: "declarative-only=true",
    passRule: "no-runtime-task-engine",
    priority: "critical",
    validation: "TSK-EVL-008",
    constraintRef: "TSK-CON-008",
    contextRef: "TSK-CTX-008",
    required: true,
    description: "Boundary evaluation — no runtime task engine rules",
  },
];

export const TASK_EVALUATION_VALIDATION_CATALOG: TaskEvaluationValidation[] = [
  {
    id: "TSK-EVL-001",
    evaluationRef: "TSK-EVAL-001",
    validationKind: "shared",
    passCondition: "shared-rules-documented",
    required: true,
    description: "Shared evaluation validation — rules documented",
  },
  {
    id: "TSK-EVL-002",
    evaluationRef: "TSK-EVAL-002",
    validationKind: "role",
    passCondition: "role-rules-documented",
    required: true,
    description: "Role evaluation validation — rules documented",
  },
  {
    id: "TSK-EVL-003",
    evaluationRef: "TSK-EVAL-003",
    validationKind: "state",
    passCondition: "state-rules-documented",
    required: true,
    description: "State evaluation validation — rules documented",
  },
  {
    id: "TSK-EVL-004",
    evaluationRef: "TSK-EVAL-004",
    validationKind: "topology",
    passCondition: "topology-rules-documented",
    required: true,
    description: "Topology evaluation validation — rules documented",
  },
  {
    id: "TSK-EVL-005",
    evaluationRef: "TSK-EVAL-005",
    validationKind: "scope",
    passCondition: "scope-rules-documented",
    required: true,
    description: "Scope evaluation validation — rules documented",
  },
  {
    id: "TSK-EVL-006",
    evaluationRef: "TSK-EVAL-006",
    validationKind: "dependency",
    passCondition: "dependency-rules-documented",
    required: true,
    description: "Dependency evaluation validation — rules documented",
  },
  {
    id: "TSK-EVL-007",
    evaluationRef: "TSK-EVAL-007",
    validationKind: "governance",
    passCondition: "governance-rules-documented",
    required: true,
    description: "Governance evaluation validation — rules documented",
  },
  {
    id: "TSK-EVL-008",
    evaluationRef: "TSK-EVAL-008",
    validationKind: "boundary",
    passCondition: "declarative-boundary-documented",
    required: true,
    description: "Boundary evaluation validation — no-runtime rules documented",
  },
];

export function isTaskEvaluationCatalogRefsAligned(): boolean {
  const roleIds = new Set(TASK_ROLE_CATALOG.map((r) => r.id));
  const stateIds = new Set(TASK_STATE_CATALOG.map((s) => s.id));
  const topologyIds = new Set(TASK_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(TASK_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const constraintIds = new Set(TASK_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(TASK_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(TASK_EVALUATION_VALIDATION_CATALOG.map((v) => v.id));
  const evaluationIds = new Set(TASK_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const kinds = new Set(TASK_EVALUATION_CATALOG_ENTRIES.map((e) => e.kind));

  const evaluationsAligned = TASK_EVALUATION_CATALOG_ENTRIES.every(
    (e) =>
      constraintIds.has(e.constraintRef) &&
      contextIds.has(e.contextRef) &&
      validationIds.has(e.validation) &&
      roleIds.has(e.roleRef) &&
      stateIds.has(e.stateRef) &&
      topologyIds.has(e.topologyRef) &&
      depIds.has(e.dependencyRef) &&
      e.metrics.length >= 1 &&
      e.passRule.length > 0,
  );

  const validationsAligned = TASK_EVALUATION_VALIDATION_CATALOG.every((v) =>
    evaluationIds.has(v.evaluationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    evaluationsAligned &&
    validationsAligned &&
    kindsComplete &&
    TASK_EVALUATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildTaskEvaluationCatalogManifest(): TaskEvaluationCatalogManifest {
  const evaluations = TASK_EVALUATION_CATALOG_ENTRIES;
  const kinds = new Set(evaluations.map((e) => e.kind));
  const catalogComplete =
    evaluations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_EVALUATION_VERSION,
    entryCount: evaluations.length,
    kindCount: kinds.size,
    catalogComplete,
    evaluations,
    summary: [
      `task-evaluation-catalog count=${evaluations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskEvaluationValidationManifest(): TaskEvaluationValidationManifest {
  const validations = TASK_EVALUATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V79_TASK_EVALUATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `task-evaluation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskEvaluationCatalogEntryById(
  id: string,
): TaskEvaluationCatalogEntry | undefined {
  return TASK_EVALUATION_CATALOG_ENTRIES.find((e) => e.id === id);
}

export function getTaskEvaluationCatalogEntriesByKind(
  kind: TaskEvaluationKind,
): TaskEvaluationCatalogEntry[] {
  return TASK_EVALUATION_CATALOG_ENTRIES.filter((e) => e.kind === kind);
}

export function getTaskEvaluationValidationByEvaluationRef(
  evaluationRef: string,
): TaskEvaluationValidation | undefined {
  return TASK_EVALUATION_VALIDATION_CATALOG.find((v) => v.evaluationRef === evaluationRef);
}

export function computeTaskDeclarativeEvaluationDeclared(input: {
  kind: TaskEvaluationKind;
  threshold: string;
}): boolean {
  return input.kind === "boundary" && input.threshold.length > 0;
}
