import {
  PROMPT_RUNTIME_VERSION,
  PROMPT_KINDS,
  runPromptRuntime,
  validatePromptRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-prompt-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validatePromptRuntime({ deploymentId: ID }).valid, "validation");
const r = runPromptRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROMPT_RUNTIME_VERSION, "prompt version");
assert(r.payload.templates.length === PROMPT_KINDS.length, "prompt kinds");
console.log(`PASS — ${r.summary}`);
