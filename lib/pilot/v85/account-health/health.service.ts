/**
 * V85 — Account health scoring (read-only, derived)
 */

import type { FollowUpRecord } from "@/lib/pilot/v84";
import type { DeliveryTrackingEvent } from "@/lib/pilot/v81";

import type { AccountHealthScores, AccountScoreInput } from "./account.types";

const EVENT_ENGAGEMENT: Record<string, number> = {
  release_ready: 10,
  delivery_opened: 25,
  artifact_viewed: 20,
  artifact_downloaded: 35,
  pending_action: -10,
  delivery_failed: -35,
};

const EVENT_LABELS: Record<string, string> = {
  release_ready: "发布就绪",
  delivery_opened: "客户打开",
  artifact_viewed: "产物查看",
  artifact_downloaded: "产物下载",
  pending_action: "待处理",
  delivery_failed: "交付失败",
};

function followUpBonus(followUp: FollowUpRecord): number {
  switch (followUp.status) {
    case "resolved":
      return 100;
    case "in_progress":
      return followUp.responseStatus === "responded" ? 85 : 65;
    case "escalated":
      return 25;
    case "pending":
    default:
      return 40;
  }
}

export function computeEngagementScore(events: DeliveryTrackingEvent[]): number {
  if (events.length === 0) return 15;
  let score = 0;
  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.type)) continue;
    seen.add(event.type);
    score += EVENT_ENGAGEMENT[event.type] ?? 5;
  }
  return Math.max(0, Math.min(100, score));
}

export function computeAccountHealthScores(input: AccountScoreInput): AccountHealthScores {
  const engagementScore = computeEngagementScore(input.events);
  const riskScore = Math.min(100, Math.max(0, input.riskScore));
  const followBonus = followUpBonus(input.followUp);

  const accountHealthScore = Math.round(
    engagementScore * 0.4 + (100 - riskScore) * 0.35 + followBonus * 0.25,
  );

  let renewalLikelihood = accountHealthScore;
  if (input.followUp.status === "escalated") renewalLikelihood -= 25;
  if (input.followUp.responseStatus === "declined") renewalLikelihood -= 30;
  if (input.followUp.responseStatus === "responded") renewalLikelihood += 10;
  if (input.events.some((e) => e.type === "artifact_downloaded")) renewalLikelihood += 10;
  if (input.events.some((e) => e.type === "delivery_failed")) renewalLikelihood -= 20;
  if (input.followUp.status === "resolved") renewalLikelihood += 15;
  if (input.patterns?.includes("failed_delivery")) renewalLikelihood -= 15;

  renewalLikelihood = Math.max(0, Math.min(100, Math.round(renewalLikelihood)));

  return {
    accountHealthScore: Math.max(0, Math.min(100, accountHealthScore)),
    engagementScore,
    riskScore,
    renewalLikelihood,
    readOnly: true,
  };
}

export function buildDeliveryHistory(
  events: DeliveryTrackingEvent[],
  signedOffAt?: string,
): Array<{ type: string; label: string; timestamp: string }> {
  const history: Array<{ type: string; label: string; timestamp: string }> = [];
  if (signedOffAt) {
    history.push({ type: "release", label: "签收发布", timestamp: signedOffAt });
  }
  for (const e of [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
    history.push({
      type: e.type,
      label: EVENT_LABELS[e.type] ?? e.type,
      timestamp: e.timestamp,
    });
  }
  return history;
}

export function deriveOpenRisks(input: {
  scores: AccountHealthScores;
  followUp: FollowUpRecord;
  events: DeliveryTrackingEvent[];
  patterns?: string[];
}): string[] {
  const risks: string[] = [];
  if (input.scores.riskScore >= 60) risks.push("高交付风险");
  if (input.events.some((e) => e.type === "delivery_failed")) risks.push("交付失败记录");
  if (input.followUp.status === "escalated") risks.push("已升级账户");
  if (input.followUp.responseStatus === "no_response") risks.push("客户无响应");
  if (input.followUp.responseStatus === "declined") risks.push("客户拒绝");
  if (input.scores.engagementScore < 30) risks.push("低参与度");
  if (input.patterns?.includes("slow_open")) risks.push("慢打开模式");
  if (input.patterns?.includes("slow_download")) risks.push("慢下载模式");
  return risks;
}
