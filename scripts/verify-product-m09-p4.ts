/**
 * Product M09 — P4 AI Workflow Engine verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AI_PROMPT_ENGINE_ID } from "../lib/product/m09/prompt-engine/prompt.constants";
import {
  assertProductAiWorkflowEngineReleaseGatePass,
  checkProductAiWorkflowEngineReleaseGate,
} from "../lib/product/m09/verify/ai.workflow.gate";
import {
  AI_WORKFLOW_KINDS,
  AI_WORKFLOW_READINESS_VERDICTS,
  AI_WORKFLOW_STATUSES,
  AI_WORKFLOW_STEP_KINDS,
  AI_WORKFLOW_VERSION_STATUSES,
  PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_WORKFLOW_ENGINE_ID,
  PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
  PRODUCT_AI_WORKFLOW_FREEZE_TAG,
} from "../lib/product/m09/workflow-engine/workflow.constants";
import {
  getAiWorkflowEngineMetadata,
  isAiWorkflowEngineMetadataIntact,
} from "../lib/product/m09/workflow-engine/workflow.metadata";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/workflow-engine/workflow.constants.ts",
    "lib/product/m09/workflow-engine/workflow.types.ts",
    "lib/product/m09/workflow-engine/workflow.metadata.ts",
    "lib/product/m09/workflow-engine/workflow.registry.ts",
    "lib/product/m09/workflow-engine/version.registry.ts",
    "lib/product/m09/workflow-engine/step.registry.ts",
    "lib/product/m09/workflow-engine/workflow.manifest.ts",
    "lib/product/m09/verify/ai.workflow.gate.ts",
    "lib/product/m09/index.ts",
    "lib/product/m09/prompt-engine/prompt.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m09/provider",
    "lib/product/m09/agent",
    "lib/product/m09/runtime",
    "lib/product/m09/workflow",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_WORKFLOW_ENGINE_ID ===
      "enterprise-product-ai-workflow-engine-v1",
    "workflow engine id",
  );
  check(
    PRODUCT_AI_WORKFLOW_ENGINE_VERSION === "product-ai-workflow-1",
    "workflow engine version",
  );
  check(
    PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION ===
      "product-ai-workflow-engine-freeze-1",
    "workflow engine freeze",
  );
  check(
    PRODUCT_AI_WORKFLOW_ENGINE_BASE === PRODUCT_AI_PROMPT_ENGINE_ID,
    "workflow base = prompt engine",
  );
  check(
    PRODUCT_AI_WORKFLOW_FREEZE_TAG === "product-ai-workflow-engine-freeze-1",
    "workflow freeze tag",
  );
  check(
    PRODUCT_AI_PROMPT_ENGINE_ID === "enterprise-product-ai-prompt-engine-v1",
    "prompt engine preserved",
  );
  check(AI_WORKFLOW_KINDS.length === 4, "workflow kinds");
  check(AI_WORKFLOW_STATUSES.length === 4, "workflow statuses");
  check(AI_WORKFLOW_VERSION_STATUSES.length === 4, "version statuses");
  check(AI_WORKFLOW_STEP_KINDS.length === 4, "step kinds");
  check(AI_WORKFLOW_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiWorkflowEngineMetadataIntact(getAiWorkflowEngineMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiWorkflowEngineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiWorkflowEngineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Workflow Engine (M09-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
