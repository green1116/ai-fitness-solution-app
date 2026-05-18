export type DecisionLevel = "go" | "cautious" | "hold";
export type DecisionLabel = "建议投" | "谨慎投" | "暂缓投";
export type ScoreRiskLevel = "low" | "medium" | "high";

export interface BidDecisionEvidenceItem {
  ref: string;
  source?: "note" | "risk" | "response" | "attachment";
  matchedBy?: string;
}

export interface BidDecisionBreakdownItem {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  note?: string;
  evidence?: BidDecisionEvidenceItem[];
  weaknesses?: string[];
  actions?: string[];
  riskLevel?: ScoreRiskLevel;
}

export interface BuildBidDecisionSummaryInput {
  items: BidDecisionBreakdownItem[];
  totalScore?: number;
  totalMaxScore?: number;
  topRisks?: Array<string | { title?: string; refs?: string[]; ref?: string }>;
  missingAttachments?: string[];
  thresholds?: Partial<{
    goMinRatio: number;
    cautiousMinRatio: number;
    highRiskItemHoldCount: number;
    highRiskItemCautiousCount: number;
    missingAttachmentHoldCount: number;
    missingAttachmentCautiousCount: number;
  }>;
}

export interface BidDecisionSummary {
  decision: {
    level: DecisionLevel;
    label: DecisionLabel;
    scoreRatio: number;
    totalScore: number;
    totalMaxScore: number;
    summaryText: string;
  };
  overview: {
    totalItems: number;
    lowRiskCount: number;
    mediumRiskCount: number;
    highRiskCount: number;
    missingAttachmentCount: number;
  };
  majorRisks: string[];
  weakestItems: Array<{
    key: string;
    label: string;
    score: number;
    maxScore: number;
    ratio: number;
    riskLevel: ScoreRiskLevel;
  }>;
  focusItems: string[];
  priorityActions: string[];
  diagnostics: {
    severeWeaknessCount: number;
    evidenceWeakCount: number;
    globalRiskHints: string[];
  };
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function safeRatio(score: number, maxScore: number) {
  if (!maxScore) return 0;
  return score / maxScore;
}

function inferRiskLevelFromRatio(ratio: number): ScoreRiskLevel {
  if (ratio >= 0.75) return "low";
  if (ratio >= 0.5) return "medium";
  return "high";
}

function normalizeRiskTitle(
  risk: string | { title?: string; refs?: string[]; ref?: string }
): string {
  if (typeof risk === "string") return risk.trim();
  return String(risk.title || "").trim();
}

function summarizeAttachmentRisk(missingAttachments?: string[]) {
  const list = (missingAttachments || []).filter(Boolean);
  if (!list.length) return "";
  if (list.length <= 3) return `缺少关键附件：${list.join("、")}`;
  return `缺少关键附件 ${list.length} 项（如 ${list.slice(0, 3).join("、")} 等）`;
}

function countEvidenceWeakItems(items: BidDecisionBreakdownItem[]) {
  return items.filter((item) => {
    const hasResponse = item.evidence?.some((e) => e.source === "response");
    const hasAttachment = item.evidence?.some((e) => e.source === "attachment");
    return !hasResponse || !hasAttachment;
  }).length;
}

function countSevereWeaknesses(items: BidDecisionBreakdownItem[]) {
  const patterns = [/不足/, /不够/, /缺少/, /缺乏/, /不充分/, /较弱/, /仍可进一步/, /影响/];
  let count = 0;
  for (const item of items) {
    for (const w of item.weaknesses || []) {
      if (patterns.some((p) => p.test(w))) {
        count += 1;
        break;
      }
    }
  }
  return count;
}

function buildDecisionText(
  label: DecisionLabel,
  ratio: number,
  highRiskCount: number,
  missingAttachmentCount: number
) {
  const ratioText = `${Math.round(ratio * 100)}%`;
  if (label === "建议投") {
    return `综合评估结果为${label}。当前整体评分基础较稳，综合得分率约 ${ratioText}，主要响应结构基本成型，可在补齐个别细节后进入正式投标输出。`;
  }
  if (label === "谨慎投") {
    return `综合评估结果为${label}。当前综合得分率约 ${ratioText}，仍存在需要优先补强的短板，尤其需关注高风险评分项${highRiskCount > 0 ? `（${highRiskCount}项）` : ""}${missingAttachmentCount > 0 ? `及缺失附件问题（${missingAttachmentCount}项）` : ""}。`;
  }
  return `综合评估结果为${label}。当前整体支撑仍偏弱，综合得分率约 ${ratioText}，高风险项较多${highRiskCount > 0 ? `（${highRiskCount}项）` : ""}，建议优先补强核心响应与关键附件后再决定是否正式投标。`;
}

export function buildBidDecisionSummary(
  input: BuildBidDecisionSummaryInput
): BidDecisionSummary {
  const items = input.items || [];
  const thresholds = {
    goMinRatio: input.thresholds?.goMinRatio ?? 0.75,
    cautiousMinRatio: input.thresholds?.cautiousMinRatio ?? 0.5,
    highRiskItemHoldCount: input.thresholds?.highRiskItemHoldCount ?? 3,
    highRiskItemCautiousCount: input.thresholds?.highRiskItemCautiousCount ?? 1,
    missingAttachmentHoldCount: input.thresholds?.missingAttachmentHoldCount ?? 2,
    missingAttachmentCautiousCount: input.thresholds?.missingAttachmentCautiousCount ?? 1,
  };

  const totalScore =
    typeof input.totalScore === "number"
      ? input.totalScore
      : items.reduce((sum, item) => sum + (item.score || 0), 0);
  const totalMaxScore =
    typeof input.totalMaxScore === "number"
      ? input.totalMaxScore
      : items.reduce((sum, item) => sum + (item.maxScore || 0), 0);
  const scoreRatio = safeRatio(totalScore, totalMaxScore);

  const normalizedItems = items.map((item) => {
    const r = safeRatio(item.score, item.maxScore);
    const riskLevel = item.riskLevel || inferRiskLevelFromRatio(r);
    return { ...item, ratio: r, riskLevel };
  });

  const lowRiskCount = normalizedItems.filter((i) => i.riskLevel === "low").length;
  const mediumRiskCount = normalizedItems.filter((i) => i.riskLevel === "medium").length;
  const highRiskCount = normalizedItems.filter((i) => i.riskLevel === "high").length;
  const missingAttachmentCount = (input.missingAttachments || []).length;

  let decisionLevel: DecisionLevel = "go";
  if (
    scoreRatio < thresholds.cautiousMinRatio ||
    highRiskCount >= thresholds.highRiskItemHoldCount ||
    missingAttachmentCount >= thresholds.missingAttachmentHoldCount
  ) {
    decisionLevel = "hold";
  } else if (
    scoreRatio < thresholds.goMinRatio ||
    highRiskCount >= thresholds.highRiskItemCautiousCount ||
    missingAttachmentCount >= thresholds.missingAttachmentCautiousCount
  ) {
    decisionLevel = "cautious";
  }

  const decisionLabelMap: Record<DecisionLevel, DecisionLabel> = {
    go: "建议投",
    cautious: "谨慎投",
    hold: "暂缓投",
  };
  const decisionLabel = decisionLabelMap[decisionLevel];

  const weakestItems = [...normalizedItems]
    .sort((a, b) => (a.ratio !== b.ratio ? a.ratio - b.ratio : a.score - b.score))
    .slice(0, 5)
    .map((item) => ({
      key: item.key,
      label: item.label,
      score: item.score,
      maxScore: item.maxScore,
      ratio: item.ratio,
      riskLevel: item.riskLevel,
    }));

  const focusItems = weakestItems.slice(0, 3).map((x) => x.label);
  const itemDerivedRisks = normalizedItems
    .filter((item) => item.riskLevel === "high" || item.ratio < 0.6)
    .flatMap((item) => item.weaknesses || [])
    .slice(0, 10);
  const globalRiskHints = (input.topRisks || [])
    .map(normalizeRiskTitle)
    .filter(Boolean)
    .slice(0, 5);
  const attachmentRisk = summarizeAttachmentRisk(input.missingAttachments);
  const majorRisks = uniq([...itemDerivedRisks, ...globalRiskHints, attachmentRisk]).slice(0, 6);

  const priorityActions = uniq(
    weakestItems.flatMap((weakItem) => {
      const full = normalizedItems.find((x) => x.key === weakItem.key);
      return full?.actions || [];
    })
  ).slice(0, 5);

  const severeWeaknessCount = countSevereWeaknesses(normalizedItems);
  const evidenceWeakCount = countEvidenceWeakItems(normalizedItems);
  const summaryText = buildDecisionText(
    decisionLabel,
    scoreRatio,
    highRiskCount,
    missingAttachmentCount
  );

  return {
    decision: {
      level: decisionLevel,
      label: decisionLabel,
      scoreRatio,
      totalScore,
      totalMaxScore,
      summaryText,
    },
    overview: {
      totalItems: normalizedItems.length,
      lowRiskCount,
      mediumRiskCount,
      highRiskCount,
      missingAttachmentCount,
    },
    majorRisks,
    weakestItems,
    focusItems,
    priorityActions,
    diagnostics: {
      severeWeaknessCount,
      evidenceWeakCount,
      globalRiskHints,
    },
  };
}
