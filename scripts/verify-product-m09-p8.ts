/**
 * Product M09 — P8 AI Governance Freeze verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID } from "../lib/product/marketplace-baseline/freeze/freeze.lock";
import { PRODUCT_AI_AUDIT_ID } from "../lib/product/m09/audit/audit.constants";
import {
  ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  isProductAiFreezeLockIntact,
  PRODUCT_AI_BASELINE_FREEZE_BASE,
  PRODUCT_AI_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_COMPONENT_LOCK,
  PRODUCT_AI_FREEZE_LOCK,
} from "../lib/product/m09/baseline/freeze/freeze.lock";
import {
  isProductAiImmutableManifestIntact,
  PRODUCT_AI_IMMUTABLE_MANIFEST,
} from "../lib/product/m09/baseline/freeze/immutable.manifest";
import {
  isProductAiRollbackSnapshotIntact,
  PRODUCT_AI_ROLLBACK_SNAPSHOT,
} from "../lib/product/m09/baseline/freeze/rollback.snapshot";
import { PRODUCT_AI_FOUNDATION_ID } from "../lib/product/m09/foundation/ai.constants";
import { PRODUCT_AI_GOVERNANCE_ID } from "../lib/product/m09/governance/governance.constants";
import { PRODUCT_AI_MODEL_REGISTRY_ID } from "../lib/product/m09/model/model.constants";
import { PRODUCT_AI_ORCHESTRATION_ID } from "../lib/product/m09/orchestration/orchestration.constants";
import { PRODUCT_AI_PROMPT_ENGINE_ID } from "../lib/product/m09/prompt-engine/prompt.constants";
import {
  assertProductAiBaselineReleaseGatePass,
  checkProductAiBaselineReleaseGate,
} from "../lib/product/m09/verify/ai.baseline.gate";
import { PRODUCT_AI_WORKFLOW_ENGINE_ID } from "../lib/product/m09/workflow-engine/workflow.constants";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/baseline/freeze/freeze.lock.ts",
    "lib/product/m09/baseline/freeze/immutable.manifest.ts",
    "lib/product/m09/baseline/freeze/rollback.snapshot.ts",
    "lib/product/m09/baseline/index.ts",
    "lib/product/m09/verify/ai.baseline.gate.ts",
    "lib/product/m09/index.ts",
    "lib/product/m09/foundation/ai.constants.ts",
    "lib/product/m09/model/model.constants.ts",
    "lib/product/m09/prompt-engine/prompt.constants.ts",
    "lib/product/m09/workflow-engine/workflow.constants.ts",
    "lib/product/m09/orchestration/orchestration.constants.ts",
    "lib/product/m09/governance/governance.constants.ts",
    "lib/product/m09/audit/audit.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m09/provider",
    "lib/product/m09/agent",
    "lib/product/m09/runtime",
    "lib/product/m09/monitoring",
    "lib/product/m09/tool",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_BASELINE_ID === "enterprise-product-ai-baseline-v1",
    "ai baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_AI_BASELINE_ID === PRODUCT_AI_BASELINE_ID,
    "ai baseline alias",
  );
  check(
    PRODUCT_AI_BASELINE_FREEZE_VERSION === "product-ai-baseline-freeze-1",
    "ai freeze version",
  );
  check(
    PRODUCT_AI_BASELINE_FREEZE_BASE === PRODUCT_AI_AUDIT_ID,
    "freeze base = ai audit",
  );
  check(
    PRODUCT_AI_FOUNDATION_ID === "enterprise-product-ai-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_AI_MODEL_REGISTRY_ID === "enterprise-product-ai-model-registry-v1",
    "model preserved",
  );
  check(
    PRODUCT_AI_PROMPT_ENGINE_ID === "enterprise-product-ai-prompt-engine-v1",
    "prompt preserved",
  );
  check(
    PRODUCT_AI_WORKFLOW_ENGINE_ID ===
      "enterprise-product-ai-workflow-engine-v1",
    "workflow preserved",
  );
  check(
    PRODUCT_AI_ORCHESTRATION_ID === "enterprise-product-ai-orchestration-v1",
    "orchestration preserved",
  );
  check(
    PRODUCT_AI_GOVERNANCE_ID === "enterprise-product-ai-governance-v1",
    "governance preserved",
  );
  check(
    PRODUCT_AI_AUDIT_ID === "enterprise-product-ai-audit-v1",
    "audit preserved",
  );
  check(
    ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID ===
      "enterprise-product-marketplace-baseline-v1",
    "marketplace baseline preserved",
  );
  check(PRODUCT_AI_COMPONENT_LOCK.length === 8, "components");
  check(isProductAiFreezeLockIntact(), "freeze lock intact");
  check(
    isProductAiImmutableManifestIntact(PRODUCT_AI_IMMUTABLE_MANIFEST),
    "immutable manifest intact",
  );
  check(
    isProductAiRollbackSnapshotIntact(PRODUCT_AI_ROLLBACK_SNAPSHOT),
    "rollback snapshot intact",
  );
  check(PRODUCT_AI_FREEZE_LOCK.readOnly === true, "read-only");
  check(PRODUCT_AI_FREEZE_LOCK.noNewCapability === true, "no new capability");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Governance Freeze (M09-P8) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
