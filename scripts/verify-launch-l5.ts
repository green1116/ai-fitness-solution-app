/**
 * Launch L5 — Launch Freeze verification
 * Freeze Launch Readiness L1–L4 into launch readiness complete baseline
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { LAUNCH_L1_DEMO_FOUNDATION_ID } from "../lib/launch/readiness/l1/demo/demo.constants";
import { LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID } from "../lib/launch/readiness/l2/pilot/pilot.constants";
import { LAUNCH_L3_PRODUCTION_HARDENING_ID } from "../lib/launch/readiness/l3/runtime/runtime.constants";
import { LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID } from "../lib/launch/readiness/l4/scenario/scenario.constants";
import {
  assertLaunchL5FinalVerificationPass,
  runLaunchL5FinalVerification,
} from "../lib/launch/readiness/l5/release/release.verification";
import {
  ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  LAUNCH_L5_COMPONENT_LOCK,
  LAUNCH_L5_FREEZE_BASE,
  LAUNCH_L5_FREEZE_LOCK,
  LAUNCH_L5_FREEZE_VERSION,
  LAUNCH_L5_SIGNOFF_VERSION,
  LAUNCH_READINESS_COMPLETE_ID,
  isLaunchL5FreezeLockIntact,
  launchL5FreezeLockMatchesExpected,
} from "../lib/launch/readiness/l5/freeze/freeze.lock";
import {
  LAUNCH_L5_EXPECTED_BASE_CHAIN,
  validateLaunchL5DependencyChain,
} from "../lib/launch/readiness/l5/freeze/freeze.dependency";
import { assertLaunchL5ReleaseGatePass } from "../lib/launch/readiness/l5/release/release.gate";
import {
  assertLaunchReadinessImmutableManifestFrozen,
  buildLaunchReadinessImmutableManifest,
} from "../lib/launch/readiness/l5/freeze/freeze.manifest";
import {
  buildLaunchReadinessRollbackSnapshotIndex,
  getLaunchReadinessRollbackSnapshotByLayer,
  LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES,
} from "../lib/launch/readiness/l5/rollback/rollback.index";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "launch-l5-freeze";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/launch/readiness/l5/freeze/freeze.lock.ts",
    "lib/launch/readiness/l5/freeze/freeze.manifest.ts",
    "lib/launch/readiness/l5/freeze/freeze.dependency.ts",
    "lib/launch/readiness/l5/release/release.gate.ts",
    "lib/launch/readiness/l5/release/release.verification.ts",
    "lib/launch/readiness/l5/rollback/rollback.snapshot.ts",
    "lib/launch/readiness/l5/rollback/rollback.index.ts",
    "lib/launch/readiness/l5/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_L5_FREEZE_VERSION === "launch-l5-launch-freeze-1",
    "l5 freeze version",
  );
  check(LAUNCH_L5_SIGNOFF_VERSION === "launch-l5-signoff-1", "l5 signoff");
  check(
    LAUNCH_L5_FREEZE_BASE ===
      "enterprise-launch-l4-enterprise-delivery-validation-v1",
    "l5 freeze base",
  );
  check(
    LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete id",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete alias",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete integrated",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete integrated",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete integrated",
  );
  check(
    LAUNCH_L5_FREEZE_LOCK.commercializationBaseline ===
      ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
    "freeze lock commercialization baseline",
  );
  check(
    LAUNCH_L5_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID,
    "freeze lock launch baseline",
  );
  check(LAUNCH_L5_FREEZE_LOCK.readOnly === true, "freeze lock readOnly");
  check(
    LAUNCH_L1_DEMO_FOUNDATION_ID ===
      "enterprise-launch-l1-demo-foundation-v1",
    "l1 id preserved",
  );
  check(
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID ===
      "enterprise-launch-l2-pilot-customer-flow-v1",
    "l2 id preserved",
  );
  check(
    LAUNCH_L3_PRODUCTION_HARDENING_ID ===
      "enterprise-launch-l3-production-hardening-v1",
    "l3 id preserved",
  );
  check(
    LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID ===
      "enterprise-launch-l4-enterprise-delivery-validation-v1",
    "l4 id preserved",
  );
  check(
    LAUNCH_L5_EXPECTED_BASE_CHAIN.freeze ===
      LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
    "expected freeze base = l4",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(LAUNCH_L5_COMPONENT_LOCK.length === 5, "component lock=5");
  check(isLaunchL5FreezeLockIntact() === true, "freeze lock intact");
  check(
    launchL5FreezeLockMatchesExpected() === true,
    "freeze lock matches expected",
  );

  const chain = validateLaunchL5DependencyChain();
  check(chain.ok === true, `dependency chain: ${chain.failures.join("; ")}`);

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkRollback() {
  const index = buildLaunchReadinessRollbackSnapshotIndex();
  check(index.indexComplete === true, "rollback index complete");
  check(index.entryCount === 5, "rollback entries=5");
  check(index.readOnly === true, "rollback readOnly");
  check(
    LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES.length === 5,
    "snapshot entries=5",
  );
  check(
    getLaunchReadinessRollbackSnapshotByLayer("L5")?.id === "LR-RS-L5",
    "l5 rollback entry",
  );
  console.log("✓ rollback snapshot index");
}

function checkGateAndManifest() {
  assertLaunchL5ReleaseGatePass();
  const manifest = buildLaunchReadinessImmutableManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  assertLaunchReadinessImmutableManifestFrozen(manifest);
  check(manifest.freezeState.frozen === true, "manifest frozen");
  check(manifest.readOnly === true, "manifest immutable");

  const finalResult = runLaunchL5FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  assertLaunchL5FinalVerificationPass(finalResult);
  check(finalResult.ok === true, `final verification: ${finalResult.summary}`);
  console.log("✓ release gate + immutable manifest + final verification");
  console.log(`  ${finalResult.summary}`);
}

function main() {
  console.log("=== Launch L5 Launch Freeze ===");
  checkModules();
  checkConstants();
  checkRollback();
  checkGateAndManifest();
  console.log("ALL PASS");
}

main();
