import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildKnowledgeCatalog } from "./builders";
import type { KnowledgeCatalogRuntimePayload } from "./types";
import { KNOWLEDGE_CATALOG_CATEGORIES, KNOWLEDGE_CATALOG_RUNTIME_VERSION } from "./types";

export { KNOWLEDGE_CATALOG_CATEGORIES };

export function validateKnowledgeCatalogRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const catalog = buildKnowledgeCatalog(input);
  return {
    valid:
      catalog.entries.length === KNOWLEDGE_CATALOG_CATEGORIES.length &&
      catalog.totalAssets > 0,
  };
}

export function runKnowledgeCatalogRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<KnowledgeCatalogRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "catalog-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const catalog = runStage(
    "knowledge-catalog-build",
    "Knowledge Catalog",
    () => buildKnowledgeCatalog({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "knowledge-catalog-validate",
    "Catalog Validation",
    () => validateKnowledgeCatalogRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Knowledge catalog validation failed");

  const payload: KnowledgeCatalogRuntimePayload = {
    version: KNOWLEDGE_CATALOG_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    catalog,
    summary: `knowledge-catalog entries=${catalog.entries.length} totalAssets=${catalog.totalAssets}`,
  };

  return finalizeRuntime({
    domain: "knowledge-catalog",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
