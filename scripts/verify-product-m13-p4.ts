/**
 * Product M13 — P4 OS Policy verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_OS_DEPENDENCY_ID } from "../lib/product/m13/dependency-runtime/dependency.constants";
import {
  OS_POLICY_BINDING_STATUSES,
  OS_POLICY_CONSTRAINTS,
  OS_POLICY_ENFORCEMENTS,
  OS_POLICY_KINDS,
  OS_POLICY_READINESS_VERDICTS,
  OS_POLICY_RULE_STATUSES,
  OS_POLICY_STATUSES,
  PRODUCT_OS_POLICY_BASE,
  PRODUCT_OS_POLICY_FREEZE_TAG,
  PRODUCT_OS_POLICY_FREEZE_VERSION,
  PRODUCT_OS_POLICY_ID,
  PRODUCT_OS_POLICY_VERSION,
} from "../lib/product/m13/policy-runtime/policy.constants";
import {
  getOsPolicyMetadata,
  isOsPolicyMetadataIntact,
} from "../lib/product/m13/policy-runtime/policy.metadata";
import {
  assertProductOsPolicyReleaseGatePass,
  checkProductOsPolicyReleaseGate,
} from "../lib/product/m13/verify/os.policy.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m13/policy-runtime/policy.constants.ts",
    "lib/product/m13/policy-runtime/policy.types.ts",
    "lib/product/m13/policy-runtime/policy.metadata.ts",
    "lib/product/m13/policy-runtime/policy.registry.ts",
    "lib/product/m13/policy-runtime/rule.registry.ts",
    "lib/product/m13/policy-runtime/binding.registry.ts",
    "lib/product/m13/policy-runtime/policy.manifest.ts",
    "lib/product/m13/verify/os.policy.gate.ts",
    "lib/product/m13/index.ts",
    "lib/product/m13/dependency-runtime/dependency.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P5+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OS_POLICY_ID === "enterprise-product-os-policy-v1",
    "os policy id",
  );
  check(
    PRODUCT_OS_POLICY_VERSION === "product-os-policy-1",
    "os policy version",
  );
  check(
    PRODUCT_OS_POLICY_FREEZE_VERSION === "product-os-policy-freeze-1",
    "os policy freeze",
  );
  check(
    PRODUCT_OS_POLICY_BASE === PRODUCT_OS_DEPENDENCY_ID,
    "os policy base = os dependency",
  );
  check(
    PRODUCT_OS_POLICY_FREEZE_TAG === "product-os-policy-freeze-1",
    "os policy freeze tag",
  );
  check(
    PRODUCT_OS_DEPENDENCY_ID === "enterprise-product-os-dependency-v1",
    "os dependency preserved",
  );
  check(OS_POLICY_KINDS.length === 4, "policy kinds");
  check(OS_POLICY_STATUSES.length === 4, "policy statuses");
  check(OS_POLICY_RULE_STATUSES.length === 4, "rule statuses");
  check(OS_POLICY_BINDING_STATUSES.length === 3, "binding statuses");
  check(OS_POLICY_ENFORCEMENTS.length === 3, "enforcements");
  check(OS_POLICY_CONSTRAINTS.length === 4, "constraints");
  check(OS_POLICY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isOsPolicyMetadataIntact(getOsPolicyMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOsPolicyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOsPolicyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Operating System Policy (M13-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
