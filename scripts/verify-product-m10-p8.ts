/**
 * Product M10 — P8 Runtime Governance Freeze verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AI_BASELINE_ID } from "../lib/product/m09/baseline/freeze/freeze.lock";
import {
  ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  isProductAiRuntimeFreezeLockIntact,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_COMPONENT_LOCK,
  PRODUCT_AI_RUNTIME_FREEZE_LOCK,
} from "../lib/product/m10/baseline/freeze/freeze.lock";
import {
  isProductAiRuntimeImmutableManifestIntact,
  PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST,
} from "../lib/product/m10/baseline/freeze/immutable.manifest";
import {
  isProductAiRuntimeRollbackSnapshotIntact,
  PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT,
} from "../lib/product/m10/baseline/freeze/rollback.snapshot";
import { PRODUCT_AI_RUNTIME_FOUNDATION_ID } from "../lib/product/m10/foundation/runtime.constants";
import { PRODUCT_AI_JOB_RUNTIME_ID } from "../lib/product/m10/job-runtime/job.constants";
import { PRODUCT_AI_QUEUE_RUNTIME_ID } from "../lib/product/m10/queue-runtime/queue.constants";
import { PRODUCT_AI_RESOURCE_MANAGER_ID } from "../lib/product/m10/resource-manager/resource.constants";
import { PRODUCT_AI_RUNTIME_AUDIT_ID } from "../lib/product/m10/runtime-audit/audit.constants";
import { PRODUCT_AI_RUNTIME_GOVERNANCE_ID } from "../lib/product/m10/runtime-governance/governance.constants";
import { PRODUCT_AI_SCHEDULER_ID } from "../lib/product/m10/scheduler/scheduler.constants";
import {
  assertProductAiRuntimeBaselineReleaseGatePass,
  checkProductAiRuntimeBaselineReleaseGate,
} from "../lib/product/m10/verify/runtime.baseline.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/baseline/freeze/freeze.lock.ts",
    "lib/product/m10/baseline/freeze/immutable.manifest.ts",
    "lib/product/m10/baseline/freeze/rollback.snapshot.ts",
    "lib/product/m10/baseline/index.ts",
    "lib/product/m10/verify/runtime.baseline.gate.ts",
    "lib/product/m10/index.ts",
    "lib/product/m10/foundation/runtime.constants.ts",
    "lib/product/m10/job-runtime/job.constants.ts",
    "lib/product/m10/queue-runtime/queue.constants.ts",
    "lib/product/m10/scheduler/scheduler.constants.ts",
    "lib/product/m10/resource-manager/resource.constants.ts",
    "lib/product/m10/runtime-governance/governance.constants.ts",
    "lib/product/m10/runtime-audit/audit.constants.ts",
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
    PRODUCT_AI_RUNTIME_BASELINE_ID ===
      "enterprise-product-ai-runtime-baseline-v1",
    "runtime baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID ===
      PRODUCT_AI_RUNTIME_BASELINE_ID,
    "runtime baseline alias",
  );
  check(
    PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION ===
      "product-ai-runtime-baseline-freeze-1",
    "runtime freeze version",
  );
  check(
    PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE === PRODUCT_AI_RUNTIME_AUDIT_ID,
    "freeze base = runtime audit",
  );
  check(
    PRODUCT_AI_RUNTIME_FOUNDATION_ID ===
      "enterprise-product-ai-runtime-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_AI_JOB_RUNTIME_ID === "enterprise-product-ai-job-runtime-v1",
    "job preserved",
  );
  check(
    PRODUCT_AI_QUEUE_RUNTIME_ID === "enterprise-product-ai-queue-runtime-v1",
    "queue preserved",
  );
  check(
    PRODUCT_AI_SCHEDULER_ID === "enterprise-product-ai-scheduler-v1",
    "scheduler preserved",
  );
  check(
    PRODUCT_AI_RESOURCE_MANAGER_ID ===
      "enterprise-product-ai-resource-manager-v1",
    "resource manager preserved",
  );
  check(
    PRODUCT_AI_RUNTIME_GOVERNANCE_ID ===
      "enterprise-product-ai-runtime-governance-v1",
    "runtime governance preserved",
  );
  check(
    PRODUCT_AI_RUNTIME_AUDIT_ID === "enterprise-product-ai-runtime-audit-v1",
    "runtime audit preserved",
  );
  check(
    ENTERPRISE_PRODUCT_AI_BASELINE_ID === "enterprise-product-ai-baseline-v1",
    "ai baseline preserved",
  );
  check(PRODUCT_AI_RUNTIME_COMPONENT_LOCK.length === 8, "components");
  check(isProductAiRuntimeFreezeLockIntact(), "freeze lock intact");
  check(
    isProductAiRuntimeImmutableManifestIntact(
      PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST,
    ),
    "immutable manifest intact",
  );
  check(
    isProductAiRuntimeRollbackSnapshotIntact(
      PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT,
    ),
    "rollback snapshot intact",
  );
  check(PRODUCT_AI_RUNTIME_FREEZE_LOCK.readOnly === true, "read-only");
  check(
    PRODUCT_AI_RUNTIME_FREEZE_LOCK.noNewCapability === true,
    "no new capability",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiRuntimeBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiRuntimeBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Runtime Governance Freeze (M10-P8) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
