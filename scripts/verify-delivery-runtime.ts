import {
  DELIVERY_RUNTIME_VERSION,
  DELIVERY_ARTIFACT_TYPES,
  runDeliveryRuntime,
  validateDeliveryRuntime,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-delivery-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateDeliveryRuntime({ deploymentId: ID }).valid, "validation");
const r = runDeliveryRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === DELIVERY_RUNTIME_VERSION, "version");
assert(r.payload.delivery.artifacts.length === DELIVERY_ARTIFACT_TYPES.length, "artifacts");
assert(r.payload.delivery.allReady, "all ready");
console.log(`PASS — ${r.summary}`);
