import { buildTenderProjectSnapshot } from "../shared/tender-input";
import type { GymProjectType, ProjectClassification } from "./types";
import { GYM_PROJECT_TYPES } from "./types";

const TYPE_LABELS: Record<GymProjectType, string> = {
  "office-gym": "Office Gym 办公健身",
  "industrial-gym": "Industrial Gym 工业健身",
  "campus-gym": "Campus Gym 校园健身",
  "hotel-gym": "Hotel Gym 酒店健身",
  "government-gym": "Government Gym 政府健身",
};

export function buildProjectClassification(input?: {
  deploymentId?: string;
  projectType?: GymProjectType;
}): ProjectClassification {
  const deploymentId = input?.deploymentId ?? "classification-default";
  const snapshot = buildTenderProjectSnapshot({ deploymentId });
  const projectType = input?.projectType ?? "government-gym";

  return {
    classificationId: `classification-${deploymentId}`,
    projectType,
    label: TYPE_LABELS[projectType],
    confidence: 0.87,
    rationale: `基于项目名称「${snapshot.projectName}」与招标方「${snapshot.tenderCompany}」的结构化推断（readiness-stub）`,
  };
}

export { GYM_PROJECT_TYPES, TYPE_LABELS };
