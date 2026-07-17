/**
 * E07-P1 — Digital Workforce Foundation public exports
 */

export {
  E07_WORKFORCE_BASE,
  E07_WORKFORCE_FREEZE_VERSION,
  E07_WORKFORCE_PLATFORM_ID,
  E07_WORKFORCE_VERSION,
  SKILL_KINDS,
  WORKER_ROLES,
  WORKER_STATUSES,
  WORKFORCE_LIFECYCLE_STAGES,
} from "./core/workforce.constants";

export type {
  SkillKind,
  WorkerDefinition,
  WorkerRole,
  WorkerStatus,
  WorkforceFoundationResult,
  WorkforceLifecycle,
  WorkforceLifecycleStage,
  WorkforceRegistryManifest,
} from "./core/workforce.types";

export {
  advanceWorkforceLifecycle,
  assertWorkforceFoundationPass,
  buildWorkforceFoundation,
  buildWorkforceFoundationLifecycle,
  canAdvanceWorkforceLifecycle,
  createInitialWorkforceLifecycle,
} from "./core/workforce.lifecycle";

export {
  WORKER_CATALOG,
  buildWorkforceRegistryManifest,
  getWorkerById,
  getWorkerByRole,
  isWorkerDependencyGraphValid,
  listExecutableWorkers,
} from "./core/workforce.registry";

export type {
  SkillDefinition,
  SkillRegistryManifest,
} from "./skill/skill.types";

export {
  SKILL_CATALOG,
  buildSkillRegistryManifest,
  getSkillById,
  listSkillsByKind,
} from "./skill/skill.registry";

export type {
  WorkforceExecutionContext,
  WorkforceInput,
  WorkforceMetadata,
} from "./runtime/workforce.context";

export {
  assertValidWorkforceContext,
  createWorkforceExecutionContext,
} from "./runtime/workforce.context";

export type {
  WorkforceExecuteBundle,
  WorkforceExecutionResult,
} from "./runtime/workforce.executor";

export {
  executeWorker,
  executeWorkerOrThrow,
} from "./runtime/workforce.executor";
