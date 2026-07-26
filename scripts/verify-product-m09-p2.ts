/**
 * Product M09 — P2 AI Model Registry verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AI_FOUNDATION_ID } from "../lib/product/m09/foundation/ai.constants";
import {
  AI_MODEL_BINDING_STATUSES,
  AI_MODEL_FAMILIES,
  AI_MODEL_READINESS_VERDICTS,
  AI_MODEL_STATUSES,
  AI_MODEL_VERSION_STATUSES,
  PRODUCT_AI_MODEL_FREEZE_TAG,
  PRODUCT_AI_MODEL_REGISTRY_BASE,
  PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  PRODUCT_AI_MODEL_REGISTRY_ID,
  PRODUCT_AI_MODEL_REGISTRY_VERSION,
} from "../lib/product/m09/model/model.constants";
import {
  getAiModelRegistryMetadata,
  isAiModelRegistryMetadataIntact,
} from "../lib/product/m09/model/model.metadata";
import {
  assertProductAiModelRegistryReleaseGatePass,
  checkProductAiModelRegistryReleaseGate,
} from "../lib/product/m09/verify/ai.model.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/model/model.constants.ts",
    "lib/product/m09/model/model.types.ts",
    "lib/product/m09/model/model.metadata.ts",
    "lib/product/m09/model/model.registry.ts",
    "lib/product/m09/model/version.registry.ts",
    "lib/product/m09/model/binding.registry.ts",
    "lib/product/m09/model/model.manifest.ts",
    "lib/product/m09/verify/ai.model.gate.ts",
    "lib/product/m09/index.ts",
    "lib/product/m09/foundation/ai.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_MODEL_REGISTRY_ID ===
      "enterprise-product-ai-model-registry-v1",
    "model registry id",
  );
  check(
    PRODUCT_AI_MODEL_REGISTRY_VERSION === "product-ai-model-1",
    "model registry version",
  );
  check(
    PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION ===
      "product-ai-model-registry-freeze-1",
    "model registry freeze",
  );
  check(
    PRODUCT_AI_MODEL_REGISTRY_BASE === PRODUCT_AI_FOUNDATION_ID,
    "model base = ai foundation",
  );
  check(
    PRODUCT_AI_MODEL_FREEZE_TAG === "product-ai-model-registry-freeze-1",
    "model freeze tag",
  );
  check(
    PRODUCT_AI_FOUNDATION_ID === "enterprise-product-ai-foundation-v1",
    "ai foundation preserved",
  );
  check(AI_MODEL_FAMILIES.length === 5, "model families");
  check(AI_MODEL_STATUSES.length === 4, "model statuses");
  check(AI_MODEL_VERSION_STATUSES.length === 4, "version statuses");
  check(AI_MODEL_BINDING_STATUSES.length === 3, "binding statuses");
  check(AI_MODEL_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiModelRegistryMetadataIntact(getAiModelRegistryMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiModelRegistryReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiModelRegistryReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Model Registry (M09-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
