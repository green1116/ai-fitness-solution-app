import type { GymProjectType, ProjectKnowledgeAsset, ProjectScaleTier } from "./types";
import { GYM_PROJECT_TYPES } from "./types";

const TYPE_LABELS: Record<GymProjectType, string> = {
  "office-gym": "Office Gym 办公健身",
  "industrial-gym": "Industrial Gym 工业健身",
  "campus-gym": "Campus Gym 校园健身",
  "hotel-gym": "Hotel Gym 酒店健身",
  "government-gym": "Government Gym 政府健身",
};

const BUDGET_BY_TYPE: Record<GymProjectType, { min: number; max: number; median: number }> = {
  "office-gym": { min: 300_000, max: 1_500_000, median: 800_000 },
  "industrial-gym": { min: 500_000, max: 2_000_000, median: 1_200_000 },
  "campus-gym": { min: 800_000, max: 3_500_000, median: 1_800_000 },
  "hotel-gym": { min: 400_000, max: 2_500_000, median: 1_000_000 },
  "government-gym": { min: 1_000_000, max: 5_000_000, median: 2_800_000 },
};

const EQUIPMENT_BY_TYPE: Record<GymProjectType, string[]> = {
  "office-gym": ["跑步机", "椭圆机", "动感单车", "力量训练器", "瑜伽区"],
  "industrial-gym": ["综合训练器", "有氧器械", "功能性训练区", "拉伸康复区"],
  "campus-gym": ["有氧区", "自由力量区", "固定器械区", "团体操房", "体测区"],
  "hotel-gym": ["精品有氧", "多功能训练器", "拉伸区", "私教区"],
  "government-gym": ["有氧器械", "力量器械", "功能性训练", "体测设备", "康复训练区"],
};

const SCALE_BY_TYPE: Record<GymProjectType, ProjectScaleTier> = {
  "office-gym": "medium",
  "industrial-gym": "medium",
  "campus-gym": "large",
  "hotel-gym": "small",
  "government-gym": "large",
};

export function buildProjectKnowledgeAssets(input?: {
  deploymentId?: string;
}): ProjectKnowledgeAsset[] {
  const deploymentId = input?.deploymentId ?? "project-knowledge-default";
  return GYM_PROJECT_TYPES.map((projectType) => ({
    assetId: `project-knowledge-${projectType}-${deploymentId}`,
    projectType,
    projectTypeLabel: TYPE_LABELS[projectType],
    scale: SCALE_BY_TYPE[projectType],
    typicalBudgetCny: BUDGET_BY_TYPE[projectType],
    typicalEquipment: EQUIPMENT_BY_TYPE[projectType],
    mode: "readiness-stub" as const,
  }));
}

export { GYM_PROJECT_TYPES, TYPE_LABELS };
