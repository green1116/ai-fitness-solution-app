import {
  RENEWAL_RUNTIME_VERSION,
  runRenewalRuntime,
  validateRenewalRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-renewal-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRenewalRuntime({ deploymentId: ID }).valid, "validation");
const r = runRenewalRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RENEWAL_RUNTIME_VERSION, "version");
assert(r.payload.upcomingRenewals > 0, "upcoming");
assert(r.payload.renewalReadiness > 0, "readiness");
console.log(`PASS — ${r.summary}`);
