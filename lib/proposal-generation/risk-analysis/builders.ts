import type { EscalationPath, MitigationStrategy, RiskRegisterEntry } from "./types";

export function buildRiskRegister(input?: { deploymentId?: string }): RiskRegisterEntry[] {
  const deploymentId = input?.deploymentId ?? "risk-default";
  return [
    { riskId: `risk-1-${deploymentId}`, title: "设备供货延迟", category: "供应链", severity: "high", likelihood: "possible", owner: "采购经理" },
    { riskId: `risk-2-${deploymentId}`, title: "现场条件不符", category: "施工", severity: "medium", likelihood: "possible", owner: "安装主管" },
    { riskId: `risk-3-${deploymentId}`, title: "系统集成兼容", category: "技术", severity: "medium", likelihood: "unlikely", owner: "技术负责人" },
    { riskId: `risk-4-${deploymentId}`, title: "验收标准争议", category: "商务", severity: "high", likelihood: "unlikely", owner: "项目经理" },
    { riskId: `risk-5-${deploymentId}`, title: "人员培训不足", category: "运营", severity: "low", likelihood: "possible", owner: "培训专员" },
  ];
}

export function buildMitigationStrategies(input?: {
  deploymentId?: string;
  risks?: RiskRegisterEntry[];
}): MitigationStrategy[] {
  const deploymentId = input?.deploymentId ?? "risk-default";
  const risks = input?.risks ?? buildRiskRegister({ deploymentId });
  return risks.map((risk) => ({
    strategyId: `mitigation-${risk.riskId}`,
    riskId: risk.riskId,
    approach: `针对「${risk.title}」的预防与应急方案`,
    preventiveActions: ["提前识别与监控", "建立备用供应商", "定期进度评审"].slice(0, 2),
    contingencyActions: ["启动应急预案", "升级至项目经理", "通知客户并协商"].slice(0, 2),
  }));
}

export function buildEscalationPaths(input?: { deploymentId?: string }): EscalationPath[] {
  const deploymentId = input?.deploymentId ?? "risk-default";
  return [
    { pathId: `esc-1-${deploymentId}`, level: 1, role: "现场负责人", trigger: "一般问题", responseTime: "4 小时内" },
    { pathId: `esc-2-${deploymentId}`, level: 2, role: "项目经理", trigger: "影响进度", responseTime: "2 小时内" },
    { pathId: `esc-3-${deploymentId}`, level: 3, role: "技术总监", trigger: "技术重大风险", responseTime: "1 小时内" },
    { pathId: `esc-4-${deploymentId}`, level: 4, role: "公司高管", trigger: "合同级争议", responseTime: "30 分钟内" },
  ];
}
