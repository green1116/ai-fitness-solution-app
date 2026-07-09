/**
 * V66 P1 — Deployment Baseline & Env Contract Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ENV_VAR_INVENTORY,
  RUNTIME_CONFIG_SURFACE,
  V66_DEPLOYMENT_ARTIFACT_SURFACE,
  V66_DEPLOYMENT_BASELINE_VERSION,
  V66_UPSTREAM_FROZEN_LAYER_LOCK,
  assertDeploymentBaselinePass,
  buildDeploymentBaselineReport,
  buildEnvContractManifest,
  buildRuntimeConfigSurfaceManifest,
  formatDeploymentBaselineSummary,
  getRequiredProductionEnvKeys,
  isUpstreamFrozenLayerLockIntact,
  runDeploymentBaseline,
} from "../lib/deployment/v66";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v66-p1-deployment-baseline";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deployment/v66/index.ts",
    "lib/deployment/v66/baseline.ts",
    "lib/deployment/v66/baseline.types.ts",
    "lib/deployment/v66/baseline.lock.ts",
    "lib/deployment/v66/baseline.surface.ts",
    "lib/deployment/v66/baseline.builder.ts",
    "lib/deployment/v66/baseline.entry.ts",
    "lib/deployment/v66/env.contract.ts",
    "lib/deployment/v66/env.inventory.ts",
    "lib/deployment/v66/deployment.checklist.ts",
    "lib/deployment/v66/runtime.surface.ts",
    "docs/deployment/V66-DEPLOYMENT-BASELINE.md",
    V66_DEPLOYMENT_ARTIFACT_SURFACE.envExample,
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V66 deployment baseline module structure");
}

function testEnvContract() {
  const contract = buildEnvContractManifest();
  assert(contract.version.length > 0, "env contract version");
  assert(ENV_VAR_INVENTORY.length >= 20, "env inventory size");
  assert(contract.requiredInProduction.length >= 5, "required prod keys");
  assert(contract.forbiddenInProduction.length >= 4, "forbidden prod keys");
  assert(contract.contractComplete, "env contract complete");

  const required = getRequiredProductionEnvKeys();
  assert(required.includes("DATABASE_URL"), "DATABASE_URL required");
  assert(required.includes("DOWNLOAD_TOKEN_SECRET"), "DOWNLOAD_TOKEN_SECRET required");
  console.log("✓ environment contract");
}

function testRuntimeSurface() {
  const surface = buildRuntimeConfigSurfaceManifest();
  assert(RUNTIME_CONFIG_SURFACE.length >= 8, "runtime surface entries");
  assert(surface.namespaceCount >= 5, "runtime namespaces");
  assert(surface.surfaceComplete, "runtime surface complete");
  console.log("✓ runtime config surface");
}

function testUpstreamLock() {
  assert(isUpstreamFrozenLayerLockIntact(), "upstream frozen lock intact");
  assert(V66_UPSTREAM_FROZEN_LAYER_LOCK.v64CommercialFreeze.length > 0, "v64 freeze ref");
  assert(V66_UPSTREAM_FROZEN_LAYER_LOCK.v65ProductionSignoff.length > 0, "v65 signoff ref");
  console.log("✓ upstream frozen layer lock (V48–V65 untouched)");
}

function testReport() {
  const incomplete = runDeploymentBaseline({
    deploymentId: DEPLOYMENT_ID,
    signals: { verifyChainPass: false },
  });
  assert(!incomplete.deploymentReady, "incomplete signals not ready");

  const ready = buildDeploymentBaselineReport({
    deploymentId: DEPLOYMENT_ID,
    targetEnvironment: "production",
  });

  assert(ready.version === V66_DEPLOYMENT_BASELINE_VERSION, "baseline version");
  assert(ready.deploymentChecklist.length >= 10, "deployment checklist");
  assert(ready.contractComplete, "contract complete");
  assert(ready.deploymentReady, "deployment ready");
  assert(ready.readinessScore === 100, "readiness score 100");
  assertDeploymentBaselinePass(ready);

  console.log("✓ deployment baseline report");
  console.log(formatDeploymentBaselineSummary(ready));
  console.log("\n✅ V66 P1 Deployment Baseline & Env Contract — verify PASS");
}

function main() {
  console.log("V66 P1 Deployment Baseline & Env Contract Verification\n");
  checkModuleStructure();
  testEnvContract();
  testRuntimeSurface();
  testUpstreamLock();
  testReport();
}

main();
