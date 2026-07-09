/**
 * V76 P6 — Collaboration simulation catalog types (read-only)
 */

export const V76_COLLABORATION_SIMULATION_VERSION =
  "v76-collaboration-simulation-catalog-1" as const;
export const V76_COLLABORATION_SIMULATION_FREEZE_VERSION =
  "v76-collaboration-simulation-catalog-freeze-1" as const;

export type CollaborationSimulationKind =
  | "shared"
  | "topology"
  | "communication"
  | "delegation"
  | "coordination"
  | "governance"
  | "workspace"
  | "boundary";

export type CollaborationSimulationPriority = "low" | "medium" | "high" | "critical";

export type CollaborationSimulationValidation = {
  id: string;
  simulationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type CollaborationSimulationCatalogEntry = {
  id: string;
  kind: CollaborationSimulationKind;
  scenario: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  branches: string[];
  assumptions: string[];
  expectedResult: string;
  priority: CollaborationSimulationPriority;
  validation: string;
  evaluationRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type CollaborationSimulationCatalogManifest = {
  version: typeof V76_COLLABORATION_SIMULATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  simulations: CollaborationSimulationCatalogEntry[];
  summary: string;
};

export type CollaborationSimulationValidationManifest = {
  version: typeof V76_COLLABORATION_SIMULATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: CollaborationSimulationValidation[];
  summary: string;
};

export type CollaborationSimulationCatalogSignals = {
  collaborationEvaluationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type CollaborationSimulationCatalogReport = {
  version: typeof V76_COLLABORATION_SIMULATION_VERSION;
  freezeVersion: typeof V76_COLLABORATION_SIMULATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  collaborationEvaluationCatalogVersion: string;
  collaborationEvaluationCatalogReady: boolean;
  catalog: CollaborationSimulationCatalogManifest;
  validations: CollaborationSimulationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
