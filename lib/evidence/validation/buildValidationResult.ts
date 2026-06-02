import type {
  ComplianceCheckResult,
  EvidenceCoverageRuntimeResult,
  ValidationFinding,
  ValidationOutcome,
  ValidationPolicy,
  ValidationSummary,
} from "../types";
import { DEFAULT_VALIDATION_POLICY } from "../types";

export function buildValidationSummary(
  findings: ValidationFinding[],
  complianceChecks: ComplianceCheckResult[],
  coverageRuntime: EvidenceCoverageRuntimeResult,
): ValidationSummary {
  return {
    findingCount: findings.length,
    criticalCount: findings.filter((f) => f.severity === "critical").length,
    errorCount: findings.filter((f) => f.severity === "error").length,
    warningCount: findings.filter((f) => f.severity === "warning").length,
    infoCount: findings.filter((f) => f.severity === "info").length,
    compliancePassed: complianceChecks.filter((c) => c.passed).length,
    complianceFailed: complianceChecks.filter((c) => !c.passed).length,
    validationScore: coverageRuntime.summary.validationScore,
    coverageRatio: coverageRuntime.summary.coverageRatio,
  };
}

export function resolveValidationOutcome(input: {
  findings: ValidationFinding[];
  complianceChecks: ComplianceCheckResult[];
  coverageRuntime: EvidenceCoverageRuntimeResult;
  policy?: ValidationPolicy;
}): {
  outcome: ValidationOutcome;
  title: string;
  message: string;
  reasons: string[];
  suggestedActions: string[];
} {
  const policy = { ...DEFAULT_VALIDATION_POLICY, ...input.policy };
  const { findings, complianceChecks, coverageRuntime } = input;
  const reasons: string[] = [];
  const suggestedActions: string[] = [];

  const criticals = findings.filter((f) => f.severity === "critical");
  const errors = findings.filter((f) => f.severity === "error");
  const failedChecks = complianceChecks.filter((c) => !c.passed);

  if (!coverageRuntime.requirements.length) {
    return {
      outcome: "incomplete",
      title: "投标文件校验未完成",
      message: "缺少需求或覆盖数据，无法出具校验结论",
      reasons: ["incomplete_data"],
      suggestedActions: ["完成招标解析与证据流水线后重试"],
    };
  }

  if (policy.rejectOnCritical && criticals.length > 0) {
    reasons.push(...criticals.map((f) => f.message));
    suggestedActions.push("补充强制性证据材料");
    return {
      outcome: "rejected",
      title: "投标文件校验未通过",
      message: `发现 ${criticals.length} 项严重问题，不建议按当前材料投标`,
      reasons,
      suggestedActions,
    };
  }

  if (policy.rejectOnError && errors.length > 0) {
    reasons.push(...errors.map((f) => f.message));
    suggestedActions.push("修正证据冲突或覆盖率不足项");
    return {
      outcome: "rejected",
      title: "投标文件校验未通过",
      message: `发现 ${errors.length} 项错误级问题`,
      reasons,
      suggestedActions,
    };
  }

  const covVerdict = coverageRuntime.validation.verdict;
  if (covVerdict === "fail") {
    return {
      outcome: "rejected",
      title: "投标文件校验未通过",
      message: coverageRuntime.validation.message,
      reasons: coverageRuntime.validation.reasons,
      suggestedActions: coverageRuntime.validation.suggestedActions,
    };
  }

  if (
    covVerdict === "conditional" ||
    failedChecks.length > 0 ||
    findings.some((f) => f.severity === "warning")
  ) {
    if (failedChecks.length) {
      reasons.push(...failedChecks.map((c) => c.message));
    }
    if (covVerdict === "conditional") {
      reasons.push(...coverageRuntime.validation.reasons);
    }
    suggestedActions.push(
      ...coverageRuntime.validation.suggestedActions,
      "人工复核条件项后决定是否提交",
    );
    return {
      outcome: "conditional",
      title: "投标文件校验有条件通过",
      message: `证据覆盖得分 ${coverageRuntime.summary.validationScore}，需补充或人工确认部分项`,
      reasons,
      suggestedActions: [...new Set(suggestedActions)],
    };
  }

  return {
    outcome: "approved",
    title: "投标文件校验通过",
    message: `证据材料满足当前规则集（得分 ${coverageRuntime.summary.validationScore}）`,
    reasons: ["all_compliance_checks_passed"],
    suggestedActions: ["可进入后续招标决策/打包流程"],
  };
}
