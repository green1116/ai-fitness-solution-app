/**
 * V77 P6 — Planning simulation catalog (declarative)
 */
import { PLANNING_CONTEXT_CATALOG_ENTRIES } from "./planning.context.catalog";
import { PLANNING_EVALUATION_CATALOG_ENTRIES } from "./planning.evaluation.catalog";
import { PLANNING_UPSTREAM_DEPENDENCIES } from "./planning.dependencies";
import {
  PLANNING_ROLE_CATALOG,
  PLANNING_TOPOLOGY_CATALOG,
} from "./planning.inventory";
import type {
  PlanningSimulationCatalogEntry,
  PlanningSimulationCatalogManifest,
  PlanningSimulationKind,
  PlanningSimulationValidation,
  PlanningSimulationValidationManifest,
} from "./planning.simulation";
import { V77_PLANNING_SIMULATION_VERSION } from "./planning.simulation";

const REQUIRED_KINDS: PlanningSimulationKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const PLANNING_SIMULATION_CATALOG_ENTRIES: PlanningSimulationCatalogEntry[] = [
  {
    id: "PLN-SIM-001",
    kind: "shared",
    scenario: "shared-baseline-dry-run",
    purpose: "Declarative dry-run of shared planning baseline without side effects",
    roleRef: "PLN-ROL-001",
    topologyRef: "PLN-TOP-001",
    dependencyRef: "PLN-DEP-001",
    branches: ["proceed", "hold"],
    assumptions: ["no-runtime-planning", "declarative-only"],
    expectedResult: "upstream-collaboration-freeze-intact",
    priority: "high",
    validation: "PLN-SVL-001",
    evaluationRef: "PLN-EVAL-001",
    contextRef: "PLN-CTX-001",
    required: true,
    description: "Shared simulation — baseline dry-run rules",
  },
  {
    id: "PLN-SIM-002",
    kind: "role",
    scenario: "role-assignment-alternative",
    purpose: "Alternative paths when planning role assignment is incomplete",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    dependencyRef: "PLN-DEP-002",
    branches: ["complete", "escalate", "reject"],
    assumptions: ["planning-role-defined", "role-coverage=100"],
    expectedResult: "planning-role-defined",
    priority: "high",
    validation: "PLN-SVL-002",
    evaluationRef: "PLN-EVAL-002",
    contextRef: "PLN-CTX-002",
    required: true,
    description: "Role simulation — assignment alternative rules",
  },
  {
    id: "PLN-SIM-003",
    kind: "topology",
    scenario: "acyclic-topology-scenario",
    purpose: "Scenario model for acyclic vs cyclic topology outcomes",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    dependencyRef: "PLN-DEP-003",
    branches: ["acyclic", "cyclic-reject"],
    assumptions: ["acyclic-topology-required", "cycle-count=0"],
    expectedResult: "acyclic-topology-required",
    priority: "critical",
    validation: "PLN-SVL-003",
    evaluationRef: "PLN-EVAL-003",
    contextRef: "PLN-CTX-003",
    required: true,
    description: "Topology simulation — acyclic graph scenario rules",
  },
  {
    id: "PLN-SIM-004",
    kind: "scope",
    scenario: "scope-boundary-comparison",
    purpose: "Compare bounded vs unbounded planning scope outcomes",
    roleRef: "PLN-ROL-005",
    topologyRef: "PLN-TOP-005",
    dependencyRef: "PLN-DEP-006",
    branches: ["bounded", "unbounded-reject"],
    assumptions: ["planning-scope-bounded", "scope-coverage=100"],
    expectedResult: "planning-scope-bounded",
    priority: "high",
    validation: "PLN-SVL-004",
    evaluationRef: "PLN-EVAL-004",
    contextRef: "PLN-CTX-004",
    required: true,
    description: "Scope simulation — boundary comparison rules",
  },
  {
    id: "PLN-SIM-005",
    kind: "dependency",
    scenario: "upstream-dependency-lock-path",
    purpose: "Simulate upstream dependency lock pass and drift paths",
    roleRef: "PLN-ROL-004",
    topologyRef: "PLN-TOP-004",
    dependencyRef: "PLN-DEP-005",
    branches: ["lock-intact", "drift-block"],
    assumptions: ["upstream-dependency-intact", "upstream-drift=0"],
    expectedResult: "upstream-dependency-intact",
    priority: "critical",
    validation: "PLN-SVL-005",
    evaluationRef: "PLN-EVAL-005",
    contextRef: "PLN-CTX-005",
    required: true,
    description: "Dependency simulation — upstream lock path rules",
  },
  {
    id: "PLN-SIM-006",
    kind: "governance",
    scenario: "governance-rules-forecast",
    purpose: "Forecast governance rules completeness without execution",
    roleRef: "PLN-ROL-007",
    topologyRef: "PLN-TOP-007",
    dependencyRef: "PLN-DEP-004",
    branches: ["complete", "incomplete-block"],
    assumptions: ["governance-rules-documented", "checklist-complete=100"],
    expectedResult: "governance-rules-documented",
    priority: "high",
    validation: "PLN-SVL-006",
    evaluationRef: "PLN-EVAL-006",
    contextRef: "PLN-CTX-006",
    required: true,
    description: "Governance simulation — rules forecast rules",
  },
  {
    id: "PLN-SIM-007",
    kind: "workspace",
    scenario: "inventory-catalog-comparison",
    purpose: "Compare catalog complete vs incomplete workspace outcomes",
    roleRef: "PLN-ROL-006",
    topologyRef: "PLN-TOP-006",
    dependencyRef: "PLN-DEP-008",
    branches: ["complete", "incomplete-hold"],
    assumptions: ["inventory-catalog-complete", "catalog-complete=100"],
    expectedResult: "inventory-catalog-complete",
    priority: "high",
    validation: "PLN-SVL-007",
    evaluationRef: "PLN-EVAL-007",
    contextRef: "PLN-CTX-007",
    required: true,
    description: "Workspace simulation — inventory catalog comparison rules",
  },
  {
    id: "PLN-SIM-008",
    kind: "boundary",
    scenario: "no-runtime-rollback-preview",
    purpose: "Preview rollback paths without modifying frozen layers",
    roleRef: "PLN-ROL-008",
    topologyRef: "PLN-TOP-008",
    dependencyRef: "PLN-DEP-008",
    branches: ["rollback-p1", "rollback-pkg", "no-rollback"],
    assumptions: ["v48-v77-p5-frozen", "declarative-only=true"],
    expectedResult: "no-runtime-planning",
    priority: "critical",
    validation: "PLN-SVL-008",
    evaluationRef: "PLN-EVAL-008",
    contextRef: "PLN-CTX-008",
    required: true,
    description: "Boundary simulation — no-runtime rollback preview rules",
  },
];

export const PLANNING_SIMULATION_VALIDATION_CATALOG: PlanningSimulationValidation[] = [
  {
    id: "PLN-SVL-001",
    simulationRef: "PLN-SIM-001",
    validationKind: "shared",
    passCondition: "shared-simulation-declared-no-side-effects",
    required: true,
    description: "Shared simulation validation — no side effects declared",
  },
  {
    id: "PLN-SVL-002",
    simulationRef: "PLN-SIM-002",
    validationKind: "role",
    passCondition: "role-alternatives-documented",
    required: true,
    description: "Role simulation validation — alternatives documented",
  },
  {
    id: "PLN-SVL-003",
    simulationRef: "PLN-SIM-003",
    validationKind: "topology",
    passCondition: "topology-scenario-documented",
    required: true,
    description: "Topology simulation validation — scenario documented",
  },
  {
    id: "PLN-SVL-004",
    simulationRef: "PLN-SIM-004",
    validationKind: "scope",
    passCondition: "scope-comparison-documented",
    required: true,
    description: "Scope simulation validation — comparison documented",
  },
  {
    id: "PLN-SVL-005",
    simulationRef: "PLN-SIM-005",
    validationKind: "dependency",
    passCondition: "dependency-path-declared",
    required: true,
    description: "Dependency simulation validation — path declared",
  },
  {
    id: "PLN-SVL-006",
    simulationRef: "PLN-SIM-006",
    validationKind: "governance",
    passCondition: "governance-forecast-documented",
    required: true,
    description: "Governance simulation validation — forecast documented",
  },
  {
    id: "PLN-SVL-007",
    simulationRef: "PLN-SIM-007",
    validationKind: "workspace",
    passCondition: "workspace-comparison-documented",
    required: true,
    description: "Workspace simulation validation — comparison documented",
  },
  {
    id: "PLN-SVL-008",
    simulationRef: "PLN-SIM-008",
    validationKind: "boundary",
    passCondition: "rollback-preview-complete",
    required: true,
    description: "Boundary simulation validation — rollback preview complete",
  },
];

export function isPlanningSimulationCatalogRefsAligned(): boolean {
  const roleIds = new Set(PLANNING_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(PLANNING_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(PLANNING_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const evaluationIds = new Set(PLANNING_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const contextIds = new Set(PLANNING_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(PLANNING_SIMULATION_VALIDATION_CATALOG.map((v) => v.id));
  const simulationIds = new Set(PLANNING_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const kinds = new Set(PLANNING_SIMULATION_CATALOG_ENTRIES.map((s) => s.kind));

  const simulationsAligned = PLANNING_SIMULATION_CATALOG_ENTRIES.every(
    (s) =>
      evaluationIds.has(s.evaluationRef) &&
      contextIds.has(s.contextRef) &&
      validationIds.has(s.validation) &&
      roleIds.has(s.roleRef) &&
      topologyIds.has(s.topologyRef) &&
      depIds.has(s.dependencyRef) &&
      s.assumptions.length >= 1 &&
      s.branches.length >= 1 &&
      s.scenario.length > 0 &&
      s.expectedResult.length > 0,
  );

  const validationsAligned = PLANNING_SIMULATION_VALIDATION_CATALOG.every((v) =>
    simulationIds.has(v.simulationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    simulationsAligned &&
    validationsAligned &&
    kindsComplete &&
    PLANNING_SIMULATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildPlanningSimulationCatalogManifest(): PlanningSimulationCatalogManifest {
  const simulations = PLANNING_SIMULATION_CATALOG_ENTRIES;
  const kinds = new Set(simulations.map((s) => s.kind));
  const catalogComplete =
    simulations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V77_PLANNING_SIMULATION_VERSION,
    entryCount: simulations.length,
    kindCount: kinds.size,
    catalogComplete,
    simulations,
    summary: [
      `planning-simulation-catalog count=${simulations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningSimulationValidationManifest(): PlanningSimulationValidationManifest {
  const validations = PLANNING_SIMULATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V77_PLANNING_SIMULATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `planning-simulation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPlanningSimulationCatalogEntryById(
  id: string,
): PlanningSimulationCatalogEntry | undefined {
  return PLANNING_SIMULATION_CATALOG_ENTRIES.find((s) => s.id === id);
}

export function getPlanningSimulationCatalogEntriesByKind(
  kind: PlanningSimulationKind,
): PlanningSimulationCatalogEntry[] {
  return PLANNING_SIMULATION_CATALOG_ENTRIES.filter((s) => s.kind === kind);
}

export function getPlanningSimulationValidationBySimulationRef(
  simulationRef: string,
): PlanningSimulationValidation | undefined {
  return PLANNING_SIMULATION_VALIDATION_CATALOG.find((v) => v.simulationRef === simulationRef);
}

export function computePlanningDeclarativeSimulationDeclared(input: {
  kind: PlanningSimulationKind;
  expectedResult: string;
}): boolean {
  return input.kind === "shared" && input.expectedResult.length > 0;
}
