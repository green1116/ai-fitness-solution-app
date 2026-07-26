/**
 * Product M09 — P5 AI Orchestration verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  AI_ORCHESTRATION_KINDS,
  AI_ORCHESTRATION_READINESS_VERDICTS,
  AI_ORCHESTRATION_ROUTE_KINDS,
  AI_ORCHESTRATION_STATUSES,
  AI_ORCHESTRATION_VERSION_STATUSES,
  PRODUCT_AI_ORCHESTRATION_BASE,
  PRODUCT_AI_ORCHESTRATION_FREEZE_TAG,
  PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
  PRODUCT_AI_ORCHESTRATION_ID,
  PRODUCT_AI_ORCHESTRATION_VERSION,
} from "../lib/product/m09/orchestration/orchestration.constants";
import {
  getAiOrchestrationMetadata,
  isAiOrchestrationMetadataIntact,
} from "../lib/product/m09/orchestration/orchestration.metadata";
import {
  assertProductAiOrchestrationReleaseGatePass,
  checkProductAiOrchestrationReleaseGate,
} from "../lib/product/m09/verify/ai.orchestration.gate";
import { PRODUCT_AI_WORKFLOW_ENGINE_ID } from "../lib/product/m09/workflow-engine/workflow.constants";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/orchestration/orchestration.constants.ts",
    "lib/product/m09/orchestration/orchestration.types.ts",
    "lib/product/m09/orchestration/orchestration.metadata.ts",
    "lib/product/m09/orchestration/orchestration.registry.ts",
    "lib/product/m09/orchestration/version.registry.ts",
    "lib/product/m09/orchestration/route.registry.ts",
    "lib/product/m09/orchestration/orchestration.manifest.ts",
    "lib/product/m09/verify/ai.orchestration.gate.ts",
    "lib/product/m09/index.ts",
    "lib/product/m09/workflow-engine/workflow.constants.ts",
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
    PRODUCT_AI_ORCHESTRATION_ID === "enterprise-product-ai-orchestration-v1",
    "orchestration id",
  );
  check(
    PRODUCT_AI_ORCHESTRATION_VERSION === "product-ai-orchestration-1",
    "orchestration version",
  );
  check(
    PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION ===
      "product-ai-orchestration-freeze-1",
    "orchestration freeze",
  );
  check(
    PRODUCT_AI_ORCHESTRATION_BASE === PRODUCT_AI_WORKFLOW_ENGINE_ID,
    "orchestration base = workflow engine",
  );
  check(
    PRODUCT_AI_ORCHESTRATION_FREEZE_TAG ===
      "product-ai-orchestration-freeze-1",
    "orchestration freeze tag",
  );
  check(
    PRODUCT_AI_WORKFLOW_ENGINE_ID ===
      "enterprise-product-ai-workflow-engine-v1",
    "workflow engine preserved",
  );
  check(AI_ORCHESTRATION_KINDS.length === 4, "orchestration kinds");
  check(AI_ORCHESTRATION_STATUSES.length === 4, "orchestration statuses");
  check(AI_ORCHESTRATION_VERSION_STATUSES.length === 4, "version statuses");
  check(AI_ORCHESTRATION_ROUTE_KINDS.length === 4, "route kinds");
  check(AI_ORCHESTRATION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiOrchestrationMetadataIntact(getAiOrchestrationMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiOrchestrationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiOrchestrationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Orchestration (M09-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
