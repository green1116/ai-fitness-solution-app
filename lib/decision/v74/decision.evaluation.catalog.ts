/**
 * V74 P5 — Decision evaluation catalog (declarative)
 */
import { CONSTRAINT_CATALOG_ENTRIES } from "./decision.constraint.catalog";
import { CONTEXT_CATALOG_ENTRIES } from "./decision.context.catalog";
import { DECISION_INPUT_CATALOG, DECISION_OUTPUT_CATALOG } from "./decision.inventory";
import type {
  EvaluationCatalogEntry,
  EvaluationCatalogManifest,
  EvaluationDimensionKind,
  EvaluationValidation,
  EvaluationValidationManifest,
} from "./decision.evaluation";
import { V74_DECISION_EVALUATION_VERSION } from "./decision.evaluation";

const REQUIRED_DIMENSIONS: EvaluationDimensionKind[] = [
  "score",
  "confidence",
  "risk",
  "quality",
  "cost",
  "benefit",
  "impact",
  "explainability",
];

export const EVALUATION_CATALOG_ENTRIES: EvaluationCatalogEntry[] = [
  {
    id: "DEC-EVAL-001",
    dimension: "score",
    purpose: "Declarative readiness score dimension for decision catalog",
    inputs: ["DEC-INP-001"],
    outputs: ["DEC-OUT-001"],
    metrics: ["readiness-score", "catalog-complete-ratio"],
    threshold: "score>=100",
    priority: "high",
    validation: "DEC-EVL-001",
    constraintRef: "DEC-CON-008",
    contextRef: "DEC-CTX-001",
    required: true,
    description: "Score — inventory readiness evaluation dimension",
  },
  {
    id: "DEC-EVAL-002",
    dimension: "confidence",
    purpose: "Confidence level dimension for compliance decisions",
    inputs: ["DEC-INP-007"],
    outputs: ["DEC-OUT-007"],
    metrics: ["confidence-level", "waiver-status"],
    threshold: "confidence>=medium",
    priority: "high",
    validation: "DEC-EVL-002",
    constraintRef: "DEC-CON-007",
    contextRef: "DEC-CTX-008",
    required: true,
    description: "Confidence — compliance waiver confidence dimension",
  },
  {
    id: "DEC-EVAL-003",
    dimension: "risk",
    purpose: "Governance risk escalation evaluation dimension",
    inputs: ["DEC-INP-005"],
    outputs: ["DEC-OUT-005"],
    metrics: ["risk-level", "escalation-tier"],
    threshold: "risk<=medium",
    priority: "critical",
    validation: "DEC-EVL-003",
    constraintRef: "DEC-CON-003",
    contextRef: "DEC-CTX-003",
    required: true,
    description: "Risk — governance risk bounded evaluation dimension",
  },
  {
    id: "DEC-EVAL-004",
    dimension: "quality",
    purpose: "Compatibility matrix quality evaluation dimension",
    inputs: ["DEC-INP-004"],
    outputs: ["DEC-OUT-004"],
    metrics: ["compatible-pairs", "incompatible-pairs"],
    threshold: "compatible>=7",
    priority: "high",
    validation: "DEC-EVL-004",
    constraintRef: "DEC-CON-006",
    contextRef: "DEC-CTX-004",
    required: true,
    description: "Quality — compatibility matrix quality dimension",
  },
  {
    id: "DEC-EVAL-005",
    dimension: "cost",
    purpose: "Evaluation cost bound dimension",
    inputs: ["DEC-INP-002"],
    outputs: ["DEC-OUT-002"],
    metrics: ["evaluation-cost", "dependency-depth"],
    threshold: "cost<=budget",
    priority: "medium",
    validation: "DEC-EVL-005",
    constraintRef: "DEC-CON-006",
    contextRef: "DEC-CTX-002",
    required: true,
    description: "Cost — dependency evaluation cost dimension",
  },
  {
    id: "DEC-EVAL-006",
    dimension: "benefit",
    purpose: "Business benefit alignment evaluation dimension",
    inputs: ["DEC-INP-001"],
    outputs: ["DEC-OUT-001"],
    metrics: ["objective-alignment", "freeze-readiness"],
    threshold: "benefit>=aligned",
    priority: "medium",
    validation: "DEC-EVL-006",
    constraintRef: "DEC-CON-002",
    contextRef: "DEC-CTX-002",
    required: true,
    description: "Benefit — business objective benefit dimension",
  },
  {
    id: "DEC-EVAL-007",
    dimension: "impact",
    purpose: "Lifecycle transition impact evaluation dimension",
    inputs: ["DEC-INP-006"],
    outputs: ["DEC-OUT-006"],
    metrics: ["transition-impact", "audit-coverage"],
    threshold: "impact<=acceptable",
    priority: "high",
    validation: "DEC-EVL-007",
    constraintRef: "DEC-CON-005",
    contextRef: "DEC-CTX-007",
    required: true,
    description: "Impact — lifecycle transition impact dimension",
  },
  {
    id: "DEC-EVAL-008",
    dimension: "explainability",
    purpose: "Declarative audit trail explainability dimension",
    inputs: ["DEC-INP-008"],
    outputs: ["DEC-OUT-008"],
    metrics: ["audit-trail-complete", "declarative-summary"],
    threshold: "explainability=declarative",
    priority: "critical",
    validation: "DEC-EVL-008",
    constraintRef: "DEC-CON-001",
    contextRef: "DEC-CTX-005",
    required: true,
    description: "Explainability — no-runtime declarative explainability dimension",
  },
];

export const EVALUATION_VALIDATION_CATALOG: EvaluationValidation[] = [
  {
    id: "DEC-EVL-001",
    evaluationRef: "DEC-EVAL-001",
    validationKind: "score",
    passCondition: "readiness-score-declared",
    required: true,
    description: "Score dimension validation — readiness declared",
  },
  {
    id: "DEC-EVL-002",
    evaluationRef: "DEC-EVAL-002",
    validationKind: "confidence",
    passCondition: "confidence-threshold-documented",
    required: true,
    description: "Confidence dimension validation — threshold documented",
  },
  {
    id: "DEC-EVL-003",
    evaluationRef: "DEC-EVAL-003",
    validationKind: "risk",
    passCondition: "risk-bounds-declared",
    required: true,
    description: "Risk dimension validation — bounds declared",
  },
  {
    id: "DEC-EVL-004",
    evaluationRef: "DEC-EVAL-004",
    validationKind: "quality",
    passCondition: "quality-metrics-documented",
    required: true,
    description: "Quality dimension validation — metrics documented",
  },
  {
    id: "DEC-EVL-005",
    evaluationRef: "DEC-EVAL-005",
    validationKind: "cost",
    passCondition: "cost-threshold-documented",
    required: true,
    description: "Cost dimension validation — threshold documented",
  },
  {
    id: "DEC-EVL-006",
    evaluationRef: "DEC-EVAL-006",
    validationKind: "benefit",
    passCondition: "benefit-criteria-declared",
    required: true,
    description: "Benefit dimension validation — criteria declared",
  },
  {
    id: "DEC-EVL-007",
    evaluationRef: "DEC-EVAL-007",
    validationKind: "impact",
    passCondition: "impact-bounds-declared",
    required: true,
    description: "Impact dimension validation — bounds declared",
  },
  {
    id: "DEC-EVL-008",
    evaluationRef: "DEC-EVAL-008",
    validationKind: "explainability",
    passCondition: "declarative-audit-complete",
    required: true,
    description: "Explainability dimension validation — audit complete",
  },
];

export function isDecisionEvaluationCatalogRefsAligned(): boolean {
  const inputIds = new Set(DECISION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(DECISION_OUTPUT_CATALOG.map((o) => o.id));
  const constraintIds = new Set(CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(EVALUATION_VALIDATION_CATALOG.map((v) => v.id));
  const evaluationIds = new Set(EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const dimensions = new Set(EVALUATION_CATALOG_ENTRIES.map((e) => e.dimension));

  const evaluationsAligned = EVALUATION_CATALOG_ENTRIES.every(
    (e) =>
      constraintIds.has(e.constraintRef) &&
      contextIds.has(e.contextRef) &&
      validationIds.has(e.validation) &&
      e.inputs.every((i) => inputIds.has(i)) &&
      e.outputs.every((o) => outputIds.has(o)) &&
      e.metrics.length >= 1,
  );

  const validationsAligned = EVALUATION_VALIDATION_CATALOG.every((v) =>
    evaluationIds.has(v.evaluationRef),
  );

  const dimensionsComplete = REQUIRED_DIMENSIONS.every((d) => dimensions.has(d));

  return (
    evaluationsAligned &&
    validationsAligned &&
    dimensionsComplete &&
    EVALUATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildEvaluationCatalogManifest(): EvaluationCatalogManifest {
  const evaluations = EVALUATION_CATALOG_ENTRIES;
  const dimensions = new Set(evaluations.map((e) => e.dimension));
  const catalogComplete =
    evaluations.length === 8 && REQUIRED_DIMENSIONS.every((d) => dimensions.has(d));

  return {
    version: V74_DECISION_EVALUATION_VERSION,
    entryCount: evaluations.length,
    dimensionCount: dimensions.size,
    catalogComplete,
    evaluations,
    summary: [
      `decision-evaluation-catalog count=${evaluations.length}`,
      `dimensions=${dimensions.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildEvaluationValidationManifest(): EvaluationValidationManifest {
  const validations = EVALUATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V74_DECISION_EVALUATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `decision-evaluation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getEvaluationCatalogEntryById(id: string): EvaluationCatalogEntry | undefined {
  return EVALUATION_CATALOG_ENTRIES.find((e) => e.id === id);
}

export function getEvaluationCatalogEntriesByDimension(
  dimension: EvaluationDimensionKind,
): EvaluationCatalogEntry[] {
  return EVALUATION_CATALOG_ENTRIES.filter((e) => e.dimension === dimension);
}

export function getEvaluationValidationByEvaluationRef(
  evaluationRef: string,
): EvaluationValidation | undefined {
  return EVALUATION_VALIDATION_CATALOG.find((v) => v.evaluationRef === evaluationRef);
}

export function computeDeclarativeEvaluationDeclared(input: {
  dimension: EvaluationDimensionKind;
  threshold: string;
}): boolean {
  return input.dimension === "explainability" && input.threshold.length > 0;
}
