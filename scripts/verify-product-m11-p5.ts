/**
 * Product M11 — P5 Knowledge Compatibility verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES,
  KNOWLEDGE_COMPATIBILITY_CONSTRAINTS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES,
  KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES,
  KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS,
  KNOWLEDGE_COMPATIBILITY_RELATIONS,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "../lib/product/m11/compatibility-runtime/compatibility.constants";
import {
  getKnowledgeCompatibilityMetadata,
  isKnowledgeCompatibilityMetadataIntact,
} from "../lib/product/m11/compatibility-runtime/compatibility.metadata";
import { PRODUCT_KNOWLEDGE_POLICY_ID } from "../lib/product/m11/policy-runtime/policy.constants";
import {
  assertProductKnowledgeCompatibilityReleaseGatePass,
  checkProductKnowledgeCompatibilityReleaseGate,
} from "../lib/product/m11/verify/knowledge.compatibility.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m11/compatibility-runtime/compatibility.types.ts",
    "lib/product/m11/compatibility-runtime/compatibility.metadata.ts",
    "lib/product/m11/compatibility-runtime/matrix.registry.ts",
    "lib/product/m11/compatibility-runtime/pair.registry.ts",
    "lib/product/m11/compatibility-runtime/binding.registry.ts",
    "lib/product/m11/compatibility-runtime/compatibility.manifest.ts",
    "lib/product/m11/verify/knowledge.compatibility.gate.ts",
    "lib/product/m11/index.ts",
    "lib/product/m11/policy-runtime/policy.constants.ts",
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
    "lib/product/m11/governance-runtime",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P6+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_COMPATIBILITY_ID ===
      "enterprise-product-knowledge-compatibility-v1",
    "knowledge compatibility id",
  );
  check(
    PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION ===
      "product-knowledge-compatibility-1",
    "knowledge compatibility version",
  );
  check(
    PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION ===
      "product-knowledge-compatibility-freeze-1",
    "knowledge compatibility freeze",
  );
  check(
    PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE === PRODUCT_KNOWLEDGE_POLICY_ID,
    "compatibility base = knowledge policy",
  );
  check(
    PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG ===
      "product-knowledge-compatibility-freeze-1",
    "knowledge compatibility freeze tag",
  );
  check(
    PRODUCT_KNOWLEDGE_POLICY_ID === "enterprise-product-knowledge-policy-v1",
    "knowledge policy preserved",
  );
  check(KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS.length === 4, "matrix kinds");
  check(
    KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES.length === 4,
    "matrix statuses",
  );
  check(KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES.length === 4, "pair statuses");
  check(KNOWLEDGE_COMPATIBILITY_RELATIONS.length === 4, "relations");
  check(
    KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES.length === 3,
    "binding statuses",
  );
  check(KNOWLEDGE_COMPATIBILITY_CONSTRAINTS.length === 4, "constraints");
  check(
    KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isKnowledgeCompatibilityMetadataIntact(
      getKnowledgeCompatibilityMetadata(),
    ),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgeCompatibilityReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgeCompatibilityReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Compatibility (M11-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
