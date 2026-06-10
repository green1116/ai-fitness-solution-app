import { buildTenderProjectSnapshot } from "../shared/tender-input";
import type { EquipmentIntelligence } from "./types";

export function buildEquipmentIntelligence(input?: {
  deploymentId?: string;
}): EquipmentIntelligence {
  const deploymentId = input?.deploymentId ?? "equipment-default";
  const snapshot = buildTenderProjectSnapshot({ deploymentId });
  const density = Math.round((snapshot.requirementCount / snapshot.estimatedAreaSqm) * 100) / 100;

  return {
    intelligenceId: `equipment-intel-${deploymentId}`,
    complexity: "advanced",
    density,
    densityUnit: "requirements/sqm",
    recommendation: "有氧区 + 力量区 + 功能区三分区配置，智能化管理系统为评分加分项",
    zones: ["有氧训练区", "力量训练区", "功能训练区", "更衣与辅助区"],
    summary: `器械复杂度 advanced，密度 ${density}，推荐四区分区方案`,
  };
}
