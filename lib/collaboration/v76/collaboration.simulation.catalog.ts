/**
 * V76 P6 — Collaboration simulation catalog (declarative)
 */
import { COLLABORATION_CONTEXT_CATALOG_ENTRIES } from "./collaboration.context.catalog";
import { COLLABORATION_EVALUATION_CATALOG_ENTRIES } from "./collaboration.evaluation.catalog";
import { COLLABORATION_INPUT_CATALOG, COLLABORATION_OUTPUT_CATALOG } from "./collaboration.inventory";
import type {
  CollaborationSimulationCatalogEntry,
  CollaborationSimulationCatalogManifest,
  CollaborationSimulationKind,
  CollaborationSimulationValidation,
  CollaborationSimulationValidationManifest,
} from "./collaboration.simulation";
import { V76_COLLABORATION_SIMULATION_VERSION } from "./collaboration.simulation";

const REQUIRED_KINDS: CollaborationSimulationKind[] = [
  "shared",
  "topology",
  "communication",
  "delegation",
  "coordination",
  "governance",
  "workspace",
  "boundary",
];

export const COLLABORATION_SIMULATION_CATALOG_ENTRIES: CollaborationSimulationCatalogEntry[] = [
  {
    id: "COL-SIM-001",
    kind: "shared",
    scenario: "shared-baseline-dry-run",
    purpose: "Declarative dry-run of shared collaboration baseline without side effects",
    inputs: ["COL-INP-001"],
    outputs: ["COL-OUT-001"],
    branches: ["proceed", "hold"],
    assumptions: ["no-runtime-execution", "declarative-only"],
    expectedResult: "upstream-agent-freeze-intact",
    priority: "high",
    validation: "COL-SVL-001",
    evaluationRef: "COL-EVAL-001",
    contextRef: "COL-CTX-001",
    required: true,
    description: "Shared simulation — baseline dry-run rules",
  },
  {
    id: "COL-SIM-002",
    kind: "topology",
    scenario: "acyclic-topology-scenario",
    purpose: "Scenario model for acyclic vs cyclic topology outcomes",
    inputs: ["COL-INP-002"],
    outputs: ["COL-OUT-002"],
    branches: ["acyclic", "cyclic-reject"],
    assumptions: ["acyclic-topology-required", "cycle-count=0"],
    expectedResult: "acyclic-topology-required",
    priority: "critical",
    validation: "COL-SVL-002",
    evaluationRef: "COL-EVAL-002",
    contextRef: "COL-CTX-002",
    required: true,
    description: "Topology simulation — acyclic graph scenario rules",
  },
  {
    id: "COL-SIM-003",
    kind: "communication",
    scenario: "communication-contract-path",
    purpose: "Simulate communication contract pass and violation paths",
    inputs: ["COL-INP-003"],
    outputs: ["COL-OUT-003"],
    branches: ["pass", "violation-block"],
    assumptions: ["communication-contract-required", "contract-pass-rate=100"],
    expectedResult: "communication-contract-pass",
    priority: "critical",
    validation: "COL-SVL-003",
    evaluationRef: "COL-EVAL-003",
    contextRef: "COL-CTX-003",
    required: true,
    description: "Communication simulation — contract enforcement rules",
  },
  {
    id: "COL-SIM-004",
    kind: "delegation",
    scenario: "delegation-boundary-alternative",
    purpose: "Alternative paths when delegation boundary is incomplete",
    inputs: ["COL-INP-004"],
    outputs: ["COL-OUT-004"],
    branches: ["complete", "escalate", "reject"],
    assumptions: ["delegation-boundary-required", "boundary-coverage=100"],
    expectedResult: "delegation-boundary-intact",
    priority: "high",
    validation: "COL-SVL-004",
    evaluationRef: "COL-EVAL-004",
    contextRef: "COL-CTX-004",
    required: true,
    description: "Delegation simulation — boundary alternative rules",
  },
  {
    id: "COL-SIM-005",
    kind: "coordination",
    scenario: "coordination-readiness-ranking",
    purpose: "Rank coordination readiness candidates by declared priority",
    inputs: ["COL-INP-005"],
    outputs: ["COL-OUT-005"],
    branches: ["rank-asc", "rank-desc", "tie-break"],
    assumptions: ["coordination-readiness-bounded", "priority-ranked"],
    expectedResult: "coordination-readiness-bounded",
    priority: "medium",
    validation: "COL-SVL-005",
    evaluationRef: "COL-EVAL-005",
    contextRef: "COL-CTX-005",
    required: true,
    description: "Coordination simulation — readiness ranking rules",
  },
  {
    id: "COL-SIM-006",
    kind: "governance",
    scenario: "governance-checklist-forecast",
    purpose: "Forecast governance checklist completion without execution",
    inputs: ["COL-INP-007"],
    outputs: ["COL-OUT-007"],
    branches: ["complete", "incomplete-block"],
    assumptions: ["governance-checklist-required", "checklist-complete=100"],
    expectedResult: "governance-checklist-required",
    priority: "high",
    validation: "COL-SVL-006",
    evaluationRef: "COL-EVAL-006",
    contextRef: "COL-CTX-007",
    required: true,
    description: "Governance simulation — checklist forecast rules",
  },
  {
    id: "COL-SIM-007",
    kind: "workspace",
    scenario: "inventory-catalog-comparison",
    purpose: "Compare catalog complete vs incomplete workspace outcomes",
    inputs: ["COL-INP-008"],
    outputs: ["COL-OUT-008"],
    branches: ["complete", "incomplete-hold"],
    assumptions: ["inventory-catalog-complete", "catalog-complete=100"],
    expectedResult: "inventory-catalog-complete",
    priority: "high",
    validation: "COL-SVL-007",
    evaluationRef: "COL-EVAL-007",
    contextRef: "COL-CTX-008",
    required: true,
    description: "Workspace simulation — inventory catalog comparison rules",
  },
  {
    id: "COL-SIM-008",
    kind: "boundary",
    scenario: "no-runtime-rollback-preview",
    purpose: "Preview rollback paths without modifying frozen layers",
    inputs: ["COL-INP-008"],
    outputs: ["COL-OUT-008"],
    branches: ["rollback-p1", "rollback-pkg", "no-rollback"],
    assumptions: ["v48-v75-frozen", "declarative-only=true"],
    expectedResult: "no-runtime-execution",
    priority: "critical",
    validation: "COL-SVL-008",
    evaluationRef: "COL-EVAL-008",
    contextRef: "COL-CTX-008",
    required: true,
    description: "Boundary simulation — no-runtime rollback preview rules",
  },
];

export const COLLABORATION_SIMULATION_VALIDATION_CATALOG: CollaborationSimulationValidation[] = [
  {
    id: "COL-SVL-001",
    simulationRef: "COL-SIM-001",
    validationKind: "shared",
    passCondition: "shared-simulation-declared-no-side-effects",
    required: true,
    description: "Shared simulation validation — no side effects declared",
  },
  {
    id: "COL-SVL-002",
    simulationRef: "COL-SIM-002",
    validationKind: "topology",
    passCondition: "topology-scenario-documented",
    required: true,
    description: "Topology simulation validation — scenario documented",
  },
  {
    id: "COL-SVL-003",
    simulationRef: "COL-SIM-003",
    validationKind: "communication",
    passCondition: "communication-path-declared",
    required: true,
    description: "Communication simulation validation — path declared",
  },
  {
    id: "COL-SVL-004",
    simulationRef: "COL-SIM-004",
    validationKind: "delegation",
    passCondition: "delegation-alternatives-documented",
    required: true,
    description: "Delegation simulation validation — alternatives documented",
  },
  {
    id: "COL-SVL-005",
    simulationRef: "COL-SIM-005",
    validationKind: "coordination",
    passCondition: "coordination-ranking-declared",
    required: true,
    description: "Coordination simulation validation — ranking declared",
  },
  {
    id: "COL-SVL-006",
    simulationRef: "COL-SIM-006",
    validationKind: "governance",
    passCondition: "governance-forecast-documented",
    required: true,
    description: "Governance simulation validation — forecast documented",
  },
  {
    id: "COL-SVL-007",
    simulationRef: "COL-SIM-007",
    validationKind: "workspace",
    passCondition: "workspace-comparison-documented",
    required: true,
    description: "Workspace simulation validation — comparison documented",
  },
  {
    id: "COL-SVL-008",
    simulationRef: "COL-SIM-008",
    validationKind: "boundary",
    passCondition: "rollback-preview-complete",
    required: true,
    description: "Boundary simulation validation — rollback preview complete",
  },
];

export function isCollaborationSimulationCatalogRefsAligned(): boolean {
  const inputIds = new Set(COLLABORATION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(COLLABORATION_OUTPUT_CATALOG.map((o) => o.id));
  const evaluationIds = new Set(COLLABORATION_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const contextIds = new Set(COLLABORATION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(COLLABORATION_SIMULATION_VALIDATION_CATALOG.map((v) => v.id));
  const simulationIds = new Set(COLLABORATION_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const kinds = new Set(COLLABORATION_SIMULATION_CATALOG_ENTRIES.map((s) => s.kind));

  const simulationsAligned = COLLABORATION_SIMULATION_CATALOG_ENTRIES.every(
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

  const validationsAligned = COLLABORATION_SIMULATION_VALIDATION_CATALOG.every((v) =>
    simulationIds.has(v.simulationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    simulationsAligned &&
    validationsAligned &&
    kindsComplete &&
    COLLABORATION_SIMULATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildCollaborationSimulationCatalogManifest(): CollaborationSimulationCatalogManifest {
  const simulations = COLLABORATION_SIMULATION_CATALOG_ENTRIES;
  const kinds = new Set(simulations.map((s) => s.kind));
  const catalogComplete =
    simulations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V76_COLLABORATION_SIMULATION_VERSION,
    entryCount: simulations.length,
    kindCount: kinds.size,
    catalogComplete,
    simulations,
    summary: [
      `collaboration-simulation-catalog count=${simulations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationSimulationValidationManifest(): CollaborationSimulationValidationManifest {
  const validations = COLLABORATION_SIMULATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V76_COLLABORATION_SIMULATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `collaboration-simulation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCollaborationSimulationCatalogEntryById(
  id: string,
): CollaborationSimulationCatalogEntry | undefined {
  return COLLABORATION_SIMULATION_CATALOG_ENTRIES.find((s) => s.id === id);
}

export function getCollaborationSimulationCatalogEntriesByKind(
  kind: CollaborationSimulationKind,
): CollaborationSimulationCatalogEntry[] {
  return COLLABORATION_SIMULATION_CATALOG_ENTRIES.filter((s) => s.kind === kind);
}

export function getCollaborationSimulationValidationBySimulationRef(
  simulationRef: string,
): CollaborationSimulationValidation | undefined {
  return COLLABORATION_SIMULATION_VALIDATION_CATALOG.find((v) => v.simulationRef === simulationRef);
}

export function computeCollaborationDeclarativeSimulationDeclared(input: {
  kind: CollaborationSimulationKind;
  expectedResult: string;
}): boolean {
  return input.kind === "shared" && input.expectedResult.length > 0;
}
