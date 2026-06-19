/**
 * V50 Production Persistence — Phase 8 verification (final freeze)
 */
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
  SAAS_PRODUCT_PERSISTENCE_P8_TAG,
  V50_META,
  validatePersistenceP7,
  validatePersistenceP8Freeze,
} from "../lib/saas-product-persistence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const p7 = await validatePersistenceP7();
  assert(p7.valid, `P7 audit sweep: ${p7.summary}`);
  console.log("✓ verify:v50-p7 equivalent ok");

  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("✓ tsc ok");

  const audit = await validatePersistenceP8Freeze();
  assert(audit.valid, `P8 freeze audit: ${audit.summary}`);
  console.log("✓ P8 full freeze audit ok");

  assert(audit.phaseValidations.P1, "P1 frozen valid");
  assert(audit.phaseValidations.P2, "P2 frozen valid");
  assert(audit.phaseValidations.P3, "P3 frozen valid");
  assert(audit.phaseValidations.P4, "P4 frozen valid");
  assert(audit.phaseValidations.P5, "P5 frozen valid");
  assert(audit.phaseValidations.P6, "P6 frozen valid");
  assert(audit.phaseValidations.P7, "P7 frozen valid");
  console.log("✓ P1~P7 phase validations ok");

  assert(audit.auditSweepPassed, "audit sweep passed");
  assert(audit.adapterReady, "adapter ready");
  assert(audit.metaLocked, "meta locked");
  assert(audit.documentationReady, "documentation ready");
  assert(audit.frozenContractsLocked, "frozen contracts locked");
  console.log("✓ freeze gates ok");

  assert(V50_META.tag === SAAS_PRODUCT_PERSISTENCE_FINAL_TAG, "V50_META tag");
  assert(V50_META.status === "frozen", "V50_META status");
  assert(V50_META.frozenRuntimeContracts.length === 8, "frozen runtime contracts");
  assert(V50_META.frozenTypeContracts.length === 7, "frozen type contracts");
  console.log("✓ V50_META artifact ok");

  const docFiles = [
    "V50-FINAL-FREEZE.md",
    "V50-IMPLEMENTATION-SUMMARY.md",
    "V50-AUDIT-REPORT.md",
    "V50-PARITY-REPORT.md",
  ];
  for (const file of docFiles) {
    const path = join(process.cwd(), "docs", "commercialization", file);
    assert(existsSync(path), `doc exists: ${file}`);
  }
  console.log("✓ freeze documentation ok");

  const metaJsonPath = join(process.cwd(), "docs", "commercialization", "V50-META.json");
  writeFileSync(metaJsonPath, `${JSON.stringify(V50_META, null, 2)}\n`, "utf8");
  const metaJson = JSON.parse(readFileSync(metaJsonPath, "utf8"));
  assert(metaJson.tag === SAAS_PRODUCT_PERSISTENCE_FINAL_TAG, "V50-META.json tag");
  console.log("✓ V50-META.json ok");

  console.log(`p8Tag=${SAAS_PRODUCT_PERSISTENCE_P8_TAG}`);
  console.log(`finalTag=${SAAS_PRODUCT_PERSISTENCE_FINAL_TAG}`);
  console.log("V50 P8 PASS");
  console.log("V50 PRODUCTION PERSISTENCE FROZEN");
  console.log("Ready for V51 API Exposure Layer");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
