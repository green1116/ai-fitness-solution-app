/**
 * V90 — Portfolio intelligence & segmentation
 */

export {
  V90_PORTFOLIO_VERSION,
  SEGMENT_LABELS,
  SEGMENT_NEXT_ACTIONS,
  type PortfolioAccountDetail,
  type PortfolioAccountRow,
  type PortfolioActionBadge,
  type PortfolioDashboard,
  type PortfolioPrioritization,
  type PortfolioSegment,
  type SegmentIntelligence,
} from "./portfolio/portfolio.types";

export {
  clearPortfolioCacheForTests,
  getCachedPortfolioDashboard,
  listPortfolioPriorityActions,
  recordPortfolioPriorityAction,
  setCachedPortfolioDashboard,
} from "./portfolio/portfolio.cache";

export {
  classifyPortfolioSegments,
  resolveBaseRenewalValue,
  resolvePrimarySegment,
} from "./portfolio/segmentation.service";

export {
  buildSegmentIntelligence,
  computeChurnExposure,
  computeRankScore,
} from "./portfolio/portfolio-intelligence.service";

export {
  buildPortfolioPrioritization,
  rankPortfolioAccounts,
} from "./portfolio/prioritization.service";

export { buildPortfolioAccountRow } from "./portfolio/portfolio-account.service";

export {
  buildPortfolioAccountDetail,
  buildPortfolioDashboard,
} from "./portfolio/portfolio-dashboard.service";
