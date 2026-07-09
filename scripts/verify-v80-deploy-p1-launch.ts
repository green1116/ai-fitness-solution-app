/**
 * V80 DEPLOY P1 — Production Launch Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  DEPLOY_STRUCTURE,
  GO_LIVE_CHECKLIST,
  RUNTIME_ENTRY_POINTS,
  V80_DEPLOY_LAUNCH_VERSION,
  V80_ENV_CONTRACT,
  assertDeployLaunchPass,
  buildDeployLaunch,
  formatDeployLaunchSummary,
  getRequiredEnvKeys,
  getRuntimeEntryByKind,
  isDeployStructureComplete,
  isEnvContractComplete,
  isGoLiveChecklistComplete,
  isRuntimeEntryComplete,
  runDeployLaunch,
} from "../lib/deploy/v80/deploy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-deploy-p1-launch";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deploy/v80/deploy.types.ts",
    "lib/deploy/v80/deploy.structure.spec.ts",
    "lib/deploy/v80/deploy.env.contract.ts",
    "lib/deploy/v80/deploy.runtime.spec.ts",
    "lib/deploy/v80/deploy.checklist.ts",
    "lib/deploy/v80/deploy.builder.ts",
    "lib/deploy/v80/deploy.entry.ts",
    "scripts/v80-worker-start.ts",
    ".env.v80.example",
    "docs/V80-DEPLOY-P1-LAUNCH.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ deploy module structure");
}

function testSpecs() {
  check(DEPLOY_STRUCTURE.length === 7, "7 structure nodes");
  check(V80_ENV_CONTRACT.length >= 12, "env contract");
  check(RUNTIME_ENTRY_POINTS.length >= 13, "runtime entries");
  check(GO_LIVE_CHECKLIST.length === 10, "10 go-live gates");
  check(isDeployStructureComplete(), "structure complete");
  check(isEnvContractComplete(), "env complete");
  check(isRuntimeEntryComplete(), "runtime complete");
  check(isGoLiveChecklistComplete(), "checklist complete");
  check(getRequiredEnvKeys().includes("DATABASE_URL"), "DATABASE_URL required");
  check(getRuntimeEntryByKind("worker").length >= 1, "worker entry");
  console.log("✓ structure, env, runtime & checklist specs");
}

function testReport() {
  const ready = buildDeployLaunch({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_DEPLOY_LAUNCH_VERSION, "version");
  check(ready.scaleReady, "product scale ready");
  check(ready.manifest.launchComplete, "launch complete");
  check(ready.launchReady, "launch ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertDeployLaunchPass(ready);
  check(runDeployLaunch({ deploymentId: DEPLOYMENT_ID }).launchReady, "run ready");

  console.log("✓ deploy launch report");
  console.log(formatDeployLaunchSummary(ready));
  console.log("\n✅ V80 DEPLOY P1 Launch — verify PASS");
}

function main() {
  console.log("V80 DEPLOY P1 Production Launch Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();
