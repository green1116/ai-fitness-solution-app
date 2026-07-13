/**
 * E01-P3 — Tender Intelligence builder
 * Builds RequirementIndex → TenderAnalysis → OpportunityProfile lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type {
  RequirementCategory,
  RequirementIndex,
} from "../understanding/understanding.types";
import {
  assertValidRequirementIndex,
  fitBandFromScore,
  INTELLIGENCE_LIFECYCLE_STAGES,
  tierFromFit,
  validateOpportunityProfile,
  validateTenderAnalysis,
} from "./intelligence.schema";
import type {
  AnalysisSignal,
  IntelligenceKernelInput,
  IntelligenceKernelResult,
  IntelligenceLifecycle,
  IntelligenceLifecycleStage,
  IntelligenceLifecycleTransition,
  OpportunityCapabilityGap,
  OpportunityProfile,
  RiskSeverity,
  RiskSignal,
  TenderAnalysis,
} from "./intelligence.types";
import {
  V101_TENDER_INTELLIGENCE_FREEZE_VERSION,
  V101_TENDER_INTELLIGENCE_VERSION,
} from "./intelligence.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

const CATEGORY_WEIGHT: Record<RequirementCategory, number> = {
  functional: 1.1,
  technical: 1.2,
  equipment: 1.15,
  space: 1.0,
  compliance: 1.25,
  schedule: 0.9,
  budget: 1.05,
  deliverable: 0.85,
  other: 0.7,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function groupByCategory(index: RequirementIndex): Map<RequirementCategory, typeof index.entries> {
  const map = new Map<RequirementCategory, typeof index.entries>();
  for (const entry of index.entries) {
    const list = map.get(entry.category) ?? [];
    list.push(entry);
    map.set(entry.category, list);
  }
  return map;
}

function buildSignals(index: RequirementIndex): AnalysisSignal[] {
  const grouped = groupByCategory(index);
  const signals: AnalysisSignal[] = [];

  for (const [category, entries] of grouped) {
    const mustEntries = entries.filter((e) => e.priority === "must");
    const weight = round2(
      CATEGORY_WEIGHT[category] * (1 + mustEntries.length * 0.15 + entries.length * 0.05),
    );
    signals.push({
      id: stableId("sig", `${index.id}|${category}`),
      category,
      priority: mustEntries.length > 0 ? "must" : entries[0]!.priority,
      label: `${category} · ${entries.length} requirements`,
      weight,
      evidenceEntryIds: entries.map((e) => e.id),
      readOnly: true,
    });
  }

  return signals.sort((a, b) => b.weight - a.weight);
}

function buildRisks(index: RequirementIndex): RiskSignal[] {
  const risks: RiskSignal[] = [];

  const mustEntries = index.entries.filter((e) => e.priority === "must");
  if (mustEntries.length >= 3) {
    risks.push({
      id: stableId("risk", `${index.id}|must-density`),
      severity: "medium",
      label: "强制需求密度偏高",
      rationale: `检测到 ${mustEntries.length} 条 must 需求，交付与合规压力上升`,
      relatedEntryIds: mustEntries.slice(0, 5).map((e) => e.id),
      readOnly: true,
    });
  }

  const compliance = index.entries.filter((e) => e.category === "compliance");
  if (compliance.length > 0) {
    risks.push({
      id: stableId("risk", `${index.id}|compliance`),
      severity: compliance.some((e) => e.priority === "must") ? "high" : "medium",
      label: "合规门槛",
      rationale: `存在 ${compliance.length} 条合规相关需求，需提前准备认证/标准证据`,
      relatedEntryIds: compliance.map((e) => e.id),
      readOnly: true,
    });
  }

  const budget = index.entries.filter((e) => e.category === "budget");
  if (budget.length > 0) {
    risks.push({
      id: stableId("risk", `${index.id}|budget`),
      severity: "medium",
      label: "预算约束",
      rationale: "标书含预算/限价信号，需校验报价与档位匹配",
      relatedEntryIds: budget.map((e) => e.id),
      readOnly: true,
    });
  }

  const schedule = index.entries.filter((e) => e.category === "schedule");
  if (schedule.length > 0) {
    risks.push({
      id: stableId("risk", `${index.id}|schedule`),
      severity: "low",
      label: "交付节奏",
      rationale: "存在工期/截止相关要求，需纳入项目排期",
      relatedEntryIds: schedule.map((e) => e.id),
      readOnly: true,
    });
  }

  if (risks.length === 0) {
    risks.push({
      id: stableId("risk", `${index.id}|baseline`),
      severity: "low",
      label: "基线风险可控",
      rationale: "未检测到高密度强制或合规冲突，按标准投标流程推进",
      relatedEntryIds: index.entries.slice(0, 3).map((e) => e.id),
      readOnly: true,
    });
  }

  return risks;
}

function severityScore(severity: RiskSeverity): number {
  if (severity === "high") return 18;
  if (severity === "medium") return 10;
  return 4;
}

export function buildTenderAnalysis(input: {
  requirementIndex: RequirementIndex;
}): TenderAnalysis {
  assertValidRequirementIndex(input.requirementIndex);
  const index = input.requirementIndex;
  const createdAt = nowIso();

  const signals = buildSignals(index);
  const risks = buildRisks(index);
  const mustCoverage =
    index.entryCount === 0 ? 0 : round2(index.mustCount / Math.max(index.entryCount, 1));

  const complexityScore = clamp(
    Math.round(
      index.entryCount * 4 +
        index.mustCount * 8 +
        signals.length * 3 +
        risks.reduce((sum, r) => sum + severityScore(r.severity), 0),
    ),
    0,
    100,
  );

  const analysis: TenderAnalysis = {
    id: stableId("analysis", `${index.id}|${createdAt}`),
    requirementIndexId: index.id,
    workspaceId: index.workspaceId,
    status: "analyzed",
    signalCount: signals.length,
    riskCount: risks.length,
    mustCoverage,
    complexityScore,
    signals,
    risks,
    summary: `分析 ${index.entryCount} 条需求 · must=${index.mustCount} · signals=${signals.length} · risks=${risks.length}`,
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  const validated = validateTenderAnalysis(analysis);
  if (!validated.ok) {
    throw new Error(
      `Invalid TenderAnalysis: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return analysis;
}

function buildGaps(analysis: TenderAnalysis): OpportunityCapabilityGap[] {
  const gaps: OpportunityCapabilityGap[] = [];

  for (const risk of analysis.risks) {
    if (risk.severity === "low") continue;
    gaps.push({
      id: stableId("gap", `${analysis.id}|${risk.id}`),
      label: risk.label,
      severity: risk.severity,
      mitigation:
        risk.severity === "high"
          ? "优先补齐合规证据包与强制条款应答"
          : "在方案与报价中显式回应约束并预留缓冲",
      readOnly: true,
    });
  }

  if (gaps.length === 0) {
    gaps.push({
      id: stableId("gap", `${analysis.id}|none`),
      label: "无明显能力缺口",
      severity: "low",
      mitigation: "保持标准投标应答与交付节奏即可",
      readOnly: true,
    });
  }

  return gaps;
}

function buildStrengths(analysis: TenderAnalysis, index: RequirementIndex): string[] {
  const strengths: string[] = [];
  const topSignals = analysis.signals.slice(0, 3);
  for (const signal of topSignals) {
    strengths.push(`覆盖 ${signal.category} 需求簇（${signal.evidenceEntryIds.length} 条）`);
  }
  if (index.mustCount > 0) {
    strengths.push(`强制需求识别完整（must=${index.mustCount}）`);
  }
  if (analysis.complexityScore < 60) {
    strengths.push("项目复杂度适中，适合快速形成方案");
  }
  return strengths.slice(0, 5);
}

function buildActions(analysis: TenderAnalysis, opportunityTier: string): string[] {
  const actions = [
    "复核 must 需求并映射到方案章节",
    "生成合规与设备证据清单",
  ];
  if (analysis.risks.some((r) => r.severity === "high")) {
    actions.push("优先处理高严重度风险并准备豁免/替代方案说明");
  }
  if (opportunityTier === "strategic" || opportunityTier === "high") {
    actions.push("进入高优先级投标编排与报价策略");
  } else {
    actions.push("完成预算档位校验后再决定是否投入完整标书");
  }
  return actions;
}

export function buildOpportunityProfile(input: {
  requirementIndex: RequirementIndex;
  analysis: TenderAnalysis;
  estimatedValueHint?: number;
}): OpportunityProfile {
  assertValidRequirementIndex(input.requirementIndex);
  if (input.analysis.requirementIndexId !== input.requirementIndex.id) {
    throw new Error("OpportunityProfile analysis.requirementIndexId mismatch");
  }

  const createdAt = nowIso();
  const index = input.requirementIndex;
  const analysis = input.analysis;

  const riskPenalty = analysis.risks.reduce((sum, r) => sum + severityScore(r.severity), 0);
  const coverageBoost = analysis.mustCoverage * 35;
  const signalBoost = Math.min(30, analysis.signalCount * 4);
  const complexityPenalty = analysis.complexityScore > 75 ? 12 : analysis.complexityScore > 55 ? 6 : 0;

  const fitScore = clamp(
    Math.round(40 + coverageBoost + signalBoost - riskPenalty * 0.6 - complexityPenalty),
    0,
    100,
  );
  const winProbability = round2(
    clamp(0.25 + fitScore / 150 - riskPenalty / 200, 0.05, 0.95),
  );
  const fitBand = fitBandFromScore(fitScore);
  const tier = tierFromFit(fitScore, winProbability);
  const gaps = buildGaps(analysis);
  const strengths = buildStrengths(analysis, index);
  const recommendedActions = buildActions(analysis, tier);

  const profile: OpportunityProfile = {
    id: stableId("opp", `${analysis.id}|${createdAt}`),
    analysisId: analysis.id,
    requirementIndexId: index.id,
    workspaceId: index.workspaceId,
    status: "ready",
    tier,
    fitScore,
    fitBand,
    winProbability,
    estimatedValueHint: input.estimatedValueHint,
    strengths,
    gaps,
    recommendedActions,
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  const validated = validateOpportunityProfile(profile);
  if (!validated.ok) {
    throw new Error(
      `Invalid OpportunityProfile: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return profile;
}

function pushTransition(
  transitions: IntelligenceLifecycleTransition[],
  from: IntelligenceLifecycleStage,
  to: IntelligenceLifecycleStage,
  note?: string,
): void {
  transitions.push({
    from,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  });
}

export function buildIntelligenceLifecycle(input: {
  analysis: TenderAnalysis | null;
  opportunity: OpportunityProfile | null;
}): IntelligenceLifecycle {
  const transitions: IntelligenceLifecycleTransition[] = [];
  let current: IntelligenceLifecycleStage = "requirements";

  if (input.analysis) {
    pushTransition(transitions, "requirements", "analysis", `analysis=${input.analysis.id}`);
    current = "analysis";
  }

  if (input.opportunity) {
    pushTransition(
      transitions,
      "analysis",
      "opportunity",
      `tier=${input.opportunity.tier}|fit=${input.opportunity.fitScore}`,
    );
    current = "opportunity";
  }

  const complete =
    input.analysis !== null &&
    input.opportunity !== null &&
    input.opportunity.status === "ready" &&
    current === "opportunity";

  return {
    current,
    stages: [...INTELLIGENCE_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildIntelligenceKernel(
  input: IntelligenceKernelInput,
): IntelligenceKernelResult {
  const deploymentId = input.deploymentId?.trim() || "v101-p3-intelligence-default";
  const generatedAt = nowIso();

  assertValidRequirementIndex(input.requirementIndex);

  const analysis = buildTenderAnalysis({
    requirementIndex: input.requirementIndex,
  });

  const opportunity = buildOpportunityProfile({
    requirementIndex: input.requirementIndex,
    analysis,
    estimatedValueHint: input.estimatedValueHint,
  });

  const lifecycle = buildIntelligenceLifecycle({ analysis, opportunity });
  const ready = lifecycle.complete;

  return {
    version: V101_TENDER_INTELLIGENCE_VERSION,
    freezeVersion: V101_TENDER_INTELLIGENCE_FREEZE_VERSION,
    reportId: `tender-intelligence-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    requirementIndex: input.requirementIndex,
    analysis,
    opportunity,
    lifecycle,
    ready,
    readinessScore: ready ? 100 : 0,
    summary: [
      `tender-intelligence ready=${ready}`,
      `requirements=${input.requirementIndex.entryCount}`,
      `signals=${analysis.signalCount}`,
      `risks=${analysis.riskCount}`,
      `tier=${opportunity.tier}`,
      `fit=${opportunity.fitScore}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V101_TENDER_INTELLIGENCE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertIntelligenceKernelPass(
  result: IntelligenceKernelResult,
): asserts result is IntelligenceKernelResult & {
  ready: true;
  analysis: TenderAnalysis;
  opportunity: OpportunityProfile;
} {
  if (!result.ready || !result.analysis || !result.opportunity) {
    throw new Error(`V101 tender intelligence kernel not ready: ${result.summary}`);
  }
}
