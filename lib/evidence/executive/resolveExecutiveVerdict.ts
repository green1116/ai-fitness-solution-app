import type {
  ExecutiveInputsSnapshot,
  ExecutivePolicy,
  ExecutiveRiskLevel,
  ExecutiveSupervision,
  ExecutiveVerdict,
} from "../types";
import { DEFAULT_EXECUTIVE_POLICY } from "../types";

export function resolveExecutiveVerdict(input: {
  riskLevel: ExecutiveRiskLevel;
  inputs: ExecutiveInputsSnapshot;
  policy?: ExecutivePolicy;
}): {
  verdict: ExecutiveVerdict;
  title: string;
  message: string;
  explain: string[];
  supervision: ExecutiveSupervision;
} {
  const policy = { ...DEFAULT_EXECUTIVE_POLICY, ...input.policy };
  const { riskLevel, inputs } = input;
  const explain: string[] = [];

  const requiresCompliance =
    policy.requireComplianceSignoffOnEscalation &&
    (inputs.escalationRequired || inputs.escalationLevel === "compliance");
  const requiresBoard =
    policy.boardReviewOnCritical && riskLevel === "critical";

  if (
    policy.denyOnGovernanceHalt &&
    (inputs.governancePosture === "halt" || riskLevel === "critical")
  ) {
    explain.push("治理层终止或 critical 风险");
    return {
      verdict: "deny",
      title: "高管监管：不予批准",
      message: "当前投标包不满足企业高层提交标准，不予批准推进",
      explain,
      supervision: {
        riskLevel,
        verdict: "deny",
        requiresBoardReview: requiresBoard,
        requiresComplianceSignoff: true,
        escalationLevel: inputs.escalationLevel as ExecutiveSupervision["escalationLevel"],
      },
    };
  }

  if (policy.deferOnHighRisk && riskLevel === "high") {
    explain.push("高风险投标包，建议延期决策");
    return {
      verdict: "defer",
      title: "高管监管：暂缓决策",
      message: "建议完成风险缓释与补充材料后再提请高管审批",
      explain,
      supervision: {
        riskLevel,
        verdict: "defer",
        requiresBoardReview: false,
        requiresComplianceSignoff: requiresCompliance,
        escalationLevel: inputs.escalationLevel as ExecutiveSupervision["escalationLevel"],
      },
    };
  }

  if (riskLevel === "attention") {
    explain.push("存在条件项或升级复核要求");
    return {
      verdict: "approve_with_conditions",
      title: "高管监管：有条件批准",
      message: "可在满足合规会签与列明条件后授权推进投标流程",
      explain,
      supervision: {
        riskLevel,
        verdict: "approve_with_conditions",
        requiresBoardReview: false,
        requiresComplianceSignoff: requiresCompliance || true,
        escalationLevel: inputs.escalationLevel as ExecutiveSupervision["escalationLevel"],
      },
    };
  }

  explain.push("治理姿态可推进", "决策与校验一致");
  return {
    verdict: "approve",
    title: "高管监管：批准推进",
    message: "证据链、治理与决策结论支持授权业务线进入投标执行阶段",
    explain,
    supervision: {
      riskLevel,
      verdict: "approve",
      requiresBoardReview: false,
      requiresComplianceSignoff: requiresCompliance,
      escalationLevel: inputs.escalationLevel as ExecutiveSupervision["escalationLevel"],
    },
  };
}
