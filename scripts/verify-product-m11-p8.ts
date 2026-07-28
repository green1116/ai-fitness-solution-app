/**
 * Product M11 — P8 Knowledge Platform Baseline Freeze verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID } from "../lib/product/m10/baseline/freeze/freeze.lock";
import {
  ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  isProductKnowledgeFreezeLockIntact,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_COMPONENT_LOCK,
  PRODUCT_KNOWLEDGE_FREEZE_LOCK,
} from "../lib/product/m11/baseline/freeze/freeze.lock";
import {
  isProductKnowledgeImmutableManifestIntact,
  PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST,
} from "../lib/product/m11/baseline/freeze/immutable.manifest";
import {
  isProductKnowledgeRollbackSnapshotIntact,
  PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT,
} from "../lib/product/m11/baseline/freeze/rollback.snapshot";
import { PRODUCT_KNOWLEDGE_CATALOG_ID } from "../lib/product/m11/catalog/catalog.constants";
import { PRODUCT_KNOWLEDGE_COMPATIBILITY_ID } from "../lib/product/m11/compatibility-runtime/compatibility.constants";
import { PRODUCT_KNOWLEDGE_DEPENDENCY_ID } from "../lib/product/m11/dependency-runtime/dependency.constants";
import { PRODUCT_KNOWLEDGE_FOUNDATION_ID } from "../lib/product/m11/foundation/knowledge.constants";
import { PRODUCT_KNOWLEDGE_GOVERNANCE_ID } from "../lib/product/m11/governance/governance.constants";
import { PRODUCT_KNOWLEDGE_LIFECYCLE_ID } from "../lib/product/m11/lifecycle-runtime/lifecycle.constants";
import { PRODUCT_KNOWLEDGE_POLICY_ID } from "../lib/product/m11/policy-runtime/policy.constants";
import {
  assertProductKnowledgeBaselineReleaseGatePass,
  checkProductKnowledgeBaselineReleaseGate,
} from "../lib/product/m11/verify/knowledge.baseline.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/baseline/freeze/freeze.lock.ts",
    "lib/product/m11/baseline/freeze/immutable.manifest.ts",
    "lib/product/m11/baseline/freeze/rollback.snapshot.ts",
    "lib/product/m11/baseline/index.ts",
    "lib/product/m11/verify/knowledge.baseline.gate.ts",
    "lib/product/m11/index.ts",
    "lib/product/m11/foundation/knowledge.constants.ts",
    "lib/product/m11/catalog/catalog.constants.ts",
    "lib/product/m11/dependency-runtime/dependency.constants.ts",
    "lib/product/m11/policy-runtime/policy.constants.ts",
    "lib/product/m11/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m11/governance/governance.constants.ts",
    "lib/product/m11/lifecycle-runtime/lifecycle.constants.ts",
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
    "lib/product/m11/lifecycle",
    "lib/product/m11/compliance",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_BASELINE_ID ===
      "enterprise-product-knowledge-baseline-v1",
    "knowledge baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID === PRODUCT_KNOWLEDGE_BASELINE_ID,
    "knowledge baseline alias",
  );
  check(
    PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION ===
      "product-knowledge-baseline-freeze-1",
    "knowledge freeze version",
  );
  check(
    PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE === PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
    "freeze base = knowledge lifecycle",
  );
  check(
    PRODUCT_KNOWLEDGE_FOUNDATION_ID ===
      "enterprise-product-knowledge-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_KNOWLEDGE_CATALOG_ID ===
      "enterprise-product-knowledge-catalog-v1",
    "catalog preserved",
  );
  check(
    PRODUCT_KNOWLEDGE_DEPENDENCY_ID ===
      "enterprise-product-knowledge-dependency-v1",
    "dependency preserved",
  );
  check(
    PRODUCT_KNOWLEDGE_POLICY_ID === "enterprise-product-knowledge-policy-v1",
    "policy preserved",
  );
  check(
    PRODUCT_KNOWLEDGE_COMPATIBILITY_ID ===
      "enterprise-product-knowledge-compatibility-v1",
    "compatibility preserved",
  );
  check(
    PRODUCT_KNOWLEDGE_GOVERNANCE_ID ===
      "enterprise-product-knowledge-governance-v1",
    "governance preserved",
  );
  check(
    PRODUCT_KNOWLEDGE_LIFECYCLE_ID ===
      "enterprise-product-knowledge-lifecycle-v1",
    "lifecycle preserved",
  );
  check(
    ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID ===
      "enterprise-product-ai-runtime-baseline-v1",
    "ai runtime baseline preserved",
  );
  check(isProductKnowledgeFreezeLockIntact(), "freeze lock intact");
  check(
    isProductKnowledgeImmutableManifestIntact(
      PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST,
    ),
    "immutable manifest",
  );
  check(
    isProductKnowledgeRollbackSnapshotIntact(
      PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT,
    ),
    "rollback snapshot",
  );
  check(PRODUCT_KNOWLEDGE_COMPONENT_LOCK.length === 8, "component lock count");
  check(
    PRODUCT_KNOWLEDGE_FREEZE_LOCK.runtimeBaseline ===
      ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
    "runtime baseline soft-ref",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgeBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgeBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Platform Baseline Freeze (M11-P8) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
