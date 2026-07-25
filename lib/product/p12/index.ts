/**
 * Product P12 — Production Launch public exports
 * Isolated namespace: lib/product/p12
 */

export {
  ADOPTION_LEVELS,
  LAUNCH_STATUSES,
  MONITORING_SEVERITIES,
  OPERATIONS_MODES,
  P12_MANAGER_STATUSES,
  P12_READINESS_VERDICTS,
  PRODUCT_P12_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
  PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_ID,
  PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
  READINESS_GATES,
  ROLLOUT_STRATEGIES,
  SUPPORT_PRIORITIES,
} from "./launch/launch.constants";

export type {
  CreateLaunchInput,
  LaunchMetadata,
  LaunchStatus,
  P12ManagerStatus,
  P12ReadinessCheck,
  P12ReadinessResult,
  P12ReadinessVerdict,
  P12RegistryManifest,
  ProductionLaunch,
  UpdateLaunchStatusInput,
} from "./launch/launch.types";

export {
  clearLaunches,
  createLaunch,
  getLaunch,
  listLaunches,
  updateLaunchStatus,
} from "./launch/launch.registry";

export type {
  LaunchReadinessCheck,
  ReadinessGate,
  ReadinessMetadata,
  RecordReadinessInput,
} from "./readiness/readiness.types";

export {
  clearReadiness,
  getReadiness,
  listReadiness,
  recordReadiness,
} from "./readiness/readiness.registry";

export type {
  AdvanceRolloutInput,
  LaunchRollout,
  RolloutMetadata,
  RolloutStrategy,
  StartRolloutInput,
} from "./rollout/rollout.types";

export {
  advanceRollout,
  clearRollouts,
  getRollout,
  listRollouts,
  startRollout,
} from "./rollout/rollout.registry";

export type {
  AdoptionLevel,
  AdoptionMetadata,
  LaunchAdoption,
  RecordAdoptionInput,
} from "./adoption/adoption.types";

export {
  clearAdoptions,
  getAdoption,
  listAdoptions,
  recordAdoption,
} from "./adoption/adoption.registry";

export type {
  ActivateOperationsInput,
  LaunchOperations,
  OperationsMetadata,
  OperationsMode,
} from "./operations/operations.types";

export {
  activateOperations,
  clearOperations,
  getOperations,
  listOperations,
} from "./operations/operations.registry";

export type {
  LaunchMonitoringSignal,
  MonitoringMetadata,
  MonitoringSeverity,
  RecordMonitoringInput,
} from "./monitoring/monitoring.types";

export {
  clearMonitoring,
  getMonitoring,
  listMonitoring,
  recordMonitoring,
} from "./monitoring/monitoring.registry";

export type {
  CloseSupportCaseInput,
  LaunchSupportCase,
  OpenSupportCaseInput,
  SupportMetadata,
  SupportPriority,
} from "./support/support.types";

export {
  clearSupportCases,
  closeSupportCase,
  getSupportCase,
  listSupportCases,
  openSupportCase,
} from "./support/support.registry";

export {
  assertP12ProductionLaunchReadinessReady,
  evaluateP12ProductionLaunchReadiness,
} from "./launch/launch.readiness";

export {
  clearP12ProductionLaunchLayer,
  createP12LaunchManager,
  getP12RegistryManifest,
  type P12LaunchManager,
  type P12LaunchManagerSnapshot,
} from "./launch.manager";

export {
  assertProductP12ReleaseGatePass,
  checkProductP12ReleaseGate,
  PRODUCT_P12_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
