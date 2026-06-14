/**
 * V34 Industry Lifecycle Foundation — Phase 3 verification
 */
import {
  buildIndustryLifecycles,
  buildLifecycleContext,
  CANONICAL_LIFECYCLE_QUERY,
  CANONICAL_LIFECYCLE_SUBJECT_ID,
  executeLifecycleQuery,
  findBrandLifecycles,
  findPartnershipLifecycles,
  findSupplierLifecycles,
  findTenderLifecycles,
  findTopLifecycles,
  getLifecyclesBySubject,
  INDUSTRY_LIFECYCLE_TAG,
  INDUSTRY_LIFECYCLE_VERSION,
  TOP_LIFECYCLE_SCORE_THRESHOLD,
  validateIndustryLifecycle,
  validateLifecycleContextRegistry,
  validateLifecycleContextState,
  validateLifecycleQueryRegistry,
  validateLifecycleRegistry,
} from "../lib/industry-lifecycle";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testLifecycleRegistry() {
  const result = validateLifecycleRegistry();
  assert(result.valid, "lifecycle registry valid");
  assert(result.count >= 8, "lifecycle count");

  const lifecycles = buildIndustryLifecycles();
  assert(
    lifecycles.every(
      (lifecycle) =>
        lifecycle.pipelineId.length > 0 &&
        lifecycle.score.totalLifecycleScore > 0 &&
        lifecycle.score.pipelineStrength > 0,
    ),
    "lifecycles derived from pipelines",
  );

  console.log("✓ lifecycle registry");
  console.log(" ", result.summary);
}

function testLifecycleContext() {
  const result = validateLifecycleContextRegistry();
  assert(result.valid, "lifecycle context registry valid");

  const context = buildLifecycleContext();
  assert(validateLifecycleContextState(context), "lifecycle context valid");
  assert(context.lifecycleReady, "lifecycle ready");

  console.log("✓ lifecycle context");
  console.log(" ", result.summary);
}

function testLifecycleQuery() {
  const result = validateLifecycleQueryRegistry();
  assert(result.valid, "lifecycle query registry valid");

  const canonical = executeLifecycleQuery(CANONICAL_LIFECYCLE_QUERY);
  const suppliers = findSupplierLifecycles(3);
  const brands = findBrandLifecycles(3);
  const tenders = findTenderLifecycles(3);
  const partnerships = findPartnershipLifecycles(3);
  const top = findTopLifecycles(5);
  const subject = getLifecyclesBySubject(CANONICAL_LIFECYCLE_SUBJECT_ID);

  assert(canonical.lifecycleReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierLifecycles");
  assert(brands.hitCount >= 1, "findBrandLifecycles");
  assert(tenders.hitCount >= 2, "findTenderLifecycles");
  assert(partnerships.hitCount >= 1, "findPartnershipLifecycles");
  assert(top.hitCount >= 3, "findTopLifecycles");
  assert(subject.length >= 1, "subject lifecycles");

  const topLifecycle = top.lifecycles[0]!;
  assert(topLifecycle.score.totalLifecycleScore >= TOP_LIFECYCLE_SCORE_THRESHOLD, "top threshold");
  assert(
    topLifecycle.score.feasibility > 0 &&
      topLifecycle.score.readiness > 0 &&
      topLifecycle.score.impact > 0 &&
      topLifecycle.score.urgency > 0 &&
      topLifecycle.score.confidence > 0 &&
      topLifecycle.score.pipelineStrength > 0,
    "lifecycle score dimensions",
  );

  console.log("✓ lifecycle query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topLifecycle.score.totalLifecycleScore}`,
  );
}

function testIndustryLifecycle() {
  const validation = validateIndustryLifecycle();
  assert(validation.valid, "industry lifecycle validation");
  assert(INDUSTRY_LIFECYCLE_VERSION === "v34-industry-lifecycle-1", "lifecycle version");
  assert(INDUSTRY_LIFECYCLE_TAG === "v34-industry-lifecycle-foundation", "lifecycle tag");

  console.log("✓ industry lifecycle validation");
  console.log(
    " ",
    `registry=${validation.lifecycleRegistry.valid} context=${validation.lifecycleContext.valid} query=${validation.lifecycleQuery.valid}`,
  );
}

testLifecycleRegistry();
testLifecycleContext();
testLifecycleQuery();
testIndustryLifecycle();
console.log("Industry Lifecycle Foundation PASS");
