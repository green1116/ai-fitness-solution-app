/**
 * V82 — Delivery monitoring dashboard (read-only)
 */

import { getIntakeSession, listIntakeSessionsForOrg } from "@/lib/pilot/v80";
import { listDeliveryTrackingEvents, listDeliveryTrackingForOrg } from "@/lib/pilot/v81";

import { aggregateDeliveryAnalytics } from "./analytics.service";
import { evaluateOrgAlerts } from "./alert.service";
import type {
  DeliveryMonitoringDashboard,
  SessionMonitoringTimeline,
  SessionTimelineEntry,
  SlaThresholds,
} from "./analytics.types";
import { DEFAULT_SLA_THRESHOLDS, V82_DELIVERY_ANALYTICS_VERSION } from "./analytics.types";
import { evaluateOrgSla, evaluateSessionSla } from "./sla.service";
import { evaluateSessionAlerts } from "./alert.service";

const EVENT_LABELS: Record<string, string> = {
  release_ready: "发布就绪",
  delivery_opened: "客户打开",
  artifact_viewed: "产物查看",
  artifact_downloaded: "产物下载",
  pending_action: "待处理",
  delivery_failed: "交付失败",
};

function buildSessionInputs(organizationId: string) {
  const released = listIntakeSessionsForOrg(organizationId).filter((s) => s.signedOff === true);
  return released.map((session) => ({
    sessionId: session.id,
    organizationId,
    signedOffAt: session.signedOffAt!,
    releasePackageId: session.releasePackageId,
    projectName: session.requirements?.projectName,
    events: listDeliveryTrackingEvents(session.id),
  }));
}

export function buildDeliveryMonitoringDashboard(
  organizationId: string,
  options?: { now?: Date; thresholds?: SlaThresholds },
): DeliveryMonitoringDashboard {
  const thresholds = options?.thresholds ?? DEFAULT_SLA_THRESHOLDS;
  const sessionInputs = buildSessionInputs(organizationId);
  const kpis = aggregateDeliveryAnalytics(organizationId);
  const sessions = evaluateOrgSla(sessionInputs, options);
  const alerts = evaluateOrgAlerts(sessionInputs, options);

  const slaSummary = {
    healthy: sessions.filter((s) => s.overallStatus === "healthy").length,
    atRisk: sessions.filter((s) => s.overallStatus === "at_risk").length,
    breached: sessions.filter((s) => s.overallStatus === "breached").length,
    thresholds,
  };

  return {
    version: V82_DELIVERY_ANALYTICS_VERSION,
    organizationId,
    generatedAt: (options?.now ?? new Date()).toISOString(),
    kpis,
    slaSummary,
    alerts,
    sessions,
    readOnly: true,
  };
}

function buildTimelineEntries(
  signedOffAt: string | undefined,
  events: ReturnType<typeof listDeliveryTrackingEvents>,
): SessionTimelineEntry[] {
  const entries: SessionTimelineEntry[] = [];

  if (signedOffAt) {
    entries.push({
      id: "release",
      timestamp: signedOffAt,
      type: "release",
      label: "最终签收发布",
    });
  }

  for (const event of [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
    entries.push({
      id: event.id,
      timestamp: event.timestamp,
      type: event.type,
      label: EVENT_LABELS[event.type] ?? event.type,
      artifactKind: event.artifactKind,
    });
  }

  return entries;
}

export function buildSessionMonitoringTimeline(
  sessionId: string,
  organizationId: string,
  options?: { now?: Date; thresholds?: SlaThresholds },
): SessionMonitoringTimeline {
  const session = getIntakeSession(sessionId);
  if (!session || session.organizationId !== organizationId || !session.signedOff) {
    throw new Error("NOT_RELEASED");
  }

  const events = listDeliveryTrackingEvents(sessionId);
  const input = {
    sessionId,
    organizationId,
    signedOffAt: session.signedOffAt!,
    releasePackageId: session.releasePackageId,
    projectName: session.requirements?.projectName,
    events,
  };

  const sla = evaluateSessionSla(input, options);
  const alerts = evaluateSessionAlerts(input, options);

  return {
    sessionId,
    releasePackageId: session.releasePackageId,
    projectName: session.requirements?.projectName,
    signedOffAt: session.signedOffAt,
    entries: buildTimelineEntries(session.signedOffAt, events),
    sla,
    alerts,
    readOnly: true,
  };
}

export function getOrgTrackingEventCount(organizationId: string): number {
  return listDeliveryTrackingForOrg(organizationId).length;
}
