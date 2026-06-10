import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import {
  buildAiComplianceContext,
  buildAiProposalContext,
  buildAiRiskContext,
  buildAiTenderContext,
  buildProjectContext,
  collectFusionSources,
} from "./builders";
import type { AiKnowledgeFusionRuntimePayload } from "./types";
import { AI_KNOWLEDGE_FUSION_RUNTIME_VERSION } from "./types";

export function validateAiKnowledgeFusionRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "fusion-default";
  const sources = collectFusionSources(deploymentId);
  const proposalContext = buildAiProposalContext({ deploymentId, sources });
  return {
    valid:
      sources.tender.status === "success" &&
      sources.knowledge.status === "success" &&
      sources.proposal.status === "success" &&
      proposalContext.knowledgeRefs.length > 0,
  };
}

export function runAiKnowledgeFusionRuntime(input?: {
  deploymentId?: string;
}): AiIntegrationRuntimeResult<AiKnowledgeFusionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "fusion-default";
  const stages: AiIntegrationStageResult[] = [];

  const projectContext = runStage(
    "fusion-project-context",
    "Project Context",
    () => buildProjectContext({ deploymentId }),
    stages,
  );
  const sources = runStage(
    "fusion-collect",
    "Collect Fusion Sources",
    () => collectFusionSources(deploymentId),
    stages,
  );
  const proposalContext = runStage(
    "fusion-proposal-context",
    "AI Proposal Context",
    () => buildAiProposalContext({ deploymentId, sources }),
    stages,
  );
  const tenderContext = runStage(
    "fusion-tender-context",
    "AI Tender Context",
    () => buildAiTenderContext({ deploymentId, sources }),
    stages,
  );
  const riskContext = runStage(
    "fusion-risk-context",
    "AI Risk Context",
    () => buildAiRiskContext({ deploymentId, sources }),
    stages,
  );
  const complianceContext = runStage(
    "fusion-compliance-context",
    "AI Compliance Context",
    () => buildAiComplianceContext({ deploymentId, sources }),
    stages,
  );
  const validation = runStage(
    "fusion-validate",
    "Fusion Validation",
    () => validateAiKnowledgeFusionRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("AI knowledge fusion validation failed");

  const payload: AiKnowledgeFusionRuntimePayload = {
    version: AI_KNOWLEDGE_FUSION_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    projectContext,
    proposalContext,
    tenderContext,
    riskContext,
    complianceContext,
    summary: `ai-knowledge-fusion type=${tenderContext.projectType} risk=${riskContext.riskLevel} compliance=${complianceContext.coverage}%`,
  };

  return finalizeRuntime({
    domain: "ai-knowledge-fusion",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
