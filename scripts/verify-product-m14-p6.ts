/**
 * Product M14 — P6 Enterprise Intelligence Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_COMPATIBILITY_ID } from "../lib/product/m14/compatibility-runtime/compatibility.constants";
import {
  INTELLIGENCE_GOVERNANCE_APPROVALS,
  INTELLIGENCE_GOVERNANCE_BINDING_STATUSES,
  INTELLIGENCE_GOVERNANCE_READINESS_VERDICTS,
  INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES,
  INTELLIGENCE_GOVERNANCE_RISK_LEVELS,
  INTELLIGENCE_GOVERNANCE_STANDARD_KINDS,
  INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
  PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
} from "../lib/product/m14/governance/governance.constants";
import {
  getIntelligenceGovernanceMetadata,
  isIntelligenceGovernanceMetadataIntact,
} from "../lib/product/m14/governance/governance.metadata";
import {
  assertProductIntelligenceGovernanceReleaseGatePass,
  checkProductIntelligenceGovernanceReleaseGate,
} from "../lib/product/m14/verify/intelligence.governance.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/governance/governance.constants.ts",
    "lib/product/m14/governance/governance.types.ts",
    "lib/product/m14/governance/governance.metadata.ts",
    "lib/product/m14/governance/standard.registry.ts",
    "lib/product/m14/governance/review.registry.ts",
    "lib/product/m14/governance/binding.registry.ts",
    "lib/product/m14/governance/governance.manifest.ts",
    "lib/product/m14/verify/intelligence.governance.gate.ts",
    "lib/product/m14/index.ts",
    "lib/product/m14/compatibility-runtime/compatibility.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P7+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_GOVERNANCE_ID ===
      "enterprise-product-intelligence-governance-v1",
    "intelligence governance id",
  );
  check(
    PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION ===
      "product-intelligence-governance-1",
    "intelligence governance version",
  );
  check(
    PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION ===
      "product-intelligence-governance-freeze-1",
    "intelligence governance freeze",
  );
  check(
    PRODUCT_INTELLIGENCE_GOVERNANCE_BASE ===
      PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
    "intelligence governance base = intelligence compatibility",
  );
  check(
    PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG ===
      "product-intelligence-governance-freeze-1",
    "intelligence governance freeze tag",
  );
  check(
    PRODUCT_INTELLIGENCE_COMPATIBILITY_ID ===
      "enterprise-product-intelligence-compatibility-v1",
    "intelligence compatibility preserved",
  );
  check(INTELLIGENCE_GOVERNANCE_STANDARD_KINDS.length === 4, "standard kinds");
  check(
    INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES.length === 4,
    "standard statuses",
  );
  check(INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES.length === 4, "review statuses");
  check(INTELLIGENCE_GOVERNANCE_APPROVALS.length === 4, "approvals");
  check(INTELLIGENCE_GOVERNANCE_RISK_LEVELS.length === 4, "risk levels");
  check(INTELLIGENCE_GOVERNANCE_BINDING_STATUSES.length === 3, "binding statuses");
  check(
    INTELLIGENCE_GOVERNANCE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isIntelligenceGovernanceMetadataIntact(getIntelligenceGovernanceMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligenceGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligenceGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Intelligence Governance (M14-P6) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
