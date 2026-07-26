/**
 * Product M10 — P4 Scheduler verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AI_QUEUE_RUNTIME_ID } from "../lib/product/m10/queue-runtime/queue.constants";
import {
  AI_SCHEDULE_BINDING_STATUSES,
  AI_SCHEDULE_KINDS,
  AI_SCHEDULE_READINESS_VERDICTS,
  AI_SCHEDULE_STATUSES,
  AI_SCHEDULE_TRIGGER_STATUSES,
  PRODUCT_AI_SCHEDULER_BASE,
  PRODUCT_AI_SCHEDULER_FREEZE_TAG,
  PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  PRODUCT_AI_SCHEDULER_ID,
  PRODUCT_AI_SCHEDULER_VERSION,
} from "../lib/product/m10/scheduler/scheduler.constants";
import {
  getAiSchedulerMetadata,
  isAiSchedulerMetadataIntact,
} from "../lib/product/m10/scheduler/scheduler.metadata";
import {
  assertProductAiSchedulerReleaseGatePass,
  checkProductAiSchedulerReleaseGate,
} from "../lib/product/m10/verify/scheduler.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/scheduler/scheduler.constants.ts",
    "lib/product/m10/scheduler/scheduler.types.ts",
    "lib/product/m10/scheduler/scheduler.metadata.ts",
    "lib/product/m10/scheduler/schedule.registry.ts",
    "lib/product/m10/scheduler/trigger.registry.ts",
    "lib/product/m10/scheduler/binding.registry.ts",
    "lib/product/m10/scheduler/scheduler.manifest.ts",
    "lib/product/m10/verify/scheduler.gate.ts",
    "lib/product/m10/index.ts",
    "lib/product/m10/queue-runtime/queue.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m10/provider",
    "lib/product/m10/agent",
    "lib/product/m10/retry",
    "lib/product/m10/timer",
    "lib/product/m10/cron",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_SCHEDULER_ID === "enterprise-product-ai-scheduler-v1",
    "scheduler id",
  );
  check(
    PRODUCT_AI_SCHEDULER_VERSION === "product-ai-scheduler-1",
    "scheduler version",
  );
  check(
    PRODUCT_AI_SCHEDULER_FREEZE_VERSION === "product-ai-scheduler-freeze-1",
    "scheduler freeze",
  );
  check(
    PRODUCT_AI_SCHEDULER_BASE === PRODUCT_AI_QUEUE_RUNTIME_ID,
    "scheduler base = queue runtime",
  );
  check(
    PRODUCT_AI_SCHEDULER_FREEZE_TAG === "product-ai-scheduler-freeze-1",
    "scheduler freeze tag",
  );
  check(
    PRODUCT_AI_QUEUE_RUNTIME_ID === "enterprise-product-ai-queue-runtime-v1",
    "queue runtime preserved",
  );
  check(AI_SCHEDULE_KINDS.length === 4, "schedule kinds");
  check(AI_SCHEDULE_STATUSES.length === 4, "schedule statuses");
  check(AI_SCHEDULE_TRIGGER_STATUSES.length === 4, "trigger statuses");
  check(AI_SCHEDULE_BINDING_STATUSES.length === 3, "binding statuses");
  check(AI_SCHEDULE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isAiSchedulerMetadataIntact(getAiSchedulerMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiSchedulerReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiSchedulerReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Scheduler (M10-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
