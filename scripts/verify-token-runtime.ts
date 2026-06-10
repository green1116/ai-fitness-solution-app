import {
  TOKEN_RUNTIME_VERSION,
  runTokenRuntime,
  validateTokenRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-token-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTokenRuntime({ deploymentId: ID }).valid, "validation");
const r = runTokenRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TOKEN_RUNTIME_VERSION, "token version");
assert(r.payload.usage.totalTokens === r.payload.usage.promptTokens + r.payload.usage.completionTokens, "total tokens");
console.log(`PASS — ${r.summary}`);
