import {
  DELIVERY_READINESS_RUNTIME_VERSION,
  runDeliveryReadinessRuntime,
  validateDeliveryReadinessRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-delivery-readiness-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateDeliveryReadinessRuntime({ deploymentId: ID }).valid, "validation");
const r = runDeliveryReadinessRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === DELIVERY_READINESS_RUNTIME_VERSION, "version");
assert(r.payload.averageDeliveryReadinessScore >= 90, "delivery readiness >= 90%");
console.log(`PASS — ${r.summary}`);
