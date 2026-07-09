/**
 * V66 P7 — Deployment Automation & Ops Runbook Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  DEPLOYMENT_AUTOMATION_CATALOG,
  ESCALATION_MAP,
  OPERATOR_ACTIONS_MATRIX,
  V66_DEPLOYMENT_OPS_VERSION,
  V66_OPS_ARTIFACT_SURFACE,
  assertDeploymentOpsPass,
  buildAutomationCatalogManifest,
  buildDeploymentOpsReport,
  buildEscalationMapManifest,
  buildOperatorActionsManifest,
  buildRunbookChecklistManifest,
  formatDeploymentOpsSummary,
  runDeploymentOps,
} from "../lib/deployment/v66";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v66-p7-deployment-ops";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deployment/v66/ops.ts",
    "lib/deployment/v66/ops.types.ts",
    "lib/deployment/v66/ops.artifacts.ts",
    "lib/deployment/v66/ops.builder.ts",
    "lib/deployment/v66/ops.entry.ts",
    "lib/deployment/v66/automation.catalog.ts",
    "lib/deployment/v66/runbook.checklist.ts",
    "lib/deployment/v66/operator.actions.matrix.ts",
    "lib/deployment/v66/escalation.map.ts",
    "docs/deployment/V66-DEPLOYMENT-OPS.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V66 deployment ops module structure");
}

function testInventories() {
  assert(DEPLOYMENT_AUTOMATION_CATALOG.length >= 10, "automation catalog");
  assert(OPERATOR_ACTIONS_MATRIX.length >= 10, "operator actions matrix");
  assert(OPERATOR_ACTIONS_MATRIX.every((a) => !a.automated), "no automated actions");
  assert(ESCALATION_MAP.length >= 8, "escalation map");
  console.log("✓ automation, operator actions & escalation inventories");
}

function testManifests() {
  const automation = buildAutomationCatalogManifest();
  assert(automation.catalogComplete, "automation catalog complete");

  const actions = buildOperatorActionsManifest();
  assert(actions.matrixComplete, "operator actions complete");

  const escalation = buildEscalationMapManifest();
  assert(escalation.mapComplete, "escalation map complete");

  const signals = {
    drReady: true,
    automationCatalogComplete: true,
    runbookChecklistPass: true,
    operatorActionsComplete: true,
    escalationMapComplete: true,
  };
  const runbook = buildRunbookChecklistManifest(signals);
  assert(runbook.checklistPass, "runbook checklist pass");
  console.log("✓ automation, runbook, actions & escalation manifests");
}

function testReport() {
  const incomplete = runDeploymentOps({
    deploymentId: DEPLOYMENT_ID,
    signals: { automationCatalogComplete: false },
  });
  assert(!incomplete.opsReady, "incomplete automation not ready");

  const ready = buildDeploymentOpsReport({ deploymentId: DEPLOYMENT_ID });

  assert(ready.version === V66_DEPLOYMENT_OPS_VERSION, "ops version");
  assert(ready.drReady, "dr ready");
  assert(ready.automationCatalog.catalogComplete, "automation complete");
  assert(ready.runbookChecklist.checklistPass, "runbook pass");
  assert(ready.operatorActions.matrixComplete, "actions complete");
  assert(ready.escalationMap.mapComplete, "escalation complete");
  assert(ready.opsReady, "ops ready");
  assert(ready.readinessScore === 100, "readiness score 100");
  assertDeploymentOpsPass(ready);

  assert(
    V66_OPS_ARTIFACT_SURFACE.verifyOps.includes("verify:v66-p7"),
    "artifact surface verify script",
  );

  console.log("✓ deployment ops report");
  console.log(formatDeploymentOpsSummary(ready));
  console.log("\n✅ V66 P7 Deployment Automation & Ops Runbook — verify PASS");
}

function main() {
  console.log("V66 P7 Deployment Automation & Ops Runbook Verification\n");
  checkModuleStructure();
  testInventories();
  testManifests();
  testReport();
}

main();
