/**
 * V75 P6 — Agent simulation catalog (declarative)
 */
import { AGENT_CONTEXT_CATALOG_ENTRIES } from "./agent.context.catalog";
import { AGENT_EVALUATION_CATALOG_ENTRIES } from "./agent.evaluation.catalog";
import { AGENT_INPUT_CATALOG, AGENT_OUTPUT_CATALOG } from "./agent.inventory";
import type {
  AgentSimulationCatalogEntry,
  AgentSimulationCatalogManifest,
  AgentSimulationTypeKind,
  AgentSimulationValidation,
  AgentSimulationValidationManifest,
} from "./agent.simulation";
import { V75_AGENT_SIMULATION_VERSION } from "./agent.simulation";

const REQUIRED_TYPES: AgentSimulationTypeKind[] = [
  "dryRun",
  "scenario",
  "alternative",
  "comparison",
  "ranking",
  "forecast",
  "sensitivity",
  "rollbackPreview",
];

export const AGENT_SIMULATION_CATALOG_ENTRIES: AgentSimulationCatalogEntry[] = [
  {
    id: "AGT-SIM-001",
    type: "dryRun",
    scenario: "inventory-readiness-dry-run",
    purpose: "Declarative dry-run of inventory readiness without side effects",
    inputs: ["AGT-INP-001"],
    outputs: ["AGT-OUT-001"],
    branches: ["proceed", "hold"],
    assumptions: ["no-runtime-execution", "declarative-only"],
    expectedResult: "readiness-score=100",
    priority: "high",
    validation: "AGT-SVL-001",
    evaluationRef: "AGT-EVAL-001",
    contextRef: "AGT-CTX-005",
    required: true,
    description: "DryRun — inventory readiness dry-run simulation",
  },
  {
    id: "AGT-SIM-002",
    type: "scenario",
    scenario: "compliance-escalation-path",
    purpose: "Scenario model for compliance readiness escalation path",
    inputs: ["AGT-INP-005"],
    outputs: ["AGT-OUT-005"],
    branches: ["escalate", "defer", "resolve"],
    assumptions: ["compliance-readiness-bounded", "priority-ranked"],
    expectedResult: "escalation-path-documented",
    priority: "critical",
    validation: "AGT-SVL-002",
    evaluationRef: "AGT-EVAL-003",
    contextRef: "AGT-CTX-003",
    required: true,
    description: "Scenario — compliance escalation scenario simulation",
  },
  {
    id: "AGT-SIM-003",
    type: "alternative",
    scenario: "context-skip-alternative",
    purpose: "Alternative path when context skip is triggered",
    inputs: ["AGT-INP-004"],
    outputs: ["AGT-OUT-004"],
    branches: ["skip", "retry", "fallback"],
    assumptions: ["incompatible-pair-skipped", "quality-gate-pass"],
    expectedResult: "alternative-path-selected",
    priority: "high",
    validation: "AGT-SVL-003",
    evaluationRef: "AGT-EVAL-004",
    contextRef: "AGT-CTX-004",
    required: true,
    description: "Alternative — context skip alternative simulation",
  },
  {
    id: "AGT-SIM-004",
    type: "comparison",
    scenario: "dependency-graph-comparison",
    purpose: "Compare dependency acyclic vs cyclic graph outcomes",
    inputs: ["AGT-INP-002"],
    outputs: ["AGT-OUT-002"],
    branches: ["acyclic", "cyclic-reject"],
    assumptions: ["acyclic-graph-required", "cost-within-budget"],
    expectedResult: "acyclic-preferred",
    priority: "medium",
    validation: "AGT-SVL-004",
    evaluationRef: "AGT-EVAL-005",
    contextRef: "AGT-CTX-002",
    required: true,
    description: "Comparison — dependency graph comparison simulation",
  },
  {
    id: "AGT-SIM-005",
    type: "ranking",
    scenario: "policy-candidate-ranking",
    purpose: "Rank policy candidates by declared priority",
    inputs: ["AGT-INP-003"],
    outputs: ["AGT-OUT-003"],
    branches: ["rank-asc", "rank-desc", "tie-break"],
    assumptions: ["policy-gate-enforced", "priority-declared"],
    expectedResult: "ranked-candidate-list",
    priority: "high",
    validation: "AGT-SVL-005",
    evaluationRef: "AGT-EVAL-006",
    contextRef: "AGT-CTX-003",
    required: true,
    description: "Ranking — policy candidate ranking simulation",
  },
  {
    id: "AGT-SIM-006",
    type: "forecast",
    scenario: "session-transition-forecast",
    purpose: "Forecast session transition impact without execution",
    inputs: ["AGT-INP-006"],
    outputs: ["AGT-OUT-006"],
    branches: ["transition", "hold", "rollback"],
    assumptions: ["session-state-documented", "impact-bounded"],
    expectedResult: "transition-impact-forecast",
    priority: "medium",
    validation: "AGT-SVL-006",
    evaluationRef: "AGT-EVAL-007",
    contextRef: "AGT-CTX-007",
    required: true,
    description: "Forecast — session transition forecast simulation",
  },
  {
    id: "AGT-SIM-007",
    type: "sensitivity",
    scenario: "confidence-threshold-sensitivity",
    purpose: "Sensitivity analysis on confidence threshold changes",
    inputs: ["AGT-INP-007"],
    outputs: ["AGT-OUT-007"],
    branches: ["low", "medium", "high"],
    assumptions: ["confidence-threshold-fixed", "no-ai-inference"],
    expectedResult: "sensitivity-bounds-documented",
    priority: "high",
    validation: "AGT-SVL-007",
    evaluationRef: "AGT-EVAL-002",
    contextRef: "AGT-CTX-008",
    required: true,
    description: "Sensitivity — confidence threshold sensitivity simulation",
  },
  {
    id: "AGT-SIM-008",
    type: "rollbackPreview",
    scenario: "frozen-layer-rollback-preview",
    purpose: "Preview rollback paths without modifying frozen layers",
    inputs: ["AGT-INP-008"],
    outputs: ["AGT-OUT-008"],
    branches: ["rollback-p1", "rollback-pkg", "no-rollback"],
    assumptions: ["v48-v74-frozen", "rollback-index-complete"],
    expectedResult: "rollback-path-preview",
    priority: "critical",
    validation: "AGT-SVL-008",
    evaluationRef: "AGT-EVAL-008",
    contextRef: "AGT-CTX-001",
    required: true,
    description: "RollbackPreview — declarative rollback preview simulation",
  },
];

export const AGENT_SIMULATION_VALIDATION_CATALOG: AgentSimulationValidation[] = [
  {
    id: "AGT-SVL-001",
    simulationRef: "AGT-SIM-001",
    validationKind: "dryRun",
    passCondition: "dry-run-declared-no-side-effects",
    required: true,
    description: "DryRun validation — no side effects declared",
  },
  {
    id: "AGT-SVL-002",
    simulationRef: "AGT-SIM-002",
    validationKind: "scenario",
    passCondition: "scenario-path-documented",
    required: true,
    description: "Scenario validation — path documented",
  },
  {
    id: "AGT-SVL-003",
    simulationRef: "AGT-SIM-003",
    validationKind: "alternative",
    passCondition: "alternative-path-declared",
    required: true,
    description: "Alternative validation — path declared",
  },
  {
    id: "AGT-SVL-004",
    simulationRef: "AGT-SIM-004",
    validationKind: "comparison",
    passCondition: "comparison-outcomes-documented",
    required: true,
    description: "Comparison validation — outcomes documented",
  },
  {
    id: "AGT-SVL-005",
    simulationRef: "AGT-SIM-005",
    validationKind: "ranking",
    passCondition: "ranking-order-declared",
    required: true,
    description: "Ranking validation — order declared",
  },
  {
    id: "AGT-SVL-006",
    simulationRef: "AGT-SIM-006",
    validationKind: "forecast",
    passCondition: "forecast-bounds-declared",
    required: true,
    description: "Forecast validation — bounds declared",
  },
  {
    id: "AGT-SVL-007",
    simulationRef: "AGT-SIM-007",
    validationKind: "sensitivity",
    passCondition: "sensitivity-range-documented",
    required: true,
    description: "Sensitivity validation — range documented",
  },
  {
    id: "AGT-SVL-008",
    simulationRef: "AGT-SIM-008",
    validationKind: "rollbackPreview",
    passCondition: "rollback-preview-complete",
    required: true,
    description: "RollbackPreview validation — preview complete",
  },
];

export function isAgentSimulationCatalogRefsAligned(): boolean {
  const inputIds = new Set(AGENT_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(AGENT_OUTPUT_CATALOG.map((o) => o.id));
  const evaluationIds = new Set(AGENT_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const contextIds = new Set(AGENT_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(AGENT_SIMULATION_VALIDATION_CATALOG.map((v) => v.id));
  const simulationIds = new Set(AGENT_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const types = new Set(AGENT_SIMULATION_CATALOG_ENTRIES.map((s) => s.type));

  const simulationsAligned = AGENT_SIMULATION_CATALOG_ENTRIES.every(
    (s) =>
      evaluationIds.has(s.evaluationRef) &&
      contextIds.has(s.contextRef) &&
      validationIds.has(s.validation) &&
      s.inputs.every((i) => inputIds.has(i)) &&
      s.outputs.every((o) => outputIds.has(o)) &&
      s.assumptions.length >= 1 &&
      s.branches.length >= 1 &&
      s.scenario.length > 0 &&
      s.expectedResult.length > 0,
  );

  const validationsAligned = AGENT_SIMULATION_VALIDATION_CATALOG.every((v) =>
    simulationIds.has(v.simulationRef),
  );

  const typesComplete = REQUIRED_TYPES.every((t) => types.has(t));

  return (
    simulationsAligned &&
    validationsAligned &&
    typesComplete &&
    AGENT_SIMULATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildAgentSimulationCatalogManifest(): AgentSimulationCatalogManifest {
  const simulations = AGENT_SIMULATION_CATALOG_ENTRIES;
  const types = new Set(simulations.map((s) => s.type));
  const catalogComplete =
    simulations.length === 8 && REQUIRED_TYPES.every((t) => types.has(t));

  return {
    version: V75_AGENT_SIMULATION_VERSION,
    entryCount: simulations.length,
    typeCount: types.size,
    catalogComplete,
    simulations,
    summary: [
      `agent-simulation-catalog count=${simulations.length}`,
      `types=${types.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentSimulationValidationManifest(): AgentSimulationValidationManifest {
  const validations = AGENT_SIMULATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V75_AGENT_SIMULATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `agent-simulation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAgentSimulationCatalogEntryById(
  id: string,
): AgentSimulationCatalogEntry | undefined {
  return AGENT_SIMULATION_CATALOG_ENTRIES.find((s) => s.id === id);
}

export function getAgentSimulationCatalogEntriesByType(
  type: AgentSimulationTypeKind,
): AgentSimulationCatalogEntry[] {
  return AGENT_SIMULATION_CATALOG_ENTRIES.filter((s) => s.type === type);
}

export function getAgentSimulationValidationBySimulationRef(
  simulationRef: string,
): AgentSimulationValidation | undefined {
  return AGENT_SIMULATION_VALIDATION_CATALOG.find((v) => v.simulationRef === simulationRef);
}

export function computeAgentDeclarativeSimulationDeclared(input: {
  type: AgentSimulationTypeKind;
  expectedResult: string;
}): boolean {
  return input.type === "dryRun" && input.expectedResult.length > 0;
}
