/** 评分引擎：默认 profile + 自定义 profile */
import {
  collectEvidenceRefs,
  type AttachmentRow,
  type EvidenceRow,
  type RiskRow,
  type TenderScoreEvidenceItem,
} from "@/lib/tender/score/collectEvidenceRefs";
import { buildScoreNote } from "@/lib/tender/score/buildScoreNote";
import { buildScoreWeaknesses } from "@/lib/tender/score/buildScoreWeaknesses";
import { buildScoreActions } from "@/lib/tender/score/buildScoreActions";

export type ScoreRuleItem = {
  id?: string;
  key: "technical" | "business" | "implementation" | "price";
  label: string;
  maxScore: number;
  keywords?: string[];
};

export type ScorePenaltyConfig = {
  techPendingPenalty: number;
  bizPendingPenalty: number;
  deviationPenalty: number;
  missingAttachmentPenalty: number;
  cautionImplPenalty: number;
  highImplPenalty: number;
};

export type ScoreProfile = {
  profileId: string;
  profileName: string;
  items: ScoreRuleItem[];
  penalty: ScorePenaltyConfig;
};

export type TenderRiskData = {
  level: "safe" | "caution" | "high";
  summary: {
    techPending: number;
    bizPending: number;
    deviations: number;
    missingAttachments: number;
  };
  topRisks?: Array<string | RiskRow>;
  missingAttachments?: string[];
};

export type TenderScoreEvidenceContext = {
  note?: string;
  topRisks?: Array<string | RiskRow>;
  responseRows?: EvidenceRow[];
  attachmentIndex?: AttachmentRow[];
};

export type ScoreBreakdownItem = {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  note: string;
  evidence?: TenderScoreEvidenceItem[];
  weaknesses?: string[];
  actions?: string[];
  riskLevel?: "low" | "medium" | "high";
};

export type TenderScoreResult = {
  totalScore: number;
  totalMaxScore: number;
  breakdown: ScoreBreakdownItem[];
  conclusion: string;
};

const DEFAULT_PENALTY: ScorePenaltyConfig = {
  techPendingPenalty: 1,
  bizPendingPenalty: 1.5,
  deviationPenalty: 2,
  missingAttachmentPenalty: 2,
  cautionImplPenalty: 3,
  highImplPenalty: 8,
};

export const ENTERPRISE_SCORE_PROFILE: ScoreProfile = {
  profileId: "enterprise-default",
  profileName: "企业投标默认评分模型",
  items: [
    { key: "technical", label: "技术评分", maxScore: 40 },
    { key: "business", label: "商务评分", maxScore: 30 },
    { key: "implementation", label: "实施与服务评分", maxScore: 20 },
    { key: "price", label: "价格与报价评分", maxScore: 10 },
  ],
  penalty: { ...DEFAULT_PENALTY },
};

export const GOVERNMENT_SCORE_PROFILE: ScoreProfile = {
  profileId: "government-default",
  profileName: "政府评审默认评分模型",
  items: [
    { key: "technical", label: "技术评分", maxScore: 45 },
    { key: "business", label: "商务评分", maxScore: 25 },
    { key: "implementation", label: "实施与服务评分", maxScore: 20 },
    { key: "price", label: "价格与报价评分", maxScore: 10 },
  ],
  penalty: {
    techPendingPenalty: 1.2,
    bizPendingPenalty: 1.2,
    deviationPenalty: 2.5,
    missingAttachmentPenalty: 2,
    cautionImplPenalty: 3,
    highImplPenalty: 8,
  },
};

export function resolveScoreProfile(
  mode?: string,
  customProfile?: Partial<ScoreProfile> | null
): ScoreProfile {
  const base =
    mode === "government"
      ? GOVERNMENT_SCORE_PROFILE
      : ENTERPRISE_SCORE_PROFILE;

  if (!customProfile) return base;

  return {
    ...base,
    ...customProfile,
    items:
      customProfile.items?.length ? customProfile.items : base.items,
    penalty: {
      ...base.penalty,
      ...(customProfile.penalty || {}),
    },
  };
}

function round1(n: number) {
  return Math.max(0, Math.round(n * 10) / 10);
}

function inferScoreRiskLevel(score: number, maxScore: number): "low" | "medium" | "high" {
  const r = maxScore ? score / maxScore : 0;
  if (r >= 0.75) return "low";
  if (r >= 0.5) return "medium";
  return "high";
}

export function computeTenderScore(
  risk: TenderRiskData,
  profile: ScoreProfile,
  evidenceContext?: Omit<TenderScoreEvidenceContext, "note" | "topRisks">
): TenderScoreResult {
  const p = profile.penalty;
  const { summary, level } = risk;

  const breakdown: ScoreBreakdownItem[] = [];

  for (const item of profile.items) {
    let score = item.maxScore;
    let note = "按响应与风险情况估算。";

    switch (item.key) {
      case "technical": {
        const d1 = summary.techPending * p.techPendingPenalty;
        const d2 = summary.deviations * p.deviationPenalty;
        score -= d1 + d2;
        if (d1 > 0 || d2 > 0) {
          note = `待确认 ${summary.techPending} 项、偏离/部分满足 ${summary.deviations} 项已折算扣分。`;
        }
        break;
      }
      case "business": {
        const d = summary.bizPending * p.bizPendingPenalty;
        score -= d;
        if (d > 0) {
          note = `商务待确认 ${summary.bizPending} 项已折算扣分。`;
        }
        break;
      }
      case "implementation": {
        if (level === "high") {
          score -= p.highImplPenalty;
          note = "综合风险等级偏高，实施可行性扣分。";
        } else if (level === "caution") {
          score -= p.cautionImplPenalty;
          note = "存在一定风险，实施可行性适度扣分。";
        } else {
          note = "风险可控，实施维度未额外扣分。";
        }
        break;
      }
      case "price": {
        const d = summary.missingAttachments * p.missingAttachmentPenalty;
        score -= d;
        if (d > 0) {
          note = `缺失附件 ${summary.missingAttachments} 项，报价与证明材料维度扣分。`;
        } else {
          note = "附件完整性对价格维度无额外扣分。";
        }
        break;
      }
      default:
        break;
    }

    score = round1(score);
    const evidence = collectEvidenceRefs(
      {
        id: item.id,
        key: item.id || item.key,
        label: item.label,
        keywords: item.keywords,
        maxScore: item.maxScore,
      },
      {
        note,
        topRisks: risk.topRisks,
        responseRows: evidenceContext?.responseRows,
        attachmentIndex: evidenceContext?.attachmentIndex,
      }
    );
    const finalNote = buildScoreNote(
      {
        label: item.label,
        score,
        maxScore: item.maxScore,
        rawNote: note,
        evidence,
        keywords: item.keywords,
      },
      "long"
    );
    const weaknesses = buildScoreWeaknesses({
      label: item.label,
      score,
      maxScore: item.maxScore,
      rawNote: note,
      evidence,
      keywords: item.keywords,
    });
    const actions = buildScoreActions({
      label: item.label,
      score,
      maxScore: item.maxScore,
      weaknesses,
      evidence,
      keywords: item.keywords,
    });

    breakdown.push({
      key: item.id || item.key,
      label: item.label,
      score,
      maxScore: item.maxScore,
      note: finalNote,
      evidence,
      weaknesses,
      actions,
      riskLevel: inferScoreRiskLevel(score, item.maxScore),
    });
  }

  const totalScore = round1(
    breakdown.reduce((s, x) => s + x.score, 0)
  );
  const totalMaxScore = round1(
    breakdown.reduce((s, x) => s + x.maxScore, 0)
  );

  const ratio =
    totalMaxScore > 0 ? totalScore / totalMaxScore : 0;

  let conclusion = "";
  if (ratio >= 0.85) {
    conclusion = "方案成熟，风险可控，建议优先考虑。";
  } else if (ratio >= 0.7) {
    conclusion = "方案基本可行，建议结合补充材料评估。";
  } else {
    conclusion = "方案存在明显风险，建议谨慎评估。";
  }

  return {
    totalScore,
    totalMaxScore,
    breakdown,
    conclusion,
  };
}
