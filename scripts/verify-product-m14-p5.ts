/**
 * Product M14 — P5 Enterprise Intelligence Compatibility verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  INTELLIGENCE_COMPATIBILITY_BINDING_STATUSES,
  INTELLIGENCE_COMPATIBILITY_CONSTRAINTS,
  INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS,
  INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES,
  INTELLIGENCE_COMPATIBILITY_PAIR_STATUSES,
  INTELLIGENCE_COMPATIBILITY_READINESS_VERDICTS,
  INTELLIGENCE_COMPATIBILITY_RELATIONS,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "../lib/product/m14/compatibility-runtime/compatibility.constants";
import {
  getIntelligenceCompatibilityMetadata,
  isIntelligenceCompatibilityMetadataIntact,
} from "../lib/product/m14/compatibility-runtime/compatibility.metadata";
import { PRODUCT_INTELLIGENCE_POLICY_ID } from "../lib/product/m14/policy-runtime/policy.constants";
import {
  assertProductIntelligenceCompatibilityReleaseGatePass,
  checkProductIntelligenceCompatibilityReleaseGate,
} from "../lib/product/m14/verify/intelligence.compatibility.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m14/compatibility-runtime/compatibility.types.ts",
    "lib/product/m14/compatibility-runtime/compatibility.metadata.ts",
    "lib/product/m14/compatibility-runtime/matrix.registry.ts",
    "lib/product/m14/compatibility-runtime/pair.registry.ts",
    "lib/product/m14/compatibility-runtime/binding.registry.ts",
    "lib/product/m14/compatibility-runtime/compatibility.manifest.ts",
    "lib/product/m14/verify/intelligence.compatibility.gate.ts",
    "lib/product/m14/index.ts",
    "lib/product/m14/policy-runtime/policy.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m14/vector",
    "lib/product/m14/rag",
    "lib/product/m14/embedding",
    "lib/product/m14/provider",
    "lib/product/m14/db",
    "lib/product/m14/runtime",
    "lib/product/m14/execution",
    "lib/product/m14/tool",
    "lib/product/m14/catalog",
    "lib/product/m14/dependency",
    "lib/product/m14/policy",
    "lib/product/m14/compatibility",
    "lib/product/m14/governance-runtime",
    "lib/product/m14/lifecycle",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P6+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_COMPATIBILITY_ID ===
      "enterprise-product-intelligence-compatibility-v1",
    "intelligence compatibility id",
  );
  check(
    PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION ===
      "product-intelligence-compatibility-1",
    "intelligence compatibility version",
  );
  check(
    PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION ===
      "product-intelligence-compatibility-freeze-1",
    "intelligence compatibility freeze",
  );
  check(
    PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE === PRODUCT_INTELLIGENCE_POLICY_ID,
    "intelligence compatibility base = intelligence policy",
  );
  check(
    PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG ===
      "product-intelligence-compatibility-freeze-1",
    "intelligence compatibility freeze tag",
  );
  check(
    PRODUCT_INTELLIGENCE_POLICY_ID === "enterprise-product-intelligence-policy-v1",
    "intelligence policy preserved",
  );
  check(INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS.length === 4, "matrix kinds");
  check(
    INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES.length === 4,
    "matrix statuses",
  );
  check(INTELLIGENCE_COMPATIBILITY_PAIR_STATUSES.length === 4, "pair statuses");
  check(INTELLIGENCE_COMPATIBILITY_RELATIONS.length === 4, "relations");
  check(
    INTELLIGENCE_COMPATIBILITY_BINDING_STATUSES.length === 3,
    "binding statuses",
  );
  check(INTELLIGENCE_COMPATIBILITY_CONSTRAINTS.length === 4, "constraints");
  check(
    INTELLIGENCE_COMPATIBILITY_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isIntelligenceCompatibilityMetadataIntact(
      getIntelligenceCompatibilityMetadata(),
    ),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligenceCompatibilityReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligenceCompatibilityReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Intelligence Compatibility (M14-P5) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
