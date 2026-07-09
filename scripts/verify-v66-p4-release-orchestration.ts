/**
 * V66 P4 — Release Orchestration & Rollback Guard Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ROLLBACK_GUARD_RULE_COUNT,
  ROLLOUT_STAGE_COUNT,
  V66_RELEASE_ARTIFACT_SURFACE,
  V66_RELEASE_LAYER_CATALOG,
  V66_RELEASE_ORCHESTRATION_VERSION,
  assertReleaseOrchestrationPass,
  buildReleaseManifest,
  buildReleaseOrchestrationReport,
  buildRollbackGuardManifest,
  buildRolloutStageManifest,
  evaluateRollbackGuard,
  formatReleaseOrchestrationSummary,
  runReleaseOrchestration,
} from "../lib/deployment/v66";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v66-p4-release-orchestration";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deployment/v66/release.ts",
    "lib/deployment/v66/release.types.ts",
    "lib/deployment/v66/release.artifacts.ts",
    "lib/deployment/v66/release.manifest.ts",
    "lib/deployment/v66/release.builder.ts",
    "lib/deployment/v66/release.entry.ts",
    "lib/deployment/v66/rollout.stages.ts",
    "lib/deployment/v66/rollback.guard.ts",
    "docs/deployment/V66-RELEASE-ORCHESTRATION.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V66 release orchestration module structure");
}

function testInventories() {
  assert(V66_RELEASE_LAYER_CATALOG.length >= 4, "release layer catalog");
  assert(ROLLOUT_STAGE_COUNT >= 6, "rollout stages");
  assert(ROLLBACK_GUARD_RULE_COUNT >= 6, "rollback guard rules");
  console.log("✓ release manifest, rollout & rollback inventories");
}

function testManifests() {
  const manifest = buildReleaseManifest({ deploymentId: DEPLOYMENT_ID });
  assert(manifest.manifestComplete, "release manifest complete");
  assert(manifest.layers.some((l) => l.phase === "P4"), "P4 layer in manifest");

  const signals = {
    observabilityReady: true,
    manifestComplete: true,
    rolloutStagesComplete: true,
    rollbackGuardIntact: true,
  };
  const rollout = buildRolloutStageManifest(signals);
  assert(rollout.sequenceComplete, "rollout sequence complete");

  const guard = buildRollbackGuardManifest(signals);
  assert(guard.guardIntact, "rollback guard intact");

  const tripped = evaluateRollbackGuard({ rollbackGuardIntact: false });
  assert(tripped.some((r) => r.status === "tripped"), "guard trips on bad signal");
  console.log("✓ release manifest, rollout stages & rollback guard");
}

function testReport() {
  const incomplete = runReleaseOrchestration({
    deploymentId: DEPLOYMENT_ID,
    signals: { rollbackGuardIntact: false },
  });
  assert(!incomplete.orchestrationReady, "tripped guard not ready");

  const ready = buildReleaseOrchestrationReport({ deploymentId: DEPLOYMENT_ID });

  assert(ready.version === V66_RELEASE_ORCHESTRATION_VERSION, "orchestration version");
  assert(ready.observabilityReady, "observability ready");
  assert(ready.releaseManifest.manifestComplete, "manifest complete");
  assert(ready.rolloutStages.sequenceComplete, "rollout complete");
  assert(ready.rollbackGuard.guardIntact, "guard intact");
  assert(ready.orchestrationReady, "orchestration ready");
  assert(ready.readinessScore === 100, "readiness score 100");
  assertReleaseOrchestrationPass(ready);

  assert(
    V66_RELEASE_ARTIFACT_SURFACE.verifyOrchestration.includes("verify:v66-p4"),
    "artifact surface verify script",
  );

  console.log("✓ release orchestration report");
  console.log(formatReleaseOrchestrationSummary(ready));
  console.log("\n✅ V66 P4 Release Orchestration & Rollback Guard — verify PASS");
}

function main() {
  console.log("V66 P4 Release Orchestration & Rollback Guard Verification\n");
  checkModuleStructure();
  testInventories();
  testManifests();
  testReport();
}

main();
