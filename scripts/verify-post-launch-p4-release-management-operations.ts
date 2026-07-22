/**
 * Post-Launch P4 — Release Management Operations verification
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
import { OPERATIONS_INCIDENT_RESPONSE_ID } from "../lib/operations/incident/incident.constants";
import {
  DEPLOYMENT_APPROVAL_STATUSES,
  OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_BASE,
  OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_ID,
  OPERATIONS_RELEASE_MANAGEMENT_VERSION,
  RELEASE_LIFECYCLE_STATUSES,
  RELEASE_MANAGER_STATUSES,
  RELEASE_READINESS_VERDICTS,
  RELEASE_VERSION_KINDS,
  ROLLBACK_WORKFLOW_STEPS,
} from "../lib/operations/release/release.constants";
import {
  assertOperationsP4ReleaseGatePass,
  checkOperationsP4ReleaseGate,
} from "../lib/operations/release/verify/release.management.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/release/release.constants.ts",
    "lib/operations/release/release.types.ts",
    "lib/operations/release/release.lifecycle.ts",
    "lib/operations/release/release.version.ts",
    "lib/operations/release/release.approval.ts",
    "lib/operations/release/release.rollback.ts",
    "lib/operations/release/release.metrics.ts",
    "lib/operations/release/release.readiness.ts",
    "lib/operations/release/release.manager.ts",
    "lib/operations/release/verify/release.management.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_RELEASE_MANAGEMENT_ID ===
      "enterprise-post-launch-p4-release-management-operations-v1",
    "release management id",
  );
  check(
    OPERATIONS_RELEASE_MANAGEMENT_VERSION === "operations-p4-1",
    "release management version",
  );
  check(
    OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION ===
      "operations-release-management-freeze-1",
    "release management freeze",
  );
  check(
    OPERATIONS_RELEASE_MANAGEMENT_BASE === OPERATIONS_INCIDENT_RESPONSE_ID,
    "release management base = p3 incident response",
  );
  check(
    OPERATIONS_INCIDENT_RESPONSE_ID ===
      "enterprise-post-launch-p3-incident-response-operations-v1",
    "p3 incident response freeze preserved",
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
    OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION ===
      "operations-p4-release-management-operations-freeze-1",
    "p4 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(RELEASE_LIFECYCLE_STATUSES.length === 7, "lifecycle statuses");
  check(RELEASE_VERSION_KINDS.length === 4, "version kinds");
  check(DEPLOYMENT_APPROVAL_STATUSES.length === 4, "approval statuses");
  check(ROLLBACK_WORKFLOW_STEPS.length === 5, "rollback steps");
  check(RELEASE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(RELEASE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsP4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsP4ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Post-Launch P4 Release Management Operations ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
