import type {
  EquipmentCategory,
  EquipmentKnowledgeAsset,
} from "./types";
import { EQUIPMENT_CATEGORIES } from "./types";

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  cardio: "有氧器械 Cardio",
  strength: "力量器械 Strength",
  functional: "功能性训练 Functional",
  rehabilitation: "康复训练 Rehabilitation",
  "group-fitness": "团体课程 Group Fitness",
};

const PROFILE_NAMES: Record<EquipmentCategory, string> = {
  cardio: "商用跑步机 Pro-Tread",
  strength: "综合力量训练器 Multi-Press",
  functional: "功能性训练架 Rig-360",
  rehabilitation: "康复评估训练系统 Rehab-Pro",
  "group-fitness": "团体操多功能镜墙 Studio-Wall",
};

export function buildEquipmentKnowledgeAssets(input?: {
  deploymentId?: string;
}): EquipmentKnowledgeAsset[] {
  const deploymentId = input?.deploymentId ?? "equipment-knowledge-default";
  return EQUIPMENT_CATEGORIES.map((category, index) => ({
    assetId: `equipment-knowledge-${category}-${deploymentId}`,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    profile: {
      profileId: `equip-profile-${category}-${deploymentId}`,
      category,
      name: PROFILE_NAMES[category],
      specs: ["商用级", "CE/国标认证", "智能监测"],
      lifespanYears: 8 + (index % 3),
    },
    deployment: {
      scenarioId: `deploy-${category}-${deploymentId}`,
      category,
      environment: category === "cardio" ? "有氧区独立通风" : "多功能训练区",
      layoutNotes: `按 ${CATEGORY_LABELS[category]} 标准间距布置`,
      capacityUsers: 4 + index * 2,
    },
    maintenance: {
      maintenanceId: `maint-${category}-${deploymentId}`,
      category,
      frequencyDays: 30,
      tasks: ["润滑保养", "紧固检查", "安全检测"],
      sparePartsLevel: index % 2 === 0 ? "medium" : "low",
    },
    mode: "readiness-stub" as const,
  }));
}

export { EQUIPMENT_CATEGORIES };
