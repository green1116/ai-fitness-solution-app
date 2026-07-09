/**
 * V67 P4 — SLO/SLI Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ERROR_BUDGET_CATALOG,
  OBJECTIVE_CATALOG,
  SLI_TYPE_CATALOG,
  SLO_TYPE_CATALOG,
  V67_SLO_GOVERNANCE_ARTIFACT_SURFACE,
  V67_SLO_GOVERNANCE_VERSION,
  assertSloGovernancePass,
  buildBudgetContractManifest,
  buildObjectiveCatalogManifest,
  buildSloGovernanceReport,
  buildSliTypeManifest,
  buildSloTypeManifest,
  computeDeclarativeErrorBudget,
  formatSloGovernanceSummary,
  getBudgetRulesBySloRef,
  getSliTypeByFoundationRef,
  runSloGovernance,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p4-slo-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/slo/slo.ts",
    "lib/monitoring/v67/slo/governance.types.ts",
    "lib/monitoring/v67/slo/governance.surface.ts",
    "lib/monitoring/v67/slo/governance.builder.ts",
    "lib/monitoring/v67/slo/governance.entry.ts",
    "lib/monitoring/v67/slo/sli.types.catalog.ts",
    "lib/monitoring/v67/slo/slo.types.catalog.ts",
    "lib/monitoring/v67/slo/objective.catalog.ts",
    "lib/monitoring/v67/slo/budget.contract.ts",
    "docs/monitoring/V67-SLO-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 SLO governance module structure");
}

function testInventories() {
  check(SLI_TYPE_CATALOG.length >= 6, "SLI type catalog");
  check(SLO_TYPE_CATALOG.length >= 6, "SLO type catalog");
  check(OBJECTIVE_CATALOG.length >= 6, "objective catalog");
  check(ERROR_BUDGET_CATALOG.length >= 6, "error budget catalog");
  console.log("✓ SLI, SLO, objective & budget inventories");
}

function testCrossReferences() {
  for (const slo of SLO_TYPE_CATALOG) {
    check(
      SLI_TYPE_CATALOG.some((s) => s.id === slo.sliRef),
      `sliRef ${slo.sliRef} for ${slo.id}`,
    );
  }

  const sli001 = getSliTypeByFoundationRef("SLI-001");
  check(sli001?.foundationRef === "SLI-001", "foundation SLI-001 mapping");

  const availabilityBudgets = getBudgetRulesBySloRef("SLOT-001");
  check(availabilityBudgets.length >= 2, "availability error budgets");

  const budgetMinutes = computeDeclarativeErrorBudget({ objectivePercent: 99.9, windowDays: 30 });
  check(budgetMinutes > 0, "declarative error budget compute");
  console.log("✓ cross-references & foundation alignment");
}

function testManifests() {
  check(buildSliTypeManifest().catalogComplete, "SLI types complete");
  check(buildSloTypeManifest().catalogComplete, "SLO types complete");
  check(buildObjectiveCatalogManifest().catalogComplete, "objectives complete");
  check(buildBudgetContractManifest().contractComplete, "budget contract complete");
  console.log("✓ governance manifests");
}

function testReport() {
  const incomplete = runSloGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { taxonomyReady: false },
  });
  check(!incomplete.governanceReady, "incomplete taxonomy not ready");

  const ready = buildSloGovernanceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V67_SLO_GOVERNANCE_VERSION, "governance version");
  check(ready.taxonomyReady, "taxonomy ready");
  check(ready.sliTypes.catalogComplete, "SLI catalog complete");
  check(ready.sloTypes.catalogComplete, "SLO catalog complete");
  check(ready.objectiveCatalog.catalogComplete, "objectives complete");
  check(ready.budgetContract.contractComplete, "budget complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertSloGovernancePass(ready);

  check(
    V67_SLO_GOVERNANCE_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v67-p4"),
    "artifact surface verify script",
  );

  console.log("✓ SLO governance report");
  console.log(formatSloGovernanceSummary(ready));
  console.log("\n✅ V67 P4 SLO/SLI Governance — verify PASS");
}

function main() {
  console.log("V67 P4 SLO/SLI Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
