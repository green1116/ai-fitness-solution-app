import {
  GTM_ANALYTICS_RUNTIME_VERSION,
  runGtmAnalyticsRuntime,
  validateGtmAnalyticsRuntime,
  assertRuntimeSuccess,
} from "../lib/go-to-market";

const ID = "v17-gtm-analytics-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateGtmAnalyticsRuntime({ deploymentId: ID }).valid, "validation");
const r = runGtmAnalyticsRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === GTM_ANALYTICS_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.goToMarketHealth > 0, "gtm health");
console.log(`PASS — ${r.summary}`);
