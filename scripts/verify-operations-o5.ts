/**
 * Operations O5 — Governance Freeze verification
 * Freeze Operations O1–O4 into operations complete baseline
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
import { OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID } from "../lib/operations/o1/success/success.constants";
import { OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID } from "../lib/operations/o2/usage/usage.constants";
import { OPERATIONS_O3_SUPPORT_OPERATIONS_ID } from "../lib/operations/o3/ticket/ticket.constants";
import { OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID } from "../lib/operations/o4/growth/growth.constants";
import {
  assertOperationsO5FinalVerificationPass,
  runOperationsO5FinalVerification,
} from "../lib/operations/o5/release/release.verification";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_COMPLETE_ID,
  OPERATIONS_O5_COMPONENT_LOCK,
  OPERATIONS_O5_FREEZE_BASE,
  OPERATIONS_O5_FREEZE_LOCK,
  OPERATIONS_O5_FREEZE_VERSION,
  OPERATIONS_O5_SIGNOFF_VERSION,
  isOperationsO5FreezeLockIntact,
  operationsO5FreezeLockMatchesExpected,
} from "../lib/operations/o5/freeze/freeze.lock";
import {
  OPERATIONS_O5_EXPECTED_BASE_CHAIN,
  validateOperationsO5DependencyChain,
} from "../lib/operations/o5/freeze/freeze.dependency";
import { assertOperationsO5ReleaseGatePass } from "../lib/operations/o5/release/release.gate";
import {
  assertOperationsImmutableManifestFrozen,
  buildOperationsImmutableManifest,
} from "../lib/operations/o5/freeze/freeze.manifest";
import {
  buildOperationsRollbackSnapshotIndex,
  getOperationsRollbackSnapshotByLayer,
  OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES,
} from "../lib/operations/o5/rollback/rollback.index";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "operations-o5-freeze";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/operations/o5/freeze/freeze.lock.ts",
    "lib/operations/o5/freeze/freeze.manifest.ts",
    "lib/operations/o5/freeze/freeze.dependency.ts",
    "lib/operations/o5/release/release.gate.ts",
    "lib/operations/o5/release/release.verification.ts",
    "lib/operations/o5/rollback/rollback.snapshot.ts",
    "lib/operations/o5/rollback/rollback.index.ts",
    "lib/operations/o5/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_O5_FREEZE_VERSION === "operations-o5-governance-freeze-1",
    "o5 freeze version",
  );
  check(
    OPERATIONS_O5_SIGNOFF_VERSION === "operations-o5-signoff-1",
    "o5 signoff",
  );
  check(
    OPERATIONS_O5_FREEZE_BASE ===
      "enterprise-operations-o4-growth-analytics-foundation-v1",
    "o5 freeze base",
  );
  check(
    OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete id",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete alias",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete integrated",
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
    OPERATIONS_O5_FREEZE_LOCK.launchReadinessBaseline ===
      ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
    "freeze lock launch readiness baseline",
  );
  check(
    OPERATIONS_O5_FREEZE_LOCK.commercializationBaseline ===
      ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
    "freeze lock commercialization baseline",
  );
  check(
    OPERATIONS_O5_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID,
    "freeze lock launch baseline",
  );
  check(OPERATIONS_O5_FREEZE_LOCK.readOnly === true, "freeze lock readOnly");
  check(
    OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID ===
      "enterprise-operations-o1-customer-success-foundation-v1",
    "o1 id preserved",
  );
  check(
    OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID ===
      "enterprise-operations-o2-usage-intelligence-foundation-v1",
    "o2 id preserved",
  );
  check(
    OPERATIONS_O3_SUPPORT_OPERATIONS_ID ===
      "enterprise-operations-o3-support-operations-v1",
    "o3 id preserved",
  );
  check(
    OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID ===
      "enterprise-operations-o4-growth-analytics-foundation-v1",
    "o4 id preserved",
  );
  check(
    OPERATIONS_O5_EXPECTED_BASE_CHAIN.freeze ===
      OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
    "expected freeze base = o4",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(OPERATIONS_O5_COMPONENT_LOCK.length === 5, "component lock=5");
  check(isOperationsO5FreezeLockIntact() === true, "freeze lock intact");
  check(
    operationsO5FreezeLockMatchesExpected() === true,
    "freeze lock matches expected",
  );

  const chain = validateOperationsO5DependencyChain();
  check(chain.ok === true, `dependency chain: ${chain.failures.join("; ")}`);

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkRollback() {
  const index = buildOperationsRollbackSnapshotIndex();
  check(index.indexComplete === true, "rollback index complete");
  check(index.entryCount === 5, "rollback entries=5");
  check(index.readOnly === true, "rollback readOnly");
  check(
    OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES.length === 5,
    "snapshot entries=5",
  );
  check(
    getOperationsRollbackSnapshotByLayer("O5")?.id === "OPS-RS-O5",
    "o5 rollback entry",
  );
  console.log("✓ rollback snapshot index");
}

function checkGateAndManifest() {
  assertOperationsO5ReleaseGatePass();
  const manifest = buildOperationsImmutableManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  assertOperationsImmutableManifestFrozen(manifest);
  check(manifest.freezeState.frozen === true, "manifest frozen");
  check(manifest.readOnly === true, "manifest immutable");

  const finalResult = runOperationsO5FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  assertOperationsO5FinalVerificationPass(finalResult);
  check(finalResult.ok === true, `final verification: ${finalResult.summary}`);
  console.log("✓ release gate + immutable manifest + final verification");
  console.log(`  ${finalResult.summary}`);
}

function main() {
  console.log("=== Operations O5 Governance Freeze ===");
  checkModules();
  checkConstants();
  checkRollback();
  checkGateAndManifest();
  console.log("ALL PASS");
}

main();
