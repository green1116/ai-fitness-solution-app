import {
  MODEL_RUNTIME_VERSION,
  runModelRuntime,
  validateModelRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-model-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateModelRuntime({ deploymentId: ID }).valid, "validation");
const r = runModelRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === MODEL_RUNTIME_VERSION, "model version");
assert(r.payload.models.length === 5, "five models");
assert(r.payload.models.every((m) => m.contextWindow > 0), "context window");
console.log(`PASS — ${r.summary}`);
