/**
 * Product M09 — P3 AI Prompt Engine verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AI_MODEL_REGISTRY_ID } from "../lib/product/m09/model/model.constants";
import {
  AI_PROMPT_BINDING_STATUSES,
  AI_PROMPT_KINDS,
  AI_PROMPT_READINESS_VERDICTS,
  AI_PROMPT_STATUSES,
  AI_PROMPT_VERSION_STATUSES,
  PRODUCT_AI_PROMPT_ENGINE_BASE,
  PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_PROMPT_ENGINE_ID,
  PRODUCT_AI_PROMPT_ENGINE_VERSION,
  PRODUCT_AI_PROMPT_FREEZE_TAG,
} from "../lib/product/m09/prompt-engine/prompt.constants";
import {
  getAiPromptEngineMetadata,
  isAiPromptEngineMetadataIntact,
} from "../lib/product/m09/prompt-engine/prompt.metadata";
import {
  assertProductAiPromptEngineReleaseGatePass,
  checkProductAiPromptEngineReleaseGate,
} from "../lib/product/m09/verify/ai.prompt.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/prompt-engine/prompt.constants.ts",
    "lib/product/m09/prompt-engine/prompt.types.ts",
    "lib/product/m09/prompt-engine/prompt.metadata.ts",
    "lib/product/m09/prompt-engine/prompt.registry.ts",
    "lib/product/m09/prompt-engine/version.registry.ts",
    "lib/product/m09/prompt-engine/binding.registry.ts",
    "lib/product/m09/prompt-engine/prompt.manifest.ts",
    "lib/product/m09/verify/ai.prompt.gate.ts",
    "lib/product/m09/index.ts",
    "lib/product/m09/model/model.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m09/provider",
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
    PRODUCT_AI_PROMPT_ENGINE_ID === "enterprise-product-ai-prompt-engine-v1",
    "prompt engine id",
  );
  check(
    PRODUCT_AI_PROMPT_ENGINE_VERSION === "product-ai-prompt-1",
    "prompt engine version",
  );
  check(
    PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION ===
      "product-ai-prompt-engine-freeze-1",
    "prompt engine freeze",
  );
  check(
    PRODUCT_AI_PROMPT_ENGINE_BASE === PRODUCT_AI_MODEL_REGISTRY_ID,
    "prompt base = model registry",
  );
  check(
    PRODUCT_AI_PROMPT_FREEZE_TAG === "product-ai-prompt-engine-freeze-1",
    "prompt freeze tag",
  );
  check(
    PRODUCT_AI_MODEL_REGISTRY_ID ===
      "enterprise-product-ai-model-registry-v1",
    "model registry preserved",
  );
  check(AI_PROMPT_KINDS.length === 5, "prompt kinds");
  check(AI_PROMPT_STATUSES.length === 4, "prompt statuses");
  check(AI_PROMPT_VERSION_STATUSES.length === 4, "version statuses");
  check(AI_PROMPT_BINDING_STATUSES.length === 3, "binding statuses");
  check(AI_PROMPT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiPromptEngineMetadataIntact(getAiPromptEngineMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiPromptEngineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiPromptEngineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Prompt Engine (M09-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
