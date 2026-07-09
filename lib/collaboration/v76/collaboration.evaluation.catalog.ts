/**
 * V76 P5 — Collaboration evaluation catalog (declarative)
 */
import { COLLABORATION_CONSTRAINT_CATALOG_ENTRIES } from "./collaboration.constraint.catalog";
import { COLLABORATION_CONTEXT_CATALOG_ENTRIES } from "./collaboration.context.catalog";
import { COLLABORATION_INPUT_CATALOG, COLLABORATION_OUTPUT_CATALOG } from "./collaboration.inventory";
import type {
  CollaborationEvaluationCatalogEntry,
  CollaborationEvaluationCatalogManifest,
  CollaborationEvaluationKind,
  CollaborationEvaluationValidation,
  CollaborationEvaluationValidationManifest,
} from "./collaboration.evaluation";
import { V76_COLLABORATION_EVALUATION_VERSION } from "./collaboration.evaluation";

const REQUIRED_KINDS: CollaborationEvaluationKind[] = [
  "shared",
  "topology",
  "communication",
  "delegation",
  "coordination",
  "governance",
  "workspace",
  "boundary",
];

export const COLLABORATION_EVALUATION_CATALOG_ENTRIES: CollaborationEvaluationCatalogEntry[] = [
  {
    id: "COL-EVAL-001",
    kind: "shared",
    purpose: "Evaluate shared collaboration baseline readiness",
    inputs: ["COL-INP-001"],
    outputs: ["COL-OUT-001"],
    metrics: ["freeze-intact-ratio", "shared-role-coverage"],
    threshold: "freeze-intact=true",
    passRule: "upstream-agent-freeze-intact",
    priority: "high",
    validation: "COL-EVL-001",
    constraintRef: "COL-CON-001",
    contextRef: "COL-CTX-001",
    required: true,
    description: "Shared evaluation — agent freeze baseline rules",
  },
  {
    id: "COL-EVAL-002",
    kind: "topology",
    purpose: "Evaluate collaboration topology acyclicity",
    inputs: ["COL-INP-002"],
    outputs: ["COL-OUT-002"],
    metrics: ["cycle-count", "topology-depth"],
    threshold: "cycle-count=0",
    passRule: "acyclic-topology-required",
    priority: "critical",
    validation: "COL-EVL-002",
    constraintRef: "COL-CON-002",
    contextRef: "COL-CTX-002",
    required: true,
    description: "Topology evaluation — acyclic graph rules",
  },
  {
    id: "COL-EVAL-003",
    kind: "communication",
    purpose: "Evaluate communication contract compliance",
    inputs: ["COL-INP-003"],
    outputs: ["COL-OUT-003"],
    metrics: ["contract-pass-rate", "violation-count"],
    threshold: "contract-pass-rate=100",
    passRule: "communication-contract-pass",
    priority: "critical",
    validation: "COL-EVL-003",
    constraintRef: "COL-CON-003",
    contextRef: "COL-CTX-003",
    required: true,
    description: "Communication evaluation — contract enforcement rules",
  },
  {
    id: "COL-EVAL-004",
    kind: "delegation",
    purpose: "Evaluate delegation boundary completeness",
    inputs: ["COL-INP-004"],
    outputs: ["COL-OUT-004"],
    metrics: ["boundary-coverage", "delegation-violations"],
    threshold: "boundary-coverage=100",
    passRule: "delegation-boundary-intact",
    priority: "high",
    validation: "COL-EVL-004",
    constraintRef: "COL-CON-004",
    contextRef: "COL-CTX-004",
    required: true,
    description: "Delegation evaluation — boundary completeness rules",
  },
  {
    id: "COL-EVAL-005",
    kind: "coordination",
    purpose: "Evaluate coordination readiness within declared bounds",
    inputs: ["COL-INP-005"],
    outputs: ["COL-OUT-005"],
    metrics: ["readiness-score", "escalation-tier"],
    threshold: "readiness<=bounded",
    passRule: "coordination-readiness-bounded",
    priority: "medium",
    validation: "COL-EVL-005",
    constraintRef: "COL-CON-005",
    contextRef: "COL-CTX-005",
    required: true,
    description: "Coordination evaluation — readiness bounded rules",
  },
  {
    id: "COL-EVAL-006",
    kind: "governance",
    purpose: "Evaluate governance inventory checklist completeness",
    inputs: ["COL-INP-007"],
    outputs: ["COL-OUT-007"],
    metrics: ["checklist-complete-ratio", "governance-pass"],
    threshold: "checklist-complete=100",
    passRule: "governance-checklist-required",
    priority: "high",
    validation: "COL-EVL-006",
    constraintRef: "COL-CON-006",
    contextRef: "COL-CTX-007",
    required: true,
    description: "Governance evaluation — checklist completeness rules",
  },
  {
    id: "COL-EVAL-007",
    kind: "workspace",
    purpose: "Evaluate collaboration inventory catalog completeness",
    inputs: ["COL-INP-008"],
    outputs: ["COL-OUT-008"],
    metrics: ["catalog-complete-ratio", "inventory-entry-count"],
    threshold: "catalog-complete=100",
    passRule: "inventory-catalog-complete",
    priority: "high",
    validation: "COL-EVL-007",
    constraintRef: "COL-CON-007",
    contextRef: "COL-CTX-008",
    required: true,
    description: "Workspace evaluation — inventory catalog rules",
  },
  {
    id: "COL-EVAL-008",
    kind: "boundary",
    purpose: "Evaluate declarative-only boundary with no runtime execution",
    inputs: ["COL-INP-008"],
    outputs: ["COL-OUT-008"],
    metrics: ["declarative-only", "runtime-exclusion"],
    threshold: "declarative-only=true",
    passRule: "no-runtime-execution",
    priority: "critical",
    validation: "COL-EVL-008",
    constraintRef: "COL-CON-008",
    contextRef: "COL-CTX-008",
    required: true,
    description: "Boundary evaluation — no runtime execution rules",
  },
];

export const COLLABORATION_EVALUATION_VALIDATION_CATALOG: CollaborationEvaluationValidation[] = [
  {
    id: "COL-EVL-001",
    evaluationRef: "COL-EVAL-001",
    validationKind: "shared",
    passCondition: "shared-rules-documented",
    required: true,
    description: "Shared evaluation validation — rules documented",
  },
  {
    id: "COL-EVL-002",
    evaluationRef: "COL-EVAL-002",
    validationKind: "topology",
    passCondition: "topology-rules-documented",
    required: true,
    description: "Topology evaluation validation — rules documented",
  },
  {
    id: "COL-EVL-003",
    evaluationRef: "COL-EVAL-003",
    validationKind: "communication",
    passCondition: "communication-rules-documented",
    required: true,
    description: "Communication evaluation validation — rules documented",
  },
  {
    id: "COL-EVL-004",
    evaluationRef: "COL-EVAL-004",
    validationKind: "delegation",
    passCondition: "delegation-rules-documented",
    required: true,
    description: "Delegation evaluation validation — rules documented",
  },
  {
    id: "COL-EVL-005",
    evaluationRef: "COL-EVAL-005",
    validationKind: "coordination",
    passCondition: "coordination-rules-documented",
    required: true,
    description: "Coordination evaluation validation — rules documented",
  },
  {
    id: "COL-EVL-006",
    evaluationRef: "COL-EVAL-006",
    validationKind: "governance",
    passCondition: "governance-rules-documented",
    required: true,
    description: "Governance evaluation validation — rules documented",
  },
  {
    id: "COL-EVL-007",
    evaluationRef: "COL-EVAL-007",
    validationKind: "workspace",
    passCondition: "workspace-rules-documented",
    required: true,
    description: "Workspace evaluation validation — rules documented",
  },
  {
    id: "COL-EVL-008",
    evaluationRef: "COL-EVAL-008",
    validationKind: "boundary",
    passCondition: "declarative-boundary-documented",
    required: true,
    description: "Boundary evaluation validation — no-runtime rules documented",
  },
];

export function isCollaborationEvaluationCatalogRefsAligned(): boolean {
  const inputIds = new Set(COLLABORATION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(COLLABORATION_OUTPUT_CATALOG.map((o) => o.id));
  const constraintIds = new Set(COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(COLLABORATION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(COLLABORATION_EVALUATION_VALIDATION_CATALOG.map((v) => v.id));
  const evaluationIds = new Set(COLLABORATION_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const kinds = new Set(COLLABORATION_EVALUATION_CATALOG_ENTRIES.map((e) => e.kind));

  const evaluationsAligned = COLLABORATION_EVALUATION_CATALOG_ENTRIES.every(
    (e) =>
      constraintIds.has(e.constraintRef) &&
      contextIds.has(e.contextRef) &&
      validationIds.has(e.validation) &&
      e.inputs.every((i) => inputIds.has(i)) &&
      e.outputs.every((o) => outputIds.has(o)) &&
      e.metrics.length >= 1 &&
      e.passRule.length > 0,
  );

  const validationsAligned = COLLABORATION_EVALUATION_VALIDATION_CATALOG.every((v) =>
    evaluationIds.has(v.evaluationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    evaluationsAligned &&
    validationsAligned &&
    kindsComplete &&
    COLLABORATION_EVALUATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildCollaborationEvaluationCatalogManifest(): CollaborationEvaluationCatalogManifest {
  const evaluations = COLLABORATION_EVALUATION_CATALOG_ENTRIES;
  const kinds = new Set(evaluations.map((e) => e.kind));
  const catalogComplete =
    evaluations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V76_COLLABORATION_EVALUATION_VERSION,
    entryCount: evaluations.length,
    kindCount: kinds.size,
    catalogComplete,
    evaluations,
    summary: [
      `collaboration-evaluation-catalog count=${evaluations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationEvaluationValidationManifest(): CollaborationEvaluationValidationManifest {
  const validations = COLLABORATION_EVALUATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V76_COLLABORATION_EVALUATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `collaboration-evaluation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCollaborationEvaluationCatalogEntryById(
  id: string,
): CollaborationEvaluationCatalogEntry | undefined {
  return COLLABORATION_EVALUATION_CATALOG_ENTRIES.find((e) => e.id === id);
}

export function getCollaborationEvaluationCatalogEntriesByKind(
  kind: CollaborationEvaluationKind,
): CollaborationEvaluationCatalogEntry[] {
  return COLLABORATION_EVALUATION_CATALOG_ENTRIES.filter((e) => e.kind === kind);
}

export function getCollaborationEvaluationValidationByEvaluationRef(
  evaluationRef: string,
): CollaborationEvaluationValidation | undefined {
  return COLLABORATION_EVALUATION_VALIDATION_CATALOG.find((v) => v.evaluationRef === evaluationRef);
}

export function computeCollaborationDeclarativeEvaluationDeclared(input: {
  kind: CollaborationEvaluationKind;
  threshold: string;
}): boolean {
  return input.kind === "boundary" && input.threshold.length > 0;
}
