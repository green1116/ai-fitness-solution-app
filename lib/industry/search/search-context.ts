import type { RegistryValidation } from "../shared/types";
import { buildIndustrySearchIndex } from "./search-index";
import type { IndustrySearchContext } from "./types";
import {
  CANONICAL_SEARCH_INDEX_ENTRY_ID,
  INDUSTRY_SEARCH_TAG,
  INDUSTRY_SEARCH_VERSION,
} from "./types";

function buildFacetCounts(
  entries: ReturnType<typeof buildIndustrySearchIndex>["entries"],
  field: "searchType" | "region",
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const key = entry[field];
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function buildCategoryFacetCounts(
  entries: ReturnType<typeof buildIndustrySearchIndex>["entries"],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    for (const categoryCode of entry.categoryCodes) {
      counts[categoryCode] = (counts[categoryCode] ?? 0) + 1;
    }
  }
  return counts;
}

export function buildIndustrySearchContext(): IndustrySearchContext {
  const index = buildIndustrySearchIndex();

  return {
    contextId: `industry-search-context-${INDUSTRY_SEARCH_VERSION}`,
    index,
    typeFacetCounts: buildFacetCounts(index.entries, "searchType"),
    regionFacetCounts: buildFacetCounts(index.entries, "region"),
    categoryFacetCounts: buildCategoryFacetCounts(index.entries),
    mode: "industry-platform",
  };
}

export function validateIndustrySearchContext(context: IndustrySearchContext): boolean {
  const canonical = context.index.entries.find(
    (entry) => entry.indexEntryId === CANONICAL_SEARCH_INDEX_ENTRY_ID,
  );

  return (
    context.index.totalEntries >= 36 &&
    context.index.entries.length === context.index.totalEntries &&
    Object.keys(context.typeFacetCounts).length >= 6 &&
    Object.keys(context.regionFacetCounts).length >= 3 &&
    Object.keys(context.categoryFacetCounts).length >= 5 &&
    canonical !== undefined &&
    context.mode === "industry-platform"
  );
}

export function validateSearchContextRegistry(): RegistryValidation {
  const context = buildIndustrySearchContext();
  const valid =
    validateIndustrySearchContext(context) &&
    INDUSTRY_SEARCH_VERSION === "v30-industry-platform-5" &&
    INDUSTRY_SEARCH_TAG === "v30-industry-search-foundation";

  return {
    valid,
    count: context.index.totalEntries,
    summary: `search-context entries=${context.index.totalEntries} types=${Object.keys(context.typeFacetCounts).length} regions=${Object.keys(context.regionFacetCounts).length} valid=${valid}`,
  };
}
