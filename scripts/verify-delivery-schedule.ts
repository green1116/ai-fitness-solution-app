import {
  DELIVERY_SCHEDULE_RUNTIME_VERSION,
  runDeliveryScheduleRuntime,
  validateDeliveryScheduleRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-generation";

const ID = "v11-delivery-schedule-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateDeliveryScheduleRuntime({ deploymentId: ID }).valid, "validation");
const r = runDeliveryScheduleRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === DELIVERY_SCHEDULE_RUNTIME_VERSION, "version");
assert(r.payload.deliveryPlan.length >= 4, "delivery plan");
assert(r.payload.supportPlan.length >= 3, "support plan");
console.log(`PASS — ${r.summary}`);
