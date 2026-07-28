/**
 * Product M11 — P6 Knowledge Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_COMPATIBILITY_ID } from "../lib/product/m11/compatibility-runtime/compatibility.constants";
import {
  KNOWLEDGE_GOVERNANCE_APPROVALS,
  KNOWLEDGE_GOVERNANCE_BINDING_STATUSES,
  KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS,
  KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES,
  KNOWLEDGE_GOVERNANCE_RISK_LEVELS,
  KNOWLEDGE_GOVERNANCE_STANDARD_KINDS,
  KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
  PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
} from "../lib/product/m11/governance/governance.constants";
import {
  getKnowledgeGovernanceMetadata,
  isKnowledgeGovernanceMetadataIntact,
} from "../lib/product/m11/governance/governance.metadata";
import {
  assertProductKnowledgeGovernanceReleaseGatePass,
  checkProductKnowledgeGovernanceReleaseGate,
} from "../lib/product/m11/verify/knowledge.governance.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/governance/governance.constants.ts",
    "lib/product/m11/governance/governance.types.ts",
    "lib/product/m11/governance/governance.metadata.ts",
    "lib/product/m11/governance/standard.registry.ts",
    "lib/product/m11/governance/review.registry.ts",
    "lib/product/m11/governance/binding.registry.ts",
    "lib/product/m11/governance/governance.manifest.ts",
    "lib/product/m11/verify/knowledge.governance.gate.ts",
    "lib/product/m11/index.ts",
    "lib/product/m11/compatibility-runtime/compatibility.constants.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P7+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_GOVERNANCE_ID ===
      "enterprise-product-knowledge-governance-v1",
    "knowledge governance id",
  );
  check(
    PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION ===
      "product-knowledge-governance-1",
    "knowledge governance version",
  );
  check(
    PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION ===
      "product-knowledge-governance-freeze-1",
    "knowledge governance freeze",
  );
  check(
    PRODUCT_KNOWLEDGE_GOVERNANCE_BASE === PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
    "governance base = knowledge compatibility",
  );
  check(
    PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG ===
      "product-knowledge-governance-freeze-1",
    "knowledge governance freeze tag",
  );
  check(
    PRODUCT_KNOWLEDGE_COMPATIBILITY_ID ===
      "enterprise-product-knowledge-compatibility-v1",
    "knowledge compatibility preserved",
  );
  check(KNOWLEDGE_GOVERNANCE_STANDARD_KINDS.length === 4, "standard kinds");
  check(
    KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES.length === 4,
    "standard statuses",
  );
  check(KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES.length === 4, "review statuses");
  check(KNOWLEDGE_GOVERNANCE_APPROVALS.length === 4, "approvals");
  check(KNOWLEDGE_GOVERNANCE_RISK_LEVELS.length === 4, "risk levels");
  check(KNOWLEDGE_GOVERNANCE_BINDING_STATUSES.length === 3, "binding statuses");
  check(
    KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isKnowledgeGovernanceMetadataIntact(getKnowledgeGovernanceMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgeGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgeGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Governance (M11-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
