import type {
  CoveragePolicy,
  CoverageRuntimeSummary,
  RequirementCoverageResult,
  TenderValidationResult,
  TenderValidationVerdict,
} from "../types";
import { DEFAULT_COVERAGE_POLICY } from "../types";

export function buildCoverageSummary(
  results: RequirementCoverageResult[],
): CoverageRuntimeSummary {
  const total = results.length;
  const covered = results.filter((r) => r.status === "covered").length;
  const partial = results.filter((r) => r.status === "partial").length;
  const missing = results.filter((r) => r.status === "missing").length;
  const conflict = results.filter((r) => r.status === "conflict").length;
  const unknown = results.filter((r) => r.status === "unknown").length;
  const mandatoryMissing = results.filter(
    (r) => r.analysis.mandatory && r.status === "missing",
  ).length;
  const mandatoryConflict = results.filter(
    (r) => r.analysis.mandatory && r.status === "conflict",
  ).length;

  const coverageRatio = total
    ? Math.round(((covered + partial * 0.5) / total) * 1000) / 1000
    : 1;

  const validationScore = total
    ? Math.round(
        ((covered * 100 + partial * 55 + unknown * 30) / total -
          mandatoryMissing * 25 -
          conflict * 15) *
          10,
      ) / 10
    : 0;

  return {
    total,
    covered,
    partial,
    missing,
    conflict,
    unknown,
    mandatoryMissing,
    mandatoryConflict,
    coverageRatio,
    validationScore: Math.max(0, Math.min(100, validationScore)),
  };
}

/**
 * Tender Validation — 基于覆盖状态的确定性校验结论
 */
export function buildTenderValidation(
  results: RequirementCoverageResult[],
  summary: CoverageRuntimeSummary,
  policy?: CoveragePolicy,
): TenderValidationResult {
  const p = { ...DEFAULT_COVERAGE_POLICY, ...policy };
  const reasons: string[] = [];
  const suggestedActions: string[] = [];
  let verdict: TenderValidationVerdict = "pass";

  if (summary.total === 0) {
    return {
      version: "3.4-e4",
      verdict: "incomplete",
      title: "校验未完成",
      message: "无需求项，无法执行招标证据校验",
      reasons: ["requirements_empty"],
      suggestedActions: ["导入招标需求后再执行覆盖运行时"],
    };
  }

  if (p.failOnMandatoryMissing && summary.mandatoryMissing > 0) {
    verdict = "fail";
    reasons.push(`强制性需求缺失证据：${summary.mandatoryMissing} 项`);
    suggestedActions.push("补充资质/技术附件并重新运行证据流水线");
  }

  if (p.conditionalOnConflict && summary.conflict > 0 && verdict !== "fail") {
    verdict = "conditional";
    reasons.push(`存在证据冲突：${summary.conflict} 项`);
    suggestedActions.push("人工核对冲突证据附件");
  }

  const partialRatio = summary.total ? summary.partial / summary.total : 0;
  if (
    partialRatio >= p.conditionalPartialRatio &&
    verdict === "pass"
  ) {
    verdict = "conditional";
    reasons.push(`部分覆盖比例偏高：${Math.round(partialRatio * 100)}%`);
    suggestedActions.push("完善证据材料以提高覆盖度");
  }

  if (summary.missing > 0 && verdict === "pass") {
    verdict = "conditional";
    reasons.push(`非强制需求缺失：${summary.missing} 项`);
  }

  const titles: Record<TenderValidationVerdict, string> = {
    pass: "证据校验通过",
    conditional: "证据校验有条件通过",
    fail: "证据校验未通过",
    incomplete: "证据校验未完成",
  };

  const messages: Record<TenderValidationVerdict, string> = {
    pass: `全部关键需求已有充分证据支撑（得分 ${summary.validationScore}）`,
    conditional: `部分需求需补充或人工确认（得分 ${summary.validationScore}）`,
    fail: `强制性需求证据不足，不建议按当前材料提交（得分 ${summary.validationScore}）`,
    incomplete: "需求或证据数据不完整",
  };

  return {
    version: "3.4-e4",
    verdict,
    title: titles[verdict],
    message: messages[verdict],
    reasons,
    suggestedActions,
  };
}
