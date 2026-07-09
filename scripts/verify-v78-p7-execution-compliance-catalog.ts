/**
 * V78 P7 — Execution Compliance Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_COMPLIANCE_CATALOG_ENTRIES,
  EXECUTION_COMPLIANCE_VALIDATION_CATALOG,
  V78_EXECUTION_COMPLIANCE_FREEZE_VERSION,
  V78_EXECUTION_COMPLIANCE_VERSION,
  assertExecutionComplianceCatalogPass,
  buildExecutionComplianceCatalog,
  computeExecutionDeclarativeCompliancePass,
  formatExecutionComplianceCatalogSummary,
  getExecutionComplianceCatalogEntriesByKind,
  getExecutionComplianceCatalogEntryById,
  getExecutionComplianceValidationByComplianceRef,
  isExecutionComplianceCatalogRefsAligned,
  runExecutionComplianceCatalog,
} from "../lib/execution/v78/execution.compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p7-execution-compliance-catalog";

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
    "lib/execution/v78/execution.compliance.ts",
    "lib/execution/v78/execution.compliance.catalog.ts",
    "lib/execution/v78/execution.compliance.builder.ts",
    "lib/execution/v78/execution.compliance.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution compliance catalog module structure");
}

function testInventories() {
  check(EXECUTION_COMPLIANCE_CATALOG_ENTRIES.length === 8, "compliance catalog entries");
  check(EXECUTION_COMPLIANCE_VALIDATION_CATALOG.length === 8, "compliance validation catalog");
  check(isExecutionComplianceCatalogRefsAligned(), "compliance catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getExecutionComplianceCatalogEntriesByKind(kind).length >= 1, `${kind} compliance kind`);
  }
  console.log("✓ compliance items, validations, kinds & alignment");
}

function testComplianceFields() {
  for (const item of EXECUTION_COMPLIANCE_CATALOG_ENTRIES) {
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
  const shared = getExecutionComplianceCatalogEntryById("EXE-CMP-001");
  check(shared?.kind === "shared", "EXE-CMP-001 shared");
  check(shared?.status === "passed", "EXE-CMP-001 passed");

  const boundary = getExecutionComplianceCatalogEntriesByKind("boundary");
  check(boundary.length >= 1, "boundary compliance kind");
  check(boundary[0]?.upstreamRef === "EXE-SIM-008", "boundary upstream ref");

  const governance = getExecutionComplianceCatalogEntryById("EXE-CMP-006");
  check(governance?.kind === "governance", "EXE-CMP-006 governance");

  const validation = getExecutionComplianceValidationByComplianceRef("EXE-CMP-007");
  check(validation?.validationKind === "workspace", "EXE-CMP-007 validation");

  check(
    computeExecutionDeclarativeCompliancePass({ status: "passed", required: true }),
    "compliance pass required",
  );
  check(
    !computeExecutionDeclarativeCompliancePass({ status: "failed", required: true }),
    "compliance fail required",
  );

  console.log("✓ compliance queries");
}

function testReport() {
  const incomplete = runExecutionComplianceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { executionSimulationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete simulation catalog not ready");

  const ready = buildExecutionComplianceCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V78_EXECUTION_COMPLIANCE_VERSION, "compliance catalog version");
  check(ready.freezeVersion === V78_EXECUTION_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.executionSimulationCatalogReady, "P6 simulation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertExecutionComplianceCatalogPass(ready);

  console.log("✓ execution compliance catalog report");
  console.log(formatExecutionComplianceCatalogSummary(ready));
  console.log("\n✅ V78 P7 Execution Compliance Catalog — verify PASS");
}

function main() {
  console.log("V78 P7 Execution Compliance Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
