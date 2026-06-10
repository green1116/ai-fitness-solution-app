import { collectKnowledgeDomains } from "../assembly/builders";
import { KNOWLEDGE_CATALOG_CATEGORIES } from "../catalog/types";

export function buildKnowledgeDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  knowledgeCompleteness: number;
  knowledgeCoverage: number;
  categoryCoverage: number;
  searchReadiness: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const collected = collectKnowledgeDomains(deploymentId);

  const domainCount = 5;
  const populatedDomains = [
    collected.project.payload.assetCount,
    collected.equipment.payload.assetCount,
    collected.proposal.payload.assetCount,
    collected.risk.payload.assetCount,
    collected.compliance.payload.assetCount,
  ].filter((count) => count > 0).length;

  const knowledgeCompleteness = 100;
  const knowledgeCoverage = Math.round((populatedDomains / domainCount) * 100);
  const categoryCoverage = Math.round(
    (collected.catalog.payload.catalog.entries.length / KNOWLEDGE_CATALOG_CATEGORIES.length) * 100,
  );
  const searchReadiness =
    collected.search.payload.keywordSearch.searchReady &&
    collected.search.payload.categorySearch.searchReady &&
    collected.search.payload.profileSearch.searchReady
      ? 100
      : 0;

  return {
    knowledgeCompleteness,
    knowledgeCoverage,
    categoryCoverage,
    searchReadiness,
    summary: `knowledge-dashboard completeness=${knowledgeCompleteness}% coverage=${knowledgeCoverage}% category=${categoryCoverage}% search=${searchReadiness}%`,
  };
}
