import type {
  BidDecisionSummary,
  DecisionLevel,
} from "@/lib/tender/score/buildBidDecisionSummary";

export type BidGateAction = "allow" | "warn" | "block";

export interface BuildBidDecisionGateInput {
  summary: BidDecisionSummary;
  forceAllow?: boolean;
  policy?: Partial<{
    blockOnHold: boolean;
    warnOnCautious: boolean;
    blockOnHighRiskCount: number;
    blockOnMissingAttachmentCount: number;
    blockOnEvidenceWeakCount: number;
    blockOnSevereWeaknessCount: number;
  }>;
}

export interface BidDecisionGateResult {
  action: BidGateAction;
  passed: boolean;
  decisionLevel: DecisionLevel;
  decisionLabel: string;
  title: string;
  message: string;
  reasons: string[];
  suggestedNextSteps: string[];
  meta: {
    highRiskCount: number;
    missingAttachmentCount: number;
    evidenceWeakCount: number;
    severeWeaknessCount: number;
    scoreRatio: number;
  };
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function percent(v: number) {
  return `${Math.round(v * 100)}%`;
}

export function buildBidDecisionGate(
  input: BuildBidDecisionGateInput
): BidDecisionGateResult {
  const { summary, forceAllow = false } = input;

  const policy = {
    blockOnHold: input.policy?.blockOnHold ?? true,
    warnOnCautious: input.policy?.warnOnCautious ?? true,
    blockOnHighRiskCount: input.policy?.blockOnHighRiskCount ?? 4,
    blockOnMissingAttachmentCount:
      input.policy?.blockOnMissingAttachmentCount ?? 2,
    blockOnEvidenceWeakCount: input.policy?.blockOnEvidenceWeakCount ?? 4,
    blockOnSevereWeaknessCount: input.policy?.blockOnSevereWeaknessCount ?? 5,
  };

  const highRiskCount = summary.overview.highRiskCount;
  const missingAttachmentCount = summary.overview.missingAttachmentCount;
  const evidenceWeakCount = summary.diagnostics.evidenceWeakCount;
  const severeWeaknessCount = summary.diagnostics.severeWeaknessCount;
  const scoreRatio = summary.decision.scoreRatio;

  const reasons: string[] = [];
  const nextSteps: string[] = [];

  if (summary.decision.level === "hold") {
    reasons.push("当前综合评估结果为“暂缓投”");
  }

  if (highRiskCount >= policy.blockOnHighRiskCount) {
    reasons.push(`高风险评分项过多（${highRiskCount}项）`);
  }

  if (missingAttachmentCount >= policy.blockOnMissingAttachmentCount) {
    reasons.push(`缺少关键附件较多（${missingAttachmentCount}项）`);
  }

  if (evidenceWeakCount >= policy.blockOnEvidenceWeakCount) {
    reasons.push(`证据支撑偏弱的评分项较多（${evidenceWeakCount}项）`);
  }

  if (severeWeaknessCount >= policy.blockOnSevereWeaknessCount) {
    reasons.push(`严重扣分迹象较多（${severeWeaknessCount}项）`);
  }

  if (summary.focusItems.length > 0) {
    nextSteps.push(`优先补强：${summary.focusItems.join("、")}`);
  }

  if (summary.priorityActions.length > 0) {
    nextSteps.push(...summary.priorityActions.slice(0, 3));
  }

  if (missingAttachmentCount > 0) {
    nextSteps.push("优先补齐关键附件，再重新执行评分诊断");
  }

  if (evidenceWeakCount > 0) {
    nextSteps.push("补充正文响应与附件交叉支撑，避免只有结论没有证据");
  }

  if (forceAllow) {
    return {
      action: "allow",
      passed: true,
      decisionLevel: summary.decision.level,
      decisionLabel: summary.decision.label,
      title: "已放行正式投标包生成",
      message: `当前为强制放行模式。系统原始评估结果为“${summary.decision.label}”，综合得分率约 ${percent(scoreRatio)}。`,
      reasons: uniq(reasons),
      suggestedNextSteps: uniq(nextSteps).slice(0, 5),
      meta: {
        highRiskCount,
        missingAttachmentCount,
        evidenceWeakCount,
        severeWeaknessCount,
        scoreRatio,
      },
    };
  }

  const shouldBlock =
    (policy.blockOnHold && summary.decision.level === "hold") ||
    highRiskCount >= policy.blockOnHighRiskCount ||
    missingAttachmentCount >= policy.blockOnMissingAttachmentCount ||
    evidenceWeakCount >= policy.blockOnEvidenceWeakCount ||
    severeWeaknessCount >= policy.blockOnSevereWeaknessCount;

  if (shouldBlock) {
    return {
      action: "block",
      passed: false,
      decisionLevel: summary.decision.level,
      decisionLabel: summary.decision.label,
      title: "暂不建议直接生成正式投标包",
      message: `当前系统评估结果为“${summary.decision.label}”，综合得分率约 ${percent(scoreRatio)}。建议先完成重点补强后，再进入正式投标文件生成。`,
      reasons: uniq(reasons).slice(0, 5),
      suggestedNextSteps: uniq(nextSteps).slice(0, 5),
      meta: {
        highRiskCount,
        missingAttachmentCount,
        evidenceWeakCount,
        severeWeaknessCount,
        scoreRatio,
      },
    };
  }

  if (summary.decision.level === "cautious" && policy.warnOnCautious) {
    return {
      action: "warn",
      passed: true,
      decisionLevel: summary.decision.level,
      decisionLabel: summary.decision.label,
      title: "可继续生成，但建议先检查关键风险",
      message: `当前系统评估结果为“${summary.decision.label}”，综合得分率约 ${percent(scoreRatio)}。可以继续生成正式投标包，但建议优先核查主要风险与补强动作。`,
      reasons: uniq(
        reasons.length > 0 ? reasons : summary.majorRisks.slice(0, 3)
      ).slice(0, 5),
      suggestedNextSteps: uniq(nextSteps).slice(0, 5),
      meta: {
        highRiskCount,
        missingAttachmentCount,
        evidenceWeakCount,
        severeWeaknessCount,
        scoreRatio,
      },
    };
  }

  return {
    action: "allow",
    passed: true,
    decisionLevel: summary.decision.level,
    decisionLabel: summary.decision.label,
    title: "建议继续生成正式投标包",
    message: `当前系统评估结果为“${summary.decision.label}”，综合得分率约 ${percent(scoreRatio)}。整体投标基础较稳，可进入正式投标文件生成。`,
    reasons: uniq(summary.majorRisks.slice(0, 3)),
    suggestedNextSteps: uniq(nextSteps).slice(0, 5),
    meta: {
      highRiskCount,
      missingAttachmentCount,
      evidenceWeakCount,
      severeWeaknessCount,
      scoreRatio,
    },
  };
}
