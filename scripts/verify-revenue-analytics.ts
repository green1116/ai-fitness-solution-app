import {
  REVENUE_ANALYTICS_RUNTIME_VERSION,
  runRevenueAnalyticsRuntime,
  validateRevenueAnalyticsRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-revenue-analytics-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRevenueAnalyticsRuntime({ deploymentId: ID }).valid, "validation");
const r = runRevenueAnalyticsRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === REVENUE_ANALYTICS_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.mrrCny > 0, "mrr");
assert(r.payload.snapshot.arrCny === r.payload.snapshot.mrrCny * 12, "arr");
console.log(`PASS — ${r.summary}`);
