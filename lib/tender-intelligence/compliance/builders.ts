import type { ComplianceIntelligence } from "./types";

export function buildComplianceIntelligence(input?: {
  deploymentId?: string;
}): ComplianceIntelligence {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  return {
    intelligenceId: `compliance-intel-${deploymentId}`,
    complianceCoverage: 82.5,
    missingAreas: ["同类项目业绩证明（待补充）", "进口设备报关单模板"],
    attentionAreas: ["质保期不少于 3 年", "智能化管理系统为评分项", "设备安装安全检测"],
    summary: "合规覆盖率 82.5%，缺失 2 项材料，需关注质保与智能化评分",
  };
}
