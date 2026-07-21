/**
 * E12-P8 — Productization Governance Freeze verification
 * Freeze E12 P1–P7 into productization complete baseline
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_ADMIN_CONSOLE_ID } from "../lib/product/e12/admin/admin.constants";
import { E12_API_PRODUCT_ID } from "../lib/product/e12/api/api.constants";
import { E12_BILLING_COMMERCIAL_ID } from "../lib/product/e12/billing/billing.constants";
import { E12_COMMERCIAL_CONTROL_ID } from "../lib/product/e12/commercial/commercial.constants";
import { E12_PRODUCT_ID } from "../lib/product/e12/core/product.constants";
import { E12_DEPLOYMENT_PACKAGE_ID } from "../lib/product/e12/deployment/deployment.constants";
import {
  assertE12P8FinalVerificationPass,
  runE12P8FinalVerification,
} from "../lib/product/e12/signoff/final.verification";
import {
  E12_P8_COMPONENT_LOCK,
  E12_P8_EXPECTED_BASE_CHAIN,
  E12_P8_FREEZE_LOCK,
  E12_P8_GOVERNANCE_BASE,
  E12_P8_PRODUCTIZATION_FREEZE_VERSION,
  E12_P8_SIGNOFF_VERSION,
  E12_PRODUCTIZATION_COMPLETE_ID,
  e12P8FreezeLockMatchesExpected,
  isE12P8FreezeLockIntact,
  validateE12P8DependencyChain,
} from "../lib/product/e12/signoff/governance.freeze.lock";
import {
  assertE12P8ReleaseGatePass,
  checkE12P8ReleaseGate,
} from "../lib/product/e12/signoff/governance.release.gate";
import {
  assertE12ImmutableManifestFrozen,
  buildE12ImmutableManifest,
} from "../lib/product/e12/signoff/immutable.manifest";
import {
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
  ROLLBACK_SNAPSHOT_INDEX,
} from "../lib/product/e12/signoff/rollback.snapshot.index";
import { E12_TENANT_PRODUCT_ID } from "../lib/product/e12/tenant/tenant.constants";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e12-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/product/e12/signoff/governance.freeze.lock.ts",
    "lib/product/e12/signoff/governance.release.gate.ts",
    "lib/product/e12/signoff/immutable.manifest.ts",
    "lib/product/e12/signoff/rollback.snapshot.index.ts",
    "lib/product/e12/signoff/final.verification.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_P8_PRODUCTIZATION_FREEZE_VERSION ===
      "e12-p8-productization-governance-freeze-1",
    "p8 freeze version",
  );
  check(E12_P8_SIGNOFF_VERSION === "e12-p8-signoff-1", "p8 signoff");
  check(
    E12_P8_GOVERNANCE_BASE ===
      "enterprise-e12-p7-commercial-control-plane-v1",
    "governance base",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "complete id",
  );
  check(isE12P8FreezeLockIntact(), "lock intact");
  check(e12P8FreezeLockMatchesExpected(), "lock matches expected");
  check(E12_P8_COMPONENT_LOCK.length === 8, "8 component locks");
  check(
    E12_P8_FREEZE_LOCK.platformBaseline === "enterprise-platform-v1-complete",
    "platform baseline",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ freeze lock constants");
}

function checkDependencyChain() {
  const chain = validateE12P8DependencyChain();
  check(chain.ok, `dependency chain: ${chain.failures.join("; ")}`);
  check(
    E12_P8_EXPECTED_BASE_CHAIN.p1 === "enterprise-platform-v1-complete",
    "p1 base",
  );
  check(
    E12_P8_EXPECTED_BASE_CHAIN.governance ===
      "enterprise-e12-p7-commercial-control-plane-v1",
    "governance chain",
  );
  check(E12_P8_FREEZE_LOCK.phases.p1.id === E12_PRODUCT_ID, "lock p1");
  check(E12_P8_FREEZE_LOCK.phases.p2.id === E12_TENANT_PRODUCT_ID, "lock p2");
  check(E12_P8_FREEZE_LOCK.phases.p3.id === E12_ADMIN_CONSOLE_ID, "lock p3");
  check(
    E12_P8_FREEZE_LOCK.phases.p4.id === E12_BILLING_COMMERCIAL_ID,
    "lock p4",
  );
  check(E12_P8_FREEZE_LOCK.phases.p5.id === E12_API_PRODUCT_ID, "lock p5");
  check(
    E12_P8_FREEZE_LOCK.phases.p6.id === E12_DEPLOYMENT_PACKAGE_ID,
    "lock p6",
  );
  check(
    E12_P8_FREEZE_LOCK.phases.p7.id === E12_COMMERCIAL_CONTROL_ID,
    "lock p7",
  );
  console.log("✓ P1–P7 dependency chain");
}

function checkComponentPaths() {
  for (const component of E12_P8_COMPONENT_LOCK) {
    check(pathExists(component.path), `missing path: ${component.path}`);
  }
  console.log("✓ component paths exist");
}

function checkRollback() {
  const rollback = buildRollbackSnapshotIndex();
  check(rollback.indexComplete === true, "rollback index complete");
  check(rollback.entryCount >= 12, "rollback entries >= 12");
  check(ROLLBACK_SNAPSHOT_INDEX.length === rollback.entryCount, "index sync");
  check(getRollbackSnapshotByLayer("P1").length >= 1, "p1 rollback");
  check(getRollbackSnapshotByLayer("P8").length >= 1, "p8 rollback");
  check(getRollbackSnapshotByLayer("platform").length >= 1, "platform rollback");
  console.log("✓ rollback snapshot index");
}

function checkGateAndManifest() {
  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const gate = checkE12P8ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P8ReleaseGatePass(gate);

  const p1 = gate.checks.find((c) => c.id === "GV-P8-P1");
  const p7 = gate.checks.find((c) => c.id === "GV-P8-P7");
  check(p1?.ok === true, "p1 gate in p8");
  check(p7?.ok === true, "p7 gate in p8");

  const manifest = buildE12ImmutableManifest({ deploymentId: DEPLOYMENT_ID });
  check(manifest.freezeState.frozen === true, `frozen: ${manifest.summary}`);
  check(manifest.readOnly === true, "manifest readOnly");
  check(
    manifest.completeId === E12_PRODUCTIZATION_COMPLETE_ID,
    "manifest complete id",
  );
  assertE12ImmutableManifestFrozen(manifest);
  console.log("✓ release gate + immutable manifest");
}

function checkFinalVerification() {
  const result = runE12P8FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  check(result.ok === true, `final: ${result.summary}`);
  check(result.lockIntact && result.lockMatches, "final lock");
  check(result.chainOk === true, "final chain");
  check(result.platformOk === true, "final platform");
  check(result.gate.result === "PASS", "final gate");
  check(result.manifest.freezeState.frozen === true, "final frozen");
  assertE12P8FinalVerificationPass(result);
  console.log("✓ final verification");
}

function main() {
  console.log("E12-P8 Productization Governance Freeze verify");
  checkModules();
  checkConstants();
  checkDependencyChain();
  checkComponentPaths();
  checkRollback();
  checkGateAndManifest();
  checkFinalVerification();
  console.log("ALL PASS");
}

main();
