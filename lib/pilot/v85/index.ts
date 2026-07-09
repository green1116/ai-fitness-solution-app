/**
 * V85 — Account health & renewal forecasting
 */

export {
  V85_ACCOUNT_HEALTH_VERSION,
  DEFAULT_RENEWAL_PERIOD_MS,
  EXPIRING_SOON_DAYS,
  type AccountHealthDashboard,
  type AccountHealthDetail,
  type AccountHealthRow,
  type AccountHealthScores,
  type AccountScoreInput,
  type DeliveryHistoryEntry,
  type RenewalForecast,
  type RenewalForecastCategory,
} from "./account-health/account.types";

export {
  clearForecastCacheForTests,
  getCachedForecast,
  setCachedForecast,
} from "./account-health/forecast.store";

export {
  buildDeliveryHistory,
  computeAccountHealthScores,
  computeEngagementScore,
  deriveOpenRisks,
} from "./account-health/health.service";

export {
  buildRenewalForecast,
  classifyRenewalForecast,
  computeRenewalDate,
  daysUntilRenewal,
  FORECAST_CATEGORY_LABELS,
} from "./account-health/renewal.service";

export {
  buildAccountHealthDashboard,
  buildAccountHealthDetail,
} from "./account-health/account.service";
