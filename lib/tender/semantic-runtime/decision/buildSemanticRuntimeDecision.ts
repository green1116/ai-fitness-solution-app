import type { SemanticEvidenceCoverageSummary } from "@/lib/tender/semantic-evidence/types";
import type {
  RequirementIntent,
  SemanticMatchResult,
  SemanticRuntimeDecision,
  SemanticRuntimeGateAction,
  SemanticRuntimePolicy,
} from "../types";

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

export type BuildSemanticRuntimeDecisionInput = {
  intents: RequirementIntent[];
  matches: SemanticMatchResult[];
  coverage: SemanticEvidenceCoverageSummary;
  policy?: Partial<SemanticRuntimePolicy>;
  forceAllow?: boolean;
};

/**
 * V3.2 语义运行时决策（确定性）
 */
export function buildSemanticRuntimeDecision(
  input: BuildSemanticRuntimeDecisionInput,
): SemanticRuntimeDecision {
  const policy: SemanticRuntimePolicy = {
    blockOnMandatoryGapCount:
      input.policy?.blockOnMandatoryGapCount ?? 1,
    blockOnGapRatio: input.policy?.blockOnGapRatio ?? 0.35,
    warnOnMisalignmentRatio: input.policy?.warnOnMisalignmentRatio ?? 0.25,
    minAvgMatchScore: input.policy?.minAvgMatchScore ?? 0.45,
  };

  const totalReqs = input.intents.length || 1;
  const matchedReqIds = new Set(input.matches.map((m) => m.requirementId));
  const gapRows = input.coverage.rows.filter(
    (r) => r.semanticStatus === "unsupported" || r.semanticStatus === "risky",
  );
  const gapCount = gapRows.length;

  const mandatoryIntents = input.intents.filter((i) => i.priority === "mandatory");
  const mandatoryGapCount = gapRows.filter((r) =>
    mandatoryIntents.some((m) => m.requirementId === r.requirementId),
  ).length;

  const misaligned = input.coverage.rows.filter((r) => !r.aligned).length;
  const misalignmentRatio = misaligned / Math.max(1, input.coverage.rows.length);

  const totalNeeds = input.coverage.rows.reduce((s, r) => s + r.totalNeeds, 0);
  const satisfiedNeeds = input.coverage.rows.reduce((s, r) => s + r.satisfiedNeeds, 0);
  const coverageRatio =
    totalNeeds > 0 ? satisfiedNeeds / totalNeeds : input.coverage.alignmentRatio;

  const avgMatchScore =
    input.matches.length > 0
      ? input.matches.reduce((s, m) => s + m.matchScore, 0) / input.matches.length
      : 0;

  const unmatchedMandatory = mandatoryIntents.filter(
    (i) => !matchedReqIds.has(i.requirementId),
  ).length;

  const meta = {
    intentCount: input.intents.length,
    profileCount: 0,
    matchCount: input.matches.length,
    gapCount,
    mandatoryGapCount,
    coverageRatio,
    alignmentRatio: input.coverage.alignmentRatio,
    avgMatchScore: Math.round(avgMatchScore * 100) / 100,
  };

  const reasons: string[] = [];
  const suggestedActions: string[] = [];

  if (mandatoryGapCount >= policy.blockOnMandatoryGapCount) {
    reasons.push(`强制性需求存在证据缺口（${mandatoryGapCount} 项）`);
  }
  if (gapCount / totalReqs >= policy.blockOnGapRatio) {
    reasons.push(`语义证据缺口占比过高（${gapCount}/${totalReqs}）`);
  }
  if (misalignmentRatio >= policy.warnOnMisalignmentRatio) {
    reasons.push(`语义覆盖与 registry 对齐率偏低（${Math.round(misalignmentRatio * 100)}% 未对齐）`);
  }
  if (avgMatchScore < policy.minAvgMatchScore && input.matches.length > 0) {
    reasons.push(`平均语义匹配分偏低（${meta.avgMatchScore}）`);
  }
  if (unmatchedMandatory > 0) {
    suggestedActions.push(
      `为 ${unmatchedMandatory} 项强制性需求补充语义匹配证据`,
    );
  }
  for (const row of gapRows.slice(0, 3)) {
    if (row.missingTypes.length) {
      suggestedActions.push(
        `补充 ${row.requirementText.slice(0, 20)}… 的 ${row.missingTypes.join("/")} 证据`,
      );
    }
  }

  if (input.forceAllow) {
    return {
      action: "allow",
      passed: true,
      title: "语义运行时已强制放行",
      message: `语义覆盖率约 ${Math.round(coverageRatio * 100)}%，匹配 ${input.matches.length} 对。`,
      reasons: uniq(reasons),
      suggestedActions: uniq(suggestedActions).slice(0, 5),
      meta: { ...meta, profileCount: meta.profileCount },
    };
  }

  const shouldBlock =
    mandatoryGapCount >= policy.blockOnMandatoryGapCount ||
    gapCount / totalReqs >= policy.blockOnGapRatio;

  if (shouldBlock) {
    return blockDecision(reasons, suggestedActions, meta);
  }

  const shouldWarn =
    misalignmentRatio >= policy.warnOnMisalignmentRatio ||
    avgMatchScore < policy.minAvgMatchScore ||
    gapCount > 0;

  if (shouldWarn) {
    return warnDecision(reasons, suggestedActions, meta, coverageRatio);
  }

  return allowDecision(meta, coverageRatio, input.matches.length);
}

function blockDecision(
  reasons: string[],
  actions: string[],
  meta: SemanticRuntimeDecision["meta"],
): SemanticRuntimeDecision {
  return {
    action: "block",
    passed: false,
    title: "语义运行时阻断：证据语义支撑不足",
    message: "确定性语义推理判定当前不满足投标准备所需的证据语义覆盖。",
    reasons: uniq(reasons).slice(0, 5),
    suggestedActions: uniq(actions).slice(0, 5),
    meta,
  };
}

function warnDecision(
  reasons: string[],
  actions: string[],
  meta: SemanticRuntimeDecision["meta"],
  coverageRatio: number,
): SemanticRuntimeDecision {
  return {
    action: "warn",
    passed: true,
    title: "语义运行时可继续，但存在语义缺口",
    message: `语义覆盖率约 ${Math.round(coverageRatio * 100)}%，建议完成语义补强后再提交。`,
    reasons: uniq(reasons.length ? reasons : ["存在未完全匹配的需求意图"]).slice(0, 5),
    suggestedActions: uniq(actions).slice(0, 5),
    meta,
  };
}

function allowDecision(
  meta: SemanticRuntimeDecision["meta"],
  coverageRatio: number,
  matchCount: number,
): SemanticRuntimeDecision {
  return {
    action: "allow" as SemanticRuntimeGateAction,
    passed: true,
    title: "语义运行时通过",
    message: `语义覆盖率约 ${Math.round(coverageRatio * 100)}%，${matchCount} 对需求-证据语义匹配。`,
    reasons: [],
    suggestedActions: [],
    meta,
  };
}
