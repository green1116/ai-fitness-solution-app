/**
 * V3.7 FINAL — production freeze verification
 */
import {
  V37_PRODUCTION_RELEASE_VERSION,
  buildProductionFreezeManifest,
  buildFreezeBaseline,
  buildFreezeIntegrityReport,
  buildFreezeLockState,
  buildFreezeReleaseDescriptor,
  buildFreezeSnapshotMeta,
  buildV37ProductionReleaseFoundation,
  warmEnterpriseStackSnapshot,
  type ProductionFreezeManifest,
} from "../lib/release/index";

const DEPLOYMENT_ID = "v37-verify-freeze";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testFreezeManifest() {
  const manifest = buildProductionFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  assert(manifest.freezeId.includes("FRZ-V37FINAL"), "freeze id");
  assert(manifest.releaseGeneration === "V3.7-FINAL", "generation");
  assert(manifest.baselineHash.startsWith("BL-"), "baseline hash");
  assert(manifest.integrityState === "sealed", "integrity sealed");
  assert(manifest.compatibilityWindow.length > 0, "compatibility window");
  assert(manifest.restorationWindow.length > 0, "restoration window");
  console.log("✓ production freeze manifest");
  console.log(" ", manifest.summary);
}

function testFreezeBaseline() {
  const baseline = buildFreezeBaseline({ deploymentId: DEPLOYMENT_ID });
  assert(baseline.layers.length >= 9, "baseline layers");
  assert(baseline.intact, "baseline intact");
  console.log("✓ freeze baseline");
  console.log(" ", baseline.summary);
}

function testFreezeIntegrityAndLock() {
  const integrity = buildFreezeIntegrityReport({ deploymentId: DEPLOYMENT_ID });
  const lock = buildFreezeLockState({ deploymentId: DEPLOYMENT_ID });
  assert(integrity.intact, "integrity intact");
  assert(integrity.preservationContinuity, "preservation continuity");
  assert(lock.locked, "freeze locked");
  console.log("✓ freeze integrity & lock");
  console.log(" ", lock.summary);
}

function testFreezeReleaseAndSnapshot() {
  const release = buildFreezeReleaseDescriptor({ deploymentId: DEPLOYMENT_ID });
  const snapshot = buildFreezeSnapshotMeta({ deploymentId: DEPLOYMENT_ID });
  assert(release.entries.length >= 10, "release entries");
  assert(snapshot.sealed, "snapshot sealed");
  console.log("✓ freeze release & snapshot");
  console.log(" ", `releaseId=${release.releaseId} snapshotId=${snapshot.snapshotId}`);
}

function testProductionFreezeFoundation() {
  const foundation = buildV37ProductionReleaseFoundation({ deploymentId: DEPLOYMENT_ID });
  assert(foundation.version === V37_PRODUCTION_RELEASE_VERSION, "foundation version");
  assert(foundation.freeze.integrityState === "sealed", "foundation freeze sealed");
  assert(foundation.lock.locked, "foundation locked");
  assert(foundation.final.productionReady, "production ready");

  const keys: (keyof ProductionFreezeManifest)[] = [
    "freezeId",
    "freezeVersion",
    "baselineHash",
    "baselineTimestamp",
    "releaseGeneration",
    "integrityState",
    "compatibilityWindow",
    "restorationWindow",
  ];
  for (const key of keys) {
    assert(key in foundation.freeze, `freeze manifest missing ${String(key)}`);
  }

  console.log("✓ production freeze foundation");
  console.log(" ", foundation.foundationSummary);
}

function main() {
  warmEnterpriseStackSnapshot(DEPLOYMENT_ID);
  testFreezeManifest();
  testFreezeBaseline();
  testFreezeIntegrityAndLock();
  testFreezeReleaseAndSnapshot();
  testProductionFreezeFoundation();
  console.log("\nAll production freeze checks passed.");
}

main();
