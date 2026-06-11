import {
  BRAND_COMPARISON_RUNTIME_VERSION,
  runBrandComparisonRuntime,
  validateBrandComparisonRuntime,
  assertRuntimeSuccess,
} from "../lib/brand-catalog-intelligence";

const ID = "v191-brand-comparison-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBrandComparisonRuntime({ deploymentId: ID }).valid, "validation");
const r = runBrandComparisonRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BRAND_COMPARISON_RUNTIME_VERSION, "version");
assert(r.payload.comparisonReadiness > 0, "readiness");
assert(r.payload.snapshot.comparisons.length >= 3, "comparisons");
console.log(`PASS — ${r.summary}`);
