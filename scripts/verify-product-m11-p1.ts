/**
 * Product M11 — P1 Knowledge Platform Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID } from "../lib/product/m10/baseline/freeze/freeze.lock";
import {
  KNOWLEDGE_ACCESS_LEVELS,
  KNOWLEDGE_DOMAIN_SCOPES,
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_ENTITY_STATUSES,
  KNOWLEDGE_GOVERNANCE_POLICY_KINDS,
  KNOWLEDGE_GOVERNANCE_POLICY_STATUSES,
  KNOWLEDGE_READINESS_VERDICTS,
  KNOWLEDGE_RETRIEVAL_MODES,
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_FOUNDATION_ID,
  PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
  PRODUCT_KNOWLEDGE_FREEZE_TAG,
} from "../lib/product/m11/foundation/knowledge.constants";
import {
  getKnowledgeFoundationMetadata,
  isKnowledgeFoundationMetadataIntact,
} from "../lib/product/m11/foundation/knowledge.metadata";
import {
  assertProductKnowledgeFoundationReleaseGatePass,
  checkProductKnowledgeFoundationReleaseGate,
} from "../lib/product/m11/verify/knowledge.foundation.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/foundation/knowledge.constants.ts",
    "lib/product/m11/foundation/knowledge.types.ts",
    "lib/product/m11/foundation/knowledge.metadata.ts",
    "lib/product/m11/foundation/knowledge.registry.ts",
    "lib/product/m11/foundation/governance.policy.ts",
    "lib/product/m11/foundation/retrieval.contract.ts",
    "lib/product/m11/foundation/knowledge.manifest.ts",
    "lib/product/m11/verify/knowledge.foundation.gate.ts",
    "lib/product/m11/index.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P2+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_FOUNDATION_ID ===
      "enterprise-product-knowledge-foundation-v1",
    "knowledge foundation id",
  );
  check(
    PRODUCT_KNOWLEDGE_FOUNDATION_VERSION === "product-knowledge-1",
    "knowledge foundation version",
  );
  check(
    PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION ===
      "product-knowledge-foundation-freeze-1",
    "knowledge foundation freeze",
  );
  check(
    PRODUCT_KNOWLEDGE_FOUNDATION_BASE ===
      ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
    "knowledge base = ai runtime baseline",
  );
  check(
    PRODUCT_KNOWLEDGE_FREEZE_TAG === "product-knowledge-foundation-freeze-1",
    "knowledge freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID ===
      "enterprise-product-ai-runtime-baseline-v1",
    "ai runtime baseline preserved",
  );
  check(KNOWLEDGE_ENTITY_KINDS.length === 6, "entity kinds");
  check(KNOWLEDGE_ENTITY_STATUSES.length === 4, "entity statuses");
  check(KNOWLEDGE_ACCESS_LEVELS.length === 4, "access levels");
  check(KNOWLEDGE_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(KNOWLEDGE_RETRIEVAL_MODES.length === 3, "retrieval modes");
  check(KNOWLEDGE_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(KNOWLEDGE_GOVERNANCE_POLICY_STATUSES.length === 3, "policy statuses");
  check(KNOWLEDGE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isKnowledgeFoundationMetadataIntact(getKnowledgeFoundationMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgeFoundationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgeFoundationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Platform Foundation (M11-P1) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
