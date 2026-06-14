/**
 * V31 Industry Relationship Network — Phase 1 verification
 */
import {
  archiveRelationship,
  buildIndustryRelationshipContext,
  CANONICAL_RELATIONSHIP_ID,
  CANONICAL_RELATIONSHIP_QUERY,
  getArchivedRelationships,
  INDUSTRY_RELATIONSHIP_TAG,
  INDUSTRY_RELATIONSHIP_VERSION,
  queryRelationships,
  queryRelationshipsBySource,
  queryRelationshipsByTarget,
  queryRelationshipsByType,
  validateIndustryRelationship,
  validateIndustryRelationshipContext,
  validateRelationshipArchive,
  validateRelationshipContextRegistry,
  validateRelationshipQueryRegistry,
  validateRelationshipRegistry,
} from "../lib/industry-relationship";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRelationshipRegistry() {
  const result = validateRelationshipRegistry();
  assert(result.valid, "relationship registry valid");
  assert(result.count >= 13, "relationship count");
  console.log("✓ relationship registry");
  console.log(" ", result.summary);
}

function testRelationshipContext() {
  const result = validateRelationshipContextRegistry();
  assert(result.valid, "relationship context registry valid");

  const context = buildIndustryRelationshipContext();
  assert(validateIndustryRelationshipContext(context), "relationship context valid");
  assert(context.typeBreakdown.SUPPLIES >= 2, "supplies breakdown");
  assert(context.typeBreakdown.BID_ON >= 2, "bid_on breakdown");

  console.log("✓ relationship context");
  console.log(" ", result.summary);
  console.log(
    " ",
    `active=${context.totalActive} archived=${context.totalArchived}`,
  );
}

function testRelationshipQuery() {
  const result = validateRelationshipQueryRegistry();
  assert(result.valid, "relationship query registry valid");

  const canonical = queryRelationships(CANONICAL_RELATIONSHIP_QUERY);
  assert(canonical.relationshipReady, "canonical query ready");
  assert(
    canonical.relationships.some((r) => r.relationshipId === CANONICAL_RELATIONSHIP_ID),
    "canonical relationship in results",
  );

  const lfSource = queryRelationshipsBySource("ind-org-supplier-life-fitness-cn");
  const shTarget = queryRelationshipsByTarget("ind-org-buyer-sh-gym");
  const partners = queryRelationshipsByType("PARTNERS_WITH");

  assert(lfSource.hitCount >= 4, "lf source query");
  assert(shTarget.hitCount >= 4, "sh target query");
  assert(partners.hitCount >= 1, "partners query");

  console.log("✓ relationship query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} lfSource=${lfSource.hitCount} shTarget=${shTarget.hitCount}`,
  );
}

function testRelationshipArchive() {
  const result = validateRelationshipArchive();
  assert(result.valid, "relationship archive valid");

  const archived = getArchivedRelationships();
  assert(archived.length >= 2, "archived relationships");
  assert(archived.every((r) => r.status === "archived"), "all archived status");

  const lookup = archiveRelationship("ind-rel-partners-matrix-lf");
  assert(lookup !== null, "archive lookup");
  assert(lookup!.relationship.status === "archived", "archived status from lookup");

  const simulated = archiveRelationship("ind-rel-supplies-lf-sh");
  assert(simulated !== null, "simulated archive");
  assert(simulated!.relationship.status === "archived", "simulated archived status");

  console.log("✓ relationship archive");
  console.log(" ", result.summary);
}

function testIndustryRelationship() {
  const validation = validateIndustryRelationship();
  assert(validation.valid, "industry relationship validation");
  assert(INDUSTRY_RELATIONSHIP_VERSION === "v31-industry-relationship-1", "relationship version");
  assert(
    INDUSTRY_RELATIONSHIP_TAG === "v31-industry-relationship-foundation",
    "relationship tag",
  );

  console.log("✓ industry relationship validation");
  console.log(
    " ",
    `registry=${validation.relationshipRegistry.valid} context=${validation.relationshipContext.valid} query=${validation.relationshipQuery.valid} archive=${validation.relationshipArchive.valid}`,
  );
}

testRelationshipRegistry();
testRelationshipContext();
testRelationshipQuery();
testRelationshipArchive();
testIndustryRelationship();
console.log("Industry Relationship Foundation PASS");
