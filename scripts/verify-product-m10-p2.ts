/**
 * Product M10 — P2 Job Runtime verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AI_RUNTIME_FOUNDATION_ID } from "../lib/product/m10/foundation/runtime.constants";
import {
  AI_JOB_BINDING_STATUSES,
  AI_JOB_KINDS,
  AI_JOB_READINESS_VERDICTS,
  AI_JOB_STATUSES,
  AI_JOB_STEP_STATUSES,
  PRODUCT_AI_JOB_RUNTIME_BASE,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_JOB_RUNTIME_ID,
  PRODUCT_AI_JOB_RUNTIME_VERSION,
} from "../lib/product/m10/job-runtime/job.constants";
import {
  getAiJobRuntimeMetadata,
  isAiJobRuntimeMetadataIntact,
} from "../lib/product/m10/job-runtime/job.metadata";
import {
  assertProductAiJobRuntimeReleaseGatePass,
  checkProductAiJobRuntimeReleaseGate,
} from "../lib/product/m10/verify/job.runtime.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/job-runtime/job.constants.ts",
    "lib/product/m10/job-runtime/job.types.ts",
    "lib/product/m10/job-runtime/job.metadata.ts",
    "lib/product/m10/job-runtime/job.registry.ts",
    "lib/product/m10/job-runtime/step.registry.ts",
    "lib/product/m10/job-runtime/binding.registry.ts",
    "lib/product/m10/job-runtime/job.manifest.ts",
    "lib/product/m10/verify/job.runtime.gate.ts",
    "lib/product/m10/index.ts",
    "lib/product/m10/foundation/runtime.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m10/queue",
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
    PRODUCT_AI_JOB_RUNTIME_ID === "enterprise-product-ai-job-runtime-v1",
    "job runtime id",
  );
  check(
    PRODUCT_AI_JOB_RUNTIME_VERSION === "product-ai-job-runtime-1",
    "job runtime version",
  );
  check(
    PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION ===
      "product-ai-job-runtime-freeze-1",
    "job runtime freeze",
  );
  check(
    PRODUCT_AI_JOB_RUNTIME_BASE === PRODUCT_AI_RUNTIME_FOUNDATION_ID,
    "job base = runtime foundation",
  );
  check(
    PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG === "product-ai-job-runtime-freeze-1",
    "job freeze tag",
  );
  check(
    PRODUCT_AI_RUNTIME_FOUNDATION_ID ===
      "enterprise-product-ai-runtime-foundation-v1",
    "runtime foundation preserved",
  );
  check(AI_JOB_KINDS.length === 4, "job kinds");
  check(AI_JOB_STATUSES.length === 4, "job statuses");
  check(AI_JOB_STEP_STATUSES.length === 4, "step statuses");
  check(AI_JOB_BINDING_STATUSES.length === 3, "binding statuses");
  check(AI_JOB_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isAiJobRuntimeMetadataIntact(getAiJobRuntimeMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiJobRuntimeReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiJobRuntimeReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Job Runtime (M10-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
