/**
 * V83 — Delivery intelligence dashboard (read-only optimization layer)
 */

import {
  buildDeliveryMonitoringDashboard,
  buildSessionMonitoringTimeline,
  type SlaThresholds,
} from "@/lib/pilot/v82";

import { buildDeliveryInsights } from "./insight.service";
import type {
  DeliveryIntelligenceDashboard,
  SessionIntelligenceDetail,
} from "./intelligence.types";
import { V83_DELIVERY_INTELLIGENCE_VERSION } from "./intelligence.types";
import {
  buildOrgRecommendations,
  buildRankedSessions,
  buildSessionRecommendations,
} from "./recommendation.service";

function patternsForSession(
  sessionId: string,
  insights: ReturnType<typeof buildDeliveryInsights>,
) {
  return insights.filter((i) => i.sessionIds.includes(sessionId)).map((i) => i.pattern);
}

export function buildDeliveryIntelligenceDashboard(
  organizationId: string,
  options?: { now?: Date; thresholds?: SlaThresholds },
): DeliveryIntelligenceDashboard {
  const monitoring = buildDeliveryMonitoringDashboard(organizationId, options);
  const insights = buildDeliveryInsights(monitoring, options);
  const recommendations = buildOrgRecommendations(monitoring, insights, options);
  const rankedSessions = buildRankedSessions(monitoring, recommendations, insights);

  const summary = {
    highRisk: rankedSessions.filter((s) => s.priority === "high").length,
    mediumRisk: rankedSessions.filter((s) => s.priority === "medium").length,
    lowRisk: rankedSessions.filter((s) => s.priority === "low").length,
    dueNow: rankedSessions.filter((s) => s.due === "due_now").length,
    dueSoon: rankedSessions.filter((s) => s.due === "soon").length,
    dueLater: rankedSessions.filter((s) => s.due === "later").length,
  };

  return {
    version: V83_DELIVERY_INTELLIGENCE_VERSION,
    organizationId,
    generatedAt: (options?.now ?? new Date()).toISOString(),
    insights,
    recommendations,
    rankedSessions,
    summary,
    readOnly: true,
  };
}

export function buildSessionIntelligenceDetail(
  sessionId: string,
  organizationId: string,
  options?: { now?: Date; thresholds?: SlaThresholds },
): SessionIntelligenceDetail {
  const monitoring = buildDeliveryMonitoringDashboard(organizationId, options);
  const insights = buildDeliveryInsights(monitoring, options);
  const sla = monitoring.sessions.find((s) => s.sessionId === sessionId);
  if (!sla) throw new Error("NOT_RELEASED");

  const alerts = monitoring.alerts.filter((a) => a.sessionId === sessionId);
  const patterns = patternsForSession(sessionId, insights);
  const sessionInsights = insights.filter((i) => i.sessionIds.includes(sessionId));
  const recommendations = buildSessionRecommendations({
    sla,
    alerts,
    patterns,
    insights,
    now: options?.now,
  });

  const ranked = buildRankedSessions(monitoring, recommendations, insights).find(
    (s) => s.sessionId === sessionId,
  );
  if (!ranked) throw new Error("NOT_RELEASED");

  return {
    sessionId,
    releasePackageId: sla.releasePackageId,
    projectName: sla.projectName,
    insights: sessionInsights,
    recommendations,
    ranked,
    timelinePath: `/api/pilot/v82/delivery-analytics/${sessionId}`,
    analyticsPath: `/pilot/delivery-analytics`,
    opsPath: `/pilot/delivery-ops`,
    readOnly: true,
  };
}

export function getSessionTimelineForDrilldown(
  sessionId: string,
  organizationId: string,
  options?: { now?: Date; thresholds?: SlaThresholds },
) {
  return buildSessionMonitoringTimeline(sessionId, organizationId, options);
}
