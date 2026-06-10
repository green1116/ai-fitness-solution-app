import {
  COMPLETION_RUNTIME_VERSION,
  runCompletionRuntime,
  validateCompletionRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-completion-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCompletionRuntime({ deploymentId: ID }).valid, "validation");
const r = runCompletionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPLETION_RUNTIME_VERSION, "completion version");
assert(r.payload.request.mode === "readiness-stub", "stub request");
assert(r.payload.response.finishReason === "stop", "finish reason");
console.log(`PASS — ${r.summary}`);
