import {
  AI_PROVIDER_RUNTIME_VERSION,
  AI_READINESS_VERSION,
  AI_PROVIDER_IDS,
  runAiProviderRuntime,
  validateAiProviderRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-ai-provider-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiProviderRuntime().valid, "validation");
const r = runAiProviderRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.version === AI_READINESS_VERSION, "readiness version");
assert(r.payload.version === AI_PROVIDER_RUNTIME_VERSION, "provider version");
assert(r.payload.providers.length === 5, "five providers");
for (const id of AI_PROVIDER_IDS) {
  assert(r.payload.supportedProviders.includes(id), id);
}
console.log(`PASS — ${r.summary}`);
