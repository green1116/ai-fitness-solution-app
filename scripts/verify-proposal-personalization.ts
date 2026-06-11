import {
  PROPOSAL_PERSONALIZATION_RUNTIME_VERSION,
  runProposalPersonalizationRuntime,
  validateProposalPersonalizationRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-intelligence";

const ID = "v19-proposal-personalization-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalPersonalizationRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalPersonalizationRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_PERSONALIZATION_RUNTIME_VERSION, "version");
assert(r.payload.differentiationReadiness > 0, "readiness");
assert(r.payload.snapshot.brandStrategy.recommendedBrands.length >= 2, "brands");
console.log(`PASS — ${r.summary}`);
