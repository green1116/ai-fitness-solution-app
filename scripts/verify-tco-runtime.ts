import {
  TCO_RUNTIME_VERSION,
  runTCORuntime,
  validateTCORuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-tco-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTCORuntime({ deploymentId: ID }).valid, "validation");
const r = runTCORuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TCO_RUNTIME_VERSION, "version");
assert(r.payload.profile.totalTCO > r.payload.profile.acquisition, "tco total");
console.log(`PASS — ${r.summary}`);
