import {
  AI_SAFETY_RUNTIME_VERSION,
  runAiSafetyRuntime,
  validateAiSafetyRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-ai-safety-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiSafetyRuntime({ deploymentId: ID }).valid, "validation");
const r = runAiSafetyRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_SAFETY_RUNTIME_VERSION, "version");
assert(r.payload.allPassed, "all passed");
assert(r.payload.checks.length === 5, "five checks");
console.log(`PASS — ${r.summary}`);
