import {
  RETRY_RUNTIME_VERSION,
  runRetryRuntime,
  validateRetryRuntime,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-retry-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRetryRuntime({ deploymentId: ID }).valid, "validation");
const r = runRetryRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RETRY_RUNTIME_VERSION, "version");
assert(r.payload.policy.maxAttempts >= 3, "retry policy");
assert(r.payload.records.some((rec) => rec.usedFallback), "fallback");
console.log(`PASS — ${r.summary}`);
