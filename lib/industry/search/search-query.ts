import type { RegistryValidation } from "../shared/types";
import { buildIndustrySearchIndex } from "./search-index";
import { validateSearchContextRegistry } from "./search-context";
import { validateSearchIndex } from "./search-index";
import type {
  IndustrySearchHit,
  IndustrySearchIndexEntry,
  IndustrySearchQuery,
  IndustrySearchQueryResult,
  IndustrySearchValidation,
} from "./types";
import { CANONICAL_INDUSTRY_SEARCH_QUERY } from "./types";

function scoreEntry(entry: IndustrySearchIndexEntry, keyword: string): number {
  const normalized = keyword.toLowerCase();
  let score = 0;

  if (entry.displayName.toLowerCase().includes(normalized)) {
    score += 10;
  }
  if (entry.searchType.toLowerCase().includes(normalized)) {
    score += 5;
  }
  if (entry.keywords.some((word) => word.toLowerCase().includes(normalized))) {
    score += 3;
  }
  if (entry.snippet.toLowerCase().includes(normalized)) {
    score += 2;
  }

  return score;
}

function toHit(entry: IndustrySearchIndexEntry, score: number): IndustrySearchHit {
  return {
    hitId: `search-hit-${entry.indexEntryId}`,
    indexEntryId: entry.indexEntryId,
    sourceType: entry.sourceType,
    sourceId: entry.sourceId,
    displayName: entry.displayName,
    searchType: entry.searchType,
    region: entry.region,
    score,
    snippet: entry.snippet,
  };
}

export function executeIndustrySearch(input: IndustrySearchQuery = {}): IndustrySearchQueryResult {
  let entries = buildIndustrySearchIndex().entries;

  if (input.type) {
    entries = entries.filter((entry) => entry.searchType === input.type);
  }

  if (input.region) {
    entries = entries.filter((entry) => entry.region === input.region);
  }

  if (input.categoryId) {
    entries = entries.filter((entry) => entry.categoryIds.includes(input.categoryId!));
  }

  if (input.categoryCode) {
    entries = entries.filter((entry) => entry.categoryCodes.includes(input.categoryCode!));
  }

  let hits: IndustrySearchHit[];

  if (input.keyword) {
    hits = entries
      .map((entry) => ({ entry, score: scoreEntry(entry, input.keyword!) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ entry, score }) => toHit(entry, score));
  } else {
    hits = entries.map((entry) => toHit(entry, 1));
  }

  const queryParts = [
    input.keyword ?? "no-keyword",
    input.type ?? "all-types",
    input.categoryId ?? input.categoryCode ?? "all-categories",
    input.region ?? "all-regions",
  ];

  return {
    queryId: `industry-search-query-${queryParts.join("-")}`,
    query: input,
    hits,
    hitCount: hits.length,
    searchReady: hits.length > 0,
  };
}

export function searchIndustryByKeyword(keyword: string): IndustrySearchQueryResult {
  return executeIndustrySearch({ keyword });
}

export function searchIndustryByType(type: string): IndustrySearchQueryResult {
  return executeIndustrySearch({ type });
}

export function searchIndustryByCategory(categoryCode: string): IndustrySearchQueryResult {
  return executeIndustrySearch({ categoryCode });
}

export function searchIndustryByRegion(region: string): IndustrySearchQueryResult {
  return executeIndustrySearch({ region });
}

export function validateSearchQueryRegistry(): RegistryValidation {
  const canonical = executeIndustrySearch(CANONICAL_INDUSTRY_SEARCH_QUERY);
  const keywordSearch = searchIndustryByKeyword("Technogym");
  const typeSearch = searchIndustryByType("brand");
  const categorySearch = searchIndustryByCategory("COMMERCIAL_GYM");
  const regionSearch = searchIndustryByRegion("East China");

  const valid =
    canonical.searchReady &&
    canonical.hitCount >= 1 &&
    canonical.hits[0]!.score >= 10 &&
    keywordSearch.hitCount >= 1 &&
    typeSearch.hitCount >= 3 &&
    categorySearch.hitCount >= 1 &&
    regionSearch.hitCount >= 6;

  return {
    valid,
    count: canonical.hitCount,
    summary: `search-query canonical=${canonical.hitCount} keyword=${keywordSearch.hitCount} type=${typeSearch.hitCount} region=${regionSearch.hitCount} valid=${valid}`,
  };
}

export function validateIndustrySearch(): IndustrySearchValidation {
  const searchIndex = validateSearchIndex();
  const searchContext = validateSearchContextRegistry();
  const searchQuery = validateSearchQueryRegistry();

  return {
    valid: searchIndex.valid && searchContext.valid && searchQuery.valid,
    searchIndex,
    searchContext,
    searchQuery,
  };
}

// Re-export for consumers expecting IndustrySearchQuery as the search entry point alias
export { executeIndustrySearch as queryIndustrySearch };
