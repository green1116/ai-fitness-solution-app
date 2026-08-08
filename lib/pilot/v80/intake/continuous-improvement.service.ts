/**
 * V80 Pilot P15 — Continuous improvement: aggregate outcomes → quality → governance feedback
 */

import { createHash } from "node:crypto";

import { appendIntakeAudit } from "./audit-trail.service";
import {
  CONTINUOUS_IMPROVEMENT_VERSION,
  type AppliedGovernanceFeedback,
  type ContinuousImprovementReport,
  type ContinuousImprovementState,
  type GovernanceSuggestionAction,
  type ImprovementTrendPoint,
  type KnowledgeQualityBand,
  type PatternQualityScore,
} from "./continuous-improvement.schema";
import {
  getContinuousImprovementState,
  saveContinuousImprovementState,
} from "./continuous-improvement.store";
import {
  demoteOrgKnowledgePattern,
  deprecateOrgKnowledgePattern,
  getOrgKnowledgeGovernanceSnapshot,
  promoteOrgKnowledgePattern,
} from "./org-knowledge-governance.service";
import { getOrgKnowledgeLibrary } from "./org-knowledge.store";
import {
  getOrgRecommendationEffectiveness,
  listRecommendationFeedbackEvents,
} from "./knowledge-recommendation.store";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function emptyState(organizationId: string): ContinuousImprovementState {
  return {
    version: CONTINUOUS_IMPROVEMENT_VERSION,
    organizationId,
    updatedAt: new Date().toISOString(),
    confidenceAdjustments: {},
    appliedFeedback: [],
  };
}

export function qualityBandFor(score: number, shown: number): KnowledgeQualityBand {
  if (shown < 2) return "insufficient";
  if (score >= 0.8) return "excellent";
  if (score >= 0.65) return "good";
  if (score >= 0.45) return "fair";
  return "poor";
}

/** Deterministic knowledge quality score from recommendation outcomes + authority. */
export function scorePatternQuality(input: {
  shown: number;
  accepted: number;
  dismissed: number;
  authority: string;
  status: string;
}): { qualityScore: number; confidenceAdjustment: number; band: KnowledgeQualityBand } {
  const shown = Math.max(0, input.shown);
  const accepted = Math.max(0, input.accepted);
  const dismissed = Math.max(0, input.dismissed);
  const acceptRate = shown === 0 ? 0 : accepted / shown;
  const dismissRate = shown === 0 ? 0 : dismissed / shown;
  const volumeNorm = clamp(shown / 8, 0, 1);
  const authorityBonus =
    input.authority === "canonical"
      ? 0.15
      : input.authority === "promoted"
        ? 0.1
        : input.authority === "reviewed"
          ? 0.05
          : 0;
  const statusPenalty = input.status === "deprecated" || input.status === "archived" ? 0.25 : 0;

  let qualityScore = round3(
    acceptRate * 0.45 +
      (1 - dismissRate) * 0.25 +
      volumeNorm * 0.2 +
      authorityBonus +
      0 -
      statusPenalty,
  );
  qualityScore = clamp(qualityScore, 0, 1);
  if (shown < 2) {
    qualityScore = round3(0.45 + authorityBonus * 0.5);
  }

  const confidenceAdjustment = round2(
    clamp((qualityScore - 0.5) * 0.5, -0.25, 0.25),
  );
  return {
    qualityScore,
    confidenceAdjustment,
    band: qualityBandFor(qualityScore, shown),
  };
}

export function suggestGovernanceAction(input: {
  shown: number;
  acceptRate: number;
  dismissed: number;
  authority: string;
  status: string;
  qualityBand: KnowledgeQualityBand;
}): { action: GovernanceSuggestionAction; reason: string; priority: number } {
  if (input.status === "archived") {
    return { action: "keep", reason: "已归档，无需调整", priority: 0 };
  }
  if (input.shown < 2) {
    return {
      action: "review",
      reason: "样本不足，建议人工复核后再晋升",
      priority: 2,
    };
  }
  if (input.acceptRate >= 0.7 && input.shown >= 3 && input.authority === "learned") {
    return {
      action: "promote",
      reason: `接受率 ${(input.acceptRate * 100).toFixed(0)}%，建议晋升为 promoted`,
      priority: 9,
    };
  }
  if (
    input.acceptRate >= 0.75 &&
    input.shown >= 4 &&
    (input.authority === "reviewed" || input.authority === "learned")
  ) {
    return {
      action: "promote",
      reason: "高质量表现，建议晋升",
      priority: 8,
    };
  }
  if (
    input.acceptRate <= 0.25 &&
    input.shown >= 3 &&
    (input.authority === "promoted" || input.authority === "canonical")
  ) {
    return {
      action: "demote",
      reason: `接受率偏低（${(input.acceptRate * 100).toFixed(0)}%），建议降级`,
      priority: 8,
    };
  }
  if (input.acceptRate <= 0.15 && input.dismissed >= 3) {
    return {
      action: "deprecate",
      reason: "多次驳回且接受率极低，建议弃用",
      priority: 9,
    };
  }
  if (input.qualityBand === "poor") {
    return {
      action: "review",
      reason: "质量较差，建议人工审阅",
      priority: 5,
    };
  }
  return { action: "keep", reason: "表现稳定，维持现状", priority: 1 };
}

function buildTrends(
  organizationId: string,
): ImprovementTrendPoint[] {
  const fromStore = listRecommendationFeedbackEvents(organizationId, 500);
  const fromEff = getOrgRecommendationEffectiveness(organizationId)?.events ?? [];
  const seen = new Set<string>();
  const events = [...fromStore, ...fromEff].filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return e.organizationId === organizationId;
  });
  const byDate = new Map<string, { accepted: number; dismissed: number }>();
  for (const e of events) {
    const date = e.at.slice(0, 10);
    const cur = byDate.get(date) ?? { accepted: 0, dismissed: 0 };
    if (e.action === "accepted") cur.accepted += 1;
    if (e.action === "dismissed") cur.dismissed += 1;
    byDate.set(date, cur);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => {
      const total = v.accepted + v.dismissed;
      return {
        date,
        accepted: v.accepted,
        dismissed: v.dismissed,
        shownApprox: total,
        acceptRate: total === 0 ? 0 : round2(v.accepted / total),
      };
    });
}

function hashReport(
  organizationId: string,
  quality: PatternQualityScore[],
  aggregation: ContinuousImprovementReport["aggregation"],
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: CONTINUOUS_IMPROVEMENT_VERSION,
        organizationId,
        totals: {
          shown: aggregation.totalShown,
          accepted: aggregation.totalAccepted,
          dismissed: aggregation.totalDismissed,
        },
        quality: quality.map((q) => ({
          id: q.patternId,
          score: q.qualityScore,
          adj: q.confidenceAdjustment,
          action: q.suggestion.action,
        })),
      }),
    )
    .digest("hex");
}

/** Aggregate recommendation outcomes into a continuous improvement report. */
export function buildContinuousImprovementReport(input: {
  organizationId: string;
  persistAdjustments?: boolean;
}): ContinuousImprovementReport {
  const stored = getOrgRecommendationEffectiveness(input.organizationId);
  const eff = stored ?? {
    organizationId: input.organizationId,
    updatedAt: new Date().toISOString(),
    events: [],
    byPatternId: {},
    totals: { shown: 0, accepted: 0, dismissed: 0, acceptRate: 0 },
  };
  const library = getOrgKnowledgeLibrary(input.organizationId);
  const gov = getOrgKnowledgeGovernanceSnapshot(input.organizationId);
  const state =
    getContinuousImprovementState(input.organizationId) ??
    emptyState(input.organizationId);

  const patternMeta = new Map(
    (library?.patterns ?? []).map((p) => [p.id, p] as const),
  );

  const quality: PatternQualityScore[] = [];
  const confidenceAdjustments: Record<string, number> = {
    ...state.confidenceAdjustments,
  };

  const patternIds = new Set([
    ...Object.keys(eff.byPatternId),
    ...Object.keys(gov?.entries ?? {}),
    ...[...(library?.patterns ?? [])].map((p) => p.id),
  ]);

  for (const patternId of patternIds) {
    const stats = eff.byPatternId[patternId] ?? {
      patternId,
      shown: 0,
      accepted: 0,
      dismissed: 0,
      acceptRate: 0,
    };
    const entry = gov?.entries[patternId];
    const pattern = patternMeta.get(patternId);
    if (!pattern && stats.shown === 0) continue;

    const authority = entry?.authority ?? "learned";
    const status = entry?.status ?? "active";
    const scored = scorePatternQuality({
      shown: stats.shown,
      accepted: stats.accepted,
      dismissed: stats.dismissed,
      authority,
      status,
    });
    const acceptRate =
      stats.shown === 0 ? 0 : round2(stats.accepted / stats.shown);
    const dismissRate =
      stats.shown === 0 ? 0 : round2(stats.dismissed / stats.shown);
    const suggestion = suggestGovernanceAction({
      shown: stats.shown,
      acceptRate,
      dismissed: stats.dismissed,
      authority,
      status,
      qualityBand: scored.band,
    });

    confidenceAdjustments[patternId] = scored.confidenceAdjustment;

    quality.push({
      patternId,
      title: pattern?.title ?? patternId,
      kind: pattern?.kind ?? "unknown",
      authority,
      status,
      shown: stats.shown,
      accepted: stats.accepted,
      dismissed: stats.dismissed,
      acceptRate,
      dismissRate,
      qualityScore: scored.qualityScore,
      qualityBand: scored.band,
      confidenceAdjustment: scored.confidenceAdjustment,
      suggestion,
    });
  }

  quality.sort(
    (a, b) =>
      b.suggestion.priority - a.suggestion.priority ||
      b.qualityScore - a.qualityScore ||
      a.title.localeCompare(b.title),
  );

  const byQualityBand: Record<KnowledgeQualityBand, number> = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    insufficient: 0,
  };
  const bySuggestion: Record<GovernanceSuggestionAction, number> = {
    promote: 0,
    demote: 0,
    deprecate: 0,
    review: 0,
    keep: 0,
  };
  for (const q of quality) {
    byQualityBand[q.qualityBand] += 1;
    bySuggestion[q.suggestion.action] += 1;
  }

  const aggregation = {
    patternsScored: quality.length,
    totalShown: eff.totals.shown,
    totalAccepted: eff.totals.accepted,
    totalDismissed: eff.totals.dismissed,
    overallAcceptRate: eff.totals.acceptRate,
    overallDismissRate:
      eff.totals.shown === 0
        ? 0
        : round2(eff.totals.dismissed / eff.totals.shown),
    byQualityBand,
    bySuggestion,
    trends: buildTrends(input.organizationId),
  };

  const contentHash = hashReport(input.organizationId, quality, aggregation);
  const suggestions = quality.filter((q) =>
    ["promote", "demote", "deprecate", "review"].includes(q.suggestion.action),
  );

  if (input.persistAdjustments !== false) {
    saveContinuousImprovementState({
      ...state,
      confidenceAdjustments,
      lastReportHash: contentHash,
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    version: CONTINUOUS_IMPROVEMENT_VERSION,
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    contentHash,
    aggregation,
    quality,
    suggestions,
    confidenceAdjustments,
    recentApplied: state.appliedFeedback.slice(0, 20),
  };
}

/** Read persisted confidence adjustment for ranking (P14 hook). */
export function getPatternConfidenceAdjustment(
  organizationId: string,
  patternId: string,
): number {
  const state = getContinuousImprovementState(organizationId);
  if (state?.confidenceAdjustments[patternId] != null) {
    return state.confidenceAdjustments[patternId]!;
  }
  // Lazy compute from latest effectiveness without full persist side effects
  const report = buildContinuousImprovementReport({
    organizationId,
    persistAdjustments: true,
  });
  return report.confidenceAdjustments[patternId] ?? 0;
}

/**
 * Apply governance feedback from improvement suggestions.
 * Deterministic: processes suggestions sorted by priority then patternId.
 */
export function applyImprovementGovernanceFeedback(input: {
  organizationId: string;
  actorId: string;
  dryRun?: boolean;
  maxActions?: number;
  actions?: GovernanceSuggestionAction[];
  patternIds?: string[];
  sessionId?: string;
}): {
  report: ContinuousImprovementReport;
  results: AppliedGovernanceFeedback[];
} {
  const report = buildContinuousImprovementReport({
    organizationId: input.organizationId,
    persistAdjustments: true,
  });
  const allowed = new Set(
    input.actions ?? (["promote", "demote", "deprecate"] as GovernanceSuggestionAction[]),
  );
  const patternFilter = input.patternIds ? new Set(input.patternIds) : null;
  const candidates = report.suggestions
    .filter((s) => allowed.has(s.suggestion.action))
    .filter((s) => (patternFilter ? patternFilter.has(s.patternId) : true))
    .filter((s) => s.suggestion.action !== "review" && s.suggestion.action !== "keep")
    .sort(
      (a, b) =>
        b.suggestion.priority - a.suggestion.priority ||
        a.patternId.localeCompare(b.patternId),
    )
    .slice(0, input.maxActions ?? 10);

  const dryRun = input.dryRun === true;
  const results: AppliedGovernanceFeedback[] = [];
  const now = new Date().toISOString();

  for (const c of candidates) {
    const action = c.suggestion.action;
    let applied = false;
    let message = c.suggestion.reason;
    try {
      if (!dryRun) {
        if (action === "promote") {
          promoteOrgKnowledgePattern({
            organizationId: input.organizationId,
            patternId: c.patternId,
            actorId: input.actorId,
            sessionId: input.sessionId,
            note: `P15 持续改进：${c.suggestion.reason}`,
          });
          applied = true;
          message = `已晋升 ${c.patternId}`;
        } else if (action === "demote") {
          demoteOrgKnowledgePattern({
            organizationId: input.organizationId,
            patternId: c.patternId,
            actorId: input.actorId,
            sessionId: input.sessionId,
            note: `P15 持续改进：${c.suggestion.reason}`,
          });
          applied = true;
          message = `已降级 ${c.patternId}`;
        } else if (action === "deprecate") {
          deprecateOrgKnowledgePattern({
            organizationId: input.organizationId,
            patternId: c.patternId,
            actorId: input.actorId,
            sessionId: input.sessionId,
            reason: `P15 持续改进：${c.suggestion.reason}`,
          });
          applied = true;
          message = `已弃用 ${c.patternId}`;
        }
      } else {
        message = `dry-run：将执行 ${action} — ${c.suggestion.reason}`;
      }
    } catch (e) {
      message = e instanceof Error ? e.message : "APPLY_FAILED";
      applied = false;
    }

    results.push({
      id: createHash("sha1")
        .update(`${action}:${c.patternId}:${now}:${dryRun}`)
        .digest("hex")
        .slice(0, 12),
      at: now,
      actorId: input.actorId,
      patternId: c.patternId,
      action,
      dryRun,
      applied,
      message,
    });
  }

  const state =
    getContinuousImprovementState(input.organizationId) ??
    emptyState(input.organizationId);
  const appliedFeedback = [...results, ...state.appliedFeedback].slice(0, 100);
  saveContinuousImprovementState({
    ...state,
    appliedFeedback,
    updatedAt: now,
  });

  const refreshed = buildContinuousImprovementReport({
    organizationId: input.organizationId,
    persistAdjustments: true,
  });

  if (input.sessionId) {
    appendIntakeAudit({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
      step: "continuous_improve",
      message: `持续改进反馈 ${results.filter((r) => r.applied).length}/${results.length}（dryRun=${dryRun}）`,
      meta: {
        dryRun,
        results: results.map((r) => ({
          patternId: r.patternId,
          action: r.action,
          applied: r.applied,
        })),
        reportHash: refreshed.contentHash,
      },
    });
  }

  return { report: refreshed, results };
}

export function getContinuousImprovementSnapshot(
  organizationId: string,
): ContinuousImprovementState | null {
  return getContinuousImprovementState(organizationId);
}

export function exportContinuousImprovementJson(
  report: ContinuousImprovementReport,
): { fileName: string; body: string } {
  return {
    fileName: `continuous-improvement-${report.organizationId}-${report.generatedAt.slice(0, 10)}.json`,
    body: JSON.stringify(report, null, 2),
  };
}
