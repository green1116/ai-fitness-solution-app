/**
 * V3.7 FINAL — release baseline verification
 */
import {
  buildReleaseBaseline,
  buildReleaseBaselineRegistry,
  buildReleaseBaselineArchive,
  buildReleaseBaselineHistory,
  buildReleaseBaselineSummary,
  warmEnterpriseStackSnapshot,
} from "../lib/release/index";

const DEPLOYMENT_ID = "v37-verify-baseline";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  warmEnterpriseStackSnapshot(DEPLOYMENT_ID);
  const baseline = buildReleaseBaseline({ deploymentId: DEPLOYMENT_ID });
  assert(baseline.readyForProduction, "baseline ready");
  assert(baseline.layerCount >= 9, "layer count");

  const registry = buildReleaseBaselineRegistry({ deploymentId: DEPLOYMENT_ID });
  assert(registry.registeredCount >= 10, "registry entries");

  const archive = buildReleaseBaselineArchive({ deploymentId: DEPLOYMENT_ID });
  assert(archive.recordCount >= 10, "archive records");

  const history = buildReleaseBaselineHistory({ deploymentId: DEPLOYMENT_ID });
  assert(history.lineage.length >= 10, "lineage nodes");
  assert(history.freezeContinuity, "freeze continuity");
  assert(history.evolutionGraph.includes("→"), "evolution graph");

  const summary = buildReleaseBaselineSummary({ deploymentId: DEPLOYMENT_ID });
  assert(summary.baseline.readyForProduction, "summary baseline ready");

  console.log("✓ release baseline");
  console.log(" ", summary.summary);
  console.log("✓ baseline lineage");
  console.log(" ", history.evolutionGraph.slice(0, 100));
  console.log("\nAll release baseline checks passed.");
}

main();
