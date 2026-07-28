/**
 * Product M13 — P8 Enterprise Operating System Baseline Freeze verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AGENT_BASELINE_ID } from "../lib/product/m12/baseline/freeze/freeze.lock";
import {
  ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  isProductOsFreezeLockIntact,
  PRODUCT_OS_BASELINE_FREEZE_BASE,
  PRODUCT_OS_BASELINE_FREEZE_VERSION,
  PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_COMPONENT_LOCK,
  PRODUCT_OS_FREEZE_LOCK,
} from "../lib/product/m13/baseline/freeze/freeze.lock";
import {
  isProductOsImmutableManifestIntact,
  PRODUCT_OS_IMMUTABLE_MANIFEST,
} from "../lib/product/m13/baseline/freeze/immutable.manifest";
import {
  isProductOsRollbackSnapshotIntact,
  PRODUCT_OS_ROLLBACK_SNAPSHOT,
} from "../lib/product/m13/baseline/freeze/rollback.snapshot";
import { PRODUCT_OS_CATALOG_ID } from "../lib/product/m13/catalog-runtime/catalog.constants";
import { PRODUCT_OS_COMPATIBILITY_ID } from "../lib/product/m13/compatibility-runtime/compatibility.constants";
import { PRODUCT_OS_DEPENDENCY_ID } from "../lib/product/m13/dependency-runtime/dependency.constants";
import { PRODUCT_OS_FOUNDATION_ID } from "../lib/product/m13/foundation/os.constants";
import { PRODUCT_OS_GOVERNANCE_ID } from "../lib/product/m13/governance/governance.constants";
import { PRODUCT_OS_LIFECYCLE_ID } from "../lib/product/m13/lifecycle-runtime/lifecycle.constants";
import { PRODUCT_OS_POLICY_ID } from "../lib/product/m13/policy-runtime/policy.constants";
import {
  assertProductOsBaselineReleaseGatePass,
  checkProductOsBaselineReleaseGate,
} from "../lib/product/m13/verify/os.baseline.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m13/baseline/freeze/freeze.lock.ts",
    "lib/product/m13/baseline/freeze/immutable.manifest.ts",
    "lib/product/m13/baseline/freeze/rollback.snapshot.ts",
    "lib/product/m13/baseline/index.ts",
    "lib/product/m13/verify/os.baseline.gate.ts",
    "lib/product/m13/index.ts",
    "lib/product/m13/foundation/os.constants.ts",
    "lib/product/m13/catalog-runtime/catalog.constants.ts",
    "lib/product/m13/dependency-runtime/dependency.constants.ts",
    "lib/product/m13/policy-runtime/policy.constants.ts",
    "lib/product/m13/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m13/governance/governance.constants.ts",
    "lib/product/m13/lifecycle-runtime/lifecycle.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OS_BASELINE_ID === "enterprise-product-os-baseline-v1",
    "os baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_OS_BASELINE_ID === PRODUCT_OS_BASELINE_ID,
    "os baseline alias",
  );
  check(
    PRODUCT_OS_BASELINE_FREEZE_VERSION === "product-os-baseline-freeze-1",
    "os freeze version",
  );
  check(
    PRODUCT_OS_BASELINE_FREEZE_BASE === PRODUCT_OS_LIFECYCLE_ID,
    "freeze base = os lifecycle",
  );
  check(
    PRODUCT_OS_FOUNDATION_ID === "enterprise-product-os-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_OS_CATALOG_ID === "enterprise-product-os-catalog-v1",
    "catalog preserved",
  );
  check(
    PRODUCT_OS_DEPENDENCY_ID === "enterprise-product-os-dependency-v1",
    "dependency preserved",
  );
  check(
    PRODUCT_OS_POLICY_ID === "enterprise-product-os-policy-v1",
    "policy preserved",
  );
  check(
    PRODUCT_OS_COMPATIBILITY_ID === "enterprise-product-os-compatibility-v1",
    "compatibility preserved",
  );
  check(
    PRODUCT_OS_GOVERNANCE_ID === "enterprise-product-os-governance-v1",
    "governance preserved",
  );
  check(
    PRODUCT_OS_LIFECYCLE_ID === "enterprise-product-os-lifecycle-v1",
    "lifecycle preserved",
  );
  check(
    ENTERPRISE_PRODUCT_AGENT_BASELINE_ID ===
      "enterprise-product-agent-baseline-v1",
    "agent baseline preserved",
  );
  check(isProductOsFreezeLockIntact(), "freeze lock intact");
  check(
    isProductOsImmutableManifestIntact(PRODUCT_OS_IMMUTABLE_MANIFEST),
    "immutable manifest",
  );
  check(
    isProductOsRollbackSnapshotIntact(PRODUCT_OS_ROLLBACK_SNAPSHOT),
    "rollback snapshot",
  );
  check(PRODUCT_OS_COMPONENT_LOCK.length === 8, "component lock count");
  check(
    PRODUCT_OS_FREEZE_LOCK.agentBaseline ===
      ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
    "agent baseline soft-ref",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOsBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOsBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Operating System Baseline Freeze (M13-P8) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
