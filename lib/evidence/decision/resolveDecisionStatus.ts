import type {
  DecisionFactor,
  DecisionInputsSnapshot,
  DecisionPolicy,
  TenderDecisionStatus,
} from "../types";
import { DEFAULT_DECISION_POLICY } from "../types";

export function computeDecisionConfidence(
  status: TenderDecisionStatus,
  factors: DecisionFactor[],
  inputs: DecisionInputsSnapshot,
): number {
  const criticalWeight = factors
    .filter((f) => f.severity === "critical")
    .reduce((s, f) => s + f.weight, 0);
  const warnWeight = factors
    .filter((f) => f.severity === "warning")
    .reduce((s, f) => s + f.weight, 0);

  let base = 0.85;
  if (status === "recommended") {
    base = 0.9 + (inputs.coverageScore ?? 0) / 1000;
  } else if (status === "conditional") {
    base = 0.72 - warnWeight * 0.05;
  } else if (status === "high-risk") {
    base = 0.55 - warnWeight * 0.08;
  } else {
    base = 0.4 - criticalWeight * 0.1;
  }

  return Math.max(0.1, Math.min(0.99, Math.round(base * 100) / 100));
}

/**
 * 确定性决策状态解析
 */
export function resolveTenderDecisionStatus(input: {
  factors: DecisionFactor[];
  inputs: DecisionInputsSnapshot;
  policy?: DecisionPolicy;
}): {
  status: TenderDecisionStatus;
  title: string;
  message: string;
  reasons: string[];
  recommendedActions: string[];
} {
  const policy = { ...DEFAULT_DECISION_POLICY, ...input.policy };
  const { factors, inputs } = input;
  const reasons: string[] = [];
  const recommendedActions: string[] = [];

  const hasCritical = factors.some((f) => f.severity === "critical");
  const validationRejected = inputs.validationOutcome === "rejected";
  const auditBlocked =
    policy.rejectOnAuditBlocked && inputs.governanceStatus === "blocked";

  if (validationRejected || auditBlocked || (inputs.mandatoryMissing ?? 0) > 0 && hasCritical) {
    if (validationRejected) reasons.push("投标校验未通过");
    if (auditBlocked) reasons.push("审计治理阻断");
    if ((inputs.mandatoryMissing ?? 0) > 0) {
      reasons.push(`强制性需求缺证据 ${inputs.mandatoryMissing} 项`);
    }
    recommendedActions.push(
      "补充资质/技术证据材料",
      "重新运行证据流水线后再次决策",
    );
    return {
      status: "rejected",
      title: "投标决策：不建议提交",
      message: "证据链/校验/审计存在阻断项，当前材料不满足投标提交条件",
      reasons,
      recommendedActions,
    };
  }

  if (
    inputs.validationOutcome === "conditional" ||
    inputs.governanceStatus === "review_required"
  ) {
    reasons.push("存在条件项或需人工复核项");
    if ((inputs.coverageScore ?? 0) < policy.minScoreForRecommended) {
      reasons.push(`校验得分 ${inputs.coverageScore} 低于推荐阈值`);
    }
    recommendedActions.push("人工复核条件项", "补充证据后可将决策升级为 recommended");
    return {
      status: "conditional",
      title: "投标决策：有条件建议",
      message: "可在补齐材料或人工确认后提交，不建议无复核直接投标",
      reasons,
      recommendedActions,
    };
  }

  const partialMandatory = factors.some(
    (f) => f.id.startsWith("F_PARTIAL_") && f.category === "coverage",
  );
  const lowCoverage =
    (inputs.coverageRatio ?? 1) < policy.minCoverageRatioForRecommended;
  const lowScore = (inputs.coverageScore ?? 0) < policy.minScoreForRecommended;

  if (
    policy.highRiskOnMandatoryPartial &&
    (partialMandatory || (inputs.mandatoryConflict ?? 0) > 0 || lowCoverage || lowScore)
  ) {
    if (partialMandatory) reasons.push("强制性需求仅部分覆盖");
    if ((inputs.mandatoryConflict ?? 0) > 0) reasons.push("强制性需求存在证据冲突");
    if (lowCoverage) reasons.push("整体覆盖率偏低");
    if (lowScore) reasons.push("综合得分偏低");
    recommendedActions.push("优先整改高风险项", "建议内部评审后再提交");
    return {
      status: "high-risk",
      title: "投标决策：高风险",
      message: "证据支撑不足或存在冲突信号，提交存在较高废标/扣分风险",
      reasons,
      recommendedActions,
    };
  }

  reasons.push("证据链完整", "校验与审计无阻断");
  recommendedActions.push("可进入标书打包/投递流程", "保留审计轨迹备查");
  return {
    status: "recommended",
    title: "投标决策：建议提交",
    message: `证据与校验结果支持投标（得分 ${inputs.coverageScore ?? "—"}）`,
    reasons,
    recommendedActions,
  };
}
