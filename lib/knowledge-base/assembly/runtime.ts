import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import {
  buildKnowledgeAssetPackage,
  collectKnowledgeDomains,
} from "./builders";
import type { KnowledgeAssemblyRuntimePayload } from "./types";
import { KNOWLEDGE_ASSEMBLY_RUNTIME_VERSION } from "./types";

export function validateKnowledgeAssemblyRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const collected = collectKnowledgeDomains(deploymentId);
  const pkg = buildKnowledgeAssetPackage({ deploymentId, collected });
  return {
    valid: pkg.completeness === 100 && pkg.totalAssets > 0 && pkg.catalogAssetCount > 0,
  };
}

export function runKnowledgeAssemblyRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<KnowledgeAssemblyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const collected = runStage(
    "knowledge-assembly-collect",
    "Collect Knowledge Domains",
    () => collectKnowledgeDomains(deploymentId),
    stages,
  );
  const pkg = runStage(
    "knowledge-assembly-package",
    "Knowledge Asset Package",
    () => buildKnowledgeAssetPackage({ deploymentId, collected }),
    stages,
  );
  const validation = runStage(
    "knowledge-assembly-validate",
    "Assembly Validation",
    () => validateKnowledgeAssemblyRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Knowledge assembly validation failed");

  const payload: KnowledgeAssemblyRuntimePayload = {
    version: KNOWLEDGE_ASSEMBLY_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    project: collected.project.payload,
    equipment: collected.equipment.payload,
    proposal: collected.proposal.payload,
    risk: collected.risk.payload,
    compliance: collected.compliance.payload,
    catalog: collected.catalog.payload,
    search: collected.search.payload,
    package: pkg,
    summary: `knowledge-assembly package=${pkg.packageId} totalAssets=${pkg.totalAssets} completeness=${pkg.completeness}%`,
  };

  return finalizeRuntime({
    domain: "knowledge-assembly",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
