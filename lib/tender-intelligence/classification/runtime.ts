import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildProjectClassification, GYM_PROJECT_TYPES } from "./builders";
import type { ProjectClassificationRuntimePayload } from "./types";
import { PROJECT_CLASSIFICATION_RUNTIME_VERSION } from "./types";

export function validateProjectClassificationRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "classification-default";
  const classification = buildProjectClassification({ deploymentId });
  return {
    valid:
      GYM_PROJECT_TYPES.includes(classification.projectType) &&
      classification.confidence > 0 &&
      classification.rationale.length > 0,
  };
}

export function runProjectClassificationRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<ProjectClassificationRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "classification-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const classification = runStage(
    "project-classification",
    "Project Classification",
    () => buildProjectClassification({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "classification-validate",
    "Classification Validation",
    () => validateProjectClassificationRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Project classification validation failed");

  const payload: ProjectClassificationRuntimePayload = {
    version: PROJECT_CLASSIFICATION_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    classification,
    supportedTypes: [...GYM_PROJECT_TYPES],
    summary: `project-classification type=${classification.projectType} confidence=${classification.confidence}`,
  };

  return finalizeRuntime({
    domain: "project-classification",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
