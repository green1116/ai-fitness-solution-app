/**
 * V30 Industry Platform Foundation — Phase 3 Directory Foundation verification
 */
import {
  buildIndustryDirectoryContext,
  CANONICAL_DIRECTORY_ENTRY_ID,
  CANONICAL_INDUSTRY_DIRECTORY_QUERY,
  INDUSTRY_DIRECTORY_TAG,
  INDUSTRY_DIRECTORY_VERSION,
  queryDirectory,
  queryDirectoryByKeyword,
  queryDirectoryByRegion,
  queryDirectoryByType,
  validateDirectoryContextRegistry,
  validateDirectoryQueryRegistry,
  validateIndustryDirectory,
  validateIndustryDirectoryContext,
  validateOrganizationDirectory,
} from "../lib/industry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testOrganizationDirectory() {
  const result = validateOrganizationDirectory();
  assert(result.valid, "organization directory valid");
  assert(result.count >= 12, "directory entry count");
  console.log("✓ organization directory");
  console.log(" ", result.summary);
}

function testDirectoryContext() {
  const result = validateDirectoryContextRegistry();
  assert(result.valid, "directory context registry valid");

  const context = buildIndustryDirectoryContext();
  assert(validateIndustryDirectoryContext(context), "directory context valid");
  assert(context.typeBreakdown.brand >= 3, "brand breakdown");
  assert(context.typeBreakdown.contractor >= 2, "contractor breakdown");
  assert(context.typeBreakdown.manufacturer >= 2, "manufacturer breakdown");
  assert(
    context.entries.some((entry) => entry.entryId === CANONICAL_DIRECTORY_ENTRY_ID),
    "canonical entry in context",
  );

  console.log("✓ directory context");
  console.log(" ", result.summary);
  console.log(
    " ",
    `orgs=${context.organizations.length} types=${Object.values(context.typeBreakdown).reduce((a, b) => a + b, 0)}`,
  );
}

function testDirectoryQuery() {
  const result = validateDirectoryQueryRegistry();
  assert(result.valid, "directory query registry valid");

  const canonical = queryDirectory(CANONICAL_INDUSTRY_DIRECTORY_QUERY);
  assert(canonical.directoryReady, "canonical query ready");
  assert(canonical.hitCount >= 1, "canonical query hits");

  const brand = queryDirectoryByType("brand");
  const region = queryDirectoryByRegion("East China");
  const keyword = queryDirectoryByKeyword("Life Fitness");

  assert(brand.hitCount >= 3, "brand query");
  assert(region.hitCount >= 6, "region query");
  assert(keyword.hitCount >= 1, "keyword query");

  console.log("✓ directory query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} brand=${brand.hitCount} region=${region.hitCount} keyword=${keyword.hitCount}`,
  );
}

function testIndustryDirectory() {
  const validation = validateIndustryDirectory();
  assert(validation.valid, "industry directory validation");
  assert(INDUSTRY_DIRECTORY_VERSION === "v30-industry-platform-3", "directory version");
  assert(INDUSTRY_DIRECTORY_TAG === "v30-industry-directory-foundation", "directory tag");

  console.log("✓ industry directory validation");
  console.log(
    " ",
    `directory=${validation.organizationDirectory.valid} context=${validation.directoryContext.valid} query=${validation.directoryQuery.valid}`,
  );
}

testOrganizationDirectory();
testDirectoryContext();
testDirectoryQuery();
testIndustryDirectory();
console.log("Industry Directory Foundation PASS");
