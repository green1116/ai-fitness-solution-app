/**
 * V79 P6 — Task simulation catalog (declarative)
 */
import { TASK_CONTEXT_CATALOG_ENTRIES } from "./task.context.catalog";
import { TASK_EVALUATION_CATALOG_ENTRIES } from "./task.evaluation.catalog";
import { TASK_UPSTREAM_DEPENDENCIES } from "./task.dependencies";
import { TASK_ROLE_CATALOG, TASK_TOPOLOGY_CATALOG } from "./task.inventory";
import { TASK_STATE_CATALOG } from "./task.state";
import type {
  TaskSimulationCatalogEntry,
  TaskSimulationCatalogManifest,
  TaskSimulationKind,
  TaskSimulationValidation,
  TaskSimulationValidationManifest,
} from "./task.simulation";
import { V79_TASK_SIMULATION_VERSION } from "./task.simulation";

const REQUIRED_KINDS: TaskSimulationKind[] = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
];

export const TASK_SIMULATION_CATALOG_ENTRIES: TaskSimulationCatalogEntry[] = [
  {
    id: "TSK-SIM-001",
    kind: "shared",
    scenario: "shared-baseline-dry-run",
    purpose: "Declarative dry-run of shared task baseline without side effects",
    roleRef: "TSK-ROL-001",
    stateRef: "TSK-STA-001",
    topologyRef: "TSK-TOP-001",
    dependencyRef: "TSK-DEP-001",
    branches: ["proceed", "hold"],
    assumptions: ["no-runtime-task-engine", "declarative-only"],
    expectedResult: "upstream-execution-freeze-intact",
    priority: "high",
    validation: "TSK-SVL-001",
    evaluationRef: "TSK-EVAL-001",
    contextRef: "TSK-CTX-001",
    required: true,
    description: "Shared simulation — baseline dry-run rules",
  },
  {
    id: "TSK-SIM-002",
    kind: "role",
    scenario: "role-assignment-alternative",
    purpose: "Alternative paths when task role assignment is incomplete",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-002",
    topologyRef: "TSK-TOP-002",
    dependencyRef: "TSK-DEP-002",
    branches: ["complete", "escalate", "reject"],
    assumptions: ["task-role-defined", "role-coverage=100"],
    expectedResult: "task-role-defined",
    priority: "high",
    validation: "TSK-SVL-002",
    evaluationRef: "TSK-EVAL-002",
    contextRef: "TSK-CTX-002",
    required: true,
    description: "Role simulation — assignment alternative rules",
  },
  {
    id: "TSK-SIM-003",
    kind: "state",
    scenario: "lifecycle-state-transition",
    purpose: "Scenario model for task state transition paths without runtime engine",
    roleRef: "TSK-ROL-003",
    stateRef: "TSK-STA-004",
    topologyRef: "TSK-TOP-003",
    dependencyRef: "TSK-DEP-003",
    branches: ["active", "blocked", "completed"],
    assumptions: ["task-state-documented", "state-coverage=100"],
    expectedResult: "task-state-documented",
    priority: "critical",
    validation: "TSK-SVL-003",
    evaluationRef: "TSK-EVAL-003",
    contextRef: "TSK-CTX-003",
    required: true,
    description: "State simulation — lifecycle transition rules",
  },
  {
    id: "TSK-SIM-004",
    kind: "topology",
    scenario: "acyclic-topology-scenario",
    purpose: "Scenario model for acyclic vs cyclic task topology outcomes",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-003",
    topologyRef: "TSK-TOP-002",
    dependencyRef: "TSK-DEP-004",
    branches: ["acyclic", "cyclic-reject"],
    assumptions: ["acyclic-topology-required", "cycle-count=0"],
    expectedResult: "acyclic-topology-required",
    priority: "critical",
    validation: "TSK-SVL-004",
    evaluationRef: "TSK-EVAL-004",
    contextRef: "TSK-CTX-004",
    required: true,
    description: "Topology simulation — acyclic graph scenario rules",
  },
  {
    id: "TSK-SIM-005",
    kind: "scope",
    scenario: "scope-boundary-comparison",
    purpose: "Compare bounded vs unbounded task scope outcomes",
    roleRef: "TSK-ROL-005",
    stateRef: "TSK-STA-006",
    topologyRef: "TSK-TOP-005",
    dependencyRef: "TSK-DEP-006",
    branches: ["bounded", "unbounded-reject"],
    assumptions: ["task-scope-bounded", "scope-coverage=100"],
    expectedResult: "task-scope-bounded",
    priority: "high",
    validation: "TSK-SVL-005",
    evaluationRef: "TSK-EVAL-005",
    contextRef: "TSK-CTX-005",
    required: true,
    description: "Scope simulation — boundary comparison rules",
  },
  {
    id: "TSK-SIM-006",
    kind: "dependency",
    scenario: "upstream-dependency-lock-path",
    purpose: "Simulate upstream dependency lock pass and drift paths",
    roleRef: "TSK-ROL-004",
    stateRef: "TSK-STA-005",
    topologyRef: "TSK-TOP-004",
    dependencyRef: "TSK-DEP-005",
    branches: ["lock-intact", "drift-block"],
    assumptions: ["upstream-dependency-intact", "upstream-drift=0"],
    expectedResult: "upstream-dependency-intact",
    priority: "critical",
    validation: "TSK-SVL-006",
    evaluationRef: "TSK-EVAL-006",
    contextRef: "TSK-CTX-006",
    required: true,
    description: "Dependency simulation — upstream lock path rules",
  },
  {
    id: "TSK-SIM-007",
    kind: "governance",
    scenario: "governance-rules-forecast",
    purpose: "Forecast governance rules completeness without task engine",
    roleRef: "TSK-ROL-007",
    stateRef: "TSK-STA-007",
    topologyRef: "TSK-TOP-007",
    dependencyRef: "TSK-DEP-002",
    branches: ["complete", "incomplete-block"],
    assumptions: ["governance-rules-documented", "checklist-complete=100"],
    expectedResult: "governance-rules-documented",
    priority: "high",
    validation: "TSK-SVL-007",
    evaluationRef: "TSK-EVAL-007",
    contextRef: "TSK-CTX-007",
    required: true,
    description: "Governance simulation — rules forecast rules",
  },
  {
    id: "TSK-SIM-008",
    kind: "boundary",
    scenario: "no-runtime-rollback-preview",
    purpose: "Preview rollback paths without modifying frozen layers",
    roleRef: "TSK-ROL-008",
    stateRef: "TSK-STA-008",
    topologyRef: "TSK-TOP-008",
    dependencyRef: "TSK-DEP-008",
    branches: ["rollback-p1", "rollback-pkg", "no-rollback"],
    assumptions: ["v48-v79-p5-frozen", "declarative-only=true"],
    expectedResult: "no-runtime-task-engine",
    priority: "critical",
    validation: "TSK-SVL-008",
    evaluationRef: "TSK-EVAL-008",
    contextRef: "TSK-CTX-008",
    required: true,
    description: "Boundary simulation — no-runtime rollback preview rules",
  },
];

export const TASK_SIMULATION_VALIDATION_CATALOG: TaskSimulationValidation[] = [
  {
    id: "TSK-SVL-001",
    simulationRef: "TSK-SIM-001",
    validationKind: "shared",
    passCondition: "shared-simulation-declared-no-side-effects",
    required: true,
    description: "Shared simulation validation — no side effects declared",
  },
  {
    id: "TSK-SVL-002",
    simulationRef: "TSK-SIM-002",
    validationKind: "role",
    passCondition: "role-alternatives-documented",
    required: true,
    description: "Role simulation validation — alternatives documented",
  },
  {
    id: "TSK-SVL-003",
    simulationRef: "TSK-SIM-003",
    validationKind: "state",
    passCondition: "state-transition-documented",
    required: true,
    description: "State simulation validation — transitions documented",
  },
  {
    id: "TSK-SVL-004",
    simulationRef: "TSK-SIM-004",
    validationKind: "topology",
    passCondition: "topology-scenario-documented",
    required: true,
    description: "Topology simulation validation — scenario documented",
  },
  {
    id: "TSK-SVL-005",
    simulationRef: "TSK-SIM-005",
    validationKind: "scope",
    passCondition: "scope-comparison-documented",
    required: true,
    description: "Scope simulation validation — comparison documented",
  },
  {
    id: "TSK-SVL-006",
    simulationRef: "TSK-SIM-006",
    validationKind: "dependency",
    passCondition: "dependency-path-declared",
    required: true,
    description: "Dependency simulation validation — path declared",
  },
  {
    id: "TSK-SVL-007",
    simulationRef: "TSK-SIM-007",
    validationKind: "governance",
    passCondition: "governance-forecast-documented",
    required: true,
    description: "Governance simulation validation — forecast documented",
  },
  {
    id: "TSK-SVL-008",
    simulationRef: "TSK-SIM-008",
    validationKind: "boundary",
    passCondition: "rollback-preview-complete",
    required: true,
    description: "Boundary simulation validation — rollback preview complete",
  },
];

export function isTaskSimulationCatalogRefsAligned(): boolean {
  const roleIds = new Set(TASK_ROLE_CATALOG.map((r) => r.id));
  const stateIds = new Set(TASK_STATE_CATALOG.map((s) => s.id));
  const topologyIds = new Set(TASK_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(TASK_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const evaluationIds = new Set(TASK_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const contextIds = new Set(TASK_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(TASK_SIMULATION_VALIDATION_CATALOG.map((v) => v.id));
  const simulationIds = new Set(TASK_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const kinds = new Set(TASK_SIMULATION_CATALOG_ENTRIES.map((s) => s.kind));

  const simulationsAligned = TASK_SIMULATION_CATALOG_ENTRIES.every(
    (s) =>
      evaluationIds.has(s.evaluationRef) &&
      contextIds.has(s.contextRef) &&
      validationIds.has(s.validation) &&
      roleIds.has(s.roleRef) &&
      stateIds.has(s.stateRef) &&
      topologyIds.has(s.topologyRef) &&
      depIds.has(s.dependencyRef) &&
      s.assumptions.length >= 1 &&
      s.branches.length >= 1 &&
      s.scenario.length > 0 &&
      s.expectedResult.length > 0,
  );

  const validationsAligned = TASK_SIMULATION_VALIDATION_CATALOG.every((v) =>
    simulationIds.has(v.simulationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    simulationsAligned &&
    validationsAligned &&
    kindsComplete &&
    TASK_SIMULATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildTaskSimulationCatalogManifest(): TaskSimulationCatalogManifest {
  const simulations = TASK_SIMULATION_CATALOG_ENTRIES;
  const kinds = new Set(simulations.map((s) => s.kind));
  const catalogComplete =
    simulations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_SIMULATION_VERSION,
    entryCount: simulations.length,
    kindCount: kinds.size,
    catalogComplete,
    simulations,
    summary: [
      `task-simulation-catalog count=${simulations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskSimulationValidationManifest(): TaskSimulationValidationManifest {
  const validations = TASK_SIMULATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V79_TASK_SIMULATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `task-simulation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskSimulationCatalogEntryById(
  id: string,
): TaskSimulationCatalogEntry | undefined {
  return TASK_SIMULATION_CATALOG_ENTRIES.find((s) => s.id === id);
}

export function getTaskSimulationCatalogEntriesByKind(
  kind: TaskSimulationKind,
): TaskSimulationCatalogEntry[] {
  return TASK_SIMULATION_CATALOG_ENTRIES.filter((s) => s.kind === kind);
}

export function getTaskSimulationValidationBySimulationRef(
  simulationRef: string,
): TaskSimulationValidation | undefined {
  return TASK_SIMULATION_VALIDATION_CATALOG.find((v) => v.simulationRef === simulationRef);
}

export function computeTaskDeclarativeSimulationDeclared(input: {
  kind: TaskSimulationKind;
  expectedResult: string;
}): boolean {
  return input.kind === "shared" && input.expectedResult.length > 0;
}
