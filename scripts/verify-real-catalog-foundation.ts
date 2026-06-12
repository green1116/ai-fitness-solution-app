import {
  validateRealCatalogFoundation,
  buildRealCatalogFoundationEvidence,
  buildRealCatalogFoundationReport,
} from "../lib/real-catalog-foundation";

const validation = validateRealCatalogFoundation();
if (!validation.valid) {
  throw new Error(`ASSERT: catalog foundation validation failed — ${validation.issues.join("; ")}`);
}
if (validation.catalogIntegrityScore < 90) {
  throw new Error(`ASSERT: integrity >= 90%, got ${validation.catalogIntegrityScore}%`);
}
if (validation.purchasabilityScore < 85) {
  throw new Error(`ASSERT: purchasability >= 85%, got ${validation.purchasabilityScore}%`);
}
const evidence = buildRealCatalogFoundationEvidence();
if (evidence.catalogs.length !== 5) throw new Error("ASSERT: five catalogs");
const report = buildRealCatalogFoundationReport();
if (report.equipmentCount < 10) throw new Error("ASSERT: equipment >= 10");
console.log(`PASS — ${validation.summary}`);
console.log(`REPORT — ${report.summary}`);
