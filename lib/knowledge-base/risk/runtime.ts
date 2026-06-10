import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildRiskKnowledgeAssets, RISK_CATEGORIES } from "./builders";
import type { RiskKnowledgeRuntimePayload } from "./types";
import { RISK_KNOWLEDGE_RUNTIME_VERSION } from "./types";

export function validateRiskKnowledgeRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const assets = buildRiskKnowledgeAssets(input);
  return {
    valid:
      assets.length === RISK_CATEGORIES.length &&
      assets.every((a) => a.mitigation.actions.length >= 2),
  };
}

export function runRiskKnowledgeRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<RiskKnowledgeRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "risk-knowledge-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const assets = runStage(
    "risk-knowledge-build",
    "Risk Knowledge Assets",
    () => buildRiskKnowledgeAssets({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "risk-knowledge-validate",
    "Risk Knowledge Validation",
    () => validateRiskKnowledgeRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Risk knowledge validation failed");

  const payload: RiskKnowledgeRuntimePayload = {
    version: RISK_KNOWLEDGE_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    assets,
    assetCount: assets.length,
    summary: `risk-knowledge patterns=${assets.length} categories=${RISK_CATEGORIES.length}`,
  };

  return finalizeRuntime({
    domain: "risk-knowledge",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
