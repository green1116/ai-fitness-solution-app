/**
 * V34 Industry Pipeline Foundation — Phase 2 verification
 */
import {
  buildIndustryPipelines,
  buildPipelineContext,
  CANONICAL_PIPELINE_QUERY,
  CANONICAL_PIPELINE_SUBJECT_ID,
  executePipelineQuery,
  findBrandPipelines,
  findPartnershipPipelines,
  findSupplierPipelines,
  findTenderPipelines,
  findTopPipelines,
  getPipelinesBySubject,
  INDUSTRY_PIPELINE_TAG,
  INDUSTRY_PIPELINE_VERSION,
  TOP_PIPELINE_SCORE_THRESHOLD,
  validateIndustryPipeline,
  validatePipelineContextRegistry,
  validatePipelineContextState,
  validatePipelineQueryRegistry,
  validatePipelineRegistry,
} from "../lib/industry-pipeline";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testPipelineRegistry() {
  const result = validatePipelineRegistry();
  assert(result.valid, "pipeline registry valid");
  assert(result.count >= 8, "pipeline count");

  const pipelines = buildIndustryPipelines();
  assert(
    pipelines.every(
      (pipeline) =>
        pipeline.workflowId.length > 0 &&
        pipeline.score.totalPipelineScore > 0 &&
        pipeline.score.workflowStrength > 0,
    ),
    "pipelines derived from workflows",
  );

  console.log("✓ pipeline registry");
  console.log(" ", result.summary);
}

function testPipelineContext() {
  const result = validatePipelineContextRegistry();
  assert(result.valid, "pipeline context registry valid");

  const context = buildPipelineContext();
  assert(validatePipelineContextState(context), "pipeline context valid");
  assert(context.pipelineReady, "pipeline ready");

  console.log("✓ pipeline context");
  console.log(" ", result.summary);
}

function testPipelineQuery() {
  const result = validatePipelineQueryRegistry();
  assert(result.valid, "pipeline query registry valid");

  const canonical = executePipelineQuery(CANONICAL_PIPELINE_QUERY);
  const suppliers = findSupplierPipelines(3);
  const brands = findBrandPipelines(3);
  const tenders = findTenderPipelines(3);
  const partnerships = findPartnershipPipelines(3);
  const top = findTopPipelines(5);
  const subject = getPipelinesBySubject(CANONICAL_PIPELINE_SUBJECT_ID);

  assert(canonical.pipelineReady, "canonical query ready");
  assert(suppliers.hitCount >= 1, "findSupplierPipelines");
  assert(brands.hitCount >= 1, "findBrandPipelines");
  assert(tenders.hitCount >= 2, "findTenderPipelines");
  assert(partnerships.hitCount >= 1, "findPartnershipPipelines");
  assert(top.hitCount >= 3, "findTopPipelines");
  assert(subject.length >= 1, "subject pipelines");

  const topPipeline = top.pipelines[0]!;
  assert(topPipeline.score.totalPipelineScore >= TOP_PIPELINE_SCORE_THRESHOLD, "top threshold");
  assert(
    topPipeline.score.feasibility > 0 &&
      topPipeline.score.readiness > 0 &&
      topPipeline.score.impact > 0 &&
      topPipeline.score.urgency > 0 &&
      topPipeline.score.confidence > 0 &&
      topPipeline.score.workflowStrength > 0,
    "pipeline score dimensions",
  );

  console.log("✓ pipeline query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} topScore=${topPipeline.score.totalPipelineScore}`,
  );
}

function testIndustryPipeline() {
  const validation = validateIndustryPipeline();
  assert(validation.valid, "industry pipeline validation");
  assert(INDUSTRY_PIPELINE_VERSION === "v34-industry-pipeline-1", "pipeline version");
  assert(INDUSTRY_PIPELINE_TAG === "v34-industry-pipeline-foundation", "pipeline tag");

  console.log("✓ industry pipeline validation");
  console.log(
    " ",
    `registry=${validation.pipelineRegistry.valid} context=${validation.pipelineContext.valid} query=${validation.pipelineQuery.valid}`,
  );
}

testPipelineRegistry();
testPipelineContext();
testPipelineQuery();
testIndustryPipeline();
console.log("Industry Pipeline Foundation PASS");
