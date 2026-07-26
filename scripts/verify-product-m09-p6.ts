/**
 * Product M09 — P6 AI Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  AI_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_GOVERNANCE_POLICY_KINDS,
  AI_GOVERNANCE_POLICY_STATUSES,
  AI_GOVERNANCE_READINESS_VERDICTS,
  AI_GOVERNANCE_REVIEW_VERDICTS,
  AI_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_GOVERNANCE_BASE,
  PRODUCT_AI_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_GOVERNANCE_ID,
  PRODUCT_AI_GOVERNANCE_VERSION,
} from "../lib/product/m09/governance/governance.constants";
import {
  getAiGovernanceMetadata,
  isAiGovernanceMetadataIntact,
} from "../lib/product/m09/governance/governance.metadata";
import { PRODUCT_AI_ORCHESTRATION_ID } from "../lib/product/m09/orchestration/orchestration.constants";
import {
  assertProductAiGovernanceReleaseGatePass,
  checkProductAiGovernanceReleaseGate,
} from "../lib/product/m09/verify/ai.governance.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/governance/governance.constants.ts",
    "lib/product/m09/governance/governance.types.ts",
    "lib/product/m09/governance/governance.metadata.ts",
    "lib/product/m09/governance/policy.registry.ts",
    "lib/product/m09/governance/standard.registry.ts",
    "lib/product/m09/governance/review.registry.ts",
    "lib/product/m09/governance/compliance.registry.ts",
    "lib/product/m09/governance/governance.manifest.ts",
    "lib/product/m09/verify/ai.governance.gate.ts",
    "lib/product/m09/index.ts",
    "lib/product/m09/orchestration/orchestration.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m09/provider",
    "lib/product/m09/agent",
    "lib/product/m09/runtime",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_GOVERNANCE_ID === "enterprise-product-ai-governance-v1",
    "ai governance id",
  );
  check(
    PRODUCT_AI_GOVERNANCE_VERSION === "product-ai-governance-1",
    "ai governance version",
  );
  check(
    PRODUCT_AI_GOVERNANCE_FREEZE_VERSION === "product-ai-governance-freeze-1",
    "ai governance freeze",
  );
  check(
    PRODUCT_AI_GOVERNANCE_BASE === PRODUCT_AI_ORCHESTRATION_ID,
    "governance base = orchestration",
  );
  check(
    PRODUCT_AI_GOVERNANCE_FREEZE_TAG === "product-ai-governance-freeze-1",
    "governance freeze tag",
  );
  check(
    PRODUCT_AI_ORCHESTRATION_ID === "enterprise-product-ai-orchestration-v1",
    "orchestration preserved",
  );
  check(AI_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(AI_GOVERNANCE_POLICY_STATUSES.length === 3, "policy statuses");
  check(AI_GOVERNANCE_STANDARD_LEVELS.length === 3, "standard levels");
  check(AI_GOVERNANCE_REVIEW_VERDICTS.length === 3, "review verdicts");
  check(AI_GOVERNANCE_COMPLIANCE_VERDICTS.length === 3, "compliance verdicts");
  check(AI_GOVERNANCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isAiGovernanceMetadataIntact(getAiGovernanceMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Governance (M09-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
