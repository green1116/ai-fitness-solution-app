/**
 * Product Customer Insight — public exports
 * Isolated namespace: lib/product/customer-insight
 */

export {
  CUSTOMER_INSIGHT_MANAGER_STATUSES,
  CUSTOMER_INSIGHT_READINESS_VERDICTS,
  INSIGHT_RECOMMENDATION_KINDS,
  INSIGHT_SCORE_KINDS,
  INSIGHT_SEGMENT_CODES,
  INSIGHT_SIGNAL_KINDS,
  PRODUCT_CUSTOMER_INSIGHT_BASE,
  PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION,
  PRODUCT_CUSTOMER_INSIGHT_ID,
  PRODUCT_CUSTOMER_INSIGHT_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_INSIGHT_VERSION,
} from "./insight/insight.constants";

export type {
  CustomerInsightManagerStatus,
  CustomerInsightReadinessCheck,
  CustomerInsightReadinessResult,
  CustomerInsightReadinessVerdict,
  CustomerInsightRegistryManifest,
} from "./insight/insight.types";

export type {
  CustomerInsightSignal,
  DetectSignalInput,
  InsightSignalKind,
  SignalMetadata,
} from "./signal/signal.types";

export {
  clearSignals,
  detectSignal,
  getSignal,
  listSignals,
} from "./signal/signal.registry";

export type {
  ComputeScoreInput,
  CustomerInsightScore,
  InsightScoreKind,
  ScoreMetadata,
} from "./score/score.types";

export {
  clearScores,
  computeScore,
  getScore,
  listScores,
} from "./score/score.registry";

export type {
  AssignInsightSegmentInput,
  CustomerInsightSegment,
  InsightSegmentCode,
  SegmentMetadata,
} from "./segment/segment.types";

export {
  assignInsightSegment,
  clearInsightSegments,
  getInsightSegment,
  listInsightSegments,
} from "./segment/segment.registry";

export type {
  CustomerInsightRecommendation,
  InsightRecommendationKind,
  IssueRecommendationInput,
  RecommendationMetadata,
} from "./recommendation/recommendation.types";

export {
  clearRecommendations,
  getRecommendation,
  issueRecommendation,
  listRecommendations,
} from "./recommendation/recommendation.registry";

export {
  assertCustomerInsightReadinessReady,
  evaluateCustomerInsightReadiness,
} from "./insight/insight.readiness";

export {
  clearCustomerInsightLayer,
  createCustomerInsightManager,
  getCustomerInsightRegistryManifest,
  type CustomerInsightManager,
  type CustomerInsightManagerSnapshot,
} from "./customer-insight.manager";

export {
  assertProductCustomerInsightReleaseGatePass,
  checkProductCustomerInsightReleaseGate,
  PRODUCT_CUSTOMER_INSIGHT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
