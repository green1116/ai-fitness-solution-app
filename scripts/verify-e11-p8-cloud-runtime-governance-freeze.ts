/**
 * E11-P8 — Cloud Runtime Governance Freeze verification
 * Freeze E11 P1–P7 into cloud runtime baseline (no feature changes)
 */
import fs from "node:fs";
import path from "node:path";

import { E11_AUTONOMOUS_ID } from "../lib/cloud-runtime/e11/autonomous/autonomous.constants";
import { E11_CONTROL_PLANE_ID } from "../lib/cloud-runtime/e11/control-plane/control-plane.constants";
import {
  E11_CLOUD_RUNTIME_ID,
} from "../lib/cloud-runtime/e11/core/cloud.constants";
import { buildCloudFoundation } from "../lib/cloud-runtime/e11/runtime/cloud.lifecycle";
import { E11_EXECUTION_ID } from "../lib/cloud-runtime/e11/execution/execution.constants";
import { E11_GOVERNANCE_ID } from "../lib/cloud-runtime/e11/governance/governance.constants";
import { E11_OBSERVABILITY_ID } from "../lib/cloud-runtime/e11/observability/observability.constants";
import {
  checkE11P8ComponentIntegrity,
} from "../lib/cloud-runtime/e11/signoff/component.integrity";
import {
  E11_P8_COMPONENT_LOCK,
  E11_P8_EXPECTED_BASE_CHAIN,
  E11_P8_FREEZE_LOCK,
  E11_P8_GOVERNANCE_BASE,
  E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_P8_SIGNOFF_VERSION,
  e11P8FreezeLockMatchesExpected,
  isE11P8FreezeLockIntact,
  validateE11P8DependencyChain,
} from "../lib/cloud-runtime/e11/signoff/governance.freeze.lock";
import {
  assertE11P8ReleaseGatePass,
  checkE11P8ReleaseGate,
} from "../lib/cloud-runtime/e11/signoff/governance.release.gate";
import {
  assertE11P8FreezePass,
  buildE11P8FreezeManifest,
} from "../lib/cloud-runtime/e11/signoff/governance.signoff.manifest";
import {
  assertE11P8FinalVerificationPass,
  runE11P8FinalVerification,
} from "../lib/cloud-runtime/e11/signoff/final.verification";
import {
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
  ROLLBACK_SNAPSHOT_INDEX,
} from "../lib/cloud-runtime/e11/signoff/rollback.snapshot.index";
import { E11_TENANT_ID } from "../lib/cloud-runtime/e11/tenant/tenant.constants";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e11-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/cloud-runtime/e11/signoff/governance.freeze.lock.ts",
    "lib/cloud-runtime/e11/signoff/governance.release.gate.ts",
    "lib/cloud-runtime/e11/signoff/governance.signoff.manifest.ts",
    "lib/cloud-runtime/e11/signoff/component.integrity.ts",
    "lib/cloud-runtime/e11/signoff/rollback.snapshot.index.ts",
    "lib/cloud-runtime/e11/signoff/final.verification.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E11_P8_CLOUD_RUNTIME_FREEZE_VERSION ===
      "e11-p8-cloud-runtime-governance-freeze-1",
    "p8 freeze version",
  );
  check(E11_P8_SIGNOFF_VERSION === "e11-p8-signoff-1", "p8 signoff");
  check(
    E11_P8_GOVERNANCE_BASE ===
      "enterprise-e11-p7-cloud-runtime-control-plane-v1",
    "p8 base",
  );
  check(isE11P8FreezeLockIntact(), "lock intact");
  check(e11P8FreezeLockMatchesExpected(), "lock matches expected");
  check(E11_P8_COMPONENT_LOCK.length === 8, "8 component locks");
  check(
    E11_P8_FREEZE_LOCK.controlPlaneId === E11_CONTROL_PLANE_ID,
    "lock control plane id",
  );
  check(
    E11_P8_FREEZE_LOCK.cloudRuntimeId === E11_CLOUD_RUNTIME_ID,
    "lock cloud runtime id",
  );
  console.log("✓ freeze lock constants");
}

function checkDependencyChain() {
  const chain = validateE11P8DependencyChain();
  check(chain.ok, `dependency chain: ${chain.failures.join("; ")}`);
  check(
    E11_P8_EXPECTED_BASE_CHAIN.p7 ===
      "enterprise-e11-p6-cloud-runtime-autonomous-operations-v1",
    "p7 base expected",
  );
  check(E11_P8_FREEZE_LOCK.phases.p1.id === E11_CLOUD_RUNTIME_ID, "p1 id");
  check(E11_P8_FREEZE_LOCK.phases.p2.id === E11_EXECUTION_ID, "p2 id");
  check(E11_P8_FREEZE_LOCK.phases.p3.id === E11_TENANT_ID, "p3 id");
  check(E11_P8_FREEZE_LOCK.phases.p4.id === E11_GOVERNANCE_ID, "p4 id");
  check(E11_P8_FREEZE_LOCK.phases.p5.id === E11_OBSERVABILITY_ID, "p5 id");
  check(E11_P8_FREEZE_LOCK.phases.p6.id === E11_AUTONOMOUS_ID, "p6 id");
  check(E11_P8_FREEZE_LOCK.phases.p7.id === E11_CONTROL_PLANE_ID, "p7 id");
  console.log("✓ dependency chain");
}

function checkComponentIntegrity() {
  const integrity = checkE11P8ComponentIntegrity(pathExists);
  check(integrity.ok, `integrity: ${integrity.failures.join("; ")}`);
  for (const component of E11_P8_COMPONENT_LOCK) {
    check(pathExists(component.path), `path exists: ${component.path}`);
  }
  console.log("✓ component integrity");
}

function checkUpstreamCompatible() {
  const foundation = buildCloudFoundation();
  check(foundation.ready === true, "P1 foundation ready");
  check(foundation.cloudId === E11_CLOUD_RUNTIME_ID, "P1 cloud id");
  console.log("✓ P1–P7 compatibility (foundation probe)");
}

function testRollbackIndex() {
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback 12 entries");
  const index = buildRollbackSnapshotIndex();
  check(index.indexComplete === true, "rollback complete");
  check(index.entryCount === 12, "rollback count");
  check(index.version === E11_P8_CLOUD_RUNTIME_FREEZE_VERSION, "rollback version");
  check(getRollbackSnapshotByLayer("P1").length === 1, "P1 rollback");
  check(getRollbackSnapshotByLayer("P8").length === 1, "P8 rollback");
  check(getRollbackSnapshotByLayer("boundary").length === 1, "boundary");
  check(getRollbackSnapshotByLayer("upstream").length === 1, "upstream");
  console.log("✓ rollback snapshot index");
}

function testReleaseGate() {
  const gate = checkE11P8ReleaseGate();
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

  assertE11P8ReleaseGatePass(gate);
  console.log("✓ governance release gate (P1–P7 PASS)");
}

function testFreezeManifest() {
  const manifest = buildE11P8FreezeManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(manifest.versionLockOk === true, "version lock ok");
  check(manifest.chainOk === true, "chain ok");
  check(manifest.gate.result === "PASS", "manifest gate pass");
  check(manifest.foundationReady === true, "foundation ready");
  check(manifest.controlPlaneReady === true, "control plane ready");
  check(manifest.rollbackSnapshot.indexComplete === true, "rollback ok");
  check(manifest.freezeState.frozen === true, "frozen");
  check(manifest.base === E11_P8_GOVERNANCE_BASE, "manifest base");
  check(manifest.controlPlaneId === E11_CONTROL_PLANE_ID, "manifest control plane");
  assertE11P8FreezePass(manifest);
  console.log("✓ governance freeze manifest");
}

function testFinalVerification() {
  const result = runE11P8FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  check(result.ok === true, `final: ${result.summary}`);
  assertE11P8FinalVerificationPass(result);
  console.log("✓ final verification");
}

function main() {
  console.log("E11-P8 Cloud Runtime Governance Freeze verify");
  checkModules();
  checkConstants();
  checkDependencyChain();
  checkComponentIntegrity();
  checkUpstreamCompatible();
  testRollbackIndex();
  testReleaseGate();
  testFreezeManifest();
  testFinalVerification();
  console.log("ALL PASS");
}

main();
