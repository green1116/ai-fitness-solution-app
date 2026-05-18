import type {
  GovernanceControlCheck,
  GovernanceEscalation,
  GovernancePolicy,
  GovernancePosture,
  GovernanceRiskLevel,
  GovernanceInputsSnapshot,
} from "../types";
import { DEFAULT_GOVERNANCE_POLICY } from "../types";

export function resolveGovernanceEscalation(input: {
  riskLevel: GovernanceRiskLevel;
  inputs: GovernanceInputsSnapshot;
  controls: GovernanceControlCheck[];
  policy?: GovernancePolicy;
}): GovernanceEscalation {
  const policy = { ...DEFAULT_GOVERNANCE_POLICY, ...input.policy };
  const failedCritical = input.controls.filter(
    (c) => !c.passed && c.riskLevel === "critical",
  );

  if (input.riskLevel === "critical") {
    return {
      required: true,
      level: policy.executiveEscalationOnReject ? "executive" : "compliance",
      reason:
        input.inputs.decisionStatus === "rejected"
          ? "投标决策驳回，需高管/合规审批"
          : "治理风险为 critical",
    };
  }

  if (input.riskLevel === "high" && policy.escalateOnHighRisk) {
    return {
      required: true,
      level: failedCritical.length ? "compliance" : "manager",
      reason: "高风险投标包，建议升级复核",
    };
  }

  if (input.inputs.validationOutcome === "conditional") {
    return {
      required: true,
      level: "manager",
      reason: "条件性校验通过，需业务负责人确认",
    };
  }

  return { required: false, level: "none", reason: "无需升级" };
}

export function resolveGovernancePosture(input: {
  riskLevel: GovernanceRiskLevel;
  controls: GovernanceControlCheck[];
  escalation: GovernanceEscalation;
  policy?: GovernancePolicy;
}): {
  posture: GovernancePosture;
  title: string;
  message: string;
  explain: string[];
} {
  const policy = { ...DEFAULT_GOVERNANCE_POLICY, ...input.policy };
  const explain: string[] = [];
  const failed = input.controls.filter((c) => !c.passed);

  if (
    policy.haltOnCriticalRisk &&
    (input.riskLevel === "critical" || failed.some((c) => c.riskLevel === "critical"))
  ) {
    explain.push(...failed.map((c) => c.message));
    return {
      posture: "halt",
      title: "治理姿态：终止",
      message: "存在 critical 级风险或控制未通过，暂停投标准备流程",
      explain,
    };
  }

  if (input.escalation.required || input.riskLevel === "high") {
    explain.push(input.escalation.reason);
    return {
      posture: input.riskLevel === "high" ? "hold" : "escalate",
      title: input.riskLevel === "high" ? "治理姿态：暂缓" : "治理姿态：升级复核",
      message: "需完成升级审批或补充材料后方可继续",
      explain,
    };
  }

  if (input.riskLevel === "medium" || failed.length > 0) {
    if (failed.length) explain.push(`${failed.length} 项治理控制待关注`);
    return {
      posture: "escalate",
      title: "治理姿态：升级复核",
      message: "中等风险，建议合规/业务双线确认后推进",
      explain,
    };
  }

  explain.push("全部治理控制通过", "风险等级低");
  return {
    posture: "proceed",
    title: "治理姿态：可推进",
    message: "证据链、校验、审计、决策一致，满足企业治理推进条件",
    explain,
  };
}
