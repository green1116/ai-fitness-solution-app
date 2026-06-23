/**
 * V59 P1 — Delivery tracking intelligence (analytics aggregation only)
 */

import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import { getDeliveryAnalyticsSnapshot } from "@/lib/portal/v58/analytics/delivery-analytics";
import { buildIntelligenceAnalytics } from "../analytics/intelligence-analytics.engine";
import type { IntelligenceActivity } from "../analytics/intelligence-analytics.types";

export type DeliveryTrackingSnapshot = {
  documentViewed: number;
  pdfDownloaded: number;
  tenderPackOpened: number;
  reportOpened: number;
  totalDownloadCount: number;
  lastDownloadTime: string | null;
  recentActivity: IntelligenceActivity[];
};

export async function getDeliveryTrackingSnapshot(
  organizationId: string,
): Promise<DeliveryTrackingSnapshot> {
  const analytics = buildIntelligenceAnalytics(organizationId);
  const deliveryLog = getDeliveryAnalyticsSnapshot(500).filter(
    (e) => e.organizationId === organizationId,
  );
  const deliveries = await aggregateDeliveries(organizationId);

  const pdfEvents = deliveryLog.filter((e) => e.event === "pdf_downloaded");
  const lastPdf = pdfEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];

  return {
    documentViewed: analytics.byEvent.document_viewed ?? 0,
    pdfDownloaded: analytics.byEvent.pdf_downloaded ?? 0,
    tenderPackOpened: analytics.byEvent.tender_pack_generated ?? 0,
    reportOpened: analytics.byEvent.report_opened ?? 0,
    totalDownloadCount: deliveries.reduce((n, d) => n + d.downloadCount, 0) + pdfEvents.length,
    lastDownloadTime: lastPdf?.timestamp ?? null,
    recentActivity: analytics.recentActivities.slice(0, 12),
  };
}
