import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildProjectKnowledgeAssets, GYM_PROJECT_TYPES } from "./builders";
import type { ProjectKnowledgeRuntimePayload } from "./types";
import { PROJECT_KNOWLEDGE_RUNTIME_VERSION } from "./types";

export function validateProjectKnowledgeRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const assets = buildProjectKnowledgeAssets(input);
  return {
    valid:
      assets.length === GYM_PROJECT_TYPES.length &&
      assets.every((a) => a.typicalBudgetCny.median > 0 && a.typicalEquipment.length > 0),
  };
}

export function runProjectKnowledgeRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<ProjectKnowledgeRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "project-knowledge-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const assets = runStage(
    "project-knowledge-build",
    "Project Knowledge Assets",
    () => buildProjectKnowledgeAssets({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "project-knowledge-validate",
    "Project Knowledge Validation",
    () => validateProjectKnowledgeRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Project knowledge validation failed");

  const payload: ProjectKnowledgeRuntimePayload = {
    version: PROJECT_KNOWLEDGE_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    assets,
    assetCount: assets.length,
    summary: `project-knowledge assets=${assets.length} types=${GYM_PROJECT_TYPES.join(",")}`,
  };

  return finalizeRuntime({
    domain: "project-knowledge",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
