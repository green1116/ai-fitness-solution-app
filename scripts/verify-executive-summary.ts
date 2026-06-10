import {
  EXECUTIVE_SUMMARY_RUNTIME_VERSION,
  PROPOSAL_GENERATION_VERSION,
  runExecutiveSummaryRuntime,
  validateExecutiveSummaryRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-generation";

const ID = "v11-executive-summary-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateExecutiveSummaryRuntime({ deploymentId: ID }).valid, "validation");
const r = runExecutiveSummaryRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EXECUTIVE_SUMMARY_RUNTIME_VERSION, "version");
assert(r.payload.businessObjectives.length >= 2, "objectives");
assert(r.payload.successMetrics.length >= 2, "metrics");
console.log(`PASS — ${r.summary}`);
