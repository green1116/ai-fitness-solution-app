/**
 * Product M14 — P8 Enterprise Intelligence Baseline Freeze verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_OS_BASELINE_ID } from "../lib/product/m13/baseline/freeze/freeze.lock";
import {
  ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
  isProductIntelligenceFreezeLockIntact,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_BASELINE_ID,
  PRODUCT_INTELLIGENCE_COMPONENT_LOCK,
  PRODUCT_INTELLIGENCE_FREEZE_LOCK,
} from "../lib/product/m14/baseline/freeze/freeze.lock";
import {
  isProductIntelligenceImmutableManifestIntact,
  PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST,
} from "../lib/product/m14/baseline/freeze/immutable.manifest";
import {
  isProductIntelligenceRollbackSnapshotIntact,
  PRODUCT_INTELLIGENCE_ROLLBACK_SNAPSHOT,
} from "../lib/product/m14/baseline/freeze/rollback.snapshot";
import { PRODUCT_INTELLIGENCE_CATALOG_ID } from "../lib/product/m14/catalog-runtime/catalog.constants";
import { PRODUCT_INTELLIGENCE_COMPATIBILITY_ID } from "../lib/product/m14/compatibility-runtime/compatibility.constants";
import { PRODUCT_INTELLIGENCE_DEPENDENCY_ID } from "../lib/product/m14/dependency-runtime/dependency.constants";
import { PRODUCT_INTELLIGENCE_FOUNDATION_ID } from "../lib/product/m14/foundation/intelligence.constants";
import { PRODUCT_INTELLIGENCE_GOVERNANCE_ID } from "../lib/product/m14/governance/governance.constants";
import { PRODUCT_INTELLIGENCE_LIFECYCLE_ID } from "../lib/product/m14/lifecycle-runtime/lifecycle.constants";
import { PRODUCT_INTELLIGENCE_POLICY_ID } from "../lib/product/m14/policy-runtime/policy.constants";
import {
  assertProductIntelligenceBaselineReleaseGatePass,
  checkProductIntelligenceBaselineReleaseGate,
} from "../lib/product/m14/verify/intelligence.baseline.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/baseline/freeze/freeze.lock.ts",
    "lib/product/m14/baseline/freeze/immutable.manifest.ts",
    "lib/product/m14/baseline/freeze/rollback.snapshot.ts",
    "lib/product/m14/baseline/index.ts",
    "lib/product/m14/verify/intelligence.baseline.gate.ts",
    "lib/product/m14/index.ts",
    "lib/product/m14/foundation/intelligence.constants.ts",
    "lib/product/m14/catalog-runtime/catalog.constants.ts",
    "lib/product/m14/dependency-runtime/dependency.constants.ts",
    "lib/product/m14/policy-runtime/policy.constants.ts",
    "lib/product/m14/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m14/governance/governance.constants.ts",
    "lib/product/m14/lifecycle-runtime/lifecycle.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_BASELINE_ID ===
      "enterprise-product-intelligence-baseline-v1",
    "intelligence baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID ===
      PRODUCT_INTELLIGENCE_BASELINE_ID,
    "intelligence baseline alias",
  );
  check(
    PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION ===
      "product-intelligence-baseline-freeze-1",
    "intelligence freeze version",
  );
  check(
    PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE ===
      PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
    "freeze base = intelligence lifecycle",
  );
  check(
    PRODUCT_INTELLIGENCE_FOUNDATION_ID ===
      "enterprise-product-intelligence-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_INTELLIGENCE_CATALOG_ID ===
      "enterprise-product-intelligence-catalog-v1",
    "catalog preserved",
  );
  check(
    PRODUCT_INTELLIGENCE_DEPENDENCY_ID ===
      "enterprise-product-intelligence-dependency-v1",
    "dependency preserved",
  );
  check(
    PRODUCT_INTELLIGENCE_POLICY_ID ===
      "enterprise-product-intelligence-policy-v1",
    "policy preserved",
  );
  check(
    PRODUCT_INTELLIGENCE_COMPATIBILITY_ID ===
      "enterprise-product-intelligence-compatibility-v1",
    "compatibility preserved",
  );
  check(
    PRODUCT_INTELLIGENCE_GOVERNANCE_ID ===
      "enterprise-product-intelligence-governance-v1",
    "governance preserved",
  );
  check(
    PRODUCT_INTELLIGENCE_LIFECYCLE_ID ===
      "enterprise-product-intelligence-lifecycle-v1",
    "lifecycle preserved",
  );
  check(
    ENTERPRISE_PRODUCT_OS_BASELINE_ID === "enterprise-product-os-baseline-v1",
    "os baseline preserved",
  );
  check(isProductIntelligenceFreezeLockIntact(), "freeze lock intact");
  check(
    isProductIntelligenceImmutableManifestIntact(
      PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST,
    ),
    "immutable manifest",
  );
  check(
    isProductIntelligenceRollbackSnapshotIntact(
      PRODUCT_INTELLIGENCE_ROLLBACK_SNAPSHOT,
    ),
    "rollback snapshot",
  );
  check(PRODUCT_INTELLIGENCE_COMPONENT_LOCK.length === 8, "component lock count");
  check(
    PRODUCT_INTELLIGENCE_FREEZE_LOCK.osBaseline ===
      ENTERPRISE_PRODUCT_OS_BASELINE_ID,
    "os baseline soft-ref",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligenceBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligenceBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Intelligence Baseline Freeze (M14-P8) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
