/**
 * Product M11 — P7 Knowledge Lifecycle verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_GOVERNANCE_ID } from "../lib/product/m11/governance/governance.constants";
import {
  KNOWLEDGE_LIFECYCLE_BINDING_STATUSES,
  KNOWLEDGE_LIFECYCLE_PLAN_KINDS,
  KNOWLEDGE_LIFECYCLE_PLAN_STATUSES,
  KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS,
  KNOWLEDGE_LIFECYCLE_STATES,
  KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES,
  KNOWLEDGE_LIFECYCLE_TRIGGERS,
  PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
  PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
} from "../lib/product/m11/lifecycle-runtime/lifecycle.constants";
import {
  getKnowledgeLifecycleMetadata,
  isKnowledgeLifecycleMetadataIntact,
} from "../lib/product/m11/lifecycle-runtime/lifecycle.metadata";
import {
  assertProductKnowledgeLifecycleReleaseGatePass,
  checkProductKnowledgeLifecycleReleaseGate,
} from "../lib/product/m11/verify/knowledge.lifecycle.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/lifecycle-runtime/lifecycle.constants.ts",
    "lib/product/m11/lifecycle-runtime/lifecycle.types.ts",
    "lib/product/m11/lifecycle-runtime/lifecycle.metadata.ts",
    "lib/product/m11/lifecycle-runtime/plan.registry.ts",
    "lib/product/m11/lifecycle-runtime/transition.registry.ts",
    "lib/product/m11/lifecycle-runtime/binding.registry.ts",
    "lib/product/m11/lifecycle-runtime/lifecycle.manifest.ts",
    "lib/product/m11/verify/knowledge.lifecycle.gate.ts",
    "lib/product/m11/index.ts",
    "lib/product/m11/governance/governance.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P8+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_LIFECYCLE_ID ===
      "enterprise-product-knowledge-lifecycle-v1",
    "knowledge lifecycle id",
  );
  check(
    PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION === "product-knowledge-lifecycle-1",
    "knowledge lifecycle version",
  );
  check(
    PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION ===
      "product-knowledge-lifecycle-freeze-1",
    "knowledge lifecycle freeze",
  );
  check(
    PRODUCT_KNOWLEDGE_LIFECYCLE_BASE === PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
    "lifecycle base = knowledge governance",
  );
  check(
    PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG ===
      "product-knowledge-lifecycle-freeze-1",
    "knowledge lifecycle freeze tag",
  );
  check(
    PRODUCT_KNOWLEDGE_GOVERNANCE_ID ===
      "enterprise-product-knowledge-governance-v1",
    "knowledge governance preserved",
  );
  check(KNOWLEDGE_LIFECYCLE_PLAN_KINDS.length === 4, "plan kinds");
  check(KNOWLEDGE_LIFECYCLE_PLAN_STATUSES.length === 4, "plan statuses");
  check(KNOWLEDGE_LIFECYCLE_STATES.length === 4, "lifecycle states");
  check(
    KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES.length === 4,
    "transition statuses",
  );
  check(KNOWLEDGE_LIFECYCLE_TRIGGERS.length === 4, "triggers");
  check(KNOWLEDGE_LIFECYCLE_BINDING_STATUSES.length === 3, "binding statuses");
  check(
    KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isKnowledgeLifecycleMetadataIntact(getKnowledgeLifecycleMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgeLifecycleReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgeLifecycleReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Lifecycle (M11-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
