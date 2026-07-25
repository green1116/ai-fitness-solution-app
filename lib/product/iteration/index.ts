/**
 * Product Iteration — Commercial Product Iteration Foundation public exports
 * Isolated namespace: lib/product/iteration
 */

export {
  BACKLOG_PRIORITIES,
  CADENCE_KINDS,
  CYCLE_STATUSES,
  EXPERIMENT_STATUSES,
  IMPACT_BANDS,
  ITERATION_MANAGER_STATUSES,
  ITERATION_READINESS_VERDICTS,
  PRODUCT_ITERATION_FOUNDATION_BASE,
  PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ITERATION_FOUNDATION_ID,
  PRODUCT_ITERATION_FOUNDATION_VERSION,
  PRODUCT_ITERATION_FREEZE_VERSION,
  ROADMAP_HORIZONS,
} from "./cycle/cycle.constants";

export type {
  CreateCycleInput,
  CycleMetadata,
  CycleStatus,
  IterationCycle,
  IterationManagerStatus,
  IterationReadinessCheck,
  IterationReadinessResult,
  IterationReadinessVerdict,
  IterationRegistryManifest,
  UpdateCycleStatusInput,
} from "./cycle/cycle.types";

export {
  clearCycles,
  createCycle,
  getCycle,
  listCycles,
  updateCycleStatus,
} from "./cycle/cycle.registry";

export type {
  BacklogItem,
  BacklogMetadata,
  BacklogPriority,
  CreateBacklogInput,
} from "./backlog/backlog.types";

export {
  clearBacklog,
  createBacklogItem,
  getBacklogItem,
  listBacklog,
} from "./backlog/backlog.registry";

export type {
  ConcludeExperimentInput,
  CreateExperimentInput,
  ExperimentMetadata,
  ExperimentStatus,
  ProductExperiment,
} from "./experiment/experiment.types";

export {
  clearExperiments,
  concludeExperiment,
  createExperiment,
  getExperiment,
  listExperiments,
} from "./experiment/experiment.registry";

export type {
  CreateRoadmapInput,
  RoadmapHorizon,
  RoadmapItem,
  RoadmapMetadata,
} from "./roadmap/roadmap.types";

export {
  clearRoadmap,
  createRoadmapItem,
  getRoadmapItem,
  listRoadmap,
} from "./roadmap/roadmap.registry";

export type {
  ImpactBand,
  ImpactMetadata,
  ImpactScore,
  ScoreImpactInput,
} from "./impact/impact.types";

export {
  clearImpact,
  getImpact,
  listImpact,
  scoreImpact,
} from "./impact/impact.registry";

export type {
  CadenceKind,
  CadenceMetadata,
  CreateCadenceInput,
  IterationCadence,
} from "./cadence/cadence.types";

export {
  clearCadences,
  createCadence,
  getCadence,
  listCadences,
} from "./cadence/cadence.registry";

export {
  assertIterationFoundationReadinessReady,
  evaluateIterationFoundationReadiness,
} from "./cycle/cycle.readiness";

export {
  clearIterationFoundationLayer,
  createIterationManager,
  getIterationRegistryManifest,
  type IterationManager,
  type IterationManagerSnapshot,
} from "./iteration.manager";

export {
  assertProductIterationReleaseGatePass,
  checkProductIterationReleaseGate,
  PRODUCT_ITERATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
