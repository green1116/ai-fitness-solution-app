/**
 * V80 Pilot P16 — Organization benchmark scorecard (read-only over P11–P15)
 */

import { createHash } from "node:crypto";

import { buildIntakeAnalyticsReport } from "./analytics.service";
import { buildContinuousImprovementReport } from "./continuous-improvement.service";
import { getOrgKnowledgeGovernanceSnapshot } from "./org-knowledge-governance.service";
import { getOrgKnowledgeLibrary } from "./org-knowledge.store";
import { getOrgRecommendationEffectiveness } from "./knowledge-recommendation.store";
import {
  ORG_BENCHMARK_VERSION,
  type BenchmarkBand,
  type BenchmarkCategoryId,
  type BenchmarkOpportunity,
  type BenchmarkPolarity,
  type BenchmarkTrendPoint,
  type CategoryBenchmark,
  type MaturityAssessment,
  type MaturityLevel,
  type OrgBenchmarkReport,
  type OrganizationScorecard,
} from "./org-benchmark.schema";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Deterministic reference targets used as percentile anchors (single-tenant safe). */
const TARGETS: Record<BenchmarkCategoryId, number> = {
  intake_throughput: 75,
  quality_confidence: 70,
  clarification_discipline: 72,
  compliance_hygiene: 80,
  knowledge_maturity: 65,
  recommendation_effectiveness: 60,
  governance_discipline: 68,
  improvement_loop: 62,
};

const WEIGHTS: Record<BenchmarkCategoryId, number> = {
  intake_throughput: 0.14,
  quality_confidence: 0.14,
  clarification_discipline: 0.12,
  compliance_hygiene: 0.14,
  knowledge_maturity: 0.12,
  recommendation_effectiveness: 0.12,
  governance_discipline: 0.12,
  improvement_loop: 0.1,
};

const LABELS: Record<BenchmarkCategoryId, string> = {
  intake_throughput: "Intake 吞吐",
  quality_confidence: "抽取质量与置信",
  clarification_discipline: "澄清纪律",
  compliance_hygiene: "合规卫生",
  knowledge_maturity: "知识成熟度",
  recommendation_effectiveness: "推荐有效性",
  governance_discipline: "知识治理",
  improvement_loop: "持续改进闭环",
};

export function bandForScore(score: number): BenchmarkBand {
  if (score >= 85) return "leading";
  if (score >= 70) return "strong";
  if (score >= 55) return "average";
  if (score >= 40) return "lagging";
  return "critical";
}

/** Map score vs target into a 0–100 percentile-like index. */
export function percentileVsTarget(score: number, target: number): number {
  if (target <= 0) return clamp(score, 0, 100);
  const ratio = score / target;
  // 1.0x target ≈ 60th percentile; 1.25x ≈ 90; 0.7x ≈ 30
  const pct = 60 + (ratio - 1) * 120;
  return round1(clamp(pct, 1, 99));
}

function polarityFor(score: number, target: number): BenchmarkPolarity {
  if (score >= target + 8) return "strength";
  if (score <= target - 10) return "weakness";
  return "neutral";
}

function category(
  id: BenchmarkCategoryId,
  score: number,
  trendDelta: number,
  metrics: Record<string, number | string>,
  summary: string,
): CategoryBenchmark {
  const target = TARGETS[id];
  const s = round1(clamp(score, 0, 100));
  return {
    id,
    label: LABELS[id],
    score: s,
    percentile: percentileVsTarget(s, target),
    band: bandForScore(s),
    polarity: polarityFor(s, target),
    weight: WEIGHTS[id],
    trendDelta: round1(trendDelta),
    metrics,
    summary,
  };
}

export function assessMaturity(
  overallScore: number,
  categories: CategoryBenchmark[],
): MaturityAssessment {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const criteriaMet: string[] = [];
  const criteriaMissed: string[] = [];

  const check = (ok: boolean, label: string) => {
    if (ok) criteriaMet.push(label);
    else criteriaMissed.push(label);
  };

  check(overallScore >= 55, "综合分 ≥ 55");
  check((byId.get("intake_throughput")?.score ?? 0) >= 50, "吞吐成熟");
  check((byId.get("compliance_hygiene")?.score ?? 0) >= 55, "合规可控");
  check((byId.get("knowledge_maturity")?.score ?? 0) >= 45, "知识库已起步");
  check((byId.get("governance_discipline")?.score ?? 0) >= 50, "治理已启用");
  check((byId.get("improvement_loop")?.score ?? 0) >= 45, "改进闭环可见");
  check((byId.get("recommendation_effectiveness")?.score ?? 0) >= 40, "推荐有反馈");

  const met = criteriaMet.length;
  let level: MaturityLevel;
  if (overallScore >= 85 && met >= 6) level = "leading";
  else if (overallScore >= 70 && met >= 5) level = "advanced";
  else if (overallScore >= 55 && met >= 4) level = "established";
  else if (overallScore >= 40 && met >= 2) level = "developing";
  else level = "nascent";

  return {
    level,
    score: round1(overallScore),
    rationale: `成熟度 ${level}：满足 ${met}/${criteriaMet.length + criteriaMissed.length} 项基准条件`,
    criteriaMet,
    criteriaMissed,
  };
}

export function detectBenchmarkOpportunities(
  categories: CategoryBenchmark[],
  maturity: MaturityAssessment,
): BenchmarkOpportunity[] {
  const out: BenchmarkOpportunity[] = [];

  for (const c of categories) {
    if (c.polarity === "weakness" || c.band === "critical" || c.band === "lagging") {
      const severity =
        c.band === "critical" || c.score < 35
          ? "high"
          : c.band === "lagging" || c.score < TARGETS[c.id] - 15
            ? "medium"
            : "low";
      out.push({
        id: `opp_${c.id}`,
        categoryId: c.id,
        severity,
        title: `提升「${c.label}」`,
        rationale: c.summary,
        recommendedAction: actionFor(c.id),
        impactScore: round1((100 - c.score) * c.weight * 1.2),
      });
    }
    if (c.trendDelta <= -8) {
      out.push({
        id: `opp_trend_${c.id}`,
        categoryId: c.id,
        severity: c.trendDelta <= -15 ? "high" : "medium",
        title: `扭转「${c.label}」下滑趋势`,
        rationale: `近窗相对基线下降 ${Math.abs(c.trendDelta).toFixed(1)} 分`,
        recommendedAction: actionFor(c.id),
        impactScore: round1(Math.abs(c.trendDelta) * c.weight),
      });
    }
  }

  if (maturity.level === "nascent" || maturity.level === "developing") {
    out.push({
      id: "opp_maturity_uplift",
      categoryId: "improvement_loop",
      severity: "medium",
      title: "加速组织成熟度跃迁",
      rationale: maturity.rationale,
      recommendedAction: "优先补齐未满足基准条件，并应用 P15 治理反馈",
      impactScore: round1(18 + (5 - maturity.criteriaMet.length) * 2),
    });
  }

  // Dedupe by id, sort by impact
  const seen = new Set<string>();
  return out
    .filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    })
    .sort(
      (a, b) =>
        b.impactScore - a.impactScore ||
        a.severity.localeCompare(b.severity) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 12);
}

function actionFor(id: BenchmarkCategoryId): string {
  switch (id) {
    case "intake_throughput":
      return "缩短澄清/合规阻塞，推动更多会话进入 ready/交接";
    case "quality_confidence":
      return "强化证据确认与低置信条目复核（P5）";
    case "clarification_discipline":
      return "关闭阻塞澄清并提高回答率（P6）";
    case "compliance_hygiene":
      return "先解决阻断性合规项再批准（P8）";
    case "knowledge_maturity":
      return "重建知识库并覆盖更多完成会话（P12）";
    case "recommendation_effectiveness":
      return "提高推荐接受质量，驳回无效模式（P14）";
    case "governance_discipline":
      return "晋升高价值模式、弃用低效模式（P13）";
    case "improvement_loop":
      return "运行持续改进报告并应用治理反馈（P15）";
    default:
      return "复查相关 Pilot 面板";
  }
}

function sThroughput(readyRate: number, failedRate: number, withProjectRate: number): number {
  return round1(clamp(readyRate * 55 + withProjectRate * 35 + (1 - failedRate) * 10, 0, 1) * 100);
}
function sConfidence(highShare: number, evidenceShare: number): number {
  return round1(clamp(highShare * 0.6 + evidenceShare * 0.4, 0, 1) * 100);
}
function sClarification(answeredRate: number, blockingOpenRate: number): number {
  return round1(clamp(answeredRate * 0.7 + (1 - blockingOpenRate) * 0.3, 0, 1) * 100);
}
function sCompliance(passRate: number, blockRate: number): number {
  return round1(clamp(passRate * 0.65 + (1 - blockRate) * 0.35, 0, 1) * 100);
}
function sKnowledge(patternCount: number, sourceSessions: number, promotedShare: number): number {
  const volume = clamp(patternCount / 40, 0, 1);
  const coverage = clamp(sourceSessions / 10, 0, 1);
  return round1(clamp(volume * 0.4 + coverage * 0.35 + promotedShare * 0.25, 0, 1) * 100);
}
function sRecommendation(acceptRate: number, shown: number): number {
  const volume = clamp(shown / 20, 0, 1);
  return round1(clamp(acceptRate * 0.75 + volume * 0.25, 0, 1) * 100);
}
function sGovernance(entryCount: number, promoted: number, deprecated: number, revision: number): number {
  if (entryCount === 0) return revision > 0 ? 35 : 15;
  const promotedShare = promoted / entryCount;
  const hygiene = clamp(1 - deprecated / Math.max(entryCount, 1), 0, 1);
  const revBoost = clamp(revision / 5, 0, 1);
  return round1(clamp(promotedShare * 0.45 + hygiene * 0.35 + revBoost * 0.2, 0, 1) * 100);
}
function sImprovement(
  acceptRate: number,
  suggestionCount: number,
  appliedCount: number,
  excellentShare: number,
): number {
  const appliedBoost = clamp(appliedCount / 5, 0, 1);
  const suggestionPressure = clamp(1 - suggestionCount / 20, 0, 1);
  return round1(
    clamp(acceptRate * 0.4 + excellentShare * 0.3 + appliedBoost * 0.2 + suggestionPressure * 0.1, 0, 1) *
      100,
  );
}

function weightedOverall(categories: CategoryBenchmark[]): number {
  let sum = 0;
  let w = 0;
  for (const c of categories) {
    sum += c.score * c.weight;
    w += c.weight;
  }
  return round1(w === 0 ? 0 : sum / w);
}

function buildScorecardFromParts(input: {
  analytics: ReturnType<typeof buildIntakeAnalyticsReport>;
  priorAnalytics?: ReturnType<typeof buildIntakeAnalyticsReport>;
  patternCount: number;
  sourceSessions: number;
  promotedShare: number;
  govRevision: number;
  govPromoted: number;
  govDeprecated: number;
  govEntries: number;
  recAcceptRate: number;
  recShown: number;
  improveAcceptRate: number;
  improveSuggestions: number;
  improveApplied: number;
  excellentShare: number;
}): OrganizationScorecard {
  const k = input.analytics.kpis;
  const pk = input.priorAnalytics?.kpis;

  const confTotal = Math.max(1, k.confidence.totalItems);
  const highShare = k.confidence.high / confTotal;
  const evidenceShare = k.confidence.withEvidence / confTotal;

  const clarifyTotal = Math.max(1, k.clarifications.totalQuestions);
  const answeredRate = k.clarifications.answered / clarifyTotal;
  const blockingOpenRate = k.clarifications.blockingOpen / clarifyTotal;

  const complianceEval = Math.max(1, k.compliance.sessionsEvaluated);
  const passRate = k.compliance.passed / complianceEval;
  const blockRate = k.compliance.blocked / complianceEval;

  const scores = {
    intake_throughput: sThroughput(k.readyRate, k.failedRate, k.withProjectRate),
    quality_confidence: sConfidence(highShare, evidenceShare),
    clarification_discipline: sClarification(answeredRate, blockingOpenRate),
    compliance_hygiene: sCompliance(passRate, blockRate),
    knowledge_maturity: sKnowledge(
      input.patternCount,
      input.sourceSessions,
      input.promotedShare,
    ),
    recommendation_effectiveness: sRecommendation(input.recAcceptRate, input.recShown),
    governance_discipline: sGovernance(
      input.govEntries,
      input.govPromoted,
      input.govDeprecated,
      input.govRevision,
    ),
    improvement_loop: sImprovement(
      input.improveAcceptRate,
      input.improveSuggestions,
      input.improveApplied,
      input.excellentShare,
    ),
  } as Record<BenchmarkCategoryId, number>;

  const priorScores: Partial<Record<BenchmarkCategoryId, number>> = {};
  if (pk) {
    const pConf = Math.max(1, pk.confidence.totalItems);
    const pClarify = Math.max(1, pk.clarifications.totalQuestions);
    const pComp = Math.max(1, pk.compliance.sessionsEvaluated);
    priorScores.intake_throughput = sThroughput(pk.readyRate, pk.failedRate, pk.withProjectRate);
    priorScores.quality_confidence = sConfidence(
      pk.confidence.high / pConf,
      pk.confidence.withEvidence / pConf,
    );
    priorScores.clarification_discipline = sClarification(
      pk.clarifications.answered / pClarify,
      pk.clarifications.blockingOpen / pClarify,
    );
    priorScores.compliance_hygiene = sCompliance(
      pk.compliance.passed / pComp,
      pk.compliance.blocked / pComp,
    );
  }

  const categories: CategoryBenchmark[] = (Object.keys(scores) as BenchmarkCategoryId[]).map(
    (id) => {
      const score = scores[id];
      const prior = priorScores[id];
      const trendDelta = prior != null ? round1(score - prior) : 0;
      return category(
        id,
        score,
        trendDelta,
        metricsFor(id, input, k, highShare, evidenceShare, answeredRate, blockingOpenRate, passRate, blockRate),
        summaryFor(id, score),
      );
    },
  );

  categories.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const overallScore = weightedOverall(categories);
  const overallPercentile = percentileVsTarget(overallScore, 70);
  const strengths = categories.filter((c) => c.polarity === "strength").map((c) => c.id);
  const weaknesses = categories.filter((c) => c.polarity === "weakness").map((c) => c.id);

  return {
    overallScore,
    overallPercentile,
    overallBand: bandForScore(overallScore),
    strengths,
    weaknesses,
    categories,
  };
}

function metricsFor(
  id: BenchmarkCategoryId,
  input: {
    patternCount: number;
    sourceSessions: number;
    promotedShare: number;
    govRevision: number;
    recAcceptRate: number;
    recShown: number;
    improveSuggestions: number;
    improveApplied: number;
  },
  k: ReturnType<typeof buildIntakeAnalyticsReport>["kpis"],
  highShare: number,
  evidenceShare: number,
  answeredRate: number,
  blockingOpenRate: number,
  passRate: number,
  blockRate: number,
): Record<string, number | string> {
  switch (id) {
    case "intake_throughput":
      return {
        readyRate: round2(k.readyRate),
        failedRate: round2(k.failedRate),
        withProjectRate: round2(k.withProjectRate),
        totalSessions: k.totalSessions,
      };
    case "quality_confidence":
      return {
        highShare: round2(highShare),
        evidenceShare: round2(evidenceShare),
        totalItems: k.confidence.totalItems,
      };
    case "clarification_discipline":
      return {
        answeredRate: round2(answeredRate),
        blockingOpenRate: round2(blockingOpenRate),
        avgRound: round2(k.clarifications.avgRound),
      };
    case "compliance_hygiene":
      return {
        passRate: round2(passRate),
        blockRate: round2(blockRate),
        blockingFindings: k.compliance.findingsBySeverity.blocking,
      };
    case "knowledge_maturity":
      return {
        patternCount: input.patternCount,
        sourceSessions: input.sourceSessions,
        promotedShare: round2(input.promotedShare),
      };
    case "recommendation_effectiveness":
      return {
        acceptRate: round2(input.recAcceptRate),
        shown: input.recShown,
      };
    case "governance_discipline":
      return { revision: input.govRevision };
    case "improvement_loop":
      return {
        suggestions: input.improveSuggestions,
        applied: input.improveApplied,
      };
    default:
      return {};
  }
}

function summaryFor(id: BenchmarkCategoryId, score: number): string {
  const band = bandForScore(score);
  return `${LABELS[id]}得分 ${score}（${band}）`;
}

function buildTrends(
  analytics: ReturnType<typeof buildIntakeAnalyticsReport>,
  recAcceptRate: number,
): BenchmarkTrendPoint[] {
  return analytics.trends.map((t) => {
    const created = Math.max(1, t.sessionsCreated);
    const readyRate = t.sessionsReady / created;
    const blockRate = t.complianceBlocked / created;
    const overallScoreApprox = round1(
      clamp(readyRate * 0.5 + (1 - blockRate) * 0.3 + recAcceptRate * 0.2, 0, 1) * 100,
    );
    return {
      date: t.date,
      overallScoreApprox,
      readyRate: round2(readyRate),
      acceptRate: round2(recAcceptRate),
      complianceBlockRate: round2(blockRate),
    };
  });
}

function hashReport(report: Omit<OrgBenchmarkReport, "contentHash" | "generatedAt">): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: report.version,
        organizationId: report.organizationId,
        window: report.window,
        scorecard: {
          overallScore: report.scorecard.overallScore,
          categories: report.scorecard.categories.map((c) => ({
            id: c.id,
            score: c.score,
            percentile: c.percentile,
          })),
        },
        maturity: report.maturity.level,
        opportunities: report.opportunities.map((o) => o.id),
      }),
    )
    .digest("hex");
}

/** Build organization benchmark report (read-only composition of P11–P15). */
export function buildOrgBenchmarkReport(input: {
  organizationId: string;
  from?: string;
  to?: string;
}): OrgBenchmarkReport {
  const analytics = buildIntakeAnalyticsReport({
    organizationId: input.organizationId,
    from: input.from,
    to: input.to,
  });

  // Prior window: if no explicit from/to, compare first half vs second half of trends by date mid
  let priorAnalytics: ReturnType<typeof buildIntakeAnalyticsReport> | undefined;
  if (!input.from && !input.to && analytics.trends.length >= 2) {
    const mid = analytics.trends[Math.floor(analytics.trends.length / 2)]!.date;
    priorAnalytics = buildIntakeAnalyticsReport({
      organizationId: input.organizationId,
      to: `${mid}T00:00:00.000Z`,
    });
  } else if (input.from || input.to) {
    // optional: no prior
  }

  const library = getOrgKnowledgeLibrary(input.organizationId);
  const gov = getOrgKnowledgeGovernanceSnapshot(input.organizationId);
  const eff = getOrgRecommendationEffectiveness(input.organizationId);
  const improvement = buildContinuousImprovementReport({
    organizationId: input.organizationId,
    persistAdjustments: false,
  });

  const entries = Object.values(gov?.entries ?? {});
  const promoted = entries.filter(
    (e) => e.authority === "promoted" || e.authority === "canonical",
  ).length;
  const deprecated = entries.filter((e) => e.status === "deprecated").length;
  const promotedShare = entries.length === 0 ? 0 : promoted / entries.length;
  const excellentShare =
    improvement.aggregation.patternsScored === 0
      ? 0
      : (improvement.aggregation.byQualityBand.excellent ?? 0) /
        improvement.aggregation.patternsScored;

  const scorecard = buildScorecardFromParts({
    analytics,
    priorAnalytics,
    patternCount: library?.patterns.length ?? 0,
    sourceSessions: library?.sourceSessionCount ?? 0,
    promotedShare,
    govRevision: gov?.libraryRevision ?? 0,
    govPromoted: promoted,
    govDeprecated: deprecated,
    govEntries: entries.length,
    recAcceptRate: eff?.totals.acceptRate ?? 0,
    recShown: eff?.totals.shown ?? 0,
    improveAcceptRate: improvement.aggregation.overallAcceptRate,
    improveSuggestions: improvement.suggestions.length,
    improveApplied: improvement.recentApplied.filter((a) => a.applied).length,
    excellentShare,
  });

  const maturity = assessMaturity(scorecard.overallScore, scorecard.categories);
  const opportunities = detectBenchmarkOpportunities(scorecard.categories, maturity);
  const trends = buildTrends(analytics, eff?.totals.acceptRate ?? 0);

  const partial = {
    version: ORG_BENCHMARK_VERSION,
    organizationId: input.organizationId,
    window: analytics.window,
    scorecard,
    maturity,
    opportunities,
    trends,
    sources: {
      knowledgePatternCount: library?.patterns.length ?? 0,
      governanceRevision: gov?.libraryRevision ?? 0,
      improvementSuggestions: improvement.suggestions.length,
      recommendationAcceptRate: round2(eff?.totals.acceptRate ?? 0),
    },
  } as const;

  const generatedAt = new Date().toISOString();
  const contentHash = hashReport(partial);

  return {
    ...partial,
    generatedAt,
    contentHash,
  };
}

export function exportOrgBenchmarkJson(report: OrgBenchmarkReport): {
  fileName: string;
  body: string;
} {
  return {
    fileName: `org-benchmark-${report.organizationId}-${report.generatedAt.slice(0, 10)}.json`,
    body: JSON.stringify(report, null, 2),
  };
}
