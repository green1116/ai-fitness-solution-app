import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildKnowledgeSearchResults } from "./builders";
import type { KnowledgeSearchRuntimePayload } from "./types";
import { KNOWLEDGE_SEARCH_RUNTIME_VERSION } from "./types";

export function validateKnowledgeSearchRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const results = buildKnowledgeSearchResults(input);
  return {
    valid:
      results.keywordSearch.searchReady &&
      results.categorySearch.hitCount > 0 &&
      results.profileSearch.searchReady,
  };
}

export function runKnowledgeSearchRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<KnowledgeSearchRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "search-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const results = runStage(
    "knowledge-search-execute",
    "Knowledge Search",
    () => buildKnowledgeSearchResults({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "knowledge-search-validate",
    "Search Validation",
    () => validateKnowledgeSearchRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Knowledge search validation failed");

  const payload: KnowledgeSearchRuntimePayload = {
    version: KNOWLEDGE_SEARCH_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    keywordSearch: results.keywordSearch,
    categorySearch: results.categorySearch,
    profileSearch: results.profileSearch,
    summary: `knowledge-search keyword=${results.keywordSearch.hitCount} category=${results.categorySearch.hitCount} profile=${results.profileSearch.hitCount}`,
  };

  return finalizeRuntime({
    domain: "knowledge-search",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
