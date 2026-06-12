import {
  PROPOSAL_QUALITY_RUNTIME_VERSION,
  runProposalQualityRuntime,
  validateProposalQualityRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-proposal-quality-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalQualityRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalQualityRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_QUALITY_RUNTIME_VERSION, "version");
assert(r.payload.assessments.length === 4, "four assessments");
assert(r.payload.averageQualityScore > 50, "quality score");
console.log(`PASS — ${r.summary}`);
