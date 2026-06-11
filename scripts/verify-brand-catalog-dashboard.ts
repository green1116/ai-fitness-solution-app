import {
  BRAND_CATALOG_DASHBOARD_RUNTIME_VERSION,
  runBrandCatalogDashboardRuntime,
  validateBrandCatalogDashboardRuntime,
  buildBrandCatalogIntelligenceEvidence,
  buildBrandCatalogIntelligenceReport,
  assertRuntimeSuccess,
} from "../lib/brand-catalog-intelligence";

const ID = "v191-brand-catalog-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBrandCatalogDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runBrandCatalogDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BRAND_CATALOG_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.brandReadiness > 0, "brand readiness");
assert(r.payload.equipmentReadiness > 0, "equipment readiness");
assert(r.payload.comparisonReadiness > 0, "comparison readiness");
assert(r.payload.matchingReadiness > 0, "matching readiness");
assert(r.payload.budgetMappingReadiness > 0, "budget readiness");
const evidence = buildBrandCatalogIntelligenceEvidence({ deploymentId: ID });
assert(evidence.domains.length === 7, "seven domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
const report = buildBrandCatalogIntelligenceReport({ deploymentId: ID });
assert(report.brandCoverage > 0, "brand coverage");
assert(report.equipmentCoverage > 0, "equipment coverage");
assert(report.budgetCoverage > 0, "budget coverage");
assert(report.differentiationReadiness > 0, "differentiation readiness");
console.log(`PASS — ${r.summary}`);
console.log(`REPORT — ${report.summary}`);
