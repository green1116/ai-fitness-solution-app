/**
 * ESCI — Customer intelligence public exports
 */

export {
  ESCI_1_ID,
  CUSTOMER_INTELLIGENCE_STATE_CAPABILITY,
  CUSTOMER_INTELLIGENCE_STATE_VERSION,
  ESCA_V1_BASELINE,
  CUSTOMER_INTELLIGENCE_STATES,
  customerIntelligenceStateFromSignals,
  buildCustomerIntelligenceState,
  getCustomerIntelligenceState,
  customerIntelligenceStateFingerprint,
  clearCustomerIntelligenceState,
  type CustomerIntelligenceStateLevel,
  type CustomerIntelligenceStateRecord,
  type CustomerIntelligenceState,
} from "./customer-intelligence-state";

export {
  ESCI_2_ID,
  INTELLIGENCE_SIGNAL_CAPABILITY,
  INTELLIGENCE_SIGNAL_VERSION,
  ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE,
  INTELLIGENCE_SIGNALS,
  intelligenceSignalFromState,
  buildIntelligenceSignal,
  getIntelligenceSignal,
  intelligenceSignalFingerprint,
  clearIntelligenceSignal,
  ensureStateThenBuildIntelligenceSignal,
  type IntelligenceSignalKind,
  type IntelligenceSignalRecord,
  type IntelligenceSignal,
} from "./intelligence-signal";

export {
  ESCI_3_ID,
  CUSTOMER_PORTFOLIO_INTELLIGENCE_CAPABILITY,
  CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION,
  ESCI2_INTELLIGENCE_SIGNAL_BASELINE,
  portfolioIntelligenceFromCounts,
  buildCustomerPortfolioIntelligence,
  getCustomerPortfolioIntelligence,
  customerPortfolioIntelligenceFingerprint,
  clearCustomerPortfolioIntelligence,
  ensureSignalThenBuildCustomerPortfolioIntelligence,
  type CustomerPortfolioIntelligenceRecord,
  type CustomerPortfolioIntelligence,
} from "./customer-portfolio-intelligence";

export {
  ESCI_4_ID,
  INTELLIGENCE_RECOMMENDATION_CAPABILITY,
  INTELLIGENCE_RECOMMENDATION_VERSION,
  ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE,
  INTELLIGENCE_RECOMMENDATIONS,
  intelligenceRecommendationFromSignals,
  buildIntelligenceRecommendation,
  getIntelligenceRecommendation,
  intelligenceRecommendationFingerprint,
  clearIntelligenceRecommendation,
  ensurePortfolioThenBuildIntelligenceRecommendation,
  type IntelligenceRecommendationKind,
  type IntelligenceRecommendationRecord,
  type IntelligenceRecommendation,
} from "./intelligence-recommendation";

export {
  ESCI_FREEZE_ID,
  ESCI_FREEZE_CAPABILITY,
  ESCI_FREEZE_VERSION,
  ESCI_FREEZE_CODENAME,
  ESCI_FREEZE_DATE,
  ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1,
  ESCI_COMPONENTS,
  buildEsciFreeze,
  getEsciFreeze,
  esciFreezeFingerprint,
  clearEsciFreeze,
  ensureRecommendationThenBuildEsciFreeze,
  type EsciComponentStatus,
  type EsciComponentEntry,
  type EsciFreezeManifest,
  type EsciFreeze,
} from "./intelligence-freeze-manifest";
