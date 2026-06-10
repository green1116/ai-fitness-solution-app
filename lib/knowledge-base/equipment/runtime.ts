import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildEquipmentKnowledgeAssets, EQUIPMENT_CATEGORIES } from "./builders";
import type { EquipmentKnowledgeRuntimePayload } from "./types";
import { EQUIPMENT_KNOWLEDGE_RUNTIME_VERSION } from "./types";

export function validateEquipmentKnowledgeRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const assets = buildEquipmentKnowledgeAssets(input);
  return {
    valid:
      assets.length === EQUIPMENT_CATEGORIES.length &&
      assets.every((a) => a.profile.name.length > 0 && a.maintenance.tasks.length > 0),
  };
}

export function runEquipmentKnowledgeRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<EquipmentKnowledgeRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-knowledge-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const assets = runStage(
    "equipment-knowledge-build",
    "Equipment Knowledge Assets",
    () => buildEquipmentKnowledgeAssets({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "equipment-knowledge-validate",
    "Equipment Knowledge Validation",
    () => validateEquipmentKnowledgeRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Equipment knowledge validation failed");

  const payload: EquipmentKnowledgeRuntimePayload = {
    version: EQUIPMENT_KNOWLEDGE_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    assets,
    assetCount: assets.length,
    summary: `equipment-knowledge assets=${assets.length} categories=${EQUIPMENT_CATEGORIES.length}`,
  };

  return finalizeRuntime({
    domain: "equipment-knowledge",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
