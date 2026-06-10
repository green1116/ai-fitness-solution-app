import {
  ADOPTION_RUNTIME_VERSION,
  runAdoptionRuntime,
  validateAdoptionRuntime,
  assertRuntimeSuccess,
} from "../lib/customer-success";

const ID = "v16-adoption-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAdoptionRuntime({ deploymentId: ID }).valid, "validation");
const r = runAdoptionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === ADOPTION_RUNTIME_VERSION, "version");
assert(r.payload.metrics.length === 3, "metrics");
assert(r.payload.overallAdoptionRate > 0, "rate");
console.log(`PASS — ${r.summary}`);
