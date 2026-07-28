/**
 * Product M13 — P5 OS Compatibility verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  OS_COMPATIBILITY_BINDING_STATUSES,
  OS_COMPATIBILITY_CONSTRAINTS,
  OS_COMPATIBILITY_MATRIX_KINDS,
  OS_COMPATIBILITY_MATRIX_STATUSES,
  OS_COMPATIBILITY_PAIR_STATUSES,
  OS_COMPATIBILITY_READINESS_VERDICTS,
  OS_COMPATIBILITY_RELATIONS,
  PRODUCT_OS_COMPATIBILITY_BASE,
  PRODUCT_OS_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_OS_COMPATIBILITY_ID,
  PRODUCT_OS_COMPATIBILITY_VERSION,
} from "../lib/product/m13/compatibility-runtime/compatibility.constants";
import {
  getOsCompatibilityMetadata,
  isOsCompatibilityMetadataIntact,
} from "../lib/product/m13/compatibility-runtime/compatibility.metadata";
import { PRODUCT_OS_POLICY_ID } from "../lib/product/m13/policy-runtime/policy.constants";
import {
  assertProductOsCompatibilityReleaseGatePass,
  checkProductOsCompatibilityReleaseGate,
} from "../lib/product/m13/verify/os.compatibility.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m13/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m13/compatibility-runtime/compatibility.types.ts",
    "lib/product/m13/compatibility-runtime/compatibility.metadata.ts",
    "lib/product/m13/compatibility-runtime/matrix.registry.ts",
    "lib/product/m13/compatibility-runtime/pair.registry.ts",
    "lib/product/m13/compatibility-runtime/binding.registry.ts",
    "lib/product/m13/compatibility-runtime/compatibility.manifest.ts",
    "lib/product/m13/verify/os.compatibility.gate.ts",
    "lib/product/m13/index.ts",
    "lib/product/m13/policy-runtime/policy.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m13/vector",
    "lib/product/m13/rag",
    "lib/product/m13/embedding",
    "lib/product/m13/provider",
    "lib/product/m13/db",
    "lib/product/m13/runtime",
    "lib/product/m13/execution",
    "lib/product/m13/tool",
    "lib/product/m13/catalog",
    "lib/product/m13/dependency",
    "lib/product/m13/policy",
    "lib/product/m13/compatibility",
    "lib/product/m13/governance-runtime",
    "lib/product/m13/lifecycle",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P6+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OS_COMPATIBILITY_ID === "enterprise-product-os-compatibility-v1",
    "os compatibility id",
  );
  check(
    PRODUCT_OS_COMPATIBILITY_VERSION === "product-os-compatibility-1",
    "os compatibility version",
  );
  check(
    PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION ===
      "product-os-compatibility-freeze-1",
    "os compatibility freeze",
  );
  check(
    PRODUCT_OS_COMPATIBILITY_BASE === PRODUCT_OS_POLICY_ID,
    "os compatibility base = os policy",
  );
  check(
    PRODUCT_OS_COMPATIBILITY_FREEZE_TAG ===
      "product-os-compatibility-freeze-1",
    "os compatibility freeze tag",
  );
  check(
    PRODUCT_OS_POLICY_ID === "enterprise-product-os-policy-v1",
    "os policy preserved",
  );
  check(OS_COMPATIBILITY_MATRIX_KINDS.length === 4, "matrix kinds");
  check(OS_COMPATIBILITY_MATRIX_STATUSES.length === 4, "matrix statuses");
  check(OS_COMPATIBILITY_PAIR_STATUSES.length === 4, "pair statuses");
  check(OS_COMPATIBILITY_RELATIONS.length === 4, "relations");
  check(OS_COMPATIBILITY_BINDING_STATUSES.length === 3, "binding statuses");
  check(OS_COMPATIBILITY_CONSTRAINTS.length === 4, "constraints");
  check(
    OS_COMPATIBILITY_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isOsCompatibilityMetadataIntact(getOsCompatibilityMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOsCompatibilityReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOsCompatibilityReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Operating System Compatibility (M13-P5) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
