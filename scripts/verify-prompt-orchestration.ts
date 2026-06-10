import {
  PROMPT_ORCHESTRATION_RUNTIME_VERSION,
  PROMPT_KINDS,
  runPromptOrchestrationRuntime,
  validatePromptOrchestrationRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-prompt-orchestration-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validatePromptOrchestrationRuntime({ deploymentId: ID }).valid, "validation");
const r = runPromptOrchestrationRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROMPT_ORCHESTRATION_RUNTIME_VERSION, "version");
assert(r.payload.templates.length === PROMPT_KINDS.length, "five kinds");
assert(r.payload.audit.length === PROMPT_KINDS.length, "audit");
console.log(`PASS — ${r.summary}`);
