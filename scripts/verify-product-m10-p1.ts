/**
 * Product M10 — P1 AI Runtime Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AI_BASELINE_ID } from "../lib/product/m09/baseline/freeze/freeze.lock";
import {
  AI_RUNTIME_CAPABILITY_KINDS,
  AI_RUNTIME_CAPABILITY_STATUSES,
  AI_RUNTIME_DOMAIN_SCOPES,
  AI_RUNTIME_READINESS_VERDICTS,
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
  PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_FOUNDATION_ID,
  PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
  PRODUCT_AI_RUNTIME_FREEZE_TAG,
} from "../lib/product/m10/foundation/runtime.constants";
import {
  getAiRuntimeFoundationMetadata,
  isAiRuntimeFoundationMetadataIntact,
} from "../lib/product/m10/foundation/runtime.metadata";
import {
  assertProductAiRuntimeFoundationReleaseGatePass,
  checkProductAiRuntimeFoundationReleaseGate,
} from "../lib/product/m10/verify/runtime.foundation.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/foundation/runtime.constants.ts",
    "lib/product/m10/foundation/runtime.types.ts",
    "lib/product/m10/foundation/runtime.metadata.ts",
    "lib/product/m10/foundation/runtime.manifest.ts",
    "lib/product/m10/foundation/runtime.registry.ts",
    "lib/product/m10/verify/runtime.foundation.gate.ts",
    "lib/product/m10/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m10/job",
    "lib/product/m10/queue",
    "lib/product/m10/scheduler",
    "lib/product/m10/resource",
    "lib/product/m10/provider",
    "lib/product/m10/model",
    "lib/product/m10/workflow",
    "lib/product/m10/agent",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P2+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_RUNTIME_FOUNDATION_ID ===
      "enterprise-product-ai-runtime-foundation-v1",
    "ai runtime foundation id",
  );
  check(
    PRODUCT_AI_RUNTIME_FOUNDATION_VERSION === "product-ai-runtime-1",
    "ai runtime foundation version",
  );
  check(
    PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION ===
      "product-ai-runtime-foundation-freeze-1",
    "ai runtime foundation freeze",
  );
  check(
    PRODUCT_AI_RUNTIME_FOUNDATION_BASE === ENTERPRISE_PRODUCT_AI_BASELINE_ID,
    "runtime base = ai baseline",
  );
  check(
    PRODUCT_AI_RUNTIME_FREEZE_TAG ===
      "product-ai-runtime-foundation-freeze-1",
    "runtime freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_AI_BASELINE_ID ===
      "enterprise-product-ai-baseline-v1",
    "ai baseline preserved",
  );
  check(AI_RUNTIME_CAPABILITY_KINDS.length === 5, "capability kinds");
  check(AI_RUNTIME_CAPABILITY_STATUSES.length === 4, "capability statuses");
  check(AI_RUNTIME_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(AI_RUNTIME_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiRuntimeFoundationMetadataIntact(getAiRuntimeFoundationMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiRuntimeFoundationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiRuntimeFoundationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Runtime Foundation (M10-P1) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
