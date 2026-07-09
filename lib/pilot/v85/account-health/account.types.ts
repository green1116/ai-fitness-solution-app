/**
 * V85 — Account health & renewal forecasting types
 */

import type { CrmCustomerRow, FollowUpRecord } from "@/lib/pilot/v84";
import type { DeliveryTrackingEvent } from "@/lib/pilot/v81";

export const V85_ACCOUNT_HEALTH_VERSION = "v85-account-health-1";

/** Default renewal window from sign-off (90 days) */
export const DEFAULT_RENEWAL_PERIOD_MS = 90 * 24 * 60 * 60 * 1000;

/** Days before renewal to flag expiring soon */
export const EXPIRING_SOON_DAYS = 30;

export type RenewalForecastCategory =
  | "expiring_soon"
  | "likely_renew"
  | "at_risk"
  | "needs_outreach";

export type AccountHealthScores = {
  accountHealthScore: number;
  engagementScore: number;
  riskScore: number;
  renewalLikelihood: number;
  readOnly: true;
};

export type RenewalForecast = {
  sessionId: string;
  category: RenewalForecastCategory;
  renewalDate: string;
  daysUntilRenewal: number;
  outreachRecommended: boolean;
  reason: string;
  readOnly: true;
};

export type DeliveryHistoryEntry = {
  type: string;
  label: string;
  timestamp: string;
};

export type AccountHealthRow = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  fileName?: string;
  signedOffAt?: string;
  scores: AccountHealthScores;
  forecast: RenewalForecast;
  followUp: FollowUpRecord;
  openRisks: string[];
  deliveryHistory: DeliveryHistoryEntry[];
  lastEventAt?: string;
  lastEventLabel?: string;
  recommendedTitle: string;
  readOnly: true;
};

export type AccountHealthDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  accounts: AccountHealthRow[];
  renewalList: AccountHealthRow[];
  summary: {
    total: number;
    healthy: number;
    atRisk: number;
    expiringSoon: number;
    likelyRenew: number;
    needsOutreach: number;
    avgHealthScore: number;
    avgRenewalLikelihood: number;
  };
  readOnly: true;
};

export type AccountHealthDetail = {
  account: AccountHealthRow;
  customer: CrmCustomerRow;
  forecastTimeline: Array<{
    date: string;
    label: string;
    kind: "release" | "event" | "follow_up" | "renewal";
  }>;
  readOnly: true;
};

export type AccountScoreInput = {
  sessionId: string;
  signedOffAt: string;
  riskScore: number;
  events: DeliveryTrackingEvent[];
  followUp: FollowUpRecord;
  patterns?: string[];
};
