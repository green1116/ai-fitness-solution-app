/**
 * V82 — Delivery analytics aggregation (read-only)
 */

import { listIntakeSessionsForOrg } from "@/lib/pilot/v80";
import { listDeliveryTrackingForOrg, summarizeTracking } from "@/lib/pilot/v81";

import type { DeliveryAnalyticsKpis } from "./analytics.types";

export function aggregateDeliveryAnalytics(organizationId: string): DeliveryAnalyticsKpis {
  const released = listIntakeSessionsForOrg(organizationId).filter((s) => s.signedOff === true);
  const orgEvents = listDeliveryTrackingForOrg(organizationId);

  const eventsBySession = new Map<string, typeof orgEvents>();
  for (const event of orgEvents) {
    const list = eventsBySession.get(event.sessionId) ?? [];
    list.push(event);
    eventsBySession.set(event.sessionId, list);
  }

  let openedCount = 0;
  let downloadedCount = 0;
  let failedDeliveryCount = 0;
  let pendingActionCount = 0;

  for (const session of released) {
    const events = eventsBySession.get(session.id) ?? [];
    const summary = summarizeTracking(events);
    if (summary.opened) openedCount++;
    if (summary.downloaded) downloadedCount++;
    if (summary.failed) failedDeliveryCount++;
    if (summary.pendingAction) pendingActionCount++;
  }

  return {
    releasedCount: released.length,
    openedCount,
    downloadedCount,
    failedDeliveryCount,
    pendingActionCount,
    readOnly: true,
  };
}
