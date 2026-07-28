/**
 * Product M11 — P4 Knowledge Policy verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_DEPENDENCY_ID } from "../lib/product/m11/dependency-runtime/dependency.constants";
import {
  KNOWLEDGE_POLICY_BINDING_STATUSES,
  KNOWLEDGE_POLICY_CONSTRAINTS,
  KNOWLEDGE_POLICY_ENFORCEMENTS,
  KNOWLEDGE_POLICY_KINDS,
  KNOWLEDGE_POLICY_READINESS_VERDICTS,
  KNOWLEDGE_POLICY_RULE_STATUSES,
  KNOWLEDGE_POLICY_STATUSES,
  PRODUCT_KNOWLEDGE_POLICY_BASE,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_POLICY_ID,
  PRODUCT_KNOWLEDGE_POLICY_VERSION,
} from "../lib/product/m11/policy-runtime/policy.constants";
import {
  getKnowledgePolicyMetadata,
  isKnowledgePolicyMetadataIntact,
} from "../lib/product/m11/policy-runtime/policy.metadata";
import {
  assertProductKnowledgePolicyReleaseGatePass,
  checkProductKnowledgePolicyReleaseGate,
} from "../lib/product/m11/verify/knowledge.policy.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/policy-runtime/policy.constants.ts",
    "lib/product/m11/policy-runtime/policy.types.ts",
    "lib/product/m11/policy-runtime/policy.metadata.ts",
    "lib/product/m11/policy-runtime/policy.registry.ts",
    "lib/product/m11/policy-runtime/rule.registry.ts",
    "lib/product/m11/policy-runtime/binding.registry.ts",
    "lib/product/m11/policy-runtime/policy.manifest.ts",
    "lib/product/m11/verify/knowledge.policy.gate.ts",
    "lib/product/m11/index.ts",
    "lib/product/m11/dependency-runtime/dependency.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m11/vector",
    "lib/product/m11/rag",
    "lib/product/m11/embedding",
    "lib/product/m11/provider",
    "lib/product/m11/db",
    "lib/product/m11/dependency",
    "lib/product/m11/index-runtime",
    "lib/product/m11/compatibility",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P5+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_POLICY_ID === "enterprise-product-knowledge-policy-v1",
    "knowledge policy id",
  );
  check(
    PRODUCT_KNOWLEDGE_POLICY_VERSION === "product-knowledge-policy-1",
    "knowledge policy version",
  );
  check(
    PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION ===
      "product-knowledge-policy-freeze-1",
    "knowledge policy freeze",
  );
  check(
    PRODUCT_KNOWLEDGE_POLICY_BASE === PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
    "policy base = knowledge dependency",
  );
  check(
    PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG ===
      "product-knowledge-policy-freeze-1",
    "knowledge policy freeze tag",
  );
  check(
    PRODUCT_KNOWLEDGE_DEPENDENCY_ID ===
      "enterprise-product-knowledge-dependency-v1",
    "knowledge dependency preserved",
  );
  check(KNOWLEDGE_POLICY_KINDS.length === 4, "policy kinds");
  check(KNOWLEDGE_POLICY_STATUSES.length === 4, "policy statuses");
  check(KNOWLEDGE_POLICY_RULE_STATUSES.length === 4, "rule statuses");
  check(KNOWLEDGE_POLICY_BINDING_STATUSES.length === 3, "binding statuses");
  check(KNOWLEDGE_POLICY_ENFORCEMENTS.length === 3, "enforcements");
  check(KNOWLEDGE_POLICY_CONSTRAINTS.length === 4, "constraints");
  check(KNOWLEDGE_POLICY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isKnowledgePolicyMetadataIntact(getKnowledgePolicyMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgePolicyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgePolicyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Policy (M11-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
