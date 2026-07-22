/**
 * Post-Launch P1 — Production Operations Foundation verification
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
import {
  OPERATION_CHECKLIST_IDS,
  OPERATIONS_MANAGER_STATUSES,
  OPERATIONS_P1_PRODUCTION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_BASE,
  OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_ID,
  OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
  OPERATIONS_READINESS_VERDICTS,
  OPERATIONAL_STATUS_LEVELS,
  PRODUCTION_OPERATION_STATUSES,
} from "../lib/operations/production/production.constants";
import {
  assertOperationsP1ReleaseGatePass,
  checkOperationsP1ReleaseGate,
} from "../lib/operations/production/verify/production.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/production/production.constants.ts",
    "lib/operations/production/production.types.ts",
    "lib/operations/production/production.operation.ts",
    "lib/operations/production/production.status.ts",
    "lib/operations/production/production.dashboard.ts",
    "lib/operations/production/production.checklist.ts",
    "lib/operations/production/production.metrics.ts",
    "lib/operations/production/production.readiness.ts",
    "lib/operations/production/production.manager.ts",
    "lib/operations/production/verify/production.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_PRODUCTION_FOUNDATION_ID ===
      "enterprise-post-launch-p1-production-operations-foundation-v1",
    "operations id",
  );
  check(
    OPERATIONS_PRODUCTION_FOUNDATION_VERSION === "operations-p1-1",
    "operations version",
  );
  check(
    OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION ===
      "operations-production-foundation-freeze-1",
    "operations freeze",
  );
  check(
    OPERATIONS_PRODUCTION_FOUNDATION_BASE === ENTERPRISE_LAUNCH_COMPLETE_ID,
    "operations base = launch complete alias",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete alias",
  );
  check(
    LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
      "enterprise-launch-commercial-release-complete-v1",
    "commercial release complete preserved",
  );
  check(
    OPERATIONS_P1_PRODUCTION_FREEZE_VERSION ===
      "operations-p1-production-operations-foundation-freeze-1",
    "p1 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PRODUCTION_OPERATION_STATUSES.length === 5, "operation statuses");
  check(OPERATIONAL_STATUS_LEVELS.length === 5, "status levels");
  check(OPERATION_CHECKLIST_IDS.length === 6, "checklist ids");
  check(OPERATIONS_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(OPERATIONS_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ version constants");
}

function testOperationsStack() {
  const gate = checkOperationsP1ReleaseGate();
  check(gate.result === "PASS", `stack: ${gate.summary}`);
  check(gate.failCount === 0, "stack failCount 0");
  const stack = gate.checks.find((c) => c.id === "OPS-P1-STACK");
  check(!!stack && stack.ok, `stack detail: ${stack?.detail ?? "missing"}`);
  console.log(
    "✓ operation / status / checklist / health / metrics / readiness",
  );
}

function testSignoff() {
  const gate = checkOperationsP1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertOperationsP1ReleaseGatePass(gate);
  console.log("✓ production operations release gate");
}

function main() {
  console.log("Post-Launch P1 Production Operations Foundation verify");
  checkModules();
  checkConstants();
  testOperationsStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
