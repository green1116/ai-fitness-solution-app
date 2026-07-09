/**
 * V78 P6 — Execution simulation catalog (declarative)
 */
import { EXECUTION_CONTEXT_CATALOG_ENTRIES } from "./execution.context.catalog";
import { EXECUTION_EVALUATION_CATALOG_ENTRIES } from "./execution.evaluation.catalog";
import { EXECUTION_UPSTREAM_DEPENDENCIES } from "./execution.dependencies";
import {
  EXECUTION_ROLE_CATALOG,
  EXECUTION_TOPOLOGY_CATALOG,
} from "./execution.inventory";
import type {
  ExecutionSimulationCatalogEntry,
  ExecutionSimulationCatalogManifest,
  ExecutionSimulationKind,
  ExecutionSimulationValidation,
  ExecutionSimulationValidationManifest,
} from "./execution.simulation";
import { V78_EXECUTION_SIMULATION_VERSION } from "./execution.simulation";

const REQUIRED_KINDS: ExecutionSimulationKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const EXECUTION_SIMULATION_CATALOG_ENTRIES: ExecutionSimulationCatalogEntry[] = [
  {
    id: "EXE-SIM-001",
    kind: "shared",
    scenario: "shared-baseline-dry-run",
    purpose: "Declarative dry-run of shared execution baseline without side effects",
    roleRef: "EXE-ROL-001",
    topologyRef: "EXE-TOP-001",
    dependencyRef: "EXE-DEP-001",
    branches: ["proceed", "hold"],
    assumptions: ["no-runtime-execution", "declarative-only"],
    expectedResult: "upstream-planning-freeze-intact",
    priority: "high",
    validation: "EXE-SVL-001",
    evaluationRef: "EXE-EVAL-001",
    contextRef: "EXE-CTX-001",
    required: true,
    description: "Shared simulation — baseline dry-run rules",
  },
  {
    id: "EXE-SIM-002",
    kind: "role",
    scenario: "role-assignment-alternative",
    purpose: "Alternative paths when execution role assignment is incomplete",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    dependencyRef: "EXE-DEP-002",
    branches: ["complete", "escalate", "reject"],
    assumptions: ["execution-role-defined", "role-coverage=100"],
    expectedResult: "execution-role-defined",
    priority: "high",
    validation: "EXE-SVL-002",
    evaluationRef: "EXE-EVAL-002",
    contextRef: "EXE-CTX-002",
    required: true,
    description: "Role simulation — assignment alternative rules",
  },
  {
    id: "EXE-SIM-003",
    kind: "topology",
    scenario: "acyclic-topology-scenario",
    purpose: "Scenario model for acyclic vs cyclic topology outcomes",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    dependencyRef: "EXE-DEP-003",
    branches: ["acyclic", "cyclic-reject"],
    assumptions: ["acyclic-topology-required", "cycle-count=0"],
    expectedResult: "acyclic-topology-required",
    priority: "critical",
    validation: "EXE-SVL-003",
    evaluationRef: "EXE-EVAL-003",
    contextRef: "EXE-CTX-003",
    required: true,
    description: "Topology simulation — acyclic graph scenario rules",
  },
  {
    id: "EXE-SIM-004",
    kind: "scope",
    scenario: "scope-boundary-comparison",
    purpose: "Compare bounded vs unbounded execution scope outcomes",
    roleRef: "EXE-ROL-003",
    topologyRef: "EXE-TOP-003",
    dependencyRef: "EXE-DEP-006",
    branches: ["bounded", "unbounded-reject"],
    assumptions: ["execution-scope-bounded", "scope-coverage=100"],
    expectedResult: "execution-scope-bounded",
    priority: "high",
    validation: "EXE-SVL-004",
    evaluationRef: "EXE-EVAL-004",
    contextRef: "EXE-CTX-004",
    required: true,
    description: "Scope simulation — boundary comparison rules",
  },
  {
    id: "EXE-SIM-005",
    kind: "dependency",
    scenario: "upstream-dependency-lock-path",
    purpose: "Simulate upstream dependency lock pass and drift paths",
    roleRef: "EXE-ROL-004",
    topologyRef: "EXE-TOP-004",
    dependencyRef: "EXE-DEP-005",
    branches: ["lock-intact", "drift-block"],
    assumptions: ["upstream-dependency-intact", "upstream-drift=0"],
    expectedResult: "upstream-dependency-intact",
    priority: "critical",
    validation: "EXE-SVL-005",
    evaluationRef: "EXE-EVAL-005",
    contextRef: "EXE-CTX-005",
    required: true,
    description: "Dependency simulation — upstream lock path rules",
  },
  {
    id: "EXE-SIM-006",
    kind: "governance",
    scenario: "governance-rules-forecast",
    purpose: "Forecast governance rules completeness without execution",
    roleRef: "EXE-ROL-007",
    topologyRef: "EXE-TOP-007",
    dependencyRef: "EXE-DEP-004",
    branches: ["complete", "incomplete-block"],
    assumptions: ["governance-rules-documented", "checklist-complete=100"],
    expectedResult: "governance-rules-documented",
    priority: "high",
    validation: "EXE-SVL-006",
    evaluationRef: "EXE-EVAL-006",
    contextRef: "EXE-CTX-006",
    required: true,
    description: "Governance simulation — rules forecast rules",
  },
  {
    id: "EXE-SIM-007",
    kind: "workspace",
    scenario: "inventory-catalog-comparison",
    purpose: "Compare catalog complete vs incomplete workspace outcomes",
    roleRef: "EXE-ROL-006",
    topologyRef: "EXE-TOP-006",
    dependencyRef: "EXE-DEP-008",
    branches: ["complete", "incomplete-hold"],
    assumptions: ["inventory-catalog-complete", "catalog-complete=100"],
    expectedResult: "inventory-catalog-complete",
    priority: "high",
    validation: "EXE-SVL-007",
    evaluationRef: "EXE-EVAL-007",
    contextRef: "EXE-CTX-007",
    required: true,
    description: "Workspace simulation — inventory catalog comparison rules",
  },
  {
    id: "EXE-SIM-008",
    kind: "boundary",
    scenario: "no-runtime-rollback-preview",
    purpose: "Preview rollback paths without modifying frozen layers",
    roleRef: "EXE-ROL-008",
    topologyRef: "EXE-TOP-008",
    dependencyRef: "EXE-DEP-008",
    branches: ["rollback-p1", "rollback-pkg", "no-rollback"],
    assumptions: ["v48-v78-p5-frozen", "declarative-only=true"],
    expectedResult: "no-runtime-execution",
    priority: "critical",
    validation: "EXE-SVL-008",
    evaluationRef: "EXE-EVAL-008",
    contextRef: "EXE-CTX-008",
    required: true,
    description: "Boundary simulation — no-runtime rollback preview rules",
  },
];

export const EXECUTION_SIMULATION_VALIDATION_CATALOG: ExecutionSimulationValidation[] = [
  {
    id: "EXE-SVL-001",
    simulationRef: "EXE-SIM-001",
    validationKind: "shared",
    passCondition: "shared-simulation-declared-no-side-effects",
    required: true,
    description: "Shared simulation validation — no side effects declared",
  },
  {
    id: "EXE-SVL-002",
    simulationRef: "EXE-SIM-002",
    validationKind: "role",
    passCondition: "role-alternatives-documented",
    required: true,
    description: "Role simulation validation — alternatives documented",
  },
  {
    id: "EXE-SVL-003",
    simulationRef: "EXE-SIM-003",
    validationKind: "topology",
    passCondition: "topology-scenario-documented",
    required: true,
    description: "Topology simulation validation — scenario documented",
  },
  {
    id: "EXE-SVL-004",
    simulationRef: "EXE-SIM-004",
    validationKind: "scope",
    passCondition: "scope-comparison-documented",
    required: true,
    description: "Scope simulation validation — comparison documented",
  },
  {
    id: "EXE-SVL-005",
    simulationRef: "EXE-SIM-005",
    validationKind: "dependency",
    passCondition: "dependency-path-declared",
    required: true,
    description: "Dependency simulation validation — path declared",
  },
  {
    id: "EXE-SVL-006",
    simulationRef: "EXE-SIM-006",
    validationKind: "governance",
    passCondition: "governance-forecast-documented",
    required: true,
    description: "Governance simulation validation — forecast documented",
  },
  {
    id: "EXE-SVL-007",
    simulationRef: "EXE-SIM-007",
    validationKind: "workspace",
    passCondition: "workspace-comparison-documented",
    required: true,
    description: "Workspace simulation validation — comparison documented",
  },
  {
    id: "EXE-SVL-008",
    simulationRef: "EXE-SIM-008",
    validationKind: "boundary",
    passCondition: "rollback-preview-complete",
    required: true,
    description: "Boundary simulation validation — rollback preview complete",
  },
];

export function isExecutionSimulationCatalogRefsAligned(): boolean {
  const roleIds = new Set(EXECUTION_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(EXECUTION_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(EXECUTION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const evaluationIds = new Set(EXECUTION_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const contextIds = new Set(EXECUTION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const validationIds = new Set(EXECUTION_SIMULATION_VALIDATION_CATALOG.map((v) => v.id));
  const simulationIds = new Set(EXECUTION_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const kinds = new Set(EXECUTION_SIMULATION_CATALOG_ENTRIES.map((s) => s.kind));

  const simulationsAligned = EXECUTION_SIMULATION_CATALOG_ENTRIES.every(
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

  const validationsAligned = EXECUTION_SIMULATION_VALIDATION_CATALOG.every((v) =>
    simulationIds.has(v.simulationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    simulationsAligned &&
    validationsAligned &&
    kindsComplete &&
    EXECUTION_SIMULATION_CATALOG_ENTRIES.length === 8
  );
}

export function buildExecutionSimulationCatalogManifest(): ExecutionSimulationCatalogManifest {
  const simulations = EXECUTION_SIMULATION_CATALOG_ENTRIES;
  const kinds = new Set(simulations.map((s) => s.kind));
  const catalogComplete =
    simulations.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V78_EXECUTION_SIMULATION_VERSION,
    entryCount: simulations.length,
    kindCount: kinds.size,
    catalogComplete,
    simulations,
    summary: [
      `execution-simulation-catalog count=${simulations.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionSimulationValidationManifest(): ExecutionSimulationValidationManifest {
  const validations = EXECUTION_SIMULATION_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V78_EXECUTION_SIMULATION_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `execution-simulation-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExecutionSimulationCatalogEntryById(
  id: string,
): ExecutionSimulationCatalogEntry | undefined {
  return EXECUTION_SIMULATION_CATALOG_ENTRIES.find((s) => s.id === id);
}

export function getExecutionSimulationCatalogEntriesByKind(
  kind: ExecutionSimulationKind,
): ExecutionSimulationCatalogEntry[] {
  return EXECUTION_SIMULATION_CATALOG_ENTRIES.filter((s) => s.kind === kind);
}

export function getExecutionSimulationValidationBySimulationRef(
  simulationRef: string,
): ExecutionSimulationValidation | undefined {
  return EXECUTION_SIMULATION_VALIDATION_CATALOG.find((v) => v.simulationRef === simulationRef);
}

export function computeExecutionDeclarativeSimulationDeclared(input: {
  kind: ExecutionSimulationKind;
  expectedResult: string;
}): boolean {
  return input.kind === "shared" && input.expectedResult.length > 0;
}
