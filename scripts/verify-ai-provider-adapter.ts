import {
  AI_PROVIDER_ADAPTER_RUNTIME_VERSION,
  AI_PROVIDER_IDS,
  runAiProviderAdapterRuntime,
  validateAiProviderAdapterRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-provider-adapter-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiProviderAdapterRuntime({ deploymentId: ID, forceMode: "stub" }).valid, "validation");
const r = runAiProviderAdapterRuntime({ deploymentId: ID, forceMode: "stub" });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_PROVIDER_ADAPTER_RUNTIME_VERSION, "version");
assert(r.payload.supportedProviders.length === AI_PROVIDER_IDS.length, "five providers");
assert(r.payload.adapterResults.length === 5, "five methods");
console.log(`PASS — ${r.summary}`);
