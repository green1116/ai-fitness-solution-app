import {
  TENDER_INTELLIGENCE_ASSEMBLY_RUNTIME_VERSION,
  runTenderIntelligenceAssemblyRuntime,
  validateTenderIntelligenceAssembly,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-tender-intel-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTenderIntelligenceAssembly({ deploymentId: ID }).valid, "validation");
const r = runTenderIntelligenceAssemblyRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TENDER_INTELLIGENCE_ASSEMBLY_RUNTIME_VERSION, "version");
assert(r.payload.profile.completeness === 100, "completeness");
assert(r.payload.profile.classification.length > 0, "classification");
console.log(`PASS — ${r.summary}`);
