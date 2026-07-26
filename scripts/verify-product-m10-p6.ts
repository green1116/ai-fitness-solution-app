/**
 * Product M10 — P6 Runtime Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AI_RESOURCE_MANAGER_ID } from "../lib/product/m10/resource-manager/resource.constants";
import {
  AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_RUNTIME_GOVERNANCE_POLICY_KINDS,
  AI_RUNTIME_GOVERNANCE_POLICY_STATUSES,
  AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS,
  AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS,
  AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
  PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
} from "../lib/product/m10/runtime-governance/governance.constants";
import {
  getAiRuntimeGovernanceMetadata,
  isAiRuntimeGovernanceMetadataIntact,
} from "../lib/product/m10/runtime-governance/governance.metadata";
import {
  assertProductAiRuntimeGovernanceReleaseGatePass,
  checkProductAiRuntimeGovernanceReleaseGate,
} from "../lib/product/m10/verify/runtime.governance.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/runtime-governance/governance.constants.ts",
    "lib/product/m10/runtime-governance/governance.types.ts",
    "lib/product/m10/runtime-governance/governance.metadata.ts",
    "lib/product/m10/runtime-governance/policy.registry.ts",
    "lib/product/m10/runtime-governance/standard.registry.ts",
    "lib/product/m10/runtime-governance/review.registry.ts",
    "lib/product/m10/runtime-governance/compliance.registry.ts",
    "lib/product/m10/runtime-governance/governance.manifest.ts",
    "lib/product/m10/verify/runtime.governance.gate.ts",
    "lib/product/m10/index.ts",
    "lib/product/m10/resource-manager/resource.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m10/provider",
    "lib/product/m10/agent",
    "lib/product/m10/retry",
    "lib/product/m10/autoscaling",
    "lib/product/m10/monitoring",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_RUNTIME_GOVERNANCE_ID ===
      "enterprise-product-ai-runtime-governance-v1",
    "runtime governance id",
  );
  check(
    PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION ===
      "product-ai-runtime-governance-1",
    "runtime governance version",
  );
  check(
    PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION ===
      "product-ai-runtime-governance-freeze-1",
    "runtime governance freeze",
  );
  check(
    PRODUCT_AI_RUNTIME_GOVERNANCE_BASE === PRODUCT_AI_RESOURCE_MANAGER_ID,
    "governance base = resource manager",
  );
  check(
    PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG ===
      "product-ai-runtime-governance-freeze-1",
    "governance freeze tag",
  );
  check(
    PRODUCT_AI_RESOURCE_MANAGER_ID ===
      "enterprise-product-ai-resource-manager-v1",
    "resource manager preserved",
  );
  check(AI_RUNTIME_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(AI_RUNTIME_GOVERNANCE_POLICY_STATUSES.length === 3, "policy statuses");
  check(AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS.length === 3, "standard levels");
  check(AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS.length === 3, "review verdicts");
  check(
    AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS.length === 3,
    "compliance verdicts",
  );
  check(
    AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isAiRuntimeGovernanceMetadataIntact(getAiRuntimeGovernanceMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiRuntimeGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiRuntimeGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Runtime Governance (M10-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
