import {
  AI_COST_CONTROL_RUNTIME_VERSION,
  runAiCostControlRuntime,
  validateAiCostControlRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-ai-cost-control-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiCostControlRuntime({ deploymentId: ID }).valid, "validation");
const r = runAiCostControlRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_COST_CONTROL_RUNTIME_VERSION, "version");
assert(r.payload.usage.withinDailyLimit, "daily limit");
assert(r.payload.limits.dailyLimitUsd > 0, "limits");
console.log(`PASS — ${r.summary}`);
