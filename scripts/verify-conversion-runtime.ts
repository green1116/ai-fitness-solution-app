import {
  CONVERSION_RUNTIME_VERSION,
  runConversionRuntime,
  validateConversionRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-conversion-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateConversionRuntime({ deploymentId: ID }).valid, "validation");
const r = runConversionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CONVERSION_RUNTIME_VERSION, "version");
assert(r.payload.metrics.length === 3, "metrics");
assert(r.payload.overallConversionRate > 0, "rate");
console.log(`PASS — ${r.summary}`);
