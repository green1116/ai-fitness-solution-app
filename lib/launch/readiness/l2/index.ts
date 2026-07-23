/**
 * Launch L2 — Pilot Customer Flow public exports
 * Isolated namespace: lib/launch/readiness/l2
 */

export {
  ACCEPTANCE_VERDICTS,
  DELIVERY_CHECKPOINT_KINDS,
  FEEDBACK_CHANNELS,
  INTAKE_STATUSES,
  L2_MANAGER_STATUSES,
  L2_READINESS_VERDICTS,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
  LAUNCH_L2_PILOT_FREEZE_VERSION,
  PILOT_STATUSES,
  PROJECT_LIFECYCLE_STAGES,
} from "./pilot/pilot.constants";

export type {
  PilotMetadata,
  PilotRecord,
  PilotStatus,
  RegisterPilotInput,
  UpdatePilotStatusInput,
} from "./pilot/pilot.types";

export {
  clearPilots,
  getPilot,
  listPilots,
  registerPilot,
} from "./pilot/pilot.registry";

export {
  listAllowedPilotTransitions,
  updatePilotStatus,
} from "./pilot/pilot.status";

export type {
  AdvanceIntakeInput,
  CreateIntakeFormInput,
  IntakeForm,
  IntakeMetadata,
  IntakeStatus,
} from "./intake/intake.types";

export {
  clearIntakeForms,
  createIntakeForm,
  getIntakeForm,
  listIntakeForms,
} from "./intake/intake.form";

export { advanceIntakeWorkflow } from "./intake/intake.workflow";

export type {
  AdvanceProjectLifecycleInput,
  CreatePilotProjectInput,
  PilotProject,
  ProjectLifecycleStage,
  ProjectMetadata,
  TrackProjectProgressInput,
} from "./project/project.types";

export {
  clearPilotProjects,
  createPilotProject,
  getPilotProject,
  listPilotProjects,
  trackProjectProgress,
} from "./project/project.tracker";

export { advanceProjectLifecycle } from "./project/project.lifecycle";

export type {
  CollectFeedbackInput,
  FeedbackChannel,
  FeedbackEntry,
  FeedbackMetadata,
  FeedbackScore,
  ScoreFeedbackInput,
} from "./feedback/feedback.types";

export {
  clearFeedbackEntries,
  collectFeedback,
  getFeedbackEntry,
  listFeedbackEntries,
} from "./feedback/feedback.collector";

export {
  clearFeedbackScores,
  getFeedbackScore,
  listFeedbackScores,
  scorePilotFeedback,
} from "./feedback/feedback.score";

export type {
  AcceptDeliveryInput,
  AcceptanceVerdict,
  DeliveryAcceptance,
  DeliveryCheckpoint,
  DeliveryCheckpointKind,
  DeliveryMetadata,
  L2ManagerStatus,
  L2ReadinessCheck,
  L2ReadinessResult,
  L2ReadinessVerdict,
  L2RegistryManifest,
  RecordCheckpointInput,
} from "./delivery/delivery.types";

export {
  clearDeliveryCheckpoints,
  getDeliveryCheckpoint,
  listDeliveryCheckpoints,
  recordDeliveryCheckpoint,
} from "./delivery/delivery.checkpoint";

export {
  acceptPilotDelivery,
  clearDeliveryAcceptances,
  getDeliveryAcceptance,
  listDeliveryAcceptances,
} from "./delivery/delivery.acceptance";

export {
  assertL2PilotReadinessReady,
  evaluateL2PilotReadiness,
} from "./delivery/delivery.readiness";

export {
  clearL2PilotCustomerFlowLayer,
  createL2PilotCustomerFlowManager,
  getL2RegistryManifest,
  type L2PilotCustomerFlowManager,
  type L2PilotCustomerFlowManagerSnapshot,
} from "./pilot.manager";

export {
  assertLaunchL2ReleaseGatePass,
  checkLaunchL2ReleaseGate,
  LAUNCH_L2_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/launch.release.gate";
