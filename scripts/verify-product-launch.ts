import {
  PRODUCT_LAUNCH_RUNTIME_VERSION,
  runProductLaunchRuntime,
  validateProductLaunchRuntime,
  assertRuntimeSuccess,
} from "../lib/go-to-market";

const ID = "v17-product-launch-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProductLaunchRuntime({ deploymentId: ID }).valid, "validation");
const r = runProductLaunchRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PRODUCT_LAUNCH_RUNTIME_VERSION, "version");
assert(r.payload.launchReadiness > 0, "readiness");
assert(r.payload.launchHistory.length >= 2, "history");
console.log(`PASS — ${r.summary}`);
