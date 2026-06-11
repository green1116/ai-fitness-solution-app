import {
  BRAND_LIBRARY_RUNTIME_VERSION,
  runBrandLibraryRuntime,
  validateBrandLibraryRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-intelligence";

const ID = "v19-brand-library-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBrandLibraryRuntime({ deploymentId: ID }).valid, "validation");
const r = runBrandLibraryRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BRAND_LIBRARY_RUNTIME_VERSION, "version");
assert(r.payload.brandReadiness > 0, "readiness");
assert(r.payload.snapshot.brands.length >= 3, "brands");
console.log(`PASS — ${r.summary}`);
