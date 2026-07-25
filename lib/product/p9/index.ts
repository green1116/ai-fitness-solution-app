/**
 * Product P9 — Customer Success public exports
 * Isolated namespace: lib/product/p9
 */

export {
  EXPANSION_STATUSES,
  FEEDBACK_KINDS,
  HEALTH_STATUSES,
  P9_MANAGER_STATUSES,
  P9_READINESS_VERDICTS,
  PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
  PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
  PRODUCT_P9_CUSTOMER_SUCCESS_ID,
  PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
  PRODUCT_P9_SUCCESS_FREEZE_VERSION,
  RENEWAL_STATUSES,
  SATISFACTION_LEVELS,
  SUCCESS_PLAN_STATUSES,
  USAGE_TRENDS,
} from "./customer-health/health.constants";

export type {
  CreateCustomerHealthInput,
  CustomerHealth,
  HealthMetadata,
  HealthStatus,
  P9ManagerStatus,
  P9ReadinessCheck,
  P9ReadinessResult,
  P9ReadinessVerdict,
  P9RegistryManifest,
  UpdateCustomerHealthInput,
} from "./customer-health/health.types";

export {
  clearCustomerHealth,
  createCustomerHealth,
  getCustomerHealth,
  listCustomerHealth,
  updateCustomerHealth,
} from "./customer-health/health.registry";

export type {
  CreateUsageInput,
  UsageMetadata,
  UsageSnapshot,
  UsageTrend,
} from "./usage/usage.types";

export {
  clearUsage,
  createUsage,
  getUsage,
  listUsage,
} from "./usage/usage.registry";

export type {
  CreateFeedbackInput,
  CustomerFeedback,
  FeedbackKind,
  FeedbackMetadata,
} from "./feedback/feedback.types";

export {
  clearFeedback,
  createFeedback,
  getFeedback,
  listFeedback,
} from "./feedback/feedback.registry";

export type {
  CreateSatisfactionInput,
  SatisfactionLevel,
  SatisfactionMetadata,
  SatisfactionScore,
} from "./satisfaction/satisfaction.types";

export {
  clearSatisfaction,
  createSatisfaction,
  getSatisfaction,
  listSatisfaction,
} from "./satisfaction/satisfaction.registry";

export type {
  CreateSuccessPlanInput,
  SuccessPlan,
  SuccessPlanMetadata,
  SuccessPlanStatus,
  UpdateSuccessPlanStatusInput,
} from "./success-plan/plan.types";

export {
  clearSuccessPlans,
  createSuccessPlan,
  getSuccessPlan,
  listSuccessPlans,
  updateSuccessPlanStatus,
} from "./success-plan/plan.registry";

export type {
  CreateRenewalInput,
  RenewalMetadata,
  RenewalOpportunity,
  RenewalStatus,
  UpdateRenewalStatusInput,
} from "./renewal/renewal.types";

export {
  clearRenewals,
  createRenewal,
  getRenewal,
  listRenewals,
  updateRenewalStatus,
} from "./renewal/renewal.registry";

export type {
  CreateExpansionInput,
  ExpansionMetadata,
  ExpansionOpportunity,
  ExpansionStatus,
  UpdateExpansionStatusInput,
} from "./expansion/expansion.types";

export {
  clearExpansions,
  createExpansion,
  getExpansion,
  listExpansions,
  updateExpansionStatus,
} from "./expansion/expansion.registry";

export {
  assertP9CustomerSuccessReadinessReady,
  evaluateP9CustomerSuccessReadiness,
} from "./customer-health/health.readiness";

export {
  clearP9CustomerSuccessLayer,
  createP9CustomerSuccessManager,
  getP9RegistryManifest,
  type P9CustomerSuccessManager,
  type P9CustomerSuccessManagerSnapshot,
} from "./customer-success.manager";

export {
  assertProductP9ReleaseGatePass,
  checkProductP9ReleaseGate,
  PRODUCT_P9_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
