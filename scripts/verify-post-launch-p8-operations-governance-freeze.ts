/**
 * Post-Launch P8 — Operations Governance Freeze verification
 * Freeze Operations P1–P7 into operations complete baseline
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { OPERATIONS_CONTROL_PLANE_ID } from "../lib/operations/control/control.constants";
import { OPERATIONS_CUSTOMER_SUCCESS_ID } from "../lib/operations/customer-success/success.constants";
import { OPERATIONS_GROWTH_ANALYTICS_ID } from "../lib/operations/growth/growth.constants";
import { OPERATIONS_INCIDENT_RESPONSE_ID } from "../lib/operations/incident/incident.constants";
import { OPERATIONS_PRODUCTION_FOUNDATION_ID } from "../lib/operations/production/production.constants";
import { OPERATIONS_RELEASE_MANAGEMENT_ID } from "../lib/operations/release/release.constants";
import { OPERATIONS_ENTERPRISE_SUPPORT_ID } from "../lib/operations/support/support.constants";
import {
  assertOperationsP8FinalVerificationPass,
  runOperationsP8FinalVerification,
} from "../lib/operations/signoff/final.verification";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
  OPERATIONS_P8_COMPONENT_LOCK,
  OPERATIONS_P8_EXPECTED_BASE_CHAIN,
  OPERATIONS_P8_FREEZE_LOCK,
  OPERATIONS_P8_GOVERNANCE_BASE,
  OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION,
  OPERATIONS_P8_SIGNOFF_VERSION,
  isOperationsP8FreezeLockIntact,
  operationsP8FreezeLockMatchesExpected,
  validateOperationsP8DependencyChain,
} from "../lib/operations/signoff/governance.freeze.lock";
import { assertOperationsP8ReleaseGatePass } from "../lib/operations/signoff/governance.release.gate";
import { assertOperationsImmutableManifestFrozen } from "../lib/operations/signoff/immutable.manifest";
import {
  buildOperationsRollbackSnapshotIndex,
  getOperationsRollbackSnapshotByLayer,
  OPERATIONS_ROLLBACK_SNAPSHOT_INDEX,
} from "../lib/operations/signoff/rollback.snapshot.index";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "operations-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/operations/signoff/governance.freeze.lock.ts",
    "lib/operations/signoff/governance.release.gate.ts",
    "lib/operations/signoff/immutable.manifest.ts",
    "lib/operations/signoff/rollback.snapshot.index.ts",
    "lib/operations/signoff/final.verification.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION ===
      "operations-p8-operations-governance-freeze-1",
    "p8 freeze version",
  );
  check(
    OPERATIONS_P8_SIGNOFF_VERSION === "operations-p8-signoff-1",
    "p8 signoff",
  );
  check(
    OPERATIONS_P8_GOVERNANCE_BASE ===
      "enterprise-post-launch-p7-operations-control-plane-v1",
    "p8 governance base",
  );
  check(
    OPERATIONS_GOVERNANCE_COMPLETE_ID ===
      "enterprise-post-launch-operations-complete-v1",
    "operations complete id",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete alias",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete integrated",
  );
  check(
    OPERATIONS_P8_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID,
    "freeze lock launch baseline",
  );
  check(
    OPERATIONS_PRODUCTION_FOUNDATION_ID ===
      "enterprise-post-launch-p1-production-operations-foundation-v1",
    "p1 id preserved",
  );
  check(
    OPERATIONS_CUSTOMER_SUCCESS_ID ===
      "enterprise-post-launch-p2-customer-success-operations-v1",
    "p2 id preserved",
  );
  check(
    OPERATIONS_INCIDENT_RESPONSE_ID ===
      "enterprise-post-launch-p3-incident-response-operations-v1",
    "p3 id preserved",
  );
  check(
    OPERATIONS_RELEASE_MANAGEMENT_ID ===
      "enterprise-post-launch-p4-release-management-operations-v1",
    "p4 id preserved",
  );
  check(
    OPERATIONS_GROWTH_ANALYTICS_ID ===
      "enterprise-post-launch-p5-growth-analytics-operations-v1",
    "p5 id preserved",
  );
  check(
    OPERATIONS_ENTERPRISE_SUPPORT_ID ===
      "enterprise-post-launch-p6-enterprise-support-operations-v1",
    "p6 id preserved",
  );
  check(
    OPERATIONS_CONTROL_PLANE_ID ===
      "enterprise-post-launch-p7-operations-control-plane-v1",
    "p7 id preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(OPERATIONS_P8_COMPONENT_LOCK.length === 8, "component lock count");
  check(
    OPERATIONS_P8_EXPECTED_BASE_CHAIN.p1 === ENTERPRISE_LAUNCH_COMPLETE_ID,
    "expected chain p1 = launch complete",
  );

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkLockAndChain() {
  check(isOperationsP8FreezeLockIntact(), "freeze lock intact");
  check(operationsP8FreezeLockMatchesExpected(), "freeze lock matches");
  const chain = validateOperationsP8DependencyChain();
  check(chain.ok, `dependency chain: ${chain.failures.join("; ")}`);
  console.log("✓ freeze lock + dependency chain");
}

function checkRollback() {
  const rollback = buildOperationsRollbackSnapshotIndex();
  check(rollback.indexComplete === true, "rollback index complete");
  check(OPERATIONS_ROLLBACK_SNAPSHOT_INDEX.length === 8, "rollback entries");
  check(!!getOperationsRollbackSnapshotByLayer("P7"), "rollback p7 entry");
  console.log("✓ rollback snapshot index");
}

function checkFinal() {
  const result = runOperationsP8FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  check(result.ok === true, `final verification: ${result.summary}`);
  assertOperationsP8FinalVerificationPass(result);
  assertOperationsP8ReleaseGatePass(result.gate);
  assertOperationsImmutableManifestFrozen(result.manifest);
  console.log("✓ final verification PASS");
  console.log(`  ${result.summary}`);
  console.log(`  gate: ${result.gate.summary}`);
}

function main() {
  console.log("=== Post-Launch P8 Operations Governance Freeze ===");
  checkModules();
  checkConstants();
  checkLockAndChain();
  checkRollback();
  checkFinal();
  console.log("ALL PASS");
}

main();
