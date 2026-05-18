import type {
  ComplianceCheckResult,
  ValidationFinding,
  ValidationPolicy,
  ValidationSeverity,
} from "../types";
import { DEFAULT_VALIDATION_POLICY } from "../types";

function maxSeverity(findings: ValidationFinding[]): ValidationSeverity {
  const order: ValidationSeverity[] = ["critical", "error", "warning", "info"];
  for (const s of order) {
    if (findings.some((f) => f.severity === s)) return s;
  }
  return "info";
}

/**
 * Compliance Check — 聚合规则发现为合规检查项
 */
export function runComplianceChecks(input: {
  findings: ValidationFinding[];
  policy?: ValidationPolicy;
}): ComplianceCheckResult[] {
  const policy = { ...DEFAULT_VALIDATION_POLICY, ...input.policy };
  const { findings } = input;

  const byRule = (prefix: string) =>
    findings.filter((f) => f.ruleId.startsWith(prefix));

  const mandatoryFindings = findings.filter(
    (f) => f.ruleId === "RULE_MANDATORY_MISSING" || f.ruleId === "RULE_MANDATORY_PARTIAL",
  );
  const conflictFindings = byRule("RULE_EVIDENCE_CONFLICT");
  const attachmentFindings = byRule("RULE_NO_ATTACHMENTS");
  const coverageFindings = byRule("RULE_LOW_COVERAGE");

  const checks: ComplianceCheckResult[] = [
    {
      checkId: "CHECK_ATTACHMENT_PRESENT",
      passed: attachmentFindings.length === 0,
      severity: attachmentFindings.length ? "critical" : "info",
      title: "证据附件完整性",
      message: attachmentFindings.length
        ? "缺少投标证据附件"
        : "已提供证据附件",
      relatedFindingIds: attachmentFindings.map((f) => f.id),
    },
    {
      checkId: "CHECK_MANDATORY_EVIDENCE",
      passed: mandatoryFindings.filter((f) => f.severity === "critical").length === 0,
      severity: maxSeverity(mandatoryFindings) || "info",
      title: "强制性需求证据",
      message: mandatoryFindings.length
        ? `${mandatoryFindings.length} 项强制性需求证据问题`
        : "强制性需求均有证据支撑",
      relatedFindingIds: mandatoryFindings.map((f) => f.id),
    },
    {
      checkId: "CHECK_CONFLICT_FREE",
      passed: conflictFindings.length === 0,
      severity: conflictFindings.length ? "error" : "info",
      title: "证据一致性",
      message: conflictFindings.length
        ? `存在 ${conflictFindings.length} 项证据冲突`
        : "未发现证据冲突",
      relatedFindingIds: conflictFindings.map((f) => f.id),
    },
    {
      checkId: "CHECK_COVERAGE_THRESHOLD",
      passed: coverageFindings.length === 0,
      severity: coverageFindings.length ? "error" : "info",
      title: "证据覆盖率阈值",
      message: coverageFindings.length
        ? "整体证据覆盖率未达企业阈值"
        : `覆盖率满足阈值（≥ ${policy.minCoverageRatio}）`,
      relatedFindingIds: coverageFindings.map((f) => f.id),
    },
  ];

  return checks;
}
