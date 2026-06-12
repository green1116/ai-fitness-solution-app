import {
  BIDDER_PROFILE_RUNTIME_VERSION,
  runBidderProfileRuntime,
  validateBidderProfileRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-intelligence";

const ID = "v19-bidder-profile-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBidderProfileRuntime({ deploymentId: ID }).valid, "validation");
const r = runBidderProfileRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BIDDER_PROFILE_RUNTIME_VERSION, "version");
assert(r.payload.profileReadiness > 0, "readiness");
assert(r.payload.snapshot.certifications.length >= 2, "certifications");
console.log(`PASS — ${r.summary}`);
