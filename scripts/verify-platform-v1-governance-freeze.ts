/**
 * Platform v1 — Governance Freeze verification
 * Freeze E09 / E10 / E11 complete + platform v1 alignment baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
  PLATFORM_V1_BASE,
  PLATFORM_V1_ID,
} from "../lib/platform/v1/platform.v1.constants";
import {
  assertPlatformV1Aligned,
  buildPlatformV1Manifest,
} from "../lib/platform/v1/platform.manifest";
import {
  assertPlatformV1GovernanceReleaseGatePass,
  checkPlatformV1GovernanceReleaseGate,
} from "../lib/platform/v1/signoff/governance.release.gate";
import {
  PLATFORM_V1_GOVERNANCE_BASE,
  PLATFORM_V1_GOVERNANCE_FREEZE_VERSION,
  PLATFORM_V1_P8_COMPONENT_LOCK,
  PLATFORM_V1_P8_EXPECTED_COMPLETE_CHAIN,
  PLATFORM_V1_P8_FREEZE_LOCK,
  PLATFORM_V1_P8_SIGNOFF_VERSION,
  isPlatformV1P8FreezeLockIntact,
  platformV1P8FreezeLockMatchesExpected,
  validatePlatformV1P8CompleteChain,
} from "../lib/platform/v1/signoff/governance.freeze.lock";
import {
  assertPlatformV1ImmutableManifestFrozen,
  buildPlatformV1ImmutableManifest,
} from "../lib/platform/v1/signoff/immutable.manifest";
import {
  assertPlatformV1FinalVerificationPass,
  runPlatformV1FinalVerification,
} from "../lib/platform/v1/signoff/final.verification";
import {
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
  ROLLBACK_SNAPSHOT_INDEX,
} from "../lib/platform/v1/signoff/rollback.snapshot.index";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "platform-v1-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/platform/v1/signoff/governance.freeze.lock.ts",
    "lib/platform/v1/signoff/governance.release.gate.ts",
    "lib/platform/v1/signoff/immutable.manifest.ts",
    "lib/platform/v1/signoff/rollback.snapshot.index.ts",
    "lib/platform/v1/signoff/final.verification.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PLATFORM_V1_GOVERNANCE_FREEZE_VERSION ===
      "platform-v1-governance-freeze-1",
    "governance freeze version",
  );
  check(
    PLATFORM_V1_P8_SIGNOFF_VERSION === "platform-v1-p8-signoff-1",
    "p8 signoff",
  );
  check(
    PLATFORM_V1_GOVERNANCE_BASE === "platform-v1-alignment",
    "governance base",
  );
  check(isPlatformV1P8FreezeLockIntact(), "lock intact");
  check(platformV1P8FreezeLockMatchesExpected(), "lock matches expected");
  check(PLATFORM_V1_P8_COMPONENT_LOCK.length === 5, "5 component locks");
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.platformId === PLATFORM_V1_ID,
    "lock platform id",
  );
  console.log("✓ freeze lock constants");
}

function checkCompleteChain() {
  const chain = validatePlatformV1P8CompleteChain();
  check(chain.ok, `complete chain: ${chain.failures.join("; ")}`);
  check(
    PLATFORM_V1_P8_EXPECTED_COMPLETE_CHAIN.e09 === E09_ENTERPRISE_COMPLETE_ID,
    "e09 complete",
  );
  check(
    PLATFORM_V1_P8_EXPECTED_COMPLETE_CHAIN.e10 === E10_ENTERPRISE_COMPLETE_ID,
    "e10 complete",
  );
  check(
    PLATFORM_V1_P8_EXPECTED_COMPLETE_CHAIN.e11 === E11_ENTERPRISE_COMPLETE_ID,
    "e11 complete",
  );
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e09.completeId ===
      E09_ENTERPRISE_COMPLETE_ID,
    "lock e09",
  );
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e10.completeId ===
      E10_ENTERPRISE_COMPLETE_ID,
    "lock e10",
  );
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e11.completeId ===
      E11_ENTERPRISE_COMPLETE_ID,
    "lock e11",
  );
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e09.code === "E09" &&
      PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e10.code === "E10" &&
      PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e11.code === "E11",
    "enterprise codes",
  );
  console.log("✓ E09/E10/E11 complete chain");
}

function checkComponentPaths() {
  for (const component of PLATFORM_V1_P8_COMPONENT_LOCK) {
    check(pathExists(component.path), `path exists: ${component.path}`);
  }
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e09.completeId.length > 0 &&
      PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e10.completeId.length > 0,
    "enterprise ids",
  );
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e09.completeId.includes("e09"),
    "e09 id tag",
  );
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e10.completeId.includes("e10"),
    "e10 id tag",
  );
  check(
    PLATFORM_V1_P8_FREEZE_LOCK.enterprise.e11.completeId.includes("e11"),
    "e11 id tag",
  );
  console.log("✓ component paths");
}

function checkAlignment() {
  const manifest = buildPlatformV1Manifest();
  check(manifest.aligned === true, `alignment: ${manifest.summary}`);
  check(manifest.base === PLATFORM_V1_BASE, "alignment base");
  assertPlatformV1Aligned(manifest);
  console.log("✓ platform v1 alignment");
}

function testRollbackIndex() {
  check(ROLLBACK_SNAPSHOT_INDEX.length === 9, "rollback 9 entries");
  const index = buildRollbackSnapshotIndex();
  check(index.indexComplete === true, "rollback complete");
  check(index.entryCount === 9, "rollback count");
  check(
    index.version === PLATFORM_V1_GOVERNANCE_FREEZE_VERSION,
    "rollback version",
  );
  check(getRollbackSnapshotByLayer("E09").length === 1, "E09 rollback");
  check(getRollbackSnapshotByLayer("P8").length === 1, "P8 rollback");
  check(getRollbackSnapshotByLayer("alignment").length === 1, "alignment");
  check(getRollbackSnapshotByLayer("upstream").length === 1, "upstream");
  console.log("✓ rollback snapshot index");
}

function testReleaseGate() {
  const gate = checkPlatformV1GovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");

  const checks = [
    "GV-PV1-E09-COMPLETE",
    "GV-PV1-E10-COMPLETE",
    "GV-PV1-E11-COMPLETE",
    "GV-PV1-ALIGNMENT",
    "GV-PV1-ALIGN-GATE",
  ];
  for (const id of checks) {
    const item = gate.checks.find((c) => c.id === id);
    check(Boolean(item?.ok), `${id} PASS`);
  }

  assertPlatformV1GovernanceReleaseGatePass(gate);
  console.log("✓ governance release gate");
}

function testImmutableManifest() {
  const manifest = buildPlatformV1ImmutableManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(manifest.versionLockOk === true, "version lock ok");
  check(manifest.chainOk === true, "chain ok");
  check(manifest.gate.result === "PASS", "manifest gate pass");
  check(manifest.alignmentOk === true, "alignment ok");
  check(manifest.rollbackSnapshot.indexComplete === true, "rollback ok");
  check(manifest.freezeState.frozen === true, "frozen");
  check(manifest.base === PLATFORM_V1_GOVERNANCE_BASE, "manifest base");
  check(manifest.readOnly === true, "immutable");
  assertPlatformV1ImmutableManifestFrozen(manifest);
  console.log("✓ immutable manifest");
}

function testFinalVerification() {
  const result = runPlatformV1FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  check(result.ok === true, `final: ${result.summary}`);
  assertPlatformV1FinalVerificationPass(result);
  console.log("✓ final verification");
}

function main() {
  console.log("Platform v1 Governance Freeze verify");
  checkModules();
  checkConstants();
  checkCompleteChain();
  checkComponentPaths();
  checkAlignment();
  testRollbackIndex();
  testReleaseGate();
  testImmutableManifest();
  testFinalVerification();
  console.log("ALL PASS");
}

main();
