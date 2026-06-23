/**
 * V59 — Intelligence analytics types
 */

export const INTELLIGENCE_ANALYTICS_EVENTS = [
  "workspace_entered",
  "project_created",
  "quote_generated",
  "document_viewed",
  "pdf_downloaded",
  "delivery_created",
  "tender_pack_generated",
  "report_opened",
] as const;

export type IntelligenceAnalyticsEventName = (typeof INTELLIGENCE_ANALYTICS_EVENTS)[number];

export type IntelligenceActivity = {
  event: string;
  timestamp: string;
  projectId?: string;
  quoteId?: string;
  meta?: Record<string, unknown>;
};

export type IntelligenceTrendPoint = {
  date: string;
  count: number;
};

export type IntelligenceAnalyticsReport = {
  totalEvents: number;
  byEvent: Record<string, number>;
  trend: IntelligenceTrendPoint[];
  activityScore: number;
  deliveryScore: number;
  recentActivities: IntelligenceActivity[];
};
