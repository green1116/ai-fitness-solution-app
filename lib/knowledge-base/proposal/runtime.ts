import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildProposalKnowledgeAssets, PROPOSAL_TEMPLATE_TYPES } from "./builders";
import type { ProposalKnowledgeRuntimePayload } from "./types";
import { PROPOSAL_KNOWLEDGE_RUNTIME_VERSION } from "./types";

export function validateProposalKnowledgeRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const assets = buildProposalKnowledgeAssets(input);
  return {
    valid:
      assets.length === PROPOSAL_TEMPLATE_TYPES.length &&
      assets.every((a) => a.template.sections.length >= 3),
  };
}

export function runProposalKnowledgeRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<ProposalKnowledgeRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-knowledge-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const assets = runStage(
    "proposal-knowledge-build",
    "Proposal Knowledge Assets",
    () => buildProposalKnowledgeAssets({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "proposal-knowledge-validate",
    "Proposal Knowledge Validation",
    () => validateProposalKnowledgeRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Proposal knowledge validation failed");

  const payload: ProposalKnowledgeRuntimePayload = {
    version: PROPOSAL_KNOWLEDGE_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    assets,
    assetCount: assets.length,
    summary: `proposal-knowledge templates=${assets.length}`,
  };

  return finalizeRuntime({
    domain: "proposal-knowledge",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
