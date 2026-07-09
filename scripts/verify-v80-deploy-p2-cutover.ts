/**
 * V80 DEPLOY P2 — Go-live cutover verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CUTOVER_PLAN,
  FIRST_TENANT_LIVE_FLOW,
  ROLLBACK_PLAN,
  SMOKE_TEST_SUITE,
  V80_DEPLOY_CUTOVER_VERSION,
  assertCutoverPass,
  buildCutover,
  formatCutoverSummary,
  getCriticalSmokeTests,
  isCutoverPlanComplete,
  isFirstTenantFlowComplete,
  isRollbackPlanComplete,
  isSmokeSuiteComplete,
  runCutover,
} from "../lib/deploy/v80/cutover.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-deploy-p2-cutover";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deploy/v80/cutover.types.ts",
    "lib/deploy/v80/deploy.cutover.spec.ts",
    "lib/deploy/v80/deploy.first-tenant.spec.ts",
    "lib/deploy/v80/deploy.smoke.spec.ts",
    "lib/deploy/v80/deploy.rollback.spec.ts",
    "lib/deploy/v80/cutover.builder.ts",
    "lib/deploy/v80/cutover.entry.ts",
    "scripts/v80-smoke-live.ts",
    "docs/V80-DEPLOY-P2-CUTOVER.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ cutover module structure");
}

function testSpecs() {
  check(CUTOVER_PLAN.length === 10, "10 cutover steps");
  check(FIRST_TENANT_LIVE_FLOW.length === 8, "8 first-tenant steps");
  check(SMOKE_TEST_SUITE.length >= 10, "smoke suite");
  check(ROLLBACK_PLAN.length === 6, "6 rollback actions");
  check(isCutoverPlanComplete(), "cutover plan");
  check(isFirstTenantFlowComplete(), "first tenant");
  check(isSmokeSuiteComplete(), "smoke suite");
  check(isRollbackPlanComplete(), "rollback plan");
  check(getCriticalSmokeTests().length >= 7, "critical smoke");
  console.log("✓ cutover, tenant, smoke & rollback specs");
}

function testReport() {
  const ready = buildCutover({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_DEPLOY_CUTOVER_VERSION, "version");
  check(ready.launchReady, "P1 launch ready");
  check(ready.manifest.cutoverComplete, "cutover complete");
  check(ready.cutoverReady, "cutover ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertCutoverPass(ready);
  check(runCutover({ deploymentId: DEPLOYMENT_ID }).cutoverReady, "run ready");

  console.log("✓ cutover report");
  console.log(formatCutoverSummary(ready));
  console.log("\n✅ V80 DEPLOY P2 Cutover — verify PASS");
}

function main() {
  console.log("V80 DEPLOY P2 Production Go-Live Cutover Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();
