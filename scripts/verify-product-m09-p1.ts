/**
 * Product M09 — P1 AI Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID } from "../lib/product/marketplace-baseline/freeze/freeze.lock";
import {
  AI_CAPABILITY_KINDS,
  AI_CAPABILITY_STATUSES,
  AI_DOMAIN_SCOPES,
  AI_READINESS_VERDICTS,
  PRODUCT_AI_FOUNDATION_BASE,
  PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_FOUNDATION_ID,
  PRODUCT_AI_FOUNDATION_VERSION,
  PRODUCT_AI_FREEZE_TAG,
} from "../lib/product/m09/foundation/ai.constants";
import {
  getAiFoundationMetadata,
  isAiFoundationMetadataIntact,
} from "../lib/product/m09/foundation/ai.metadata";
import {
  assertProductAiFoundationReleaseGatePass,
  checkProductAiFoundationReleaseGate,
} from "../lib/product/m09/verify/ai.foundation.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/foundation/ai.constants.ts",
    "lib/product/m09/foundation/ai.types.ts",
    "lib/product/m09/foundation/ai.metadata.ts",
    "lib/product/m09/foundation/ai.manifest.ts",
    "lib/product/m09/foundation/ai.registry.ts",
    "lib/product/m09/verify/ai.foundation.gate.ts",
    "lib/product/m09/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m09/provider",
    "lib/product/m09/prompt",
    "lib/product/m09/workflow",
    "lib/product/m09/agent",
    "lib/product/m09/runtime",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P2+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_FOUNDATION_ID === "enterprise-product-ai-foundation-v1",
    "ai foundation id",
  );
  check(
    PRODUCT_AI_FOUNDATION_VERSION === "product-ai-1",
    "ai foundation version",
  );
  check(
    PRODUCT_AI_FOUNDATION_FREEZE_VERSION === "product-ai-foundation-freeze-1",
    "ai foundation freeze",
  );
  check(
    PRODUCT_AI_FOUNDATION_BASE === ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
    "ai base = marketplace baseline",
  );
  check(
    PRODUCT_AI_FREEZE_TAG === "product-ai-foundation-freeze-1",
    "ai freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID ===
      "enterprise-product-marketplace-baseline-v1",
    "marketplace baseline preserved",
  );
  check(AI_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(AI_CAPABILITY_STATUSES.length === 4, "capability statuses");
  check(AI_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(AI_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isAiFoundationMetadataIntact(getAiFoundationMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiFoundationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiFoundationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Foundation (M09-P1) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
