/**
 * V70 P5 — Upgrade Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertUpgradeGovernancePass,
  buildUpgradeGovernance,
  computeDeclarativeUpgradeRiskBlock,
  formatUpgradeGovernanceSummary,
  getPostCheckByPlanRef,
  getPreCheckByPlanRef,
  getRollbackPlanByPlanRef,
  getUpgradePathById,
  getUpgradePlanById,
  getUpgradePlansByRiskLevel,
  isUpgradeGovernanceRefsAligned,
  POST_CHECK_CATALOG,
  PRE_CHECK_CATALOG,
  ROLLBACK_PLAN_CATALOG,
  runUpgradeGovernance,
  UPGRADE_PATH_CATALOG,
  UPGRADE_PLAN_CATALOG,
  V70_UPGRADE_GOVERNANCE_FREEZE_VERSION,
  V70_UPGRADE_GOVERNANCE_VERSION,
} from "../lib/delivery/v70/upgrade.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p5-upgrade-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/upgrade.governance.ts",
    "lib/delivery/v70/upgrade.plan.ts",
    "lib/delivery/v70/upgrade.builder.ts",
    "lib/delivery/v70/upgrade.entry.ts",
    "docs/V70-P5-UPGRADE-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 upgrade governance module structure");
}

function testInventories() {
  check(UPGRADE_PLAN_CATALOG.length >= 6, "upgrade plan catalog");
  check(UPGRADE_PATH_CATALOG.length >= 6, "upgrade path catalog");
  check(PRE_CHECK_CATALOG.length >= 6, "pre-check catalog");
  check(POST_CHECK_CATALOG.length >= 6, "post-check catalog");
  check(ROLLBACK_PLAN_CATALOG.length >= 6, "rollback plan catalog");
  check(isUpgradeGovernanceRefsAligned(), "upgrade governance refs aligned");
  console.log("✓ plans, paths, checks, rollback & alignment");
}

function testPlanFields() {
  for (const plan of UPGRADE_PLAN_CATALOG) {
    check(plan.upgradePath.length > 0, `${plan.id} upgradePath`);
    check(plan.preCheck.length > 0, `${plan.id} preCheck`);
    check(plan.postCheck.length > 0, `${plan.id} postCheck`);
    check(plan.rollbackPlan.length > 0, `${plan.id} rollbackPlan`);
    check(plan.compatibilityCheck.length > 0, `${plan.id} compatibilityCheck`);
    check(plan.approval.length > 0, `${plan.id} approval`);
    check(plan.riskLevel.length > 0, `${plan.id} riskLevel`);
    check(plan.maintenanceWindow.length > 0, `${plan.id} maintenanceWindow`);
    check(plan.successCriteria.length > 0, `${plan.id} successCriteria`);
  }
  console.log("✓ upgrade plan field coverage");
}

function testPlanQueries() {
  const plan = getUpgradePlanById("DLV-UPG-001");
  check(plan?.compatibilityCheck === "DLV-VPX-001", "DLV-UPG-001 compatibility check");
  check(plan?.approval === "approved", "DLV-UPG-001 approval");

  const path = getUpgradePathById("DLV-UPG-PATH-002");
  check(path?.toReleaseRef === "DLV-REL-003", "DLV-UPG-PATH-002 target release");

  const pre = getPreCheckByPlanRef("DLV-UPG-004");
  check(pre?.checkKind === "compatibility", "DLV-UPG-004 pre-check");

  const post = getPostCheckByPlanRef("DLV-UPG-007");
  check(post?.checkKind === "production", "DLV-UPG-007 post-check");

  const rbk = getRollbackPlanByPlanRef("DLV-UPG-007");
  check(rbk?.rollbackTarget === "DLV-REL-006", "DLV-UPG-007 rollback plan");

  const critical = getUpgradePlansByRiskLevel("critical");
  check(critical.length >= 1, "critical risk plans");

  check(
    computeDeclarativeUpgradeRiskBlock({ riskLevel: "critical", approval: "required" }),
    "risk block critical required",
  );
  check(
    !computeDeclarativeUpgradeRiskBlock({ riskLevel: "low", approval: "approved" }),
    "risk block low approved",
  );

  console.log("✓ upgrade plan queries");
}

function testReport() {
  const incomplete = runUpgradeGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionCompatibilityReady: false },
  });
  check(!incomplete.governanceReady, "incomplete compatibility not ready");

  const ready = buildUpgradeGovernance({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V70_UPGRADE_GOVERNANCE_VERSION, "governance version");
  check(ready.freezeVersion === V70_UPGRADE_GOVERNANCE_FREEZE_VERSION, "freeze version");
  check(ready.versionCompatibilityReady, "P4 compatibility ready");
  check(ready.plans.catalogComplete, "plans complete");
  check(ready.paths.catalogComplete, "paths complete");
  check(ready.preChecks.catalogComplete, "pre-checks complete");
  check(ready.postChecks.catalogComplete, "post-checks complete");
  check(ready.rollbackPlans.catalogComplete, "rollback plans complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertUpgradeGovernancePass(ready);

  console.log("✓ upgrade governance report");
  console.log(formatUpgradeGovernanceSummary(ready));
  console.log("\n✅ V70 P5 Upgrade Governance — verify PASS");
}

function main() {
  console.log("V70 P5 Upgrade Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testPlanFields();
  testPlanQueries();
  testReport();
}

main();
