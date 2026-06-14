/**
 * V30 Industry Platform Foundation — Phase 5 Search Foundation verification
 */
import {
  buildIndustrySearchContext,
  buildIndustrySearchIndex,
  CANONICAL_INDUSTRY_SEARCH_QUERY,
  CANONICAL_SEARCH_INDEX_ENTRY_ID,
  executeIndustrySearch,
  INDUSTRY_SEARCH_TAG,
  INDUSTRY_SEARCH_VERSION,
  searchIndustryByCategory,
  searchIndustryByKeyword,
  searchIndustryByRegion,
  searchIndustryByType,
  validateIndustrySearch,
  validateIndustrySearchContext,
  validateSearchContextRegistry,
  validateSearchIndex,
  validateSearchQueryRegistry,
} from "../lib/industry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testSearchIndex() {
  const result = validateSearchIndex();
  assert(result.valid, "search index valid");
  assert(result.count >= 36, "search index count");

  const index = buildIndustrySearchIndex();
  assert(
    index.entries.some((entry) => entry.indexEntryId === CANONICAL_SEARCH_INDEX_ENTRY_ID),
    "canonical index entry",
  );

  console.log("✓ search index");
  console.log(" ", result.summary);
}

function testSearchContext() {
  const result = validateSearchContextRegistry();
  assert(result.valid, "search context registry valid");

  const context = buildIndustrySearchContext();
  assert(validateIndustrySearchContext(context), "search context valid");
  assert(context.typeFacetCounts.brand >= 3, "brand facet");
  assert(Object.keys(context.categoryFacetCounts).length >= 5, "category facets");

  console.log("✓ search context");
  console.log(" ", result.summary);
  console.log(
    " ",
    `types=${Object.keys(context.typeFacetCounts).length} regions=${Object.keys(context.regionFacetCounts).length}`,
  );
}

function testSearchQuery() {
  const result = validateSearchQueryRegistry();
  assert(result.valid, "search query registry valid");

  const canonical = executeIndustrySearch(CANONICAL_INDUSTRY_SEARCH_QUERY);
  assert(canonical.searchReady, "canonical search ready");
  assert(canonical.hitCount >= 1, "canonical search hits");

  const keyword = searchIndustryByKeyword("Life Fitness");
  const type = searchIndustryByType("supplier");
  const category = searchIndustryByCategory("CARDIO_EQUIPMENT");
  const region = searchIndustryByRegion("East China");

  assert(keyword.hitCount >= 1, "keyword search");
  assert(type.hitCount >= 2, "type search");
  assert(category.hitCount >= 1, "category search");
  assert(region.hitCount >= 6, "region search");

  console.log("✓ search query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} keyword=${keyword.hitCount} type=${type.hitCount} category=${category.hitCount} region=${region.hitCount}`,
  );
}

function testIndustrySearch() {
  const validation = validateIndustrySearch();
  assert(validation.valid, "industry search validation");
  assert(INDUSTRY_SEARCH_VERSION === "v30-industry-platform-5", "search version");
  assert(INDUSTRY_SEARCH_TAG === "v30-industry-search-foundation", "search tag");

  console.log("✓ industry search validation");
  console.log(
    " ",
    `index=${validation.searchIndex.valid} context=${validation.searchContext.valid} query=${validation.searchQuery.valid}`,
  );
}

testSearchIndex();
testSearchContext();
testSearchQuery();
testIndustrySearch();
console.log("Industry Search Foundation PASS");
