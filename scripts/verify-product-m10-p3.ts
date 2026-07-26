/**
 * Product M10 — P3 Queue Runtime verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AI_JOB_RUNTIME_ID } from "../lib/product/m10/job-runtime/job.constants";
import {
  AI_QUEUE_BINDING_STATUSES,
  AI_QUEUE_CHANNEL_STATUSES,
  AI_QUEUE_KINDS,
  AI_QUEUE_READINESS_VERDICTS,
  AI_QUEUE_STATUSES,
  PRODUCT_AI_QUEUE_RUNTIME_BASE,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_QUEUE_RUNTIME_ID,
  PRODUCT_AI_QUEUE_RUNTIME_VERSION,
} from "../lib/product/m10/queue-runtime/queue.constants";
import {
  getAiQueueRuntimeMetadata,
  isAiQueueRuntimeMetadataIntact,
} from "../lib/product/m10/queue-runtime/queue.metadata";
import {
  assertProductAiQueueRuntimeReleaseGatePass,
  checkProductAiQueueRuntimeReleaseGate,
} from "../lib/product/m10/verify/queue.runtime.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/queue-runtime/queue.constants.ts",
    "lib/product/m10/queue-runtime/queue.types.ts",
    "lib/product/m10/queue-runtime/queue.metadata.ts",
    "lib/product/m10/queue-runtime/queue.registry.ts",
    "lib/product/m10/queue-runtime/channel.registry.ts",
    "lib/product/m10/queue-runtime/binding.registry.ts",
    "lib/product/m10/queue-runtime/queue.manifest.ts",
    "lib/product/m10/verify/queue.runtime.gate.ts",
    "lib/product/m10/index.ts",
    "lib/product/m10/job-runtime/job.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m10/scheduler",
    "lib/product/m10/provider",
    "lib/product/m10/agent",
    "lib/product/m10/retry",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_QUEUE_RUNTIME_ID === "enterprise-product-ai-queue-runtime-v1",
    "queue runtime id",
  );
  check(
    PRODUCT_AI_QUEUE_RUNTIME_VERSION === "product-ai-queue-runtime-1",
    "queue runtime version",
  );
  check(
    PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION ===
      "product-ai-queue-runtime-freeze-1",
    "queue runtime freeze",
  );
  check(
    PRODUCT_AI_QUEUE_RUNTIME_BASE === PRODUCT_AI_JOB_RUNTIME_ID,
    "queue base = job runtime",
  );
  check(
    PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG ===
      "product-ai-queue-runtime-freeze-1",
    "queue freeze tag",
  );
  check(
    PRODUCT_AI_JOB_RUNTIME_ID === "enterprise-product-ai-job-runtime-v1",
    "job runtime preserved",
  );
  check(AI_QUEUE_KINDS.length === 4, "queue kinds");
  check(AI_QUEUE_STATUSES.length === 4, "queue statuses");
  check(AI_QUEUE_CHANNEL_STATUSES.length === 4, "channel statuses");
  check(AI_QUEUE_BINDING_STATUSES.length === 3, "binding statuses");
  check(AI_QUEUE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiQueueRuntimeMetadataIntact(getAiQueueRuntimeMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiQueueRuntimeReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiQueueRuntimeReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Queue Runtime (M10-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
