/**
 * Post-Launch P2 — Customer Success Operations verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../lib/launch/signoff/governance.freeze.lock";
import { OPERATIONS_PRODUCTION_FOUNDATION_ID } from "../lib/operations/production/production.constants";
import {
  ADOPTION_STAGES,
  CUSTOMER_HEALTH_LEVELS,
  CUSTOMER_SUCCESS_MANAGER_STATUSES,
  CUSTOMER_SUCCESS_READINESS_VERDICTS,
  OPERATIONS_CUSTOMER_SUCCESS_BASE,
  OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_ID,
  OPERATIONS_CUSTOMER_SUCCESS_VERSION,
  OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION,
  SUCCESS_STEP_STATUSES,
  SUCCESS_WORKFLOW_STEPS,
} from "../lib/operations/customer-success/success.constants";
import {
  assertOperationsP2ReleaseGatePass,
  checkOperationsP2ReleaseGate,
} from "../lib/operations/customer-success/verify/success.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/customer-success/success.constants.ts",
    "lib/operations/customer-success/success.types.ts",
    "lib/operations/customer-success/success.health.ts",
    "lib/operations/customer-success/success.adoption.ts",
    "lib/operations/customer-success/success.workflow.ts",
    "lib/operations/customer-success/success.lifecycle.ts",
    "lib/operations/customer-success/success.metrics.ts",
    "lib/operations/customer-success/success.readiness.ts",
    "lib/operations/customer-success/success.manager.ts",
    "lib/operations/customer-success/verify/success.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_CUSTOMER_SUCCESS_ID ===
      "enterprise-post-launch-p2-customer-success-operations-v1",
    "customer success id",
  );
  check(
    OPERATIONS_CUSTOMER_SUCCESS_VERSION === "operations-p2-1",
    "customer success version",
  );
  check(
    OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION ===
      "operations-customer-success-freeze-1",
    "customer success freeze",
  );
  check(
    OPERATIONS_CUSTOMER_SUCCESS_BASE === OPERATIONS_PRODUCTION_FOUNDATION_ID,
    "customer success base = p1 foundation",
  );
  check(
    OPERATIONS_PRODUCTION_FOUNDATION_ID ===
      "enterprise-post-launch-p1-production-operations-foundation-v1",
    "p1 foundation freeze preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete alias preserved",
  );
  check(
    LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
      "enterprise-launch-commercial-release-complete-v1",
    "commercial release complete preserved",
  );
  check(
    OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION ===
      "operations-p2-customer-success-operations-freeze-1",
    "p2 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(CUSTOMER_HEALTH_LEVELS.length === 5, "health levels");
  check(ADOPTION_STAGES.length === 5, "adoption stages");
  check(SUCCESS_WORKFLOW_STEPS.length === 5, "workflow steps");
  check(SUCCESS_STEP_STATUSES.length === 5, "step statuses");
  check(CUSTOMER_SUCCESS_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CUSTOMER_SUCCESS_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsP2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsP2ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Post-Launch P2 Customer Success Operations ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
