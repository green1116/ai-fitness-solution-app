/**
 * Phase XIII Platform Freeze Baseline — verification
 */
import {
  PLATFORM_FREEZE_BASELINE_VERSION,
  buildFreezeInventory,
  getPhaseRegistry,
  buildFreezeManifests,
  buildPlatformBaseline,
  countFrozenDomains,
  buildPlatformFreezeReport,
  runPlatformFreeze,
} from "../lib/freeze";

const DEPLOYMENT_ID = "phase-xiii-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testFreezeInventory() {
  const inventory = buildFreezeInventory({ deploymentId: DEPLOYMENT_ID });
  assert(inventory.version === PLATFORM_FREEZE_BASELINE_VERSION, "inventory version");
  assert(inventory.totalPhases === 12, "total phases");
  assert(inventory.domains.length === 12, "domain count");
  assert(inventory.inventoryId.length > 0, "inventory id");

  const registry = getPhaseRegistry();
  assert(registry.length === 12, "registry count");
  for (let phase = 1; phase <= 12; phase += 1) {
    const entry = inventory.domains.find((d) => d.phase === phase);
    assert(entry !== undefined, `phase ${phase} entry`);
    assert(entry!.tag.length > 0, `phase ${phase} tag`);
  }

  console.log("✓ freeze inventory");
  console.log(" ", `phases=${inventory.totalPhases} domains=${inventory.domains.length}`);
}

function testFreezeManifest() {
  const manifests = buildFreezeManifests();
  assert(manifests.length === 12, "manifest count");
  for (const manifest of manifests) {
    assert(manifest.phase >= 1 && manifest.phase <= 12, "manifest phase");
    assert(manifest.phaseName.length > 0, "manifest phase name");
    assert(["active", "frozen", "archived"].includes(manifest.status), "manifest status");
    assert(manifest.version.length > 0, "manifest version");
    assert(manifest.tag.length > 0, "manifest tag");
  }
  assert(manifests.every((m) => m.status === "frozen"), "all phases frozen");

  console.log("✓ freeze manifest");
  console.log(" ", `manifests=${manifests.length} status=frozen`);
}

function testPlatformBaseline() {
  const inventory = buildFreezeInventory({ deploymentId: DEPLOYMENT_ID });
  const baseline = buildPlatformBaseline({ deploymentId: DEPLOYMENT_ID, inventory });
  assert(baseline.baselineId.length > 0, "baseline id");
  assert(baseline.runtime.status === "frozen", "runtime frozen");
  assert(baseline.consumer.status === "frozen", "consumer frozen");
  assert(baseline.dashboard.status === "frozen", "dashboard frozen");
  assert(baseline.release.status === "frozen", "release frozen");
  assert(baseline.operations.status === "frozen", "operations frozen");
  assert(baseline.commercialization.status === "frozen", "commercialization frozen");
  assert(baseline.landing.status === "frozen", "landing frozen");
  assert(baseline.governance.status === "frozen", "governance frozen");
  assert(baseline.trust.status === "frozen", "trust frozen");
  assert(baseline["control-center"].status === "frozen", "control-center frozen");
  assert(baseline.executive.tag === "v11-executive-intelligence-freeze", "executive tag");
  assert(baseline.strategy.tag === "v12-strategic-planning-freeze", "strategy tag");

  const frozenCount = countFrozenDomains(baseline);
  assert(frozenCount === 12, "frozen domain count");

  console.log("✓ platform baseline");
  console.log(" ", `baselineId=${baseline.baselineId} frozenDomains=${frozenCount}`);
}

function testPlatformFreezeRuntime() {
  const report = buildPlatformFreezeReport({ deploymentId: DEPLOYMENT_ID });
  assert(report.version === PLATFORM_FREEZE_BASELINE_VERSION, "report version");
  assert(report.totalDomains === 12, "total domains");
  assert(report.frozenDomains === 12, "frozen domains");
  assert(report.verificationCoverage === 100, "verification coverage");
  assert(report.runtimeSummary.length > 0, "runtime summary");

  const runtime = runPlatformFreeze({ deploymentId: DEPLOYMENT_ID });
  assert(runtime.reportId === report.reportId, "runtime report id");
  assert(runtime.totalDomains === report.totalDomains, "runtime total domains");
  assert(runtime.frozenDomains === report.frozenDomains, "runtime frozen domains");
  assert(runtime.verificationCoverage === report.verificationCoverage, "runtime coverage");

  console.log("✓ platform freeze report & runtime");
  console.log(" ", runtime.runtimeSummary);
  console.log("");
  console.log("Platform Freeze Baseline Ready");
  console.log(` total domains: ${runtime.totalDomains}`);
  console.log(` frozen domains: ${runtime.frozenDomains}`);
  console.log(` verification coverage: ${runtime.verificationCoverage}%`);
  console.log("");
  console.log("PLATFORM FREEZE VERIFY PASS");
}

function main() {
  testFreezeInventory();
  testFreezeManifest();
  testPlatformBaseline();
  testPlatformFreezeRuntime();
}

main();
