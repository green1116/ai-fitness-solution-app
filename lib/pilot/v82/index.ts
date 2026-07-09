/**
 * V82 — Delivery analytics & SLA monitoring
 */

export {
  V82_DELIVERY_ANALYTICS_VERSION,
  DEFAULT_SLA_THRESHOLDS,
  type DeliveryAlert,
  type DeliveryAlertKind,
  type DeliveryAnalyticsKpis,
  type DeliveryMonitoringDashboard,
  type SessionMonitoringTimeline,
  type SessionSlaStatus,
  type SessionTimelineEntry,
  type SlaMetricStatus,
  type SlaThresholds,
} from "./analytics/analytics.types";

export { aggregateDeliveryAnalytics } from "./analytics/analytics.service";

export { evaluateOrgSla, evaluateSessionSla } from "./analytics/sla.service";

export { evaluateOrgAlerts, evaluateSessionAlerts } from "./analytics/alert.service";

export {
  buildDeliveryMonitoringDashboard,
  buildSessionMonitoringTimeline,
  getOrgTrackingEventCount,
} from "./analytics/monitoring.service";
