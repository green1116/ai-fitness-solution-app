import {
  CATALOG_COVERAGE_RUNTIME_VERSION,
  runCatalogCoverageRuntime,
  validateCatalogCoverageRuntime,
  assertRuntimeSuccess,
} from "../lib/brand-catalog-intelligence";

const ID = "v191-catalog-coverage-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCatalogCoverageRuntime({ deploymentId: ID }).valid, "validation");
const r = runCatalogCoverageRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CATALOG_COVERAGE_RUNTIME_VERSION, "version");
assert(r.payload.catalogCompletenessScore > 0, "completeness");
assert(r.payload.snapshot.brandCount >= 6, "brands");
console.log(`PASS — ${r.summary}`);
