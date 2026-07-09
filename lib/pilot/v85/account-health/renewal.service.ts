/**
 * V85 — Renewal forecast (read-only, derived)
 */

import {
  DEFAULT_RENEWAL_PERIOD_MS,
  EXPIRING_SOON_DAYS,
  type AccountHealthScores,
  type AccountScoreInput,
  type RenewalForecast,
  type RenewalForecastCategory,
} from "./account.types";
import { computeAccountHealthScores } from "./health.service";
import { getCachedForecast, setCachedForecast } from "./forecast.store";

export function computeRenewalDate(signedOffAt: string): string {
  const ms = new Date(signedOffAt).getTime() + DEFAULT_RENEWAL_PERIOD_MS;
  return new Date(ms).toISOString();
}

export function daysUntilRenewal(signedOffAt: string, now = new Date()): number {
  const renewalMs = new Date(signedOffAt).getTime() + DEFAULT_RENEWAL_PERIOD_MS;
  return Math.ceil((renewalMs - now.getTime()) / (24 * 60 * 60 * 1000));
}

export function classifyRenewalForecast(input: {
  scores: AccountHealthScores;
  followUp: AccountScoreInput["followUp"];
  daysUntilRenewal: number;
  patterns?: string[];
}): { category: RenewalForecastCategory; reason: string; outreachRecommended: boolean } {
  const { scores, followUp, daysUntilRenewal: days } = input;

  if (
    scores.riskScore >= 65 ||
    followUp.status === "escalated" ||
    input.patterns?.includes("failed_delivery")
  ) {
    return {
      category: "at_risk",
      reason: "高风险分或已升级，续约存在流失风险",
      outreachRecommended: true,
    };
  }

  if (
    days <= EXPIRING_SOON_DAYS &&
    scores.renewalLikelihood < 60
  ) {
    return {
      category: "expiring_soon",
      reason: `距续约 ${days} 天，续约可能性偏低`,
      outreachRecommended: true,
    };
  }

  if (
    followUp.status === "pending" ||
    followUp.status === "in_progress" ||
    followUp.responseStatus === "no_response" ||
    followUp.responseStatus === "unknown"
  ) {
    if (scores.renewalLikelihood < 70 || days <= EXPIRING_SOON_DAYS) {
      return {
        category: "needs_outreach",
        reason: "需主动外联 — 跟进未完成或客户未响应",
        outreachRecommended: true,
      };
    }
  }

  if (scores.renewalLikelihood >= 65 && followUp.status === "resolved") {
    return {
      category: "likely_renew",
      reason: "健康分与跟进状态良好，续约概率高",
      outreachRecommended: false,
    };
  }

  if (scores.renewalLikelihood >= 55 && scores.engagementScore >= 50) {
    return {
      category: "likely_renew",
      reason: "参与度与健康分达标",
      outreachRecommended: days <= EXPIRING_SOON_DAYS,
    };
  }

  if (days <= EXPIRING_SOON_DAYS) {
    return {
      category: "expiring_soon",
      reason: `续约窗口 ${days} 天内到期`,
      outreachRecommended: true,
    };
  }

  return {
    category: "needs_outreach",
    reason: "建议持续客户成功触达",
    outreachRecommended: scores.renewalLikelihood < 60,
  };
}

export function buildRenewalForecast(
  input: AccountScoreInput & { organizationId: string; patterns?: string[] },
  options?: { now?: Date; useCache?: boolean },
): RenewalForecast {
  if (options?.useCache) {
    const cached = getCachedForecast(input.organizationId, input.sessionId);
    if (cached) return cached.forecast;
  }

  const now = options?.now ?? new Date();
  const scores = computeAccountHealthScores(input);
  const days = daysUntilRenewal(input.signedOffAt, now);
  const classified = classifyRenewalForecast({
    scores,
    followUp: input.followUp,
    daysUntilRenewal: days,
    patterns: input.patterns,
  });

  const forecast: RenewalForecast = {
    sessionId: input.sessionId,
    category: classified.category,
    renewalDate: computeRenewalDate(input.signedOffAt),
    daysUntilRenewal: days,
    outreachRecommended: classified.outreachRecommended,
    reason: classified.reason,
    readOnly: true,
  };

  if (options?.useCache) {
    setCachedForecast({
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      forecast,
      scores,
      cachedAt: now.toISOString(),
    });
  }

  return forecast;
}

export const FORECAST_CATEGORY_LABELS: Record<RenewalForecastCategory, string> = {
  expiring_soon: "即将到期",
  likely_renew: "可能续约",
  at_risk: "流失风险",
  needs_outreach: "需外联",
};
