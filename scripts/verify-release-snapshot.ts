/**
 * V3.7 FINAL — release snapshot verification
 */
import {
  buildSnapshotRuntime,
  buildSnapshotManifest,
  buildSnapshotArchive,
  buildSnapshotRestorePlan,
  buildSnapshotDriftDiff,
  warmEnterpriseStackSnapshot,
} from "../lib/release/index";

const DEPLOYMENT_ID = "v37-verify-snapshot";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  warmEnterpriseStackSnapshot(DEPLOYMENT_ID);
  const runtime = buildSnapshotRuntime({ deploymentId: DEPLOYMENT_ID });
  const manifest = buildSnapshotManifest({ deploymentId: DEPLOYMENT_ID });
  const archive = buildSnapshotArchive({ deploymentId: DEPLOYMENT_ID });
  const restore = buildSnapshotRestorePlan({ deploymentId: DEPLOYMENT_ID });
  const diff = buildSnapshotDriftDiff({ deploymentId: DEPLOYMENT_ID });

  assert(runtime.chain.length >= 3, "snapshot chain");
  assert(Object.keys(runtime.releaseSnapshotMap).length >= 3, "snapshot map");
  assert(manifest.rollbackLineage.length >= 2, "rollback lineage");
  assert(archive.entries.length >= 3, "archive entries");
  assert(restore.restoreReady, "restore ready");
  assert(!diff.driftDetected, "no drift");
  assert(restore.restoreGraph.includes("→"), "restore graph");

  console.log("✓ snapshot chain");
  console.log(" ", runtime.summary);
  console.log("✓ rollback lineage");
  console.log(" ", manifest.rollbackLineage.join(" → "));
  console.log("✓ snapshot continuity");
  console.log(" ", restore.summary);
  console.log("\nAll release snapshot checks passed.");
}

main();
