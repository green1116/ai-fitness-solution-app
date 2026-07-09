/**
 * V80 P3 — System meta simulation types (declarative, read-only)
 */

export const V80_SYSTEM_SIMULATION_VERSION = "v80-system-meta-simulation-1" as const;
export const V80_SYSTEM_SIMULATION_FREEZE_VERSION =
  "v80-system-meta-simulation-freeze-1" as const;

export type SystemSimulationKind =
  | "flow"
  | "propagation"
  | "policy"
  | "invariant"
  | "violation"
  | "failure";

export type SystemSimulationPriority = "low" | "medium" | "high" | "critical";

export type SystemSimulationModel = {
  id: string;
  kind: SystemSimulationKind;
  scenario: string;
  purpose: string;
  layerRefs: string[];
  policyRef: string;
  invariantRef: string;
  roleRef: string;
  topologyRef: string;
  dependencyRef: string;
  scopeRef: string;
  branches: string[];
  assumptions: string[];
  expectedResult: string;
  priority: SystemSimulationPriority;
  propagationRef: string;
  violationRef: string;
  failureRef: string;
  required: boolean;
  description: string;
};

export type SystemStatePropagationSegment = {
  id: string;
  fromLayer: string;
  toLayer: string;
  stateKind: string;
  policyRef: string;
  invariantRef: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type SystemPreRuntimeViolationRule = {
  id: string;
  policyRef: string;
  invariantRef: string;
  violationKind: string;
  detectCondition: string;
  blockCondition: string;
  simulationRef: string;
  required: boolean;
  description: string;
};

export type SystemFailureScenarioKind = "orphan" | "desync" | "bypass" | "freeze-conflict";

export type SystemFailureScenario = {
  id: string;
  kind: SystemFailureScenarioKind;
  policyRef: string;
  invariantRef: string;
  simulationRef: string;
  trigger: string;
  expectedBlock: string;
  required: boolean;
  description: string;
};

export type SystemSimulationCatalogManifest = {
  version: typeof V80_SYSTEM_SIMULATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  simulations: SystemSimulationModel[];
  summary: string;
};

export type SystemStatePropagationManifest = {
  version: typeof V80_SYSTEM_SIMULATION_VERSION;
  segmentCount: number;
  propagationComplete: boolean;
  segments: SystemStatePropagationSegment[];
  summary: string;
};

export type SystemPreRuntimeViolationManifest = {
  version: typeof V80_SYSTEM_SIMULATION_VERSION;
  ruleCount: number;
  rulesComplete: boolean;
  rules: SystemPreRuntimeViolationRule[];
  summary: string;
};

export type SystemFailureScenarioManifest = {
  version: typeof V80_SYSTEM_SIMULATION_VERSION;
  scenarioCount: number;
  scenariosComplete: boolean;
  scenarios: SystemFailureScenario[];
  summary: string;
};

export type SystemSimulationCatalogSignals = {
  systemPolicyCatalogReady?: boolean;
  catalogComplete?: boolean;
  propagationComplete?: boolean;
  violationsComplete?: boolean;
  failuresComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type SystemSimulationCatalogReport = {
  version: typeof V80_SYSTEM_SIMULATION_VERSION;
  freezeVersion: typeof V80_SYSTEM_SIMULATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  systemPolicyCatalogVersion: string;
  systemPolicyCatalogReady: boolean;
  catalog: SystemSimulationCatalogManifest;
  propagation: SystemStatePropagationManifest;
  violations: SystemPreRuntimeViolationManifest;
  failures: SystemFailureScenarioManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
