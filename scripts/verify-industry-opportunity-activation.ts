/**
 * V33 Industry Opportunity Activation Foundation — Phase 3 verification
 */
import {
  buildIndustryOpportunityActivations,
  buildOpportunityActivationContext,
  CANONICAL_ACTIVATION_QUERY,
  CANONICAL_ACTIVATION_SUBJECT_ID,
  executeOpportunityActivationQuery,
  findActivateBrandOpportunities,
  findActivatePartnershipOpportunities,
  findActivateSupplierOpportunities,
  findActivateTenderOpportunities,
  findTopActivationOpportunities,
  getActivationsBySubject,
  INDUSTRY_OPPORTUNITY_ACTIVATION_TAG,
  INDUSTRY_OPPORTUNITY_ACTIVATION_VERSION,
  TOP_ACTIVATION_SCORE_THRESHOLD,
  validateActivationContextRegistry,
  validateActivationQueryRegistry,
  validateActivationRegistry,
  validateIndustryOpportunityActivation,
  validateOpportunityActivationContextState,
} from "../lib/industry-opportunity-activation";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testActivationRegistry() {
  const result = validateActivationRegistry();
  assert(result.valid, "activation registry valid");
  assert(result.count >= 8, "activation count");

  const activations = buildIndustryOpportunityActivations();
  assert(
    activations.every(
      (activation) =>
        activation.opportunityId.length > 0 &&
        activation.score.totalActivationScore > 0,
    ),
    "activations derived from opportunities",
  );

  console.log("✓ activation registry");
  console.log(" ", result.summary);
}

function testActivationContext() {
  const result = validateActivationContextRegistry();
  assert(result.valid, "activation context registry valid");

  const context = buildOpportunityActivationContext();
  assert(validateOpportunityActivationContextState(context), "activation context valid");
  assert(context.activationReady, "activation ready");

  console.log("✓ activation context");
  console.log(" ", result.summary);
}

function testActivationQuery() {
  const result = validateActivationQueryRegistry();
  assert(result.valid, "activation query registry valid");

  const canonical = executeOpportunityActivationQuery(CANONICAL_ACTIVATION_QUERY);
  const suppliers = findActivateSupplierOpportunities(3);
  const brands = findActivateBrandOpportunities(3);
  const tenders = findActivateTenderOpportunities(3);
  const partnerships = findActivatePartnershipOpportunities(3);
  const top = findTopActivationOpportunities(5);
  const subject = getActivationsBySubject(CANONICAL_ACTIVATION_SUBJECT_ID);

  assert(canonical.activationReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findActivateSupplierOpportunities");
  assert(brands.hitCount >= 1, "findActivateBrandOpportunities");
  assert(tenders.hitCount >= 2, "findActivateTenderOpportunities");
  assert(partnerships.hitCount >= 1, "findActivatePartnershipOpportunities");
  assert(top.hitCount >= 3, "findTopActivationOpportunities");
  assert(subject.length >= 1, "subject activations");

  const topActivation = top.activations[0]!;
  assert(topActivation.score.totalActivationScore >= TOP_ACTIVATION_SCORE_THRESHOLD, "top threshold");
  assert(
    topActivation.score.feasibility > 0 &&
      topActivation.score.readiness > 0 &&
      topActivation.score.impact > 0 &&
      topActivation.score.urgency > 0 &&
      topActivation.score.confidence > 0,
    "activation score dimensions",
  );

  console.log("✓ activation query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topActivation.score.totalActivationScore}`,
  );
}

function testIndustryOpportunityActivation() {
  const validation = validateIndustryOpportunityActivation();
  assert(validation.valid, "industry opportunity activation validation");
  assert(
    INDUSTRY_OPPORTUNITY_ACTIVATION_VERSION === "v33-industry-opportunity-activation-1",
    "activation version",
  );
  assert(
    INDUSTRY_OPPORTUNITY_ACTIVATION_TAG === "v33-industry-opportunity-activation-foundation",
    "activation tag",
  );

  console.log("✓ industry opportunity activation validation");
  console.log(
    " ",
    `registry=${validation.activationRegistry.valid} context=${validation.activationContext.valid} query=${validation.activationQuery.valid}`,
  );
}

testActivationRegistry();
testActivationContext();
testActivationQuery();
testIndustryOpportunityActivation();
console.log("Industry Opportunity Activation Foundation PASS");
