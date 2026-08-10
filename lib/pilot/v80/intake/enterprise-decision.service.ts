/**
 * V80 Pilot P18 — Enterprise decision support (read-only composition of P11–P17)
 */

import { createHash } from "node:crypto";

import { buildIntakeAnalyticsReport } from "./analytics.service";
import { buildContinuousImprovementReport } from "./continuous-improvement.service";
import { buildCrossProjectExplorer } from "./cross-project.service";
import {
  ENTERPRISE_DECISION_VERSION,
  type DecisionHealthBand,
  type DecisionPriorityLevel,
  type DecisionRecommendationItem,
  type DeliveryRiskScore,
  type EnterpriseDecisionReport,
  type ExecutiveScorecard,
  type InvestmentPriorityItem,
  type ProjectReadinessScore,
} from "./enterprise-decision.schema";
import {
  getIntakeSession,
  listIntakeSessionsForOrg,
  type TenderIntakeSession,
} from "./intake.store";
import { getOrgKnowledgeGovernanceSnapshot } from "./org-knowledge-governance.service";
import { getOrgKnowledgeLibrary } from "./org-knowledge.store";
import { getOrgRecommendationEffectiveness } from "./knowledge-recommendation.store";
import { buildOrgBenchmarkReport } from "./org-benchmark.service";
import { parseTenderRequirements } from "./requirements.validation";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function healthBandFor(score: number, invertRisk = false): DecisionHealthBand {
  const s = invertRisk ? 100 - score : score;
  if (s >= 75) return "healthy";
  if (s >= 55) return "watch";
  if (s >= 35) return "at_risk";
  return "critical";
}

function sessionLabel(s: TenderIntakeSession): string {
  const req = s.requirements ?? s.extractedRequirements;
  return req?.projectName?.trim() || s.productionProjectId || s.fileName || s.id;
}

function isActivePipeline(s: TenderIntakeSession): boolean {
  return (
    s.status === "in_review" ||
    s.status === "extracted" ||
    s.status === "qa_failed" ||
    s.status === "approving" ||
    s.status === "generating" ||
    (s.status !== "ready" &&
      s.status !== "approved" &&
      s.status !== "failed" &&
      !s.signedOff)
  );
}

function isCompleted(s: TenderIntakeSession): boolean {
  return (
    s.status === "ready" ||
    s.status === "approved" ||
    s.signedOff === true ||
    Boolean(s.productionProjectId && s.qaPassedAt)
  );
}

/** Deterministic project readiness 0–100 for a session. */
export function scoreProjectReadiness(session: TenderIntakeSession): ProjectReadinessScore {
  const req = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );
  const factors: ProjectReadinessScore["factors"] = [];

  const hasName = Boolean(req.projectName.trim());
  const hasScope = Boolean(req.scope.trim());
  const techCount =
    req.technicalRequirements.filter((i) => i.text.trim()).length +
    req.functionalRequirements.filter((i) => i.text.trim()).length;
  const equipCount = req.equipment.filter((i) => i.text.trim()).length;
  const standardsCount = req.standards.filter((i) => i.text.trim()).length;
  const openBlocking = (session.clarifications?.questions ?? []).filter(
    (q) => q.status === "open" && q.severity === "blocking",
  ).length;
  const compliancePassed = session.compliance?.report.passed === true;
  const complianceBlocking = session.compliance?.report.blockingCount ?? 0;
  const qaOk = Boolean(session.qaPassedAt);
  const bootstrapReady = session.bootstrap?.package.kickoff.ready === true;

  const basics = (hasName ? 50 : 0) + (hasScope ? 50 : 0);
  factors.push({
    id: "basics",
    label: "基础信息",
    score: basics,
    note: hasName && hasScope ? "项目名与范围齐全" : "缺少项目名或范围",
  });

  const content = clamp((techCount >= 1 ? 40 : 0) + (equipCount >= 1 ? 35 : 0) + (standardsCount >= 1 ? 25 : 0), 0, 100);
  factors.push({
    id: "content",
    label: "需求完整度",
    score: content,
    note: `需求 ${techCount} · 设备 ${equipCount} · 标准 ${standardsCount}`,
  });

  const clarifyScore = openBlocking === 0 ? 100 : clamp(100 - openBlocking * 35, 0, 100);
  factors.push({
    id: "clarification",
    label: "澄清闭环",
    score: clarifyScore,
    note: openBlocking === 0 ? "无阻塞澄清" : `${openBlocking} 个阻塞澄清未关闭`,
  });

  const complianceScore =
    complianceBlocking > 0 ? clamp(100 - complianceBlocking * 40, 0, 40) : compliancePassed ? 100 : 55;
  factors.push({
    id: "compliance",
    label: "合规门禁",
    score: complianceScore,
    note:
      complianceBlocking > 0
        ? `${complianceBlocking} 项阻断`
        : compliancePassed
          ? "合规已通过"
          : "尚未完成合规评估",
  });

  const execScore = (qaOk ? 50 : 0) + (bootstrapReady ? 50 : session.bootstrap ? 25 : 0);
  factors.push({
    id: "execution",
    label: "执行就绪",
    score: execScore,
    note: qaOk && bootstrapReady ? "QA + Kickoff 就绪" : "QA/Bootstrap 未齐备",
  });

  const score = round1(
    factors.reduce((s, f) => s + f.score, 0) / Math.max(1, factors.length),
  );
  const band = healthBandFor(score);

  let recommendation = "维持当前评审节奏";
  if (score < 40) recommendation = "优先关闭阻塞澄清与合规阻断，再推进批准";
  else if (score < 60) recommendation = "补齐设备/标准条目并完成合规评估";
  else if (!qaOk) recommendation = "推进 QA 门禁与交接包";
  else if (!bootstrapReady) recommendation = "生成/确认执行 Bootstrap";
  else recommendation = "可进入批准与生产交接";

  return {
    sessionId: session.id,
    label: sessionLabel(session),
    status: session.status,
    score,
    band,
    factors,
    recommendation,
  };
}

/** Deterministic delivery risk 0–100 (higher = riskier). */
export function scoreDeliveryRisk(session: TenderIntakeSession): DeliveryRiskScore {
  const drivers: DeliveryRiskScore["drivers"] = [];
  let score = 15;

  const openBlocking = (session.clarifications?.questions ?? []).filter(
    (q) => q.status === "open" && q.severity === "blocking",
  ).length;
  if (openBlocking > 0) {
    score += openBlocking * 18;
    drivers.push({
      id: "clarify_blocking",
      label: "阻塞澄清",
      severity: openBlocking >= 2 ? "high" : "medium",
      detail: `${openBlocking} 个未关闭阻塞澄清`,
    });
  }

  const blocking = session.compliance?.report.blockingCount ?? 0;
  if (blocking > 0) {
    score += blocking * 22;
    drivers.push({
      id: "compliance_blocking",
      label: "合规阻断",
      severity: "high",
      detail: `${blocking} 项阻断性合规发现`,
    });
  }

  if (session.status === "failed" || session.status === "qa_failed") {
    score += 25;
    drivers.push({
      id: "status_failed",
      label: "状态异常",
      severity: "high",
      detail: `会话状态为 ${session.status}`,
    });
  }

  const req = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );
  const ambiguous = [
    ...req.technicalRequirements,
    ...req.equipment,
  ].filter((i) => /待定|若干|大约|TBD/i.test(i.text)).length;
  if (ambiguous > 0) {
    score += Math.min(20, ambiguous * 8);
    drivers.push({
      id: "ambiguous_specs",
      label: "规格含糊",
      severity: ambiguous >= 2 ? "medium" : "low",
      detail: `${ambiguous} 条含糊需求/设备`,
    });
  }

  if (!session.qaPassedAt && isActivePipeline(session)) {
    score += 10;
    drivers.push({
      id: "qa_pending",
      label: "QA 未过",
      severity: "medium",
      detail: "尚未通过 QA 门禁",
    });
  }

  if (drivers.length === 0) {
    drivers.push({
      id: "stable",
      label: "风险可控",
      severity: "low",
      detail: "未发现显著交付风险驱动因素",
    });
  }

  score = round1(clamp(score, 0, 100));
  return {
    sessionId: session.id,
    label: sessionLabel(session),
    score,
    level: healthBandFor(score, true),
    drivers,
  };
}

function buildExecutiveScorecard(input: {
  benchmarkScore: number;
  maturityLevel: string;
  readinessAvg: number;
  riskAvg: number;
  knowledgeLeverage: number;
  strengths: string[];
  concerns: string[];
}): ExecutiveScorecard {
  const overallHealth = round1(
    clamp(
      input.benchmarkScore * 0.35 +
        input.readinessAvg * 0.3 +
        (100 - input.riskAvg) * 0.2 +
        input.knowledgeLeverage * 0.15,
      0,
      100,
    ),
  );

  return {
    overallHealth,
    readinessIndex: round1(input.readinessAvg),
    riskIndex: round1(input.riskAvg),
    knowledgeLeverage: round1(input.knowledgeLeverage),
    benchmarkScore: round1(input.benchmarkScore),
    maturityLevel: input.maturityLevel,
    band: healthBandFor(overallHealth),
    strengths: input.strengths.slice(0, 5),
    concerns: input.concerns.slice(0, 5),
  };
}

function buildRecommendations(input: {
  benchmarkOpportunities: Array<{
    id: string;
    title: string;
    recommendedAction: string;
    impactScore: number;
    severity: string;
  }>;
  readiness: ProjectReadinessScore[];
  risks: DeliveryRiskScore[];
  improvementSuggestions: number;
  acceptRate: number;
}): DecisionRecommendationItem[] {
  const items: DecisionRecommendationItem[] = [];

  for (const o of input.benchmarkOpportunities.slice(0, 5)) {
    const priority: DecisionPriorityLevel =
      o.severity === "high" || o.impactScore >= 12
        ? "P0"
        : o.severity === "medium"
          ? "P1"
          : "P2";
    items.push({
      id: `rec_bench_${o.id}`,
      priority,
      title: o.title,
      action: o.recommendedAction,
      source: "benchmark",
      impactScore: round1(o.impactScore),
    });
  }

  for (const r of input.risks.filter((x) => x.score >= 50).slice(0, 4)) {
    items.push({
      id: `rec_risk_${r.sessionId}`,
      priority: r.score >= 70 ? "P0" : "P1",
      title: `降低「${r.label}」交付风险`,
      action: r.drivers[0]?.detail
        ? `优先处理：${r.drivers[0].detail}`
        : "复核澄清与合规阻断",
      source: "delivery_risk",
      impactScore: round1(r.score * 0.2),
    });
  }

  for (const p of input.readiness.filter((x) => x.score < 55).slice(0, 3)) {
    items.push({
      id: `rec_ready_${p.sessionId}`,
      priority: p.score < 40 ? "P1" : "P2",
      title: `提升「${p.label}」就绪度`,
      action: p.recommendation,
      source: "readiness",
      impactScore: round1((100 - p.score) * 0.15),
    });
  }

  if (input.improvementSuggestions > 0) {
    items.push({
      id: "rec_improve_loop",
      priority: input.improvementSuggestions >= 3 ? "P1" : "P2",
      title: "应用持续改进治理反馈",
      action: `处理 ${input.improvementSuggestions} 条晋升/降级/弃用建议（P15）`,
      source: "improvement",
      impactScore: round1(8 + input.improvementSuggestions),
    });
  }

  if (input.acceptRate > 0 && input.acceptRate < 0.4) {
    items.push({
      id: "rec_accept_rate",
      priority: "P2",
      title: "提升知识推荐接受质量",
      action: "驳回低相关推荐并晋升高接受模式（P13/P14）",
      source: "recommendation",
      impactScore: round1((0.4 - input.acceptRate) * 40),
    });
  }

  const priorityRank: Record<DecisionPriorityLevel, number> = {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3,
  };

  return items
    .sort(
      (a, b) =>
        priorityRank[a.priority] - priorityRank[b.priority] ||
        b.impactScore - a.impactScore ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 12);
}

function buildInvestmentPriorities(input: {
  weaknesses: string[];
  opportunities: Array<{ title: string; recommendedAction: string; impactScore: number; categoryId: string }>;
  knowledgePatterns: number;
  similarPairCount: number;
  acceptRate: number;
}): InvestmentPriorityItem[] {
  const items: InvestmentPriorityItem[] = [];

  for (const o of input.opportunities.slice(0, 6)) {
    items.push({
      id: `inv_${o.categoryId}`,
      title: o.title,
      category: o.categoryId,
      priorityScore: round1(o.impactScore * 1.1),
      rationale: o.recommendedAction,
      expectedLeverage: "提升对标短板分与交付确定性",
    });
  }

  if (input.knowledgePatterns < 15) {
    items.push({
      id: "inv_knowledge_coverage",
      title: "扩大组织知识覆盖",
      category: "knowledge_maturity",
      priorityScore: round1(12 + (15 - input.knowledgePatterns)),
      rationale: "完成更多 Intake 并重建知识库，增强推荐与跨项目复用",
      expectedLeverage: "提高知识杠杆与相似项目命中率",
    });
  }

  if (input.similarPairCount === 0) {
    items.push({
      id: "inv_cross_project",
      title: "沉淀可对标历史项目",
      category: "cross_project",
      priorityScore: 10,
      rationale: "至少完成 2+ 相似项目以激活跨项目智能",
      expectedLeverage: "缩短新 Intake 澄清与规格决策时间",
    });
  }

  if (input.acceptRate >= 0.6) {
    items.push({
      id: "inv_promote_winners",
      title: "晋升高接受知识模式",
      category: "governance_discipline",
      priorityScore: round1(9 + input.acceptRate * 10),
      rationale: "推荐接受率较高，适合将赢家模式晋升为组织标准",
      expectedLeverage: "固化最佳实践，降低重复评审成本",
    });
  }

  return items
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 8);
}

/** Build enterprise decision report (read-only). */
export function buildEnterpriseDecisionReport(input: {
  organizationId: string;
  from?: string;
  to?: string;
}): EnterpriseDecisionReport {
  const analytics = buildIntakeAnalyticsReport({
    organizationId: input.organizationId,
    from: input.from,
    to: input.to,
  });
  const benchmark = buildOrgBenchmarkReport({
    organizationId: input.organizationId,
    from: input.from,
    to: input.to,
  });
  const improvement = buildContinuousImprovementReport({
    organizationId: input.organizationId,
    persistAdjustments: false,
  });
  const explorer = buildCrossProjectExplorer({
    organizationId: input.organizationId,
  });
  const library = getOrgKnowledgeLibrary(input.organizationId);
  const gov = getOrgKnowledgeGovernanceSnapshot(input.organizationId);
  const eff = getOrgRecommendationEffectiveness(input.organizationId);

  const sessions = listIntakeSessionsForOrg(input.organizationId);
  const focusSessions = sessions.filter(
    (s) => isActivePipeline(s) || (!isCompleted(s) && s.status !== "failed"),
  );
  const readinessTargets =
    focusSessions.length > 0
      ? focusSessions
      : sessions.filter((s) => s.status === "in_review" || s.status === "extracted");
  const riskTargets =
    readinessTargets.length > 0 ? readinessTargets : sessions.slice(0, 5);

  const projectReadiness = readinessTargets
    .map(scoreProjectReadiness)
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));

  const deliveryRisks = riskTargets
    .map(scoreDeliveryRisk)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  const readinessAvg =
    projectReadiness.length === 0
      ? clamp(analytics.kpis.readyRate * 100, 0, 100)
      : projectReadiness.reduce((s, r) => s + r.score, 0) / projectReadiness.length;

  const riskAvg =
    deliveryRisks.length === 0
      ? clamp(analytics.kpis.failedRate * 100 + analytics.kpis.compliance.blocked * 10, 0, 100)
      : deliveryRisks.reduce((s, r) => s + r.score, 0) / deliveryRisks.length;

  const promoted =
    Object.values(gov?.entries ?? {}).filter(
      (e) => e.authority === "promoted" || e.authority === "canonical",
    ).length ?? 0;
  const patternCount = library?.patterns.length ?? 0;
  const knowledgeLeverage = clamp(
    (patternCount / 40) * 40 +
      (promoted / Math.max(1, patternCount)) * 30 +
      (eff?.totals.acceptRate ?? 0) * 30,
    0,
    100,
  ) * (patternCount === 0 ? 0.35 : 1);

  const strengths: string[] = [];
  const concerns: string[] = [];
  for (const c of benchmark.scorecard.categories) {
    if (c.polarity === "strength") strengths.push(`${c.label} ${c.score}`);
    if (c.polarity === "weakness") concerns.push(`${c.label} ${c.score}`);
  }
  if (explorer.insight.pairCount > 0) {
    strengths.push(`跨项目相似对 ${explorer.insight.pairCount}`);
  }
  if (deliveryRisks.some((r) => r.score >= 60)) {
    concerns.push("存在高交付风险会话");
  }

  const executiveScorecard = buildExecutiveScorecard({
    benchmarkScore: benchmark.scorecard.overallScore,
    maturityLevel: benchmark.maturity.level,
    readinessAvg,
    riskAvg,
    knowledgeLeverage: round1(knowledgeLeverage),
    strengths,
    concerns,
  });

  const recommendations = buildRecommendations({
    benchmarkOpportunities: benchmark.opportunities,
    readiness: projectReadiness,
    risks: deliveryRisks,
    improvementSuggestions: improvement.suggestions.length,
    acceptRate: eff?.totals.acceptRate ?? 0,
  });

  const investmentPriorities = buildInvestmentPriorities({
    weaknesses: benchmark.scorecard.weaknesses,
    opportunities: benchmark.opportunities.map((o) => ({
      title: o.title,
      recommendedAction: o.recommendedAction,
      impactScore: o.impactScore,
      categoryId: o.categoryId,
    })),
    knowledgePatterns: patternCount,
    similarPairCount: explorer.topPairs.length,
    acceptRate: eff?.totals.acceptRate ?? 0,
  });

  const nextSteps = recommendations.slice(0, 4).map((r) => `[${r.priority}] ${r.action}`);
  if (nextSteps.length === 0) {
    nextSteps.push("维持当前运营，继续完成 Intake 以丰富知识与对标样本");
  }

  const narrative = {
    headline: `组织健康度 ${executiveScorecard.overallHealth}（${executiveScorecard.band}）· 成熟度 ${executiveScorecard.maturityLevel}`,
    summary: `对标 ${benchmark.scorecard.overallScore} 分；管线就绪均值 ${round1(readinessAvg)}；交付风险均值 ${round1(riskAvg)}；知识杠杆 ${round1(knowledgeLeverage)}。共 ${recommendations.length} 条决策建议、${investmentPriorities.length} 项投资优先级。`,
    nextSteps,
  };

  const generatedAt = new Date().toISOString();
  const partial = {
    version: ENTERPRISE_DECISION_VERSION,
    organizationId: input.organizationId,
    executiveScorecard,
    projectReadiness,
    deliveryRisks,
    recommendations,
    investmentPriorities,
    narrative,
    sources: {
      sessionCount: analytics.kpis.totalSessions,
      benchmarkScore: benchmark.scorecard.overallScore,
      maturityLevel: benchmark.maturity.level,
      knowledgePatterns: patternCount,
      similarPairCount: explorer.topPairs.length,
      improvementSuggestions: improvement.suggestions.length,
      recommendationAcceptRate: round2(eff?.totals.acceptRate ?? 0),
    },
  };

  const contentHash = createHash("sha256")
    .update(
      JSON.stringify({
        version: partial.version,
        organizationId: partial.organizationId,
        scorecard: partial.executiveScorecard,
        readiness: partial.projectReadiness.map((r) => ({ id: r.sessionId, s: r.score })),
        risks: partial.deliveryRisks.map((r) => ({ id: r.sessionId, s: r.score })),
        recs: partial.recommendations.map((r) => r.id),
        inv: partial.investmentPriorities.map((i) => i.id),
      }),
    )
    .digest("hex");

  return {
    ...partial,
    generatedAt,
    contentHash,
  } as EnterpriseDecisionReport;
}

export function exportEnterpriseDecisionJson(report: EnterpriseDecisionReport): {
  fileName: string;
  body: string;
} {
  return {
    fileName: `enterprise-decision-${report.organizationId}-${report.generatedAt.slice(0, 10)}.json`,
    body: JSON.stringify(report, null, 2),
  };
}

/** Optional session-scoped decision snapshot for review surfaces. */
export function getSessionDecisionSnapshot(input: {
  organizationId: string;
  sessionId: string;
}): {
  readiness: ProjectReadinessScore;
  risk: DeliveryRiskScore;
} {
  const session = getIntakeSession(input.sessionId);
  if (!session || session.organizationId !== input.organizationId) {
    throw new Error("SESSION_NOT_FOUND");
  }
  return {
    readiness: scoreProjectReadiness(session),
    risk: scoreDeliveryRisk(session),
  };
}
