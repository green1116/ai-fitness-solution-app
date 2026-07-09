/**
 * V83 — Insight engine (read-only, derived from V82 monitoring)
 */

import { randomUUID } from "node:crypto";

import type {
  DeliveryAlert,
  DeliveryMonitoringDashboard,
  SessionSlaStatus,
  SlaThresholds,
} from "@/lib/pilot/v82";
import { DEFAULT_SLA_THRESHOLDS } from "@/lib/pilot/v82";

import type { DeliveryInsight, InsightPattern } from "./intelligence.types";

type SessionContext = {
  sla: SessionSlaStatus;
  alerts: DeliveryAlert[];
  hasOpen: boolean;
  hasDownload: boolean;
  hasFailed: boolean;
  hasPending: boolean;
};

function buildSessionContexts(
  monitoring: DeliveryMonitoringDashboard,
): Map<string, SessionContext> {
  const map = new Map<string, SessionContext>();
  for (const sla of monitoring.sessions) {
    const alerts = monitoring.alerts.filter((a) => a.sessionId === sla.sessionId);
    map.set(sla.sessionId, {
      sla,
      alerts,
      hasOpen: sla.releaseToFirstOpen === "met" || sla.releaseToFirstOpen === "pending",
      hasDownload: sla.releaseToFirstDownload === "met",
      hasFailed: alerts.some((a) => a.kind === "download_failure"),
      hasPending: alerts.some((a) => a.kind === "pending_action_too_long"),
    });
  }
  return map;
}

function isSlowOpen(sla: SessionSlaStatus, thresholds: SlaThresholds, nowMs: number): boolean {
  const releaseMs = new Date(sla.signedOffAt).getTime();
  if (sla.releaseToFirstOpen === "met") {
    return (
      sla.firstOpenMs !== undefined && sla.firstOpenMs > thresholds.firstOpenMs * 0.75
    );
  }
  if (sla.releaseToFirstOpen === "pending") {
    return nowMs - releaseMs > thresholds.firstOpenMs * 0.75;
  }
  return false;
}

function isSlowDownload(sla: SessionSlaStatus, thresholds: SlaThresholds, nowMs: number): boolean {
  const releaseMs = new Date(sla.signedOffAt).getTime();
  if (sla.releaseToFirstDownload === "met") {
    return (
      sla.firstDownloadMs !== undefined &&
      sla.firstDownloadMs > thresholds.firstDownloadMs * 0.75
    );
  }
  if (sla.releaseToFirstDownload === "pending" && sla.releaseToFirstOpen === "met") {
    return nowMs - releaseMs > thresholds.firstDownloadMs * 0.75;
  }
  return false;
}

function insight(
  pattern: InsightPattern,
  title: string,
  description: string,
  sessionIds: string[],
): DeliveryInsight {
  return {
    id: randomUUID(),
    pattern,
    title,
    description,
    sessionIds,
    count: sessionIds.length,
    readOnly: true,
  };
}

export function buildDeliveryInsights(
  monitoring: DeliveryMonitoringDashboard,
  options?: { now?: Date; thresholds?: SlaThresholds },
): DeliveryInsight[] {
  const now = options?.now ?? new Date();
  const thresholds = options?.thresholds ?? DEFAULT_SLA_THRESHOLDS;
  const nowMs = now.getTime();
  const contexts = buildSessionContexts(monitoring);

  const slaRiskIds: string[] = [];
  const failedIds: string[] = [];
  const slowOpenIds: string[] = [];
  const slowDownloadIds: string[] = [];

  for (const [sessionId, ctx] of contexts) {
    if (ctx.sla.overallStatus === "at_risk" || ctx.sla.overallStatus === "breached") {
      slaRiskIds.push(sessionId);
    }
    if (ctx.hasFailed || ctx.sla.failedDeliveryOverdue) {
      failedIds.push(sessionId);
    }
    if (isSlowOpen(ctx.sla, thresholds, nowMs)) {
      slowOpenIds.push(sessionId);
    }
    if (isSlowDownload(ctx.sla, thresholds, nowMs)) {
      slowDownloadIds.push(sessionId);
    }
  }

  const insights: DeliveryInsight[] = [];

  if (slaRiskIds.length > 0) {
    insights.push(
      insight(
        "sla_risk",
        "SLA 风险会话",
        "存在 at_risk 或 breached 状态的发布包，需优先关注",
        slaRiskIds.sort(),
      ),
    );
  }

  if (failedIds.length > 0) {
    insights.push(
      insight(
        "failed_delivery",
        "交付失败模式",
        "检测到 delivery_failed 事件或失败老化超时",
        failedIds.sort(),
      ),
    );
  }

  if (slowOpenIds.length > 0) {
    insights.push(
      insight(
        "slow_open",
        "慢打开模式",
        "发布后首次打开接近或超过 SLA 阈值 75%",
        slowOpenIds.sort(),
      ),
    );
  }

  if (slowDownloadIds.length > 0) {
    insights.push(
      insight(
        "slow_download",
        "慢下载模式",
        "首次下载延迟或接近 SLA 阈值 75%",
        slowDownloadIds.sort(),
      ),
    );
  }

  return insights.sort((a, b) => b.count - a.count);
}

export function rankSessionsBySlaRisk(
  monitoring: DeliveryMonitoringDashboard,
): SessionSlaStatus[] {
  const order = { breached: 0, at_risk: 1, healthy: 2 };
  return [...monitoring.sessions].sort(
    (a, b) => order[a.overallStatus] - order[b.overallStatus],
  );
}
