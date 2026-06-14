import type { IndustryEntityStatus, IndustryPlatformDataMode, RegistryValidation } from "../shared/types";

export const INDUSTRY_SEARCH_VERSION = "v30-industry-platform-5" as const;
export const INDUSTRY_SEARCH_TAG = "v30-industry-search-foundation" as const;

export type IndustrySearchSourceType = "directory-entry" | "organization" | "category";

export interface IndustrySearchIndexEntry {
  indexEntryId: string;
  sourceType: IndustrySearchSourceType;
  sourceId: string;
  displayName: string;
  searchType: string;
  region: string;
  categoryIds: string[];
  categoryCodes: string[];
  keywords: string[];
  snippet: string;
  status: IndustryEntityStatus;
  mode: IndustryPlatformDataMode;
}

export interface IndustrySearchIndex {
  indexId: string;
  entries: IndustrySearchIndexEntry[];
  totalEntries: number;
  mode: IndustryPlatformDataMode;
}

export interface IndustrySearchContext {
  contextId: string;
  index: IndustrySearchIndex;
  typeFacetCounts: Record<string, number>;
  regionFacetCounts: Record<string, number>;
  categoryFacetCounts: Record<string, number>;
  mode: IndustryPlatformDataMode;
}

export interface IndustrySearchQuery {
  keyword?: string;
  type?: string;
  categoryId?: string;
  categoryCode?: string;
  region?: string;
}

export interface IndustrySearchHit {
  hitId: string;
  indexEntryId: string;
  sourceType: IndustrySearchSourceType;
  sourceId: string;
  displayName: string;
  searchType: string;
  region: string;
  score: number;
  snippet: string;
}

export interface IndustrySearchQueryResult {
  queryId: string;
  query: IndustrySearchQuery;
  hits: IndustrySearchHit[];
  hitCount: number;
  searchReady: boolean;
}

export interface IndustrySearchValidation {
  valid: boolean;
  searchIndex: RegistryValidation;
  searchContext: RegistryValidation;
  searchQuery: RegistryValidation;
}

export const CANONICAL_INDUSTRY_SEARCH_QUERY: IndustrySearchQuery = {
  keyword: "Life Fitness",
  type: "brand",
  region: "East China",
  categoryCode: "CARDIO_EQUIPMENT",
} as const;

export const CANONICAL_SEARCH_INDEX_ENTRY_ID = "ind-search-ind-dir-brand-life-fitness" as const;
