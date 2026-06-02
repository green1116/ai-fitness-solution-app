/**
 * V3.7 FINAL — freeze integrity verification
 */
import {
  buildIntegrityLock,
  buildIntegritySeal,
  buildIntegrityVerification,
  buildIntegrityRestoreVerification,
  buildIntegritySnapshotRecord,
  warmEnterpriseStackSnapshot,
} from "../lib/release/index";

const DEPLOYMENT_ID = "v37-verify-integrity";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  warmEnterpriseStackSnapshot(DEPLOYMENT_ID);
  const lock = buildIntegrityLock({ deploymentId: DEPLOYMENT_ID });
  const seal = buildIntegritySeal({ deploymentId: DEPLOYMENT_ID });
  const verification = buildIntegrityVerification({ deploymentId: DEPLOYMENT_ID });
  const restore = buildIntegrityRestoreVerification({ deploymentId: DEPLOYMENT_ID });
  const snapshot = buildIntegritySnapshotRecord({ deploymentId: DEPLOYMENT_ID });

  assert(lock.locked, "integrity lock");
  assert(seal.freezeSeal, "freeze seal");
  assert(verification.baselineVerified, "baseline verified");
  assert(verification.preservationVerified, "preservation verified");
  assert(verification.archivalContinuityVerified, "archival continuity");
  assert(restore.restoreReady, "restore ready");
  assert(restore.rollbackReady, "rollback ready");
  assert(snapshot.baselineHash.startsWith("BL-"), "integrity snapshot hash");

  console.log("✓ integrity seal");
  console.log(" ", seal.summary);
  console.log("✓ integrity verification");
  console.log(" ", verification.summary);
  console.log("✓ restoration verification");
  console.log(" ", restore.summary);
  console.log("\nAll freeze integrity checks passed.");
}

main();
