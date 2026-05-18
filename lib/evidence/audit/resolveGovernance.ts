import type {
  TenderAuditGovernanceStatus,
  TenderAuditTrail,
  TenderValidationRuntimeResult,
} from "../types";

/**
 * 治理状态（确定性，非 AI 决策）
 */
export function resolveGovernanceStatus(input: {
  trail: TenderAuditTrail;
  tenderValidation?: TenderValidationRuntimeResult;
}): {
  status: TenderAuditGovernanceStatus;
  title: string;
  message: string;
  explain: string[];
} {
  const explain: string[] = [];
  const { trail, tenderValidation } = input;
  const criticalEntries = trail.entries.filter((e) => e.severity === "critical");
  const complianceFlags = trail.entries.filter((e) => e.type === "compliance-flagged");

  if (tenderValidation?.outcome === "rejected") {
    explain.push(...tenderValidation.reasons.slice(0, 5));
    return {
      status: "blocked",
      title: "投标治理：阻断",
      message: tenderValidation.message,
      explain,
    };
  }

  if (criticalEntries.length > 0 || trail.summary.criticalFindings > 0) {
    explain.push(`${criticalEntries.length} 条严重级审计事件`);
    return {
      status: "blocked",
      title: "投标治理：阻断",
      message: "审计轨迹存在严重级问题，需整改后重新提交",
      explain,
    };
  }

  if (
    tenderValidation?.outcome === "conditional" ||
    complianceFlags.length > 0 ||
    trail.summary.validationOutcome === "conditional"
  ) {
    if (tenderValidation) explain.push(...tenderValidation.reasons.slice(0, 4));
    explain.push(`${complianceFlags.length} 项合规标记需人工复核`);
    return {
      status: "review_required",
      title: "投标治理：需复核",
      message: "证据链完整但存在条件项，建议采购/合规人工审核",
      explain,
    };
  }

  explain.push(`审计事件 ${trail.summary.totalEntries} 条，未发现阻断项`);
  return {
    status: "clear",
    title: "投标治理：清晰",
    message: "证据链与校验轨迹完整，可进入后续决策流程",
    explain,
  };
}
