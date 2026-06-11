import {
  BRAND_INTELLIGENCE_RUNTIME_VERSION,
  runBrandIntelligenceRuntime,
  validateBrandIntelligenceRuntime,
  assertRuntimeSuccess,
} from "../lib/brand-catalog-intelligence";

const ID = "v191-brand-intelligence-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBrandIntelligenceRuntime({ deploymentId: ID }).valid, "validation");
const r = runBrandIntelligenceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BRAND_INTELLIGENCE_RUNTIME_VERSION, "version");
assert(r.payload.intelligenceReadiness > 0, "readiness");
assert(r.payload.snapshot.tierDistribution.premium > 0, "premium tier");
assert(r.payload.snapshot.tierDistribution.commercial > 0, "commercial tier");
assert(r.payload.snapshot.tierDistribution.value > 0, "value tier");
console.log(`PASS — ${r.summary}`);
