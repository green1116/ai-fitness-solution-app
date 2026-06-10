import {
  OPPORTUNITY_RUNTIME_VERSION,
  PIPELINE_STAGES,
  runOpportunityRuntime,
  validateOpportunityRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-opportunity-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateOpportunityRuntime({ deploymentId: ID }).valid, "validation");
const r = runOpportunityRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === OPPORTUNITY_RUNTIME_VERSION, "version");
assert(r.payload.opportunities.length >= 3, "opportunities");
assert(PIPELINE_STAGES.includes(r.payload.opportunities[0].pipelineStage), "stage");
console.log(`PASS — ${r.summary}`);
