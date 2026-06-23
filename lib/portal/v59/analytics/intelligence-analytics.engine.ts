/**
 * V59 P10 — Unified intelligence analytics (read-only aggregation)
 */

import { getProductAnalyticsSnapshot } from "@/lib/portal/v57/experience/product-analytics";
import { getDeliveryAnalyticsSnapshot } from "@/lib/portal/v58/analytics/delivery-analytics";
import type {
  IntelligenceActivity,
  IntelligenceAnalyticsReport,
  IntelligenceTrendPoint,
} from "./intelligence-analytics.types";

function normalizeEvents(organizationId: string): IntelligenceActivity[] {
  const product = getProductAnalyticsSnapshot(500)
    .filter((e) => e.organizationId === organizationId)
    .map((e) => ({
      event: e.event,
      timestamp: e.timestamp,
      projectId: e.projectId,
      quoteId: e.quoteId,
      meta: e.meta,
    }));

  const delivery = getDeliveryAnalyticsSnapshot(500)
    .filter((e) => e.organizationId === organizationId)
    .map((e) => ({
      event: e.event,
      timestamp: e.timestamp,
      projectId: e.projectId,
      quoteId: e.quoteId,
      meta: e.meta,
    }));

  return [...product, ...delivery].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function buildTrend(activities: IntelligenceActivity[]): IntelligenceTrendPoint[] {
  const byDay = new Map<string, number>();
  for (const a of activities) {
    const day = a.timestamp.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({ date, count }));
}

export function buildIntelligenceAnalytics(organizationId: string): IntelligenceAnalyticsReport {
  const activities = normalizeEvents(organizationId);
  const byEvent: Record<string, number> = {};
  for (const a of activities) {
    byEvent[a.event] = (byEvent[a.event] ?? 0) + 1;
  }

  const workspaceActivity = byEvent.workspace_entered ?? 0;
  const projectActivity = byEvent.project_created ?? 0;
  const quoteActivity = byEvent.quote_generated ?? 0;
  const deliveryActivity =
    (byEvent.delivery_created ?? 0) +
    (byEvent.tender_pack_generated ?? 0) +
    (byEvent.pdf_downloaded ?? 0);

  const activityScore = Math.min(
    100,
    workspaceActivity * 5 + projectActivity * 10 + quoteActivity * 8 + deliveryActivity * 3,
  );
  const deliveryScore = Math.min(
    100,
    (byEvent.pdf_downloaded ?? 0) * 12 +
      (byEvent.document_viewed ?? 0) * 4 +
      (byEvent.report_opened ?? 0) * 6,
  );

  return {
    totalEvents: activities.length,
    byEvent,
    trend: buildTrend(activities),
    activityScore,
    deliveryScore,
    recentActivities: activities.slice(0, 20),
  };
}
