import { collectKnowledgeAssets } from "../catalog/builders";
import type { KnowledgeCatalogCategory } from "../catalog/types";
import type { KnowledgeSearchResult, SearchHit, SearchMode } from "./types";

function scoreMatch(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower.includes(q)) return 0.9;
  if (q.split(/\s+/).some((word) => lower.includes(word))) return 0.6;
  return 0;
}

function runKeywordSearch(deploymentId: string, query: string): KnowledgeSearchResult {
  const collected = collectKnowledgeAssets(deploymentId);
  const hits: SearchHit[] = [];

  for (const asset of collected.project) {
    const text = `${asset.projectTypeLabel} ${asset.typicalEquipment.join(" ")}`;
    const score = scoreMatch(text, query);
    if (score > 0) {
      hits.push({
        hitId: `hit-kw-project-${asset.assetId}`,
        assetId: asset.assetId,
        category: "project",
        title: asset.projectTypeLabel,
        snippet: `典型预算 ¥${asset.typicalBudgetCny.median.toLocaleString()}`,
        score,
      });
    }
  }

  for (const asset of collected.equipment) {
    const text = `${asset.categoryLabel} ${asset.profile.name}`;
    const score = scoreMatch(text, query);
    if (score > 0) {
      hits.push({
        hitId: `hit-kw-equipment-${asset.assetId}`,
        assetId: asset.assetId,
        category: "equipment",
        title: asset.profile.name,
        snippet: asset.categoryLabel,
        score,
      });
    }
  }

  for (const asset of collected.proposal) {
    const text = asset.template.title;
    const score = scoreMatch(text, query);
    if (score > 0) {
      hits.push({
        hitId: `hit-kw-proposal-${asset.assetId}`,
        assetId: asset.assetId,
        category: "proposal",
        title: asset.template.title,
        snippet: asset.template.sections.slice(0, 2).join(" / "),
        score,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);

  return {
    searchId: `search-keyword-${deploymentId}`,
    mode: "keyword",
    query,
    hits,
    hitCount: hits.length,
    searchReady: true,
  };
}

function runCategorySearch(
  deploymentId: string,
  category: KnowledgeCatalogCategory,
): KnowledgeSearchResult {
  const collected = collectKnowledgeAssets(deploymentId);
  const assets = collected[category];
  const hits: SearchHit[] = assets.map((asset, index) => ({
    hitId: `hit-cat-${category}-${index}-${deploymentId}`,
    assetId: asset.assetId,
    category,
    title: asset.assetId,
    snippet: `category=${category}`,
    score: 1.0,
  }));

  return {
    searchId: `search-category-${category}-${deploymentId}`,
    mode: "category",
    query: category,
    hits,
    hitCount: hits.length,
    searchReady: true,
  };
}

function runProfileSearch(deploymentId: string, profileQuery: string): KnowledgeSearchResult {
  const collected = collectKnowledgeAssets(deploymentId);
  const hits: SearchHit[] = [];

  for (const asset of collected.project) {
    if (asset.scale === profileQuery || asset.projectType.includes(profileQuery)) {
      hits.push({
        hitId: `hit-profile-project-${asset.assetId}`,
        assetId: asset.assetId,
        category: "project",
        title: asset.projectTypeLabel,
        snippet: `scale=${asset.scale}`,
        score: 0.95,
      });
    }
  }

  for (const asset of collected.equipment) {
    if (asset.category === profileQuery || asset.profile.name.includes(profileQuery)) {
      hits.push({
        hitId: `hit-profile-equipment-${asset.assetId}`,
        assetId: asset.assetId,
        category: "equipment",
        title: asset.profile.name,
        snippet: `category=${asset.category}`,
        score: 0.9,
      });
    }
  }

  return {
    searchId: `search-profile-${deploymentId}`,
    mode: "profile",
    query: profileQuery,
    hits,
    hitCount: hits.length,
    searchReady: true,
  };
}

export function buildKnowledgeSearchResults(input?: {
  deploymentId?: string;
  keywordQuery?: string;
  categoryFilter?: KnowledgeCatalogCategory;
  profileQuery?: string;
}): {
  keywordSearch: KnowledgeSearchResult;
  categorySearch: KnowledgeSearchResult;
  profileSearch: KnowledgeSearchResult;
} {
  const deploymentId = input?.deploymentId ?? "search-default";
  const keywordQuery = input?.keywordQuery ?? "健身";
  const categoryFilter = input?.categoryFilter ?? "project";
  const profileQuery = input?.profileQuery ?? "government-gym";

  return {
    keywordSearch: runKeywordSearch(deploymentId, keywordQuery),
    categorySearch: runCategorySearch(deploymentId, categoryFilter),
    profileSearch: runProfileSearch(deploymentId, profileQuery),
  };
}

export type { SearchMode };
