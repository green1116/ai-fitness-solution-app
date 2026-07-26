/**
 * Product M10 — P5 Resource Manager verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  AI_RESOURCE_BINDING_STATUSES,
  AI_RESOURCE_KINDS,
  AI_RESOURCE_QUOTA_STATUSES,
  AI_RESOURCE_READINESS_VERDICTS,
  AI_RESOURCE_STATUSES,
  PRODUCT_AI_RESOURCE_MANAGER_BASE,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
  PRODUCT_AI_RESOURCE_MANAGER_ID,
  PRODUCT_AI_RESOURCE_MANAGER_VERSION,
} from "../lib/product/m10/resource-manager/resource.constants";
import {
  getAiResourceManagerMetadata,
  isAiResourceManagerMetadataIntact,
} from "../lib/product/m10/resource-manager/resource.metadata";
import { PRODUCT_AI_SCHEDULER_ID } from "../lib/product/m10/scheduler/scheduler.constants";
import {
  assertProductAiResourceManagerReleaseGatePass,
  checkProductAiResourceManagerReleaseGate,
} from "../lib/product/m10/verify/resource.manager.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/resource-manager/resource.constants.ts",
    "lib/product/m10/resource-manager/resource.types.ts",
    "lib/product/m10/resource-manager/resource.metadata.ts",
    "lib/product/m10/resource-manager/resource.registry.ts",
    "lib/product/m10/resource-manager/quota.registry.ts",
    "lib/product/m10/resource-manager/binding.registry.ts",
    "lib/product/m10/resource-manager/resource.manifest.ts",
    "lib/product/m10/verify/resource.manager.gate.ts",
    "lib/product/m10/index.ts",
    "lib/product/m10/scheduler/scheduler.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m10/provider",
    "lib/product/m10/agent",
    "lib/product/m10/retry",
    "lib/product/m10/autoscaling",
    "lib/product/m10/monitoring",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_RESOURCE_MANAGER_ID ===
      "enterprise-product-ai-resource-manager-v1",
    "resource manager id",
  );
  check(
    PRODUCT_AI_RESOURCE_MANAGER_VERSION === "product-ai-resource-manager-1",
    "resource manager version",
  );
  check(
    PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION ===
      "product-ai-resource-manager-freeze-1",
    "resource manager freeze",
  );
  check(
    PRODUCT_AI_RESOURCE_MANAGER_BASE === PRODUCT_AI_SCHEDULER_ID,
    "resource base = scheduler",
  );
  check(
    PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG ===
      "product-ai-resource-manager-freeze-1",
    "resource freeze tag",
  );
  check(
    PRODUCT_AI_SCHEDULER_ID === "enterprise-product-ai-scheduler-v1",
    "scheduler preserved",
  );
  check(AI_RESOURCE_KINDS.length === 5, "resource kinds");
  check(AI_RESOURCE_STATUSES.length === 4, "resource statuses");
  check(AI_RESOURCE_QUOTA_STATUSES.length === 4, "quota statuses");
  check(AI_RESOURCE_BINDING_STATUSES.length === 3, "binding statuses");
  check(AI_RESOURCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiResourceManagerMetadataIntact(getAiResourceManagerMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiResourceManagerReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiResourceManagerReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Resource Manager (M10-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
