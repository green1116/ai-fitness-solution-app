/**
 * V74 P6 — Decision simulation catalog (declarative)
 */
import { CONTEXT_CATALOG_ENTRIES } from "./decision.context.catalog";
import { EVALUATION_CATALOG_ENTRIES } from "./decision.evaluation.catalog";
import { DECISION_INPUT_CATALOG, DECISION_OUTPUT_CATALOG } from "./decision.inventory";
import type {
  SimulationCatalogEntry,
  SimulationCatalogManifest,
  SimulationTypeKind,
  SimulationValidation,
  SimulationValidationManifest,
} from "./decision.simulation";
import { V74_DECISION_SIMULATION_VERSION } from "./decision.simulation";

const REQUIRED_TYPES: SimulationTypeKind[] = [
  "dryRun",
  "scenario",
  "alternative",
  "comparison",
  "ranking",
  "forecast",
  "sensitivity",
  "rollbackPreview",
];

export const SIMULATION_CATALOG_ENTRIES: SimulationCatalogEntry[] = [
  {
    id: "DEC-SIM-001",
    type: "dryRun",
    purpose: "Declarative dry-run of inventory readiness without side effects",
    inputs: ["DEC-INP-001"],
    outputs: ["DEC-OUT-001"],
    assumptions: ["no-runtime-mutation", "declarative-only"],
    expectedResult: "readiness-score=100",
    priority: "high",
    validation: "DEC-SVL-001",
    evaluationRef: "DEC-EVAL-001",
    contextRef: "DEC-CTX-005",
    required: true,
    description: "DryRun — inventory readiness dry-run simulation",
  },
  {
    id: "DEC-SIM-002",
    type: "scenario",
    purpose: "Scenario model for governance risk escalation path",
    inputs: ["DEC-INP-005"],
    outputs: ["DEC-OUT-005"],
    assumptions: ["governance-risk-bounded", "priority-ranked"],
    expectedResult: "escalation-path-documented",
    priority: "critical",
    validation: "DEC-SVL-002",
    evaluationRef: "DEC-EVAL-003",
    contextRef: "DEC-CTX-003",
    required: true,
    description: "Scenario — governance risk escalation scenario simulation",
  },
  {
    id: "DEC-SIM-003",
    type: "alternative",
    purpose: "Alternative path when compatibility skip is triggered",
    inputs: ["DEC-INP-004"],
    outputs: ["DEC-OUT-004"],
    assumptions: ["incompatible-pair-skipped", "quality-gate-pass"],
    expectedResult: "alternative-path-selected",
    priority: "high",
    validation: "DEC-SVL-003",
    evaluationRef: "DEC-EVAL-004",
    contextRef: "DEC-CTX-004",
    required: true,
    description: "Alternative — compatibility skip alternative simulation",
  },
  {
    id: "DEC-SIM-004",
    type: "comparison",
    purpose: "Compare dependency acyclic vs cyclic graph outcomes",
    inputs: ["DEC-INP-002"],
    outputs: ["DEC-OUT-002"],
    assumptions: ["acyclic-graph-required", "cost-within-budget"],
    expectedResult: "acyclic-preferred",
    priority: "medium",
    validation: "DEC-SVL-004",
    evaluationRef: "DEC-EVAL-005",
    contextRef: "DEC-CTX-002",
    required: true,
    description: "Comparison — dependency graph comparison simulation",
  },
  {
    id: "DEC-SIM-005",
    type: "ranking",
    purpose: "Rank policy candidates by declared priority",
    inputs: ["DEC-INP-003"],
    outputs: ["DEC-OUT-003"],
    assumptions: ["policy-gate-enforced", "priority-declared"],
    expectedResult: "ranked-candidate-list",
    priority: "high",
    validation: "DEC-SVL-005",
    evaluationRef: "DEC-EVAL-006",
    contextRef: "DEC-CTX-003",
    required: true,
    description: "Ranking — policy candidate ranking simulation",
  },
  {
    id: "DEC-SIM-006",
    type: "forecast",
    purpose: "Forecast lifecycle transition impact without execution",
    inputs: ["DEC-INP-006"],
    outputs: ["DEC-OUT-006"],
    assumptions: ["lifecycle-state-documented", "impact-bounded"],
    expectedResult: "transition-impact-forecast",
    priority: "medium",
    validation: "DEC-SVL-006",
    evaluationRef: "DEC-EVAL-007",
    contextRef: "DEC-CTX-007",
    required: true,
    description: "Forecast — lifecycle transition forecast simulation",
  },
  {
    id: "DEC-SIM-007",
    type: "sensitivity",
    purpose: "Sensitivity analysis on confidence threshold changes",
    inputs: ["DEC-INP-007"],
    outputs: ["DEC-OUT-007"],
    assumptions: ["confidence-threshold-fixed", "no-ai-inference"],
    expectedResult: "sensitivity-bounds-documented",
    priority: "high",
    validation: "DEC-SVL-007",
    evaluationRef: "DEC-EVAL-002",
    contextRef: "DEC-CTX-008",
    required: true,
    description: "Sensitivity — confidence threshold sensitivity simulation",
  },
  {
    id: "DEC-SIM-008",
    type: "rollbackPreview",
    purpose: "Preview rollback paths without modifying frozen layers",
    inputs: ["DEC-INP-008"],
    outputs: ["DEC-OUT-008"],
    assumptions: ["v48-v73-frozen", "rollback-index-complete"],
    expectedResult: "rollback-path-preview",
    priority: "critical",
    validation: "DEC-SVL-008",
    evaluationRef: "DEC-EVAL-008",
    contextRef: "DEC-CTX-001",
    required: true,
    description: "RollbackPreview — declarative rollback preview simulation",
  },
];

export const SIMULATION_VALIDATION_CATALOG: SimulationValidation[] = [
  {
    id: "DEC-SVL-001",
    simulationRef: "DEC-SIM-001",
    validationKind: "dryRun",
    passCondition: "dry-run-declared-no-side-effects",
    required: true,
    description: "DryRun validation — no side effects declared",
  },
  {
    id: "DEC-SVL-002",
    simulationRef: "DEC-SIM-002",
    validationKind: "scenario",
    passCondition: "scenario-path-documented",
    required: true,
    description: "Scenario validation — path documented",
  },
  {
    id: "DEC-SVL-003",
    simulationRef: "DEC-SIM-003",
    validationKind: "alternative",
    passCondition: "alternative-path-declared",
    required: true,
    description: "Alternative validation — path declared",
  },
  {
    id: "DEC-SVL-004",
    simulationRef: "DEC-SIM-004",
    validationKind: "comparison",
    passCondition: "comparison-outcomes-documented",
    required: true,
    description: "Comparison validation — outcomes documented",
  },
  {
    id: "DEC-SVL-005",
    simulationRef: "DEC-SIM-005",
    validationKind: "ranking",
    passCondition: "ranking-order-declared",
    required: true,
    description: "Ranking validation — order declared",
  },
  {
    id: "DEC-SVL-006",
    simulationRef: "DEC-SIM-006",
    validationKind: "forecast",
    passCondition: "forecast-bounds-declared",
    required: true,
    description: "Forecast validation — bounds declared",
  },
  {
    id: "DEC-SVL-007",
    simulationRef: "DEC-SIM-007",
    validationKind: "sensitivity",
    passCondition: "sensitivity-range-documented",
    required: true,
    description: "Sensitivity validation — range documented",
  },
  {
    id: "DEC-SVL-008",
    simulationRef: "DEC-SIM-008",
    validationKind: "rollbackPreview",
    passCondition: "rollback-preview-complete",
    required: true,
    description: "RollbackPreview validation — preview complete",
  },
];

export function isDecisionSimulationCatalogRefsAligned(): boolean {
  const inputIds = new Set(DECISION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(DECISION_OUTPUT_CATALOG.map((o) => o.id));
  const evaluationIds = new Set(EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const contextIds = new Set(CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(SIMULATION_VALIDATION_CATALOG.map((v) => v.id));
  const simulationIds = new Set(SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const types = new Set(SIMULATION_CATALOG_ENTRIES.map((s) => s.type));

  const simulationsAligned = SIMULATION_CATALOG_ENTRIES.every(
    (s) =>
      evaluationIds.has(s.evaluationRef) &&
      contextIds.has(s.contextRef) &&
      validationIds.has(s.validation) &&
      s.inputs.every((i) => inputIds.has(i)) &&
      s.outputs.every((o) => outputIds.has(o)) &&
      s.assumptions.length >= 1 &&
      s.expectedResult.length > 0,
  );

  const validationsAligned = SIMULATION_VALIDATION_CATALOG.every((v) =>
    simulationIds.has(v.simulationRef),
  );

  const typesComplete = REQUIRED_TYPES.every((t) => types.has(t));

  return (
    simulationsAligned &&
    validationsAligned &&
    typesComplete &&
    SIMULATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildSimulationCatalogManifest(): SimulationCatalogManifest {
  const simulations = SIMULATION_CATALOG_ENTRIES;
  const types = new Set(simulations.map((s) => s.type));
  const catalogComplete =
    simulations.length === 8 && REQUIRED_TYPES.every((t) => types.has(t));

  return {
    version: V74_DECISION_SIMULATION_VERSION,
    entryCount: simulations.length,
    typeCount: types.size,
    catalogComplete,
    simulations,
    summary: [
      `decision-simulation-catalog count=${simulations.length}`,
      `types=${types.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildSimulationValidationManifest(): SimulationValidationManifest {
  const validations = SIMULATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V74_DECISION_SIMULATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `decision-simulation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getSimulationCatalogEntryById(id: string): SimulationCatalogEntry | undefined {
  return SIMULATION_CATALOG_ENTRIES.find((s) => s.id === id);
}

export function getSimulationCatalogEntriesByType(
  type: SimulationTypeKind,
): SimulationCatalogEntry[] {
  return SIMULATION_CATALOG_ENTRIES.filter((s) => s.type === type);
}

export function getSimulationValidationBySimulationRef(
  simulationRef: string,
): SimulationValidation | undefined {
  return SIMULATION_VALIDATION_CATALOG.find((v) => v.simulationRef === simulationRef);
}

export function computeDeclarativeSimulationDeclared(input: {
  type: SimulationTypeKind;
  expectedResult: string;
}): boolean {
  return input.type === "dryRun" && input.expectedResult.length > 0;
}
