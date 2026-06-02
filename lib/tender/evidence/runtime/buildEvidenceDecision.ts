import type { RequirementCoverageResult } from "../types";
import type {
  EvidenceDecisionPolicy,
  EvidenceDecisionResult,
  EvidenceGateAction,
} from "./types";

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

export type BuildEvidenceDecisionInput = {
  coverage: RequirementCoverageResult[];
  documentsCount: number;
  linksCount: number;
  mandatoryRequirementIds?: Set<string>;
  policy?: EvidenceDecisionPolicy;
  forceAllow?: boolean;
};

export function buildEvidenceDecision(
  input: BuildEvidenceDecisionInput,
): EvidenceDecisionResult {
  const policy = {
    blockOnUnsupportedCount: input.policy?.blockOnUnsupportedCount ?? 5,
    blockOnRiskyCount: input.policy?.blockOnRiskyCount ?? 8,
    blockOnMandatoryUnsupportedCount:
      input.policy?.blockOnMandatoryUnsupportedCount ?? 1,
    warnOnPartiallyEvidencedRatio:
      input.policy?.warnOnPartiallyEvidencedRatio ?? 0.35,
    warnOnUnsupportedRatio: input.policy?.warnOnUnsupportedRatio ?? 0.2,
  };

  const total = input.coverage.length;
  const fullyEvidencedCount = input.coverage.filter(
    (c) => c.status === "fully_evidenced",
  ).length;
  const partiallyEvidencedCount = input.coverage.filter(
    (c) => c.status === "partially_evidenced",
  ).length;
  const unsupportedCount = input.coverage.filter(
    (c) => c.status === "unsupported",
  ).length;
  const riskyCount = input.coverage.filter((c) => c.status === "risky").length;

  const mandatoryIds = input.mandatoryRequirementIds ?? new Set<string>();
  const mandatoryUnsupportedCount = input.coverage.filter(
    (c) =>
      c.status === "unsupported" && mandatoryIds.has(c.requirementId),
  ).length;

  const coverageRatio = total > 0 ? fullyEvidencedCount / total : 1;
  const unsupportedRatio = total > 0 ? unsupportedCount / total : 0;
  const partialRatio = total > 0 ? partiallyEvidencedCount / total : 0;

  const meta = {
    totalRequirements: total,
    fullyEvidencedCount,
    partiallyEvidencedCount,
    unsupportedCount,
    riskyCount,
    mandatoryUnsupportedCount,
    documentsCount: input.documentsCount,
    linksCount: input.linksCount,
    coverageRatio,
  };

  const reasons: string[] = [];
  const nextSteps: string[] = [];

  if (unsupportedCount >= policy.blockOnUnsupportedCount) {
    reasons.push(`无证据支撑的要求较多（${unsupportedCount} 项）`);
  }
  if (riskyCount >= policy.blockOnRiskyCount) {
    reasons.push(`证据置信度偏低的要求较多（${riskyCount} 项）`);
  }
  if (mandatoryUnsupportedCount >= policy.blockOnMandatoryUnsupportedCount) {
    reasons.push(
      `强制性要求缺少证据（${mandatoryUnsupportedCount} 项）`,
    );
  }
  if (partiallyEvidencedCount > 0) {
    nextSteps.push("优先补强仅部分覆盖的技术参数与资质证明");
  }
  if (unsupportedCount > 0) {
    nextSteps.push("为 unsupported 要求补充 SKU 参数表、检测报告或案例材料");
  }
  if (riskyCount > 0) {
    nextSteps.push("提升低置信度证据：增加交叉引用或更完整附件");
  }

  if (input.forceAllow) {
    return {
      action: "allow",
      passed: true,
      title: "证据运行已放行",
      message: `强制放行模式。证据覆盖率约 ${Math.round(coverageRatio * 100)}%，共 ${input.documentsCount} 份证据文档。`,
      reasons: uniq(reasons),
      suggestedNextSteps: uniq(nextSteps).slice(0, 5),
      meta,
    };
  }

  const shouldBlock =
    unsupportedCount >= policy.blockOnUnsupportedCount ||
    riskyCount >= policy.blockOnRiskyCount ||
    mandatoryUnsupportedCount >= policy.blockOnMandatoryUnsupportedCount;

  if (shouldBlock) {
    return blockResult(reasons, nextSteps, meta);
  }

  const shouldWarn =
    partialRatio >= policy.warnOnPartiallyEvidencedRatio ||
    unsupportedRatio >= policy.warnOnUnsupportedRatio;

  if (shouldWarn) {
    return warnResult(reasons, nextSteps, meta);
  }

  return allowResult(meta);
}

function blockResult(
  reasons: string[],
  nextSteps: string[],
  meta: EvidenceDecisionResult["meta"],
): EvidenceDecisionResult {
  return {
    action: "block",
    passed: false,
    title: "证据支撑不足，暂不建议进入正式投标包生成",
    message: `当前证据覆盖率约 ${Math.round(meta.coverageRatio * 100)}%。请先完成证据补强后再继续。`,
    reasons: uniq(reasons).slice(0, 5),
    suggestedNextSteps: uniq(nextSteps).slice(0, 5),
    meta,
  };
}

function warnResult(
  reasons: string[],
  nextSteps: string[],
  meta: EvidenceDecisionResult["meta"],
): EvidenceDecisionResult {
  return {
    action: "warn",
    passed: true,
    title: "可继续，但建议先补强关键证据",
    message: `证据覆盖率约 ${Math.round(meta.coverageRatio * 100)}%，存在部分未完全覆盖的要求。`,
    reasons: uniq(
      reasons.length > 0
        ? reasons
        : [`部分覆盖 ${meta.partiallyEvidencedCount} 项`, `无证据 ${meta.unsupportedCount} 项`],
    ).slice(0, 5),
    suggestedNextSteps: uniq(nextSteps).slice(0, 5),
    meta,
  };
}

function allowResult(
  meta: EvidenceDecisionResult["meta"],
): EvidenceDecisionResult {
  return {
    action: "allow" as EvidenceGateAction,
    passed: true,
    title: "证据支撑充分，可继续投标流程",
    message: `证据覆盖率约 ${Math.round(meta.coverageRatio * 100)}%，共登记 ${meta.documentsCount} 份证据。`,
    reasons: [],
    suggestedNextSteps: [],
    meta,
  };
}
