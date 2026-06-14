/**
 * V34 Industry CRM Foundation — Phase 4 verification
 */
import {
  buildCRMContext,
  buildIndustryCRM,
  CANONICAL_CRM_QUERY,
  CANONICAL_CRM_SUBJECT_ID,
  executeCRMQuery,
  findBrandCRM,
  findPartnershipCRM,
  findSupplierCRM,
  findTenderCRM,
  findTopCRM,
  getCRMBySubject,
  INDUSTRY_CRM_TAG,
  INDUSTRY_CRM_VERSION,
  TOP_CRM_SCORE_THRESHOLD,
  validateCRMContextRegistry,
  validateCRMContextState,
  validateCRMQueryRegistry,
  validateCRMRegistry,
  validateIndustryCRM,
} from "../lib/industry-crm";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testCRMRegistry() {
  const result = validateCRMRegistry();
  assert(result.valid, "crm registry valid");
  assert(result.count >= 8, "crm count");

  const crmRecords = buildIndustryCRM();
  assert(
    crmRecords.every(
      (crm) =>
        crm.lifecycleId.length > 0 &&
        crm.score.totalCRMScore > 0 &&
        crm.score.lifecycleStrength > 0,
    ),
    "crm records derived from lifecycles",
  );

  console.log("✓ crm registry");
  console.log(" ", result.summary);
}

function testCRMContext() {
  const result = validateCRMContextRegistry();
  assert(result.valid, "crm context registry valid");

  const context = buildCRMContext();
  assert(validateCRMContextState(context), "crm context valid");
  assert(context.crmReady, "crm ready");

  console.log("✓ crm context");
  console.log(" ", result.summary);
}

function testCRMQuery() {
  const result = validateCRMQueryRegistry();
  assert(result.valid, "crm query registry valid");

  const canonical = executeCRMQuery(CANONICAL_CRM_QUERY);
  const suppliers = findSupplierCRM(3);
  const brands = findBrandCRM(3);
  const tenders = findTenderCRM(3);
  const partnerships = findPartnershipCRM(3);
  const top = findTopCRM(5);
  const subject = getCRMBySubject(CANONICAL_CRM_SUBJECT_ID);

  assert(canonical.crmReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierCRM");
  assert(brands.hitCount >= 1, "findBrandCRM");
  assert(tenders.hitCount >= 2, "findTenderCRM");
  assert(partnerships.hitCount >= 1, "findPartnershipCRM");
  assert(top.hitCount >= 3, "findTopCRM");
  assert(subject.length >= 1, "subject crm records");

  const topCRM = top.crmRecords[0]!;
  assert(topCRM.score.totalCRMScore >= TOP_CRM_SCORE_THRESHOLD, "top threshold");
  assert(
    topCRM.score.relationshipStrength > 0 &&
      topCRM.score.lifecycleStrength > 0 &&
      topCRM.score.confidence > 0 &&
      topCRM.score.retentionScore > 0 &&
      topCRM.score.expansionScore > 0,
    "crm score dimensions",
  );

  console.log("✓ crm query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topCRM.score.totalCRMScore}`,
  );
}

function testIndustryCRM() {
  const validation = validateIndustryCRM();
  assert(validation.valid, "industry crm validation");
  assert(INDUSTRY_CRM_VERSION === "v34-industry-crm-1", "crm version");
  assert(INDUSTRY_CRM_TAG === "v34-industry-crm-foundation", "crm tag");

  console.log("✓ industry crm validation");
  console.log(
    " ",
    `registry=${validation.crmRegistry.valid} context=${validation.crmContext.valid} query=${validation.crmQuery.valid}`,
  );
}

testCRMRegistry();
testCRMContext();
testCRMQuery();
testIndustryCRM();
console.log("Industry CRM Foundation PASS");
