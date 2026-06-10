import type { RiskDriver, RiskIntelligence } from "./types";

export function buildRiskIntelligence(input?: { deploymentId?: string }): RiskIntelligence {
  const deploymentId = input?.deploymentId ?? "risk-default";
  const drivers: RiskDriver[] = [
    { driverId: `risk-drv-1-${deploymentId}`, category: "供应链", description: "进口器械交货周期不确定", impact: "medium" },
    { driverId: `risk-drv-2-${deploymentId}`, category: "施工", description: "现场层高与承重条件待确认", impact: "medium" },
    { driverId: `risk-drv-3-${deploymentId}`, category: "验收", description: "政府项目验收标准严格", impact: "high" },
    { driverId: `risk-drv-4-${deploymentId}`, category: "商务", description: "质保条款高于行业惯例", impact: "low" },
  ];

  const highCount = drivers.filter((d) => d.impact === "high" || d.impact === "critical").length;
  const riskLevel = highCount >= 2 ? "high" : highCount >= 1 ? "medium" : "low";

  return {
    intelligenceId: `risk-intel-${deploymentId}`,
    riskLevel,
    drivers,
    summary: `风险等级 ${riskLevel}，${drivers.length} 项驱动因素，重点关注验收与供应链`,
  };
}
