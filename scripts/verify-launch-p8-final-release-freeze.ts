/**
 * Launch P8 — Final Commercial Release Freeze verification
 * Freeze Launch P1–P7 into commercial release complete baseline
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { LAUNCH_CONTROL_PLANE_ID } from "../lib/launch/control/control.constants";
import { LAUNCH_DEMO_ENVIRONMENT_ID } from "../lib/launch/demo/demo.constants";
import { LAUNCH_DOCUMENTATION_ID } from "../lib/launch/documentation/documentation.constants";
import { LAUNCH_PRODUCTION_FOUNDATION_ID } from "../lib/launch/launch.constants";
import { LAUNCH_CUSTOMER_ONBOARDING_ID } from "../lib/launch/onboarding/onboarding.constants";
import { LAUNCH_SECURITY_READINESS_ID } from "../lib/launch/security/security.constants";
import {
  assertLaunchP8FinalVerificationPass,
  runLaunchP8FinalVerification,
} from "../lib/launch/signoff/final.verification";
import {
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
  LAUNCH_P8_COMPONENT_LOCK,
  LAUNCH_P8_EXPECTED_BASE_CHAIN,
  LAUNCH_P8_FREEZE_LOCK,
  LAUNCH_P8_GOVERNANCE_BASE,
  LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION,
  LAUNCH_P8_SIGNOFF_VERSION,
  isLaunchP8FreezeLockIntact,
  launchP8FreezeLockMatchesExpected,
  validateLaunchP8DependencyChain,
} from "../lib/launch/signoff/governance.freeze.lock";
import {
  assertLaunchP8ReleaseGatePass,
} from "../lib/launch/signoff/governance.release.gate";
import {
  assertLaunchImmutableManifestFrozen,
} from "../lib/launch/signoff/immutable.manifest";
import {
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
  ROLLBACK_SNAPSHOT_INDEX,
} from "../lib/launch/signoff/rollback.snapshot.index";
import { LAUNCH_SLA_SUPPORT_ID } from "../lib/launch/support/support.constants";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "launch-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/launch/signoff/governance.freeze.lock.ts",
    "lib/launch/signoff/governance.release.gate.ts",
    "lib/launch/signoff/immutable.manifest.ts",
    "lib/launch/signoff/rollback.snapshot.index.ts",
    "lib/launch/signoff/final.verification.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION ===
      "launch-p8-commercial-release-freeze-1",
    "p8 freeze version",
  );
  check(LAUNCH_P8_SIGNOFF_VERSION === "launch-p8-signoff-1", "p8 signoff");
  check(
    LAUNCH_P8_GOVERNANCE_BASE ===
      "enterprise-launch-p7-launch-control-plane-v1",
    "governance base",
  );
  check(
    LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
      "enterprise-launch-commercial-release-complete-v1",
    "complete id",
  );
  check(isLaunchP8FreezeLockIntact(), "lock intact");
  check(launchP8FreezeLockMatchesExpected(), "lock matches expected");
  check(LAUNCH_P8_COMPONENT_LOCK.length === 8, "8 component locks");
  check(
    LAUNCH_P8_FREEZE_LOCK.e12Baseline ===
      "enterprise-e12-productization-complete-v1",
    "e12 baseline",
  );
  check(
    LAUNCH_P8_FREEZE_LOCK.platformBaseline ===
      "enterprise-platform-v1-complete",
    "platform baseline",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ freeze lock constants");
}

function checkDependencyChain() {
  const chain = validateLaunchP8DependencyChain();
  check(chain.ok, `chain: ${chain.failures.join("; ")}`);
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.p1 === E12_PRODUCTIZATION_COMPLETE_ID,
    "p1 base = e12 complete",
  );
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.p2 === LAUNCH_PRODUCTION_FOUNDATION_ID,
    "p2 base = p1",
  );
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.p3 === LAUNCH_CUSTOMER_ONBOARDING_ID,
    "p3 base = p2",
  );
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.p4 === LAUNCH_DEMO_ENVIRONMENT_ID,
    "p4 base = p3",
  );
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.p5 === LAUNCH_SECURITY_READINESS_ID,
    "p5 base = p4",
  );
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.p6 === LAUNCH_SLA_SUPPORT_ID,
    "p6 base = p5",
  );
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.p7 === LAUNCH_DOCUMENTATION_ID,
    "p7 base = p6",
  );
  check(
    LAUNCH_P8_EXPECTED_BASE_CHAIN.governance === LAUNCH_CONTROL_PLANE_ID,
    "governance = p7",
  );
  console.log("✓ dependency chain P1–P7");
}

function checkRollback() {
  check(ROLLBACK_SNAPSHOT_INDEX.length === 8, "8 rollback entries");
  const index = buildRollbackSnapshotIndex();
  check(index.indexComplete === true, "rollback index complete");
  check(!!getRollbackSnapshotByLayer("P1"), "rollback P1");
  check(!!getRollbackSnapshotByLayer("P8"), "rollback P8");
  for (const entry of ROLLBACK_SNAPSHOT_INDEX) {
    check(pathExists(entry.snapshotPath), `snapshot path: ${entry.snapshotPath}`);
  }
  console.log("✓ rollback snapshot index");
}

function checkFinalVerification() {
  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");

  const result = runLaunchP8FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  check(result.ok === true, `final: ${result.summary}`);
  check(result.gate.result === "PASS", `gate via final: ${result.gate.summary}`);
  check(result.manifest.freezeState.frozen === true, "manifest frozen via final");
  assertLaunchP8ReleaseGatePass(result.gate);
  assertLaunchImmutableManifestFrozen(result.manifest);
  assertLaunchP8FinalVerificationPass(result);
  console.log("✓ release gate + immutable manifest + final verification");
}

function main() {
  console.log("Launch P8 Final Commercial Release Freeze verify");
  checkModules();
  checkConstants();
  checkDependencyChain();
  checkRollback();
  checkFinalVerification();
  console.log("ALL PASS");
}

main();
