import {
  PROPOSAL_CONTEXT_RUNTIME_VERSION,
  runProposalContextRuntime,
  validateProposalContextRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-proposal-context-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalContextRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalContextRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_CONTEXT_RUNTIME_VERSION, "version");
assert(r.payload.contextReadiness >= 80, "context readiness");
console.log(`PASS — ${r.summary}`);
