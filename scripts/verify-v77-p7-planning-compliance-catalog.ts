/**
 * V77 P7 — Planning Compliance Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_COMPLIANCE_CATALOG_ENTRIES,
  PLANNING_COMPLIANCE_VALIDATION_CATALOG,
  V77_PLANNING_COMPLIANCE_FREEZE_VERSION,
  V77_PLANNING_COMPLIANCE_VERSION,
  assertPlanningComplianceCatalogPass,
  buildPlanningComplianceCatalog,
  computePlanningDeclarativeCompliancePass,
  formatPlanningComplianceCatalogSummary,
  getPlanningComplianceCatalogEntriesByKind,
  getPlanningComplianceCatalogEntryById,
  getPlanningComplianceValidationByComplianceRef,
  isPlanningComplianceCatalogRefsAligned,
  runPlanningComplianceCatalog,
} from "../lib/planning/v77/planning.compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p7-planning-compliance-catalog";

const REQUIRED_KINDS = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/planning/v77/planning.compliance.ts",
    "lib/planning/v77/planning.compliance.catalog.ts",
    "lib/planning/v77/planning.compliance.builder.ts",
    "lib/planning/v77/planning.compliance.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning compliance catalog module structure");
}

function testInventories() {
  check(PLANNING_COMPLIANCE_CATALOG_ENTRIES.length === 8, "compliance catalog entries");
  check(PLANNING_COMPLIANCE_VALIDATION_CATALOG.length === 8, "compliance validation catalog");
  check(isPlanningComplianceCatalogRefsAligned(), "compliance catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getPlanningComplianceCatalogEntriesByKind(kind).length >= 1, `${kind} compliance kind`);
  }
  console.log("✓ compliance items, validations, kinds & alignment");
}

function testComplianceFields() {
  for (const item of PLANNING_COMPLIANCE_CATALOG_ENTRIES) {
    check(item.purpose.length > 0, `${item.id} purpose`);
    check(item.rule.length > 0, `${item.id} rule`);
    check(item.auditPoint.length > 0, `${item.id} auditPoint`);
    check(item.waiverCondition.length > 0, `${item.id} waiverCondition`);
    check(item.roleRef.length > 0, `${item.id} roleRef`);
    check(item.topologyRef.length > 0, `${item.id} topologyRef`);
    check(item.dependencyRef.length > 0, `${item.id} dependencyRef`);
    check(item.criteria.length >= 1, `${item.id} criteria`);
    check(item.evidence.length > 0, `${item.id} evidence`);
    check(item.status.length > 0, `${item.id} status`);
    check(item.validation.length > 0, `${item.id} validation`);
    check(item.upstreamRef.length > 0, `${item.id} upstreamRef`);
  }
  console.log("✓ compliance field coverage");
}

function testComplianceQueries() {
  const shared = getPlanningComplianceCatalogEntryById("PLN-CMP-001");
  check(shared?.kind === "shared", "PLN-CMP-001 shared");
  check(shared?.status === "passed", "PLN-CMP-001 passed");

  const boundary = getPlanningComplianceCatalogEntriesByKind("boundary");
  check(boundary.length >= 1, "boundary compliance kind");
  check(boundary[0]?.upstreamRef === "PLN-SIM-008", "boundary upstream ref");

  const governance = getPlanningComplianceCatalogEntryById("PLN-CMP-006");
  check(governance?.kind === "governance", "PLN-CMP-006 governance");

  const validation = getPlanningComplianceValidationByComplianceRef("PLN-CMP-007");
  check(validation?.validationKind === "workspace", "PLN-CMP-007 validation");

  check(
    computePlanningDeclarativeCompliancePass({ status: "passed", required: true }),
    "compliance pass required",
  );
  check(
    !computePlanningDeclarativeCompliancePass({ status: "failed", required: true }),
    "compliance fail required",
  );

  console.log("✓ compliance queries");
}

function testReport() {
  const incomplete = runPlanningComplianceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { planningSimulationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete simulation catalog not ready");

  const ready = buildPlanningComplianceCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V77_PLANNING_COMPLIANCE_VERSION, "compliance catalog version");
  check(ready.freezeVersion === V77_PLANNING_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.planningSimulationCatalogReady, "P6 simulation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPlanningComplianceCatalogPass(ready);

  console.log("✓ planning compliance catalog report");
  console.log(formatPlanningComplianceCatalogSummary(ready));
  console.log("\n✅ V77 P7 Planning Compliance Catalog — verify PASS");
}

function main() {
  console.log("V77 P7 Planning Compliance Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
