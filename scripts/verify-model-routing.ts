import {
  MODEL_ROUTING_RUNTIME_VERSION,
  runModelRoutingRuntime,
  validateModelRoutingRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-model-routing-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateModelRoutingRuntime({ deploymentId: ID }).valid, "validation");
const r = runModelRoutingRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === MODEL_ROUTING_RUNTIME_VERSION, "version");
assert(r.payload.rules.length >= 4, "rules");
assert(r.payload.decisions.some((d) => d.usedFallback), "fallback");
console.log(`PASS — ${r.summary}`);
