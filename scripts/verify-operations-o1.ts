/**
 * Operations O1 — Customer Success Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../lib/launch/readiness/l5/freeze/freeze.lock";
import {
  CUSTOMER_STATUSES,
  FEEDBACK_CHANNELS,
  HEALTH_BANDS,
  O1_MANAGER_STATUSES,
  O1_READINESS_VERDICTS,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
  OPERATIONS_O1_SUCCESS_FREEZE_VERSION,
  RENEWAL_STATUSES,
  SUCCESS_PLAN_STATUSES,
} from "../lib/operations/o1/success/success.constants";
import {
  assertOperationsO1ReleaseGatePass,
  checkOperationsO1ReleaseGate,
} from "../lib/operations/o1/verify/operations.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/o1/customer/customer.types.ts",
    "lib/operations/o1/customer/customer.registry.ts",
    "lib/operations/o1/health/health.types.ts",
    "lib/operations/o1/health/health.metrics.ts",
    "lib/operations/o1/health/health.score.ts",
    "lib/operations/o1/success/success.constants.ts",
    "lib/operations/o1/success/success.types.ts",
    "lib/operations/o1/success/success.plan.ts",
    "lib/operations/o1/success/success.tracking.ts",
    "lib/operations/o1/feedback/feedback.types.ts",
    "lib/operations/o1/feedback/feedback.collector.ts",
    "lib/operations/o1/feedback/feedback.analysis.ts",
    "lib/operations/o1/renewal/renewal.types.ts",
    "lib/operations/o1/renewal/renewal.status.ts",
    "lib/operations/o1/renewal/renewal.readiness.ts",
    "lib/operations/o1/success.manager.ts",
    "lib/operations/o1/verify/operations.release.gate.ts",
    "lib/operations/o1/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID ===
      "enterprise-operations-o1-customer-success-foundation-v1",
    "o1 customer success foundation id",
  );
  check(
    OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION === "operations-o1-1",
    "o1 customer success foundation version",
  );
  check(
    OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION ===
      "operations-o1-customer-success-foundation-freeze-1",
    "o1 customer success foundation freeze",
  );
  check(
    OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE ===
      "enterprise-launch-v1-release",
    "o1 base = launch v1 release",
  );
  check(
    OPERATIONS_O1_SUCCESS_FREEZE_VERSION ===
      "operations-o1-customer-success-foundation-freeze-1",
    "o1 freeze tag",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(CUSTOMER_STATUSES.length === 4, "customer statuses");
  check(HEALTH_BANDS.length === 5, "health bands");
  check(SUCCESS_PLAN_STATUSES.length === 4, "success plan statuses");
  check(FEEDBACK_CHANNELS.length === 4, "feedback channels");
  check(RENEWAL_STATUSES.length === 5, "renewal statuses");
  check(O1_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(O1_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsO1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsO1ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Operations O1 Customer Success Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
