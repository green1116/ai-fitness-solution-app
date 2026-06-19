/**
 * V49 SaaS Product — Phase 8 verification (final freeze)
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_FINAL_TAG,
  SAAS_PRODUCT_P8_TAG,
  V49_META,
  validateSaasProductP8Freeze,
} from "../lib/saas-product";
import { buildOwnerContext } from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const audit = validateSaasProductP8Freeze();
  assert(audit.valid, `P8 freeze audit: ${audit.summary}`);
  console.log("✓ P8 full freeze audit ok");

  assert(audit.phaseValidations.P1, "P1 phase frozen valid");
  assert(audit.phaseValidations.P2, "P2 phase frozen valid");
  assert(audit.phaseValidations.P3, "P3 phase frozen valid");
  assert(audit.phaseValidations.P4, "P4 phase frozen valid");
  assert(audit.phaseValidations.P5, "P5 phase frozen valid");
  assert(audit.phaseValidations.P6, "P6 phase frozen valid");
  assert(audit.phaseValidations.P7, "P7 phase frozen valid");
  console.log("✓ P1~P7 phase validations ok");

  assert(audit.crossLayerClean, "cross-layer dependency clean");
  assert(audit.v47BoundaryClean, "V47 runtime boundary clean");
  assert(audit.mutationLeakFree, "P6/P7 mutation leak free");
  assert(audit.runtimeContractsFrozen, "runtime contracts frozen");
  assert(audit.typeSystemLocked, "type system locked");
  assert(audit.commercialReadiness, "commercial readiness");
  console.log("✓ architecture audit ok");

  assert(V49_META.tag === SAAS_PRODUCT_FINAL_TAG, "V49_META tag");
  assert(V49_META.frozenRuntimeContracts.length === 7, "frozen runtime contracts");
  assert(V49_META.frozenTypeContracts.length === 5, "frozen type contracts");
  assert(V49_META.commercialSkus.length === 3, "commercial SKUs");
  console.log("✓ V49_META artifact ok");

  const docFiles = [
    "V49-FINAL-FREEZE.md",
    "V49-ARCHITECTURE-DIAGRAM.md",
    "V49-DEPENDENCY-GRAPH.md",
    "V49-RUNTIME-CONTRACTS.md",
    "V49-COMMERCIAL-READINESS.md",
  ];
  for (const file of docFiles) {
    const path = join(process.cwd(), "docs", "commercialization", file);
    assert(existsSync(path), `doc exists: ${file}`);
  }
  console.log("✓ freeze documentation ok");

  const metaJsonPath = join(process.cwd(), "docs", "commercialization", "V49-META.json");
  assert(existsSync(metaJsonPath), "V49-META.json exists");
  const metaJson = JSON.parse(readFileSync(metaJsonPath, "utf8"));
  assert(metaJson.tag === SAAS_PRODUCT_FINAL_TAG, "V49-META.json tag");
  console.log("✓ V49-META.json ok");

  const ownerCtx = buildOwnerContext();
  assert(Boolean(ownerCtx.tenantId), "tenant context available for commercial layer");
  console.log("✓ commercial layer boundary ok");

  console.log(`p8Tag=${SAAS_PRODUCT_P8_TAG}`);
  console.log(`finalTag=${SAAS_PRODUCT_FINAL_TAG}`);
  console.log("SAAS PRODUCT P8 PASS");
  console.log("V49 PRODUCT LAYER FROZEN");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
