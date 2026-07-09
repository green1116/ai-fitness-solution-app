/**
 * V75 P5 — Agent evaluation catalog (declarative)
 */
import { AGENT_CONSTRAINT_CATALOG_ENTRIES } from "./agent.constraint.catalog";
import { AGENT_CONTEXT_CATALOG_ENTRIES } from "./agent.context.catalog";
import { AGENT_INPUT_CATALOG, AGENT_OUTPUT_CATALOG } from "./agent.inventory";
import type {
  AgentEvaluationCatalogEntry,
  AgentEvaluationCatalogManifest,
  AgentEvaluationDimensionKind,
  AgentEvaluationValidation,
  AgentEvaluationValidationManifest,
} from "./agent.evaluation";
import { V75_AGENT_EVALUATION_VERSION } from "./agent.evaluation";

const REQUIRED_DIMENSIONS: AgentEvaluationDimensionKind[] = [
  "score",
  "confidence",
  "risk",
  "quality",
  "cost",
  "benefit",
  "impact",
  "explainability",
];

export const AGENT_EVALUATION_CATALOG_ENTRIES: AgentEvaluationCatalogEntry[] = [
  {
    id: "AGT-EVAL-001",
    dimension: "score",
    purpose: "Declarative readiness score dimension for agent catalog",
    inputs: ["AGT-INP-001"],
    outputs: ["AGT-OUT-001"],
    metrics: ["readiness-score", "catalog-complete-ratio"],
    threshold: "score>=100",
    passRule: "readiness-score-equals-100",
    priority: "high",
    validation: "AGT-EVL-001",
    constraintRef: "AGT-CON-008",
    contextRef: "AGT-CTX-001",
    required: true,
    description: "Score — inventory readiness evaluation dimension",
  },
  {
    id: "AGT-EVAL-002",
    dimension: "confidence",
    purpose: "Confidence level dimension for evaluation decisions",
    inputs: ["AGT-INP-007"],
    outputs: ["AGT-OUT-007"],
    metrics: ["confidence-level", "waiver-status"],
    threshold: "confidence>=medium",
    passRule: "confidence-threshold-met-or-waiver-declared",
    priority: "high",
    validation: "AGT-EVL-002",
    constraintRef: "AGT-CON-007",
    contextRef: "AGT-CTX-008",
    required: true,
    description: "Confidence — evaluation waiver confidence dimension",
  },
  {
    id: "AGT-EVAL-003",
    dimension: "risk",
    purpose: "Compliance readiness escalation evaluation dimension",
    inputs: ["AGT-INP-005"],
    outputs: ["AGT-OUT-005"],
    metrics: ["risk-level", "escalation-tier"],
    threshold: "risk<=medium",
    passRule: "risk-within-declared-bounds",
    priority: "critical",
    validation: "AGT-EVL-003",
    constraintRef: "AGT-CON-003",
    contextRef: "AGT-CTX-003",
    required: true,
    description: "Risk — compliance readiness bounded evaluation dimension",
  },
  {
    id: "AGT-EVAL-004",
    dimension: "quality",
    purpose: "Context integrity quality evaluation dimension",
    inputs: ["AGT-INP-004"],
    outputs: ["AGT-OUT-004"],
    metrics: ["integrity-pairs", "skipped-pairs"],
    threshold: "integrity>=7",
    passRule: "context-integrity-matrix-complete",
    priority: "high",
    validation: "AGT-EVL-004",
    constraintRef: "AGT-CON-006",
    contextRef: "AGT-CTX-004",
    required: true,
    description: "Quality — context integrity quality dimension",
  },
  {
    id: "AGT-EVAL-005",
    dimension: "cost",
    purpose: "Orchestration cost bound dimension",
    inputs: ["AGT-INP-002"],
    outputs: ["AGT-OUT-002"],
    metrics: ["orchestration-cost", "dependency-depth"],
    threshold: "cost<=budget",
    passRule: "cost-within-budget-or-audit-logged",
    priority: "medium",
    validation: "AGT-EVL-005",
    constraintRef: "AGT-CON-006",
    contextRef: "AGT-CTX-002",
    required: true,
    description: "Cost — dependency orchestration cost dimension",
  },
  {
    id: "AGT-EVAL-006",
    dimension: "benefit",
    purpose: "Business benefit alignment evaluation dimension",
    inputs: ["AGT-INP-001"],
    outputs: ["AGT-OUT-001"],
    metrics: ["objective-alignment", "freeze-readiness"],
    threshold: "benefit>=aligned",
    passRule: "business-objective-aligned",
    priority: "medium",
    validation: "AGT-EVL-006",
    constraintRef: "AGT-CON-002",
    contextRef: "AGT-CTX-002",
    required: true,
    description: "Benefit — business objective benefit dimension",
  },
  {
    id: "AGT-EVAL-007",
    dimension: "impact",
    purpose: "Session transition impact evaluation dimension",
    inputs: ["AGT-INP-006"],
    outputs: ["AGT-OUT-006"],
    metrics: ["transition-impact", "audit-coverage"],
    threshold: "impact<=acceptable",
    passRule: "impact-bounds-declared",
    priority: "high",
    validation: "AGT-EVL-007",
    constraintRef: "AGT-CON-005",
    contextRef: "AGT-CTX-007",
    required: true,
    description: "Impact — session transition impact dimension",
  },
  {
    id: "AGT-EVAL-008",
    dimension: "explainability",
    purpose: "Declarative audit trail explainability dimension",
    inputs: ["AGT-INP-008"],
    outputs: ["AGT-OUT-008"],
    metrics: ["audit-trail-complete", "declarative-summary"],
    threshold: "explainability=declarative",
    passRule: "declarative-audit-trail-complete",
    priority: "critical",
    validation: "AGT-EVL-008",
    constraintRef: "AGT-CON-001",
    contextRef: "AGT-CTX-005",
    required: true,
    description: "Explainability — no-runtime declarative explainability dimension",
  },
];

export const AGENT_EVALUATION_VALIDATION_CATALOG: AgentEvaluationValidation[] = [
  {
    id: "AGT-EVL-001",
    evaluationRef: "AGT-EVAL-001",
    validationKind: "score",
    passCondition: "readiness-score-declared",
    required: true,
    description: "Score dimension validation — readiness declared",
  },
  {
    id: "AGT-EVL-002",
    evaluationRef: "AGT-EVAL-002",
    validationKind: "confidence",
    passCondition: "confidence-threshold-documented",
    required: true,
    description: "Confidence dimension validation — threshold documented",
  },
  {
    id: "AGT-EVL-003",
    evaluationRef: "AGT-EVAL-003",
    validationKind: "risk",
    passCondition: "risk-bounds-declared",
    required: true,
    description: "Risk dimension validation — bounds declared",
  },
  {
    id: "AGT-EVL-004",
    evaluationRef: "AGT-EVAL-004",
    validationKind: "quality",
    passCondition: "quality-metrics-documented",
    required: true,
    description: "Quality dimension validation — metrics documented",
  },
  {
    id: "AGT-EVL-005",
    evaluationRef: "AGT-EVAL-005",
    validationKind: "cost",
    passCondition: "cost-threshold-documented",
    required: true,
    description: "Cost dimension validation — threshold documented",
  },
  {
    id: "AGT-EVL-006",
    evaluationRef: "AGT-EVAL-006",
    validationKind: "benefit",
    passCondition: "benefit-criteria-declared",
    required: true,
    description: "Benefit dimension validation — criteria declared",
  },
  {
    id: "AGT-EVL-007",
    evaluationRef: "AGT-EVAL-007",
    validationKind: "impact",
    passCondition: "impact-bounds-declared",
    required: true,
    description: "Impact dimension validation — bounds declared",
  },
  {
    id: "AGT-EVL-008",
    evaluationRef: "AGT-EVAL-008",
    validationKind: "explainability",
    passCondition: "declarative-audit-complete",
    required: true,
    description: "Explainability dimension validation — audit complete",
  },
];

export function isAgentEvaluationCatalogRefsAligned(): boolean {
  const inputIds = new Set(AGENT_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(AGENT_OUTPUT_CATALOG.map((o) => o.id));
  const constraintIds = new Set(AGENT_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(AGENT_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(AGENT_EVALUATION_VALIDATION_CATALOG.map((v) => v.id));
  const evaluationIds = new Set(AGENT_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const dimensions = new Set(AGENT_EVALUATION_CATALOG_ENTRIES.map((e) => e.dimension));

  const evaluationsAligned = AGENT_EVALUATION_CATALOG_ENTRIES.every(
    (e) =>
      constraintIds.has(e.constraintRef) &&
      contextIds.has(e.contextRef) &&
      validationIds.has(e.validation) &&
      e.inputs.every((i) => inputIds.has(i)) &&
      e.outputs.every((o) => outputIds.has(o)) &&
      e.metrics.length >= 1 &&
      e.passRule.length > 0,
  );

  const validationsAligned = AGENT_EVALUATION_VALIDATION_CATALOG.every((v) =>
    evaluationIds.has(v.evaluationRef),
  );

  const dimensionsComplete = REQUIRED_DIMENSIONS.every((d) => dimensions.has(d));

  return (
    evaluationsAligned &&
    validationsAligned &&
    dimensionsComplete &&
    AGENT_EVALUATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildAgentEvaluationCatalogManifest(): AgentEvaluationCatalogManifest {
  const evaluations = AGENT_EVALUATION_CATALOG_ENTRIES;
  const dimensions = new Set(evaluations.map((e) => e.dimension));
  const catalogComplete =
    evaluations.length === 8 && REQUIRED_DIMENSIONS.every((d) => dimensions.has(d));

  return {
    version: V75_AGENT_EVALUATION_VERSION,
    entryCount: evaluations.length,
    dimensionCount: dimensions.size,
    catalogComplete,
    evaluations,
    summary: [
      `agent-evaluation-catalog count=${evaluations.length}`,
      `dimensions=${dimensions.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentEvaluationValidationManifest(): AgentEvaluationValidationManifest {
  const validations = AGENT_EVALUATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V75_AGENT_EVALUATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `agent-evaluation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAgentEvaluationCatalogEntryById(
  id: string,
): AgentEvaluationCatalogEntry | undefined {
  return AGENT_EVALUATION_CATALOG_ENTRIES.find((e) => e.id === id);
}

export function getAgentEvaluationCatalogEntriesByDimension(
  dimension: AgentEvaluationDimensionKind,
): AgentEvaluationCatalogEntry[] {
  return AGENT_EVALUATION_CATALOG_ENTRIES.filter((e) => e.dimension === dimension);
}

export function getAgentEvaluationValidationByEvaluationRef(
  evaluationRef: string,
): AgentEvaluationValidation | undefined {
  return AGENT_EVALUATION_VALIDATION_CATALOG.find((v) => v.evaluationRef === evaluationRef);
}

export function computeAgentDeclarativeEvaluationDeclared(input: {
  dimension: AgentEvaluationDimensionKind;
  threshold: string;
}): boolean {
  return input.dimension === "explainability" && input.threshold.length > 0;
}
