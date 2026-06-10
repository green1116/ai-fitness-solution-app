import {
  CHURN_RUNTIME_VERSION,
  runChurnRuntime,
  validateChurnRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-churn-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateChurnRuntime({ deploymentId: ID }).valid, "validation");
const r = runChurnRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CHURN_RUNTIME_VERSION, "version");
assert(r.payload.retentionRate > 0, "retention");
assert(r.payload.churnRate < 1, "churn rate");
console.log(`PASS — ${r.summary}`);
