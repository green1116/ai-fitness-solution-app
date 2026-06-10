import {
  AI_ADAPTER_RUNTIME_VERSION,
  runAiAdapterRuntime,
  validateAiAdapterRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-ai-adapter-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiAdapterRuntime({ deploymentId: ID }).valid, "validation");
const r = runAiAdapterRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_ADAPTER_RUNTIME_VERSION, "adapter version");
assert(r.payload.results.length === 4, "four tasks");
const tasks = new Set(r.payload.results.map((res) => res.task));
assert(tasks.has("proposal"), "proposal");
assert(tasks.has("summary"), "summary");
assert(tasks.has("risk-analysis"), "risk");
assert(tasks.has("compliance-matrix"), "compliance");
console.log(`PASS — ${r.summary}`);
