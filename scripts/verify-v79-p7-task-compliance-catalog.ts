/**
 * V79 P7 — Task Compliance Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TASK_COMPLIANCE_CATALOG_ENTRIES,
  TASK_COMPLIANCE_VALIDATION_CATALOG,
  V79_TASK_COMPLIANCE_FREEZE_VERSION,
  V79_TASK_COMPLIANCE_VERSION,
  assertTaskComplianceCatalogPass,
  buildTaskComplianceCatalog,
  computeTaskDeclarativeCompliancePass,
  formatTaskComplianceCatalogSummary,
  getTaskComplianceCatalogEntriesByKind,
  getTaskComplianceCatalogEntryById,
  getTaskComplianceValidationByComplianceRef,
  isTaskComplianceCatalogRefsAligned,
  runTaskComplianceCatalog,
} from "../lib/task/v79/task.compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p7-task-compliance-catalog";

const REQUIRED_KINDS = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/task/v79/task.compliance.ts",
    "lib/task/v79/task.compliance.catalog.ts",
    "lib/task/v79/task.compliance.builder.ts",
    "lib/task/v79/task.compliance.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task compliance catalog module structure");
}

function testInventories() {
  check(TASK_COMPLIANCE_CATALOG_ENTRIES.length === 8, "compliance catalog entries");
  check(TASK_COMPLIANCE_VALIDATION_CATALOG.length === 8, "compliance validation catalog");
  check(isTaskComplianceCatalogRefsAligned(), "compliance catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getTaskComplianceCatalogEntriesByKind(kind).length >= 1, `${kind} compliance kind`);
  }
  console.log("✓ compliance items, validations, kinds & alignment");
}

function testComplianceFields() {
  for (const item of TASK_COMPLIANCE_CATALOG_ENTRIES) {
    check(item.purpose.length > 0, `${item.id} purpose`);
    check(item.rule.length > 0, `${item.id} rule`);
    check(item.auditPoint.length > 0, `${item.id} auditPoint`);
    check(item.waiverCondition.length > 0, `${item.id} waiverCondition`);
    check(item.roleRef.length > 0, `${item.id} roleRef`);
    check(item.stateRef.length > 0, `${item.id} stateRef`);
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
  const shared = getTaskComplianceCatalogEntryById("TSK-CMP-001");
  check(shared?.kind === "shared", "TSK-CMP-001 shared");
  check(shared?.status === "passed", "TSK-CMP-001 passed");

  const state = getTaskComplianceCatalogEntriesByKind("state");
  check(state.length >= 1, "state compliance kind");
  check(state[0]?.upstreamRef === "TSK-SIM-003", "state upstream ref");

  const boundary = getTaskComplianceCatalogEntryById("TSK-CMP-008");
  check(boundary?.kind === "boundary", "TSK-CMP-008 boundary");
  check(boundary?.rule === "no-runtime-task-engine-must-be-declared", "TSK-CMP-008 rule");

  const validation = getTaskComplianceValidationByComplianceRef("TSK-CMP-007");
  check(validation?.validationKind === "governance", "TSK-CMP-007 validation");

  check(
    computeTaskDeclarativeCompliancePass({ status: "passed", required: true }),
    "compliance pass required",
  );
  check(
    !computeTaskDeclarativeCompliancePass({ status: "failed", required: true }),
    "compliance fail required",
  );

  console.log("✓ compliance queries");
}

function testReport() {
  const incomplete = runTaskComplianceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { taskSimulationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete simulation catalog not ready");

  const ready = buildTaskComplianceCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V79_TASK_COMPLIANCE_VERSION, "compliance catalog version");
  check(ready.freezeVersion === V79_TASK_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.taskSimulationCatalogReady, "P6 simulation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTaskComplianceCatalogPass(ready);

  console.log("✓ task compliance catalog report");
  console.log(formatTaskComplianceCatalogSummary(ready));
  console.log("\n✅ V79 P7 Task Compliance Catalog — verify PASS");
}

function main() {
  console.log("V79 P7 Task Compliance Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
