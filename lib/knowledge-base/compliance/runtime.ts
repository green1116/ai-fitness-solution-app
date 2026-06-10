import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildComplianceKnowledgeAssets, COMPLIANCE_DOMAINS } from "./builders";
import type { ComplianceKnowledgeRuntimePayload } from "./types";
import { COMPLIANCE_KNOWLEDGE_RUNTIME_VERSION } from "./types";

export function validateComplianceKnowledgeRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const assets = buildComplianceKnowledgeAssets(input);
  return {
    valid:
      assets.length === COMPLIANCE_DOMAINS.length &&
      assets.every((a) => a.compliance.coverageScore > 0),
  };
}

export function runComplianceKnowledgeRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<ComplianceKnowledgeRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "compliance-knowledge-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const assets = runStage(
    "compliance-knowledge-build",
    "Compliance Knowledge Assets",
    () => buildComplianceKnowledgeAssets({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "compliance-knowledge-validate",
    "Compliance Knowledge Validation",
    () => validateComplianceKnowledgeRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Compliance knowledge validation failed");

  const payload: ComplianceKnowledgeRuntimePayload = {
    version: COMPLIANCE_KNOWLEDGE_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    assets,
    assetCount: assets.length,
    summary: `compliance-knowledge domains=${assets.length} patterns=${COMPLIANCE_DOMAINS.length}`,
  };

  return finalizeRuntime({
    domain: "compliance-knowledge",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
