import {
  LIFECYCLE_COST_RUNTIME_VERSION,
  runLifecycleCostRuntime,
  validateLifecycleCostRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-lifecycle-cost-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateLifecycleCostRuntime({ deploymentId: ID }).valid, "validation");
const r = runLifecycleCostRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === LIFECYCLE_COST_RUNTIME_VERSION, "version");
assert(r.payload.profile.totalLifecycleCost > r.payload.profile.acquisitionCost, "lifecycle total");
console.log(`PASS — ${r.summary}`);
