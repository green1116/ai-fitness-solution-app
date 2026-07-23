/**
 * Operations O1 — Customer Success Foundation public exports
 * Isolated namespace: lib/operations/o1
 */

export {
  CUSTOMER_STATUSES,
  FEEDBACK_CHANNELS,
  HEALTH_BANDS,
  O1_MANAGER_STATUSES,
  O1_READINESS_VERDICTS,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
  OPERATIONS_O1_SUCCESS_FREEZE_VERSION,
  RENEWAL_STATUSES,
  SUCCESS_PLAN_STATUSES,
} from "./success/success.constants";

export type {
  CustomerMetadata,
  CustomerStatus,
  RegisterCustomerInput,
  SuccessCustomer,
} from "./customer/customer.types";

export {
  clearCustomers,
  getCustomer,
  listCustomers,
  registerCustomer,
} from "./customer/customer.registry";

export type {
  HealthBand,
  HealthMetadata,
  HealthMetrics,
  HealthScore,
  RecordHealthMetricsInput,
  ScoreCustomerHealthInput,
} from "./health/health.types";

export {
  clearHealthMetrics,
  getHealthMetrics,
  listHealthMetrics,
  recordHealthMetrics,
} from "./health/health.metrics";

export {
  clearHealthScores,
  getHealthScore,
  listHealthScores,
  scoreCustomerHealth,
} from "./health/health.score";

export type {
  CreateSuccessPlanInput,
  SuccessMetadata,
  SuccessPlan,
  SuccessPlanStatus,
  SuccessTracking,
  TrackSuccessProgressInput,
} from "./success/success.types";

export {
  clearSuccessPlans,
  createSuccessPlan,
  getSuccessPlan,
  listSuccessPlans,
} from "./success/success.plan";

export {
  clearSuccessTracking,
  getSuccessTracking,
  listSuccessTracking,
  trackSuccessProgress,
} from "./success/success.tracking";

export type {
  AnalyzeFeedbackInput,
  CollectFeedbackInput,
  FeedbackAnalysis,
  FeedbackChannel,
  FeedbackEntry,
  FeedbackMetadata,
} from "./feedback/feedback.types";

export {
  clearFeedbackEntries,
  collectFeedback,
  getFeedbackEntry,
  listFeedbackEntries,
} from "./feedback/feedback.collector";

export {
  analyzeFeedback,
  clearFeedbackAnalyses,
  getFeedbackAnalysis,
  listFeedbackAnalyses,
} from "./feedback/feedback.analysis";

export type {
  O1ManagerStatus,
  O1ReadinessCheck,
  O1ReadinessResult,
  O1ReadinessVerdict,
  O1RegistryManifest,
  RegisterRenewalInput,
  RenewalMetadata,
  RenewalRecord,
  RenewalStatus,
  UpdateRenewalStatusInput,
} from "./renewal/renewal.types";

export {
  clearRenewals,
  getRenewal,
  listRenewals,
  registerRenewal,
  updateRenewalStatus,
} from "./renewal/renewal.status";

export {
  assertO1CustomerSuccessReadinessReady,
  evaluateO1CustomerSuccessReadiness,
} from "./renewal/renewal.readiness";

export {
  clearO1CustomerSuccessLayer,
  createO1CustomerSuccessManager,
  getO1RegistryManifest,
  type O1CustomerSuccessManager,
  type O1CustomerSuccessManagerSnapshot,
} from "./success.manager";

export {
  assertOperationsO1ReleaseGatePass,
  checkOperationsO1ReleaseGate,
  OPERATIONS_O1_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/operations.release.gate";
