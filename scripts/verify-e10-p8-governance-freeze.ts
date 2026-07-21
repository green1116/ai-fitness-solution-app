/**
 * E10-P8 — Enterprise Platform Governance Freeze verification
 * Freeze E10 P1–P7 into platform baseline (no feature changes)
 */
import fs from "node:fs";
import path from "node:path";

import { E10_PLATFORM_ID } from "../lib/platform/e10/core/platform.constants";
import { buildPlatformFoundation } from "../lib/platform/e10/core/platform.lifecycle";
import { E10_EVENT_ID } from "../lib/platform/e10/event/event.constants";
import { E10_GATEWAY_ID } from "../lib/platform/e10/gateway/gateway.constants";
import { E10_MARKETPLACE_ID } from "../lib/platform/e10/marketplace/marketplace.constants";
import {
  E10_OS_BASE,
  E10_OS_ID,
} from "../lib/platform/e10/os/os.constants";
import { E10_RESOURCE_ID } from "../lib/platform/e10/resource/resource.constants";
import { E10_RUNTIME_ID } from "../lib/platform/e10/runtime/runtime.constants";
import {
  E10_P8_COMPONENT_LOCK,
  E10_P8_EXPECTED_BASE_CHAIN,
  E10_P8_FREEZE_LOCK,
  E10_P8_GOVERNANCE_BASE,
  E10_P8_PLATFORM_FREEZE_VERSION,
  E10_P8_SIGNOFF_VERSION,
  e10P8FreezeLockMatchesExpected,
  isE10P8FreezeLockIntact,
  validateE10P8DependencyChain,
} from "../lib/platform/e10/signoff/governance.freeze.lock";
import {
  assertE10P8ReleaseGatePass,
  checkE10P8ReleaseGate,
} from "../lib/platform/e10/signoff/governance.release.gate";
import {
  assertE10P8FreezePass,
  buildE10P8FreezeManifest,
} from "../lib/platform/e10/signoff/governance.signoff.manifest";
import {
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
  ROLLBACK_SNAPSHOT_INDEX,
} from "../lib/platform/e10/signoff/rollback.snapshot.index";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e10-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/platform/e10/signoff/governance.freeze.lock.ts",
    "lib/platform/e10/signoff/governance.release.gate.ts",
    "lib/platform/e10/signoff/governance.signoff.manifest.ts",
    "lib/platform/e10/signoff/rollback.snapshot.index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E10_P8_PLATFORM_FREEZE_VERSION === "e10-p8-governance-freeze-1",
    "p8 freeze version",
  );
  check(E10_P8_SIGNOFF_VERSION === "e10-p8-signoff-1", "p8 signoff");
  check(
    E10_P8_GOVERNANCE_BASE === "enterprise-e10-p7-platform-os-v1",
    "p8 base",
  );
  check(isE10P8FreezeLockIntact(), "lock intact");
  check(e10P8FreezeLockMatchesExpected(), "lock matches expected");
  check(E10_P8_COMPONENT_LOCK.length === 8, "8 component locks");
  check(E10_P8_FREEZE_LOCK.osId === E10_OS_ID, "lock os id");
  check(E10_P8_FREEZE_LOCK.platformId === E10_PLATFORM_ID, "lock platform id");
  console.log("✓ freeze lock constants");
}

function checkDependencyChain() {
  const chain = validateE10P8DependencyChain();
  check(chain.ok, `dependency chain: ${chain.failures.join("; ")}`);
  check(
    E10_P8_EXPECTED_BASE_CHAIN.p7 ===
      "enterprise-e10-p6-platform-marketplace-v1",
    "p7 base expected",
  );
  check(
    E10_P8_FREEZE_LOCK.phases.p1.id === E10_PLATFORM_ID,
    "p1 id",
  );
  check(E10_P8_FREEZE_LOCK.phases.p2.id === E10_RUNTIME_ID, "p2 id");
  check(E10_P8_FREEZE_LOCK.phases.p3.id === E10_RESOURCE_ID, "p3 id");
  check(E10_P8_FREEZE_LOCK.phases.p4.id === E10_EVENT_ID, "p4 id");
  check(E10_P8_FREEZE_LOCK.phases.p5.id === E10_GATEWAY_ID, "p5 id");
  check(E10_P8_FREEZE_LOCK.phases.p6.id === E10_MARKETPLACE_ID, "p6 id");
  check(E10_P8_FREEZE_LOCK.phases.p7.id === E10_OS_ID, "p7 id");
  check(E10_OS_BASE === E10_P8_EXPECTED_BASE_CHAIN.p7, "os base matches");
  console.log("✓ dependency chain");
}

function checkUpstreamCompatible() {
  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "P1 foundation ready");
  check(foundation.platformId === E10_PLATFORM_ID, "P1 platform id");
  console.log("✓ P1–P7 compatibility (foundation probe)");
}

function testRollbackIndex() {
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback 12 entries");
  const index = buildRollbackSnapshotIndex();
  check(index.indexComplete === true, "rollback complete");
  check(index.entryCount === 12, "rollback count");
  check(index.version === E10_P8_PLATFORM_FREEZE_VERSION, "rollback version");
  check(getRollbackSnapshotByLayer("P1").length === 1, "P1 rollback");
  check(getRollbackSnapshotByLayer("P8").length === 1, "P8 rollback");
  check(getRollbackSnapshotByLayer("boundary").length === 1, "boundary");
  check(getRollbackSnapshotByLayer("upstream").length === 1, "upstream");
  console.log("✓ rollback snapshot index");
}

function testReleaseGate() {
  const gate = checkE10P8ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");

  const phaseChecks = [
    "GV-P8-P1",
    "GV-P8-P2",
    "GV-P8-P3",
    "GV-P8-P4",
    "GV-P8-P5",
    "GV-P8-P6",
    "GV-P8-P7",
  ];
  for (const id of phaseChecks) {
    const item = gate.checks.find((c) => c.id === id);
    check(Boolean(item?.ok), `${id} PASS`);
  }

  assertE10P8ReleaseGatePass(gate);
  console.log("✓ governance release gate (P1–P7 PASS)");
}

function testFreezeManifest() {
  const manifest = buildE10P8FreezeManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(manifest.versionLockOk === true, "version lock ok");
  check(manifest.chainOk === true, "chain ok");
  check(manifest.gate.result === "PASS", "manifest gate pass");
  check(manifest.foundationReady === true, "foundation ready");
  check(manifest.osReady === true, "os ready");
  check(manifest.rollbackSnapshot.indexComplete === true, "rollback ok");
  check(manifest.freezeState.frozen === true, "frozen");
  check(manifest.base === E10_P8_GOVERNANCE_BASE, "manifest base");
  check(manifest.osId === E10_OS_ID, "manifest os");
  assertE10P8FreezePass(manifest);
  console.log("✓ governance freeze manifest");
}

function main() {
  console.log("E10-P8 Governance Freeze verify");
  checkModules();
  checkConstants();
  checkDependencyChain();
  checkUpstreamCompatible();
  testRollbackIndex();
  testReleaseGate();
  testFreezeManifest();
  console.log("ALL PASS");
}

main();
