/**
 * Product M14 — P4 Enterprise Intelligence Policy verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_DEPENDENCY_ID } from "../lib/product/m14/dependency-runtime/dependency.constants";
import {
  INTELLIGENCE_POLICY_BINDING_STATUSES,
  INTELLIGENCE_POLICY_CONSTRAINTS,
  INTELLIGENCE_POLICY_ENFORCEMENTS,
  INTELLIGENCE_POLICY_KINDS,
  INTELLIGENCE_POLICY_READINESS_VERDICTS,
  INTELLIGENCE_POLICY_RULE_STATUSES,
  INTELLIGENCE_POLICY_STATUSES,
  PRODUCT_INTELLIGENCE_POLICY_BASE,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_POLICY_ID,
  PRODUCT_INTELLIGENCE_POLICY_VERSION,
} from "../lib/product/m14/policy-runtime/policy.constants";
import {
  getIntelligencePolicyMetadata,
  isIntelligencePolicyMetadataIntact,
} from "../lib/product/m14/policy-runtime/policy.metadata";
import {
  assertProductIntelligencePolicyReleaseGatePass,
  checkProductIntelligencePolicyReleaseGate,
} from "../lib/product/m14/verify/intelligence.policy.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/policy-runtime/policy.constants.ts",
    "lib/product/m14/policy-runtime/policy.types.ts",
    "lib/product/m14/policy-runtime/policy.metadata.ts",
    "lib/product/m14/policy-runtime/policy.registry.ts",
    "lib/product/m14/policy-runtime/rule.registry.ts",
    "lib/product/m14/policy-runtime/binding.registry.ts",
    "lib/product/m14/policy-runtime/policy.manifest.ts",
    "lib/product/m14/verify/intelligence.policy.gate.ts",
    "lib/product/m14/index.ts",
    "lib/product/m14/dependency-runtime/dependency.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P5+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_POLICY_ID === "enterprise-product-intelligence-policy-v1",
    "intelligence policy id",
  );
  check(
    PRODUCT_INTELLIGENCE_POLICY_VERSION === "product-intelligence-policy-1",
    "intelligence policy version",
  );
  check(
    PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION ===
      "product-intelligence-policy-freeze-1",
    "intelligence policy freeze",
  );
  check(
    PRODUCT_INTELLIGENCE_POLICY_BASE === PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
    "intelligence policy base = intelligence dependency",
  );
  check(
    PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG ===
      "product-intelligence-policy-freeze-1",
    "intelligence policy freeze tag",
  );
  check(
    PRODUCT_INTELLIGENCE_DEPENDENCY_ID ===
      "enterprise-product-intelligence-dependency-v1",
    "intelligence dependency preserved",
  );
  check(INTELLIGENCE_POLICY_KINDS.length === 4, "policy kinds");
  check(INTELLIGENCE_POLICY_STATUSES.length === 4, "policy statuses");
  check(INTELLIGENCE_POLICY_RULE_STATUSES.length === 4, "rule statuses");
  check(INTELLIGENCE_POLICY_BINDING_STATUSES.length === 3, "binding statuses");
  check(INTELLIGENCE_POLICY_ENFORCEMENTS.length === 3, "enforcements");
  check(INTELLIGENCE_POLICY_CONSTRAINTS.length === 4, "constraints");
  check(INTELLIGENCE_POLICY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isIntelligencePolicyMetadataIntact(getIntelligencePolicyMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligencePolicyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligencePolicyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Intelligence Policy (M14-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
