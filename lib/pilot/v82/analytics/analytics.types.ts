/**
 * V82 — Delivery analytics & SLA monitoring types
 */

import type { DeliveryTrackingEvent } from "@/lib/pilot/v81";

export const V82_DELIVERY_ANALYTICS_VERSION = "v82-delivery-analytics-1";

export type SlaThresholds = {
  /** Max ms from release to first customer open */
  firstOpenMs: number;
  /** Max ms from release to first download */
  firstDownloadMs: number;
  /** Max age for pending_action before alert */
  pendingActionMaxMs: number;
  /** Failed delivery aging before overdue alert */
  failedDeliveryAgingMs: number;
};

export const DEFAULT_SLA_THRESHOLDS: SlaThresholds = {
  firstOpenMs: 24 * 60 * 60 * 1000,
  firstDownloadMs: 72 * 60 * 60 * 1000,
  pendingActionMaxMs: 48 * 60 * 60 * 1000,
  failedDeliveryAgingMs: 4 * 60 * 60 * 1000,
};

export type DeliveryAnalyticsKpis = {
  releasedCount: number;
  openedCount: number;
  downloadedCount: number;
  failedDeliveryCount: number;
  pendingActionCount: number;
  readOnly: true;
};

export type SlaMetricStatus = "met" | "pending" | "breached" | "not_applicable";

export type SessionSlaStatus = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  signedOffAt: string;
  firstOpenMs?: number;
  firstDownloadMs?: number;
  releaseToFirstOpen: SlaMetricStatus;
  releaseToFirstDownload: SlaMetricStatus;
  failedDeliveryAgeMs?: number;
  failedDeliveryOverdue: boolean;
  overallStatus: "healthy" | "at_risk" | "breached";
  readOnly: true;
};

export type DeliveryAlertKind =
  | "no_open_after_release"
  | "download_failure"
  | "pending_action_too_long"
  | "sla_breach";

export type DeliveryAlert = {
  id: string;
  sessionId: string;
  organizationId: string;
  kind: DeliveryAlertKind;
  severity: "warning" | "critical";
  message: string;
  triggeredAt: string;
  meta?: Record<string, unknown>;
  readOnly: true;
};

export type SessionTimelineEntry = {
  id: string;
  timestamp: string;
  type: string;
  label: string;
  artifactKind?: string;
};

export type SessionMonitoringTimeline = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  signedOffAt?: string;
  entries: SessionTimelineEntry[];
  sla: SessionSlaStatus;
  alerts: DeliveryAlert[];
  readOnly: true;
};

export type DeliveryMonitoringDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  kpis: DeliveryAnalyticsKpis;
  slaSummary: {
    healthy: number;
    atRisk: number;
    breached: number;
    thresholds: SlaThresholds;
  };
  alerts: DeliveryAlert[];
  sessions: SessionSlaStatus[];
  readOnly: true;
};

export type SessionEventsInput = {
  sessionId: string;
  signedOffAt: string;
  releasePackageId?: string;
  projectName?: string;
  events: DeliveryTrackingEvent[];
};
