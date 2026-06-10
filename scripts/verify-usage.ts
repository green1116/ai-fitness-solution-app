import {
  USAGE_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  runUsageRuntime,
  validateUsageRuntime,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-usage-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validateUsageRuntime({ deploymentId: ID });
assert(v.metricsValid, "validation");
const r = runUsageRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.metrics.plans > 0, "plans");
assert(r.payload.metrics.zipExports >= 0, "zip exports");
assert(r.payload.metrics.tenderUploads >= 0, "tender uploads");
console.log(`PASS — ${r.summary}`);
