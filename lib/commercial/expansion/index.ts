/**
 * ESXP — Expansion public exports
 */

export {
  ESXP_1_ID,
  EXPANSION_STATE_CAPABILITY,
  EXPANSION_STATE_VERSION,
  ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
  ESCR_V1_BASELINE,
  EXPANSION_STATES,
  expansionStateFromSignals,
  buildExpansionState,
  getExpansionState,
  expansionStateFingerprint,
  clearExpansionState,
  type ExpansionStateLevel,
  type ExpansionStateRecord,
  type ExpansionState,
} from "./state";

export {
  ESXP_2_ID,
  EXPANSION_OPPORTUNITY_CAPABILITY,
  EXPANSION_OPPORTUNITY_VERSION,
  ESXP1_EXPANSION_STATE_BASELINE,
  EXPANSION_OPPORTUNITIES,
  expansionOpportunityFromState,
  buildExpansionOpportunity,
  getExpansionOpportunity,
  expansionOpportunityFingerprint,
  clearExpansionOpportunity,
  ensureStateThenBuildExpansionOpportunity,
  type ExpansionOpportunityKind,
  type ExpansionOpportunityRecord,
  type ExpansionOpportunity,
} from "./opportunity";

export {
  ESXP_3_ID,
  EXPANSION_RECOMMENDATION_CAPABILITY,
  EXPANSION_RECOMMENDATION_VERSION,
  ESXP2_EXPANSION_OPPORTUNITY_BASELINE,
  EXPANSION_RECOMMENDATIONS,
  expansionRecommendationFromOpportunity,
  buildExpansionRecommendation,
  getExpansionRecommendation,
  expansionRecommendationFingerprint,
  clearExpansionRecommendation,
  ensureOpportunityThenBuildExpansionRecommendation,
  type ExpansionRecommendationKind,
  type ExpansionRecommendationRecord,
  type ExpansionRecommendation,
} from "./recommendation";

export {
  ESXP_4_ID,
  EXPANSION_OUTCOME_CAPABILITY,
  EXPANSION_OUTCOME_VERSION,
  ESXP3_EXPANSION_RECOMMENDATION_BASELINE,
  EXPANSION_OUTCOMES,
  expansionOutcomeFromRecommendation,
  buildExpansionOutcome,
  getExpansionOutcome,
  expansionOutcomeFingerprint,
  clearExpansionOutcome,
  ensureRecommendationThenBuildExpansionOutcome,
  type ExpansionOutcomeKind,
  type ExpansionOutcomeRecord,
  type ExpansionOutcome,
} from "./outcome";

export {
  ESXP_5_ID,
  EXPANSION_FEEDBACK_CAPABILITY,
  EXPANSION_FEEDBACK_VERSION,
  ESXP4_EXPANSION_OUTCOME_BASELINE,
  EXPANSION_FEEDBACKS,
  expansionFeedbackFromOutcome,
  buildExpansionFeedback,
  getExpansionFeedback,
  expansionFeedbackFingerprint,
  clearExpansionFeedback,
  ensureOutcomeThenBuildExpansionFeedback,
  type ExpansionFeedbackKind,
  type ExpansionFeedbackRecord,
  type ExpansionFeedback,
} from "./feedback";

export {
  ESXP_6_ID,
  ESXP_FREEZE_ID,
  ESXP_FREEZE_CAPABILITY,
  ESXP_FREEZE_VERSION,
  ESXP_FREEZE_CODENAME,
  ESXP_FREEZE_DATE,
  ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1,
  ESXP_COMPONENTS,
  buildEsxpFreeze,
  getEsxpFreeze,
  esxpFreezeFingerprint,
  clearEsxpFreeze,
  ensureFeedbackThenBuildEsxpFreeze,
  type EsxpComponentStatus,
  type EsxpComponentEntry,
  type EsxpFreezeManifest,
  type EsxpFreeze,
} from "./freeze";
