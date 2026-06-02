import type {
  AttachmentFile,
  EvidenceCoverageRuntimeResult,
  EvidenceLinkingRuntimeResult,
  EvidenceRegistryState,
  RequirementItem,
  ValidationFinding,
  ValidationPolicy,
} from "../types";
import { DEFAULT_VALIDATION_POLICY } from "../types";

function findingId(ruleId: string, suffix: string) {
  return `vf-${ruleId}-${suffix}-${Date.now().toString(36).slice(-4)}`;
}

/**
 * Validation Rules — 确定性规则引擎（非 LLM）
 */
export function runValidationRules(input: {
  documentId: string;
  requirements: RequirementItem[];
  coverageRuntime: EvidenceCoverageRuntimeResult;
  linking?: EvidenceLinkingRuntimeResult;
  registry?: EvidenceRegistryState;
  attachments?: AttachmentFile[];
  policy?: ValidationPolicy;
}): ValidationFinding[] {
  const policy = { ...DEFAULT_VALIDATION_POLICY, ...input.policy };
  const findings: ValidationFinding[] = [];
  const { coverageRuntime, requirements, attachments } = input;

  if (!requirements.length) {
    findings.push({
      id: findingId("RULE_NO_REQUIREMENTS", "0"),
      ruleId: "RULE_NO_REQUIREMENTS",
      severity: "critical",
      code: "NO_REQUIREMENTS",
      title: "无招标需求",
      message: "未解析到可校验的招标需求项",
      explain: ["投标文件校验需要需求清单作为基准"],
    });
    return findings;
  }

  if (policy.requireAttachments && (!attachments?.length || attachments.length === 0)) {
    findings.push({
      id: findingId("RULE_NO_ATTACHMENTS", "0"),
      ruleId: "RULE_NO_ATTACHMENTS",
      severity: "critical",
      code: "NO_ATTACHMENTS",
      title: "未提交证据附件",
      message: "投标文件校验需要至少一份证据附件",
      explain: ["请上传资质、技术参数、检测报告等证明材料"],
    });
  }

  for (const req of coverageRuntime.requirements) {
    if (req.analysis.mandatory && req.status === "missing") {
      findings.push({
        id: findingId("RULE_MANDATORY_MISSING", req.requirementId),
        ruleId: "RULE_MANDATORY_MISSING",
        severity: "critical",
        code: "MANDATORY_MISSING",
        title: `强制性需求缺证据：${req.requirementTitle}`,
        message: req.explain[0] || "强制性要求未发现匹配证据",
        requirementId: req.requirementId,
        explain: req.explain,
      });
    } else if (req.analysis.mandatory && req.status === "partial") {
      findings.push({
        id: findingId("RULE_MANDATORY_PARTIAL", req.requirementId),
        ruleId: "RULE_MANDATORY_PARTIAL",
        severity: "error",
        code: "MANDATORY_PARTIAL",
        title: `强制性需求证据不足：${req.requirementTitle}`,
        message: `匹配分 ${req.analysis.bestScore}，关键词覆盖 ${Math.round(req.analysis.keywordCoverageRatio * 100)}%`,
        requirementId: req.requirementId,
        explain: req.explain,
      });
    } else if (req.status === "conflict") {
      findings.push({
        id: findingId("RULE_EVIDENCE_CONFLICT", req.requirementId),
        ruleId: "RULE_EVIDENCE_CONFLICT",
        severity: "error",
        code: "EVIDENCE_CONFLICT",
        title: `证据冲突：${req.requirementTitle}`,
        message: req.analysis.conflictSignals.join("；") || "多份证据存在不一致信号",
        requirementId: req.requirementId,
        explain: [...req.explain, ...req.analysis.conflictSignals],
      });
    } else if (req.status === "missing" && !req.analysis.mandatory) {
      findings.push({
        id: findingId("RULE_OPTIONAL_MISSING", req.requirementId),
        ruleId: "RULE_OPTIONAL_MISSING",
        severity: "warning",
        code: "OPTIONAL_MISSING",
        title: `建议补充证据：${req.requirementTitle}`,
        message: "非强制性需求暂无充分证据",
        requirementId: req.requirementId,
        explain: req.explain,
      });
    } else if (req.status === "partial") {
      findings.push({
        id: findingId("RULE_PARTIAL_COVERAGE", req.requirementId),
        ruleId: "RULE_PARTIAL_COVERAGE",
        severity: "info",
        code: "PARTIAL_COVERAGE",
        title: `部分覆盖：${req.requirementTitle}`,
        message: `当前匹配分 ${req.analysis.bestScore}`,
        requirementId: req.requirementId,
        explain: req.explain.slice(0, 3),
      });
    }
  }

  if (coverageRuntime.summary.validationScore < policy.minValidationScore) {
    findings.push({
      id: findingId("RULE_LOW_SCORE", "0"),
      ruleId: "RULE_LOW_SCORE",
      severity: "warning",
      code: "LOW_VALIDATION_SCORE",
      title: "综合校验得分偏低",
      message: `得分 ${coverageRuntime.summary.validationScore} 低于阈值 ${policy.minValidationScore}`,
      explain: [
        `覆盖比 ${coverageRuntime.summary.coverageRatio}`,
        `缺失 ${coverageRuntime.summary.missing} 项`,
      ],
    });
  }

  if (coverageRuntime.summary.coverageRatio < policy.minCoverageRatio) {
    findings.push({
      id: findingId("RULE_LOW_COVERAGE", "0"),
      ruleId: "RULE_LOW_COVERAGE",
      severity: "error",
      code: "LOW_COVERAGE_RATIO",
      title: "证据覆盖率不足",
      message: `覆盖率 ${coverageRuntime.summary.coverageRatio} 低于阈值 ${policy.minCoverageRatio}`,
      explain: ["建议补充附件材料后重新校验"],
    });
  }

  const qualMissing = coverageRuntime.requirements.filter(
    (r) =>
      requirements.find((q) => q.id === r.requirementId)?.category === "qualification" &&
      (r.status === "missing" || r.status === "partial"),
  );
  if (qualMissing.length) {
    findings.push({
      id: findingId("RULE_QUALIFICATION_GAP", "0"),
      ruleId: "RULE_QUALIFICATION_GAP",
      severity: "error",
      code: "QUALIFICATION_GAP",
      title: "资质类要求证据不足",
      message: `${qualMissing.length} 项资质/资格要求未充分覆盖`,
      explain: qualMissing.map((r) => r.requirementTitle),
    });
  }

  if (input.linking) {
    const noLoc = input.linking.matches.filter((m) => m.locations.length === 0);
    if (noLoc.length && input.linking.matches.length) {
      findings.push({
        id: findingId("RULE_NO_OCR_LOC", "0"),
        ruleId: "RULE_NO_OCR_LOC",
        severity: "info",
        code: "NO_OCR_LOCATION",
        title: "部分匹配无 OCR 块定位",
        message: `${noLoc.length} 条匹配未能定位到 OCR 文本块`,
        explain: ["可能为文件名模式或文本提取失败"],
      });
    }
  }

  return findings;
}
