/**
 * V83 — Actionable recommendations (read-only)
 */

import { randomUUID } from "node:crypto";

import type { DeliveryAlert, DeliveryMonitoringDashboard, SessionSlaStatus } from "@/lib/pilot/v82";

import type {
  DeliveryRecommendation,
  InsightPattern,
  RankedSession,
  RecommendationAction,
} from "./intelligence.types";
import { scoreSessionPriority } from "./priority.service";

const ACTION_LABELS: Record<RecommendationAction, string> = {
  follow_up_needed: "需要跟进",
  retry_delivery: "重试交付",
  escalate_to_admin: "升级管理员",
  customer_success_action: "客户成功触达",
};

function patternsForSession(
  sessionId: string,
  insights: { pattern: InsightPattern; sessionIds: string[] }[],
): InsightPattern[] {
  return insights
    .filter((i) => i.sessionIds.includes(sessionId))
    .map((i) => i.pattern);
}

function pickAction(
  sla: SessionSlaStatus,
  alerts: DeliveryAlert[],
  patterns: InsightPattern[],
): RecommendationAction {
  if (alerts.some((a) => a.kind === "download_failure") || patterns.includes("failed_delivery")) {
    return "retry_delivery";
  }
  if (sla.overallStatus === "breached" || alerts.some((a) => a.kind === "sla_breach")) {
    return "escalate_to_admin";
  }
  if (
    alerts.some((a) => a.kind === "no_open_after_release") ||
    patterns.includes("slow_open") ||
    alerts.some((a) => a.kind === "pending_action_too_long")
  ) {
    return "follow_up_needed";
  }
  if (
    patterns.includes("slow_download") ||
    (sla.releaseToFirstOpen === "met" && sla.releaseToFirstDownload === "pending")
  ) {
    return "customer_success_action";
  }
  return "customer_success_action";
}

function buildReason(
  action: RecommendationAction,
  sla: SessionSlaStatus,
  alerts: DeliveryAlert[],
): string {
  switch (action) {
    case "retry_delivery":
      return `交付失败 — SLA ${sla.overallStatus}，建议重试生成/导出`;
    case "escalate_to_admin":
      return `SLA 违约或 critical 告警 — 需 explicitRecovery 管理员路径`;
    case "follow_up_needed":
      return alerts.find((a) => a.kind === "no_open_after_release")?.message ??
        "客户尚未打开或待处理超时，需运营跟进";
    case "customer_success_action":
      return sla.releaseToFirstDownload === "pending"
        ? "已打开但未下载，建议客户成功触达"
        : "发布健康，建议主动确认满意度";
    default:
      return "基于 SLA 与追踪事件派生";
  }
}

export function buildSessionRecommendations(input: {
  sla: SessionSlaStatus;
  alerts: DeliveryAlert[];
  patterns: InsightPattern[];
  insights: { pattern: InsightPattern; sessionIds: string[] }[];
  now?: Date;
}): DeliveryRecommendation[] {
  const patterns =
    input.patterns.length > 0
      ? input.patterns
      : patternsForSession(input.sla.sessionId, input.insights);

  const priority = scoreSessionPriority({
    sla: input.sla,
    alerts: input.alerts,
    patterns,
    now: input.now,
  });

  const action = pickAction(input.sla, input.alerts, patterns);
  const reason = buildReason(action, input.sla, input.alerts);

  const rec: DeliveryRecommendation = {
    id: randomUUID(),
    sessionId: input.sla.sessionId,
    releasePackageId: input.sla.releasePackageId,
    projectName: input.sla.projectName,
    action,
    priority: priority.priority,
    due: priority.due,
    score: priority.score,
    title: ACTION_LABELS[action],
    reason,
    drilldownPath: `/pilot/delivery-intelligence?session=${input.sla.sessionId}`,
    readOnly: true,
  };

  return [rec];
}

export function buildOrgRecommendations(
  monitoring: DeliveryMonitoringDashboard,
  insights: { pattern: InsightPattern; sessionIds: string[] }[],
  options?: { now?: Date },
): DeliveryRecommendation[] {
  const recs: DeliveryRecommendation[] = [];

  for (const sla of monitoring.sessions) {
    const alerts = monitoring.alerts.filter((a) => a.sessionId === sla.sessionId);
    const patterns = patternsForSession(sla.sessionId, insights);
    recs.push(
      ...buildSessionRecommendations({ sla, alerts, patterns, insights, now: options?.now }),
    );
  }

  return recs.sort((a, b) => {
    const dueOrder = { due_now: 0, soon: 1, later: 2 };
    const priOrder = { high: 0, medium: 1, low: 2 };
    if (dueOrder[a.due] !== dueOrder[b.due]) return dueOrder[a.due] - dueOrder[b.due];
    if (priOrder[a.priority] !== priOrder[b.priority]) {
      return priOrder[a.priority] - priOrder[b.priority];
    }
    return b.score - a.score;
  });
}

export function buildRankedSession(
  sla: SessionSlaStatus,
  recommendations: DeliveryRecommendation[],
  patterns: InsightPattern[],
): RankedSession {
  const top = recommendations.find((r) => r.sessionId === sla.sessionId) ?? recommendations[0];
  return {
    sessionId: sla.sessionId,
    releasePackageId: sla.releasePackageId,
    projectName: sla.projectName,
    priority: top?.priority ?? "low",
    due: top?.due ?? "later",
    score: top?.score ?? 0,
    topAction: top?.action ?? "customer_success_action",
    patterns,
    slaStatus: sla.overallStatus,
    recommendations: recommendations.filter((r) => r.sessionId === sla.sessionId),
    readOnly: true,
  };
}

export function buildRankedSessions(
  monitoring: DeliveryMonitoringDashboard,
  recommendations: DeliveryRecommendation[],
  insights: { pattern: InsightPattern; sessionIds: string[] }[],
): RankedSession[] {
  return monitoring.sessions
    .map((sla) => {
      const patterns = patternsForSession(sla.sessionId, insights);
      return buildRankedSession(
        sla,
        recommendations.filter((r) => r.sessionId === sla.sessionId),
        patterns,
      );
    })
    .sort((a, b) => {
      const dueOrder = { due_now: 0, soon: 1, later: 2 };
      const priOrder = { high: 0, medium: 1, low: 2 };
      if (dueOrder[a.due] !== dueOrder[b.due]) return dueOrder[a.due] - dueOrder[b.due];
      if (priOrder[a.priority] !== priOrder[b.priority]) {
        return priOrder[a.priority] - priOrder[b.priority];
      }
      return b.score - a.score;
    });
}
