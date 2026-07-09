/**
 * V76 P7 — Collaboration Compliance Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_COMPLIANCE_CATALOG_ENTRIES,
  COLLABORATION_COMPLIANCE_VALIDATION_CATALOG,
  V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION,
  V76_COLLABORATION_COMPLIANCE_VERSION,
  assertCollaborationComplianceCatalogPass,
  buildCollaborationComplianceCatalog,
  computeCollaborationDeclarativeCompliancePass,
  formatCollaborationComplianceCatalogSummary,
  getCollaborationComplianceCatalogEntriesByKind,
  getCollaborationComplianceCatalogEntryById,
  getCollaborationComplianceValidationByComplianceRef,
  isCollaborationComplianceCatalogRefsAligned,
  runCollaborationComplianceCatalog,
} from "../lib/collaboration/v76/collaboration.compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p7-collaboration-compliance-catalog";

const REQUIRED_KINDS = [
  "shared",
  "topology",
  "communication",
  "delegation",
  "coordination",
  "governance",
  "workspace",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/collaboration/v76/collaboration.compliance.ts",
    "lib/collaboration/v76/collaboration.compliance.catalog.ts",
    "lib/collaboration/v76/collaboration.compliance.builder.ts",
    "lib/collaboration/v76/collaboration.compliance.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration compliance catalog module structure");
}

function testInventories() {
  check(COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.length === 8, "compliance catalog entries");
  check(COLLABORATION_COMPLIANCE_VALIDATION_CATALOG.length === 8, "compliance validation catalog");
  check(isCollaborationComplianceCatalogRefsAligned(), "compliance catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getCollaborationComplianceCatalogEntriesByKind(kind).length >= 1, `${kind} compliance kind`);
  }
  console.log("✓ compliance items, validations, kinds & alignment");
}

function testComplianceFields() {
  for (const item of COLLABORATION_COMPLIANCE_CATALOG_ENTRIES) {
    check(item.purpose.length > 0, `${item.id} purpose`);
    check(item.rule.length > 0, `${item.id} rule`);
    check(item.auditPoint.length > 0, `${item.id} auditPoint`);
    check(item.waiverCondition.length > 0, `${item.id} waiverCondition`);
    check(item.inputs.length >= 1, `${item.id} inputs`);
    check(item.outputs.length >= 1, `${item.id} outputs`);
    check(item.criteria.length >= 1, `${item.id} criteria`);
    check(item.evidence.length > 0, `${item.id} evidence`);
    check(item.status.length > 0, `${item.id} status`);
    check(item.validation.length > 0, `${item.id} validation`);
    check(item.upstreamRef.length > 0, `${item.id} upstreamRef`);
  }
  console.log("✓ compliance field coverage");
}

function testComplianceQueries() {
  const shared = getCollaborationComplianceCatalogEntryById("COL-CMP-001");
  check(shared?.kind === "shared", "COL-CMP-001 shared");
  check(shared?.status === "passed", "COL-CMP-001 passed");

  const boundary = getCollaborationComplianceCatalogEntriesByKind("boundary");
  check(boundary.length >= 1, "boundary compliance kind");
  check(boundary[0]?.upstreamRef === "COL-SIM-008", "boundary upstream ref");

  const governance = getCollaborationComplianceCatalogEntryById("COL-CMP-006");
  check(governance?.kind === "governance", "COL-CMP-006 governance");

  const validation = getCollaborationComplianceValidationByComplianceRef("COL-CMP-007");
  check(validation?.validationKind === "workspace", "COL-CMP-007 validation");

  check(
    computeCollaborationDeclarativeCompliancePass({ status: "passed", required: true }),
    "compliance pass required",
  );
  check(
    !computeCollaborationDeclarativeCompliancePass({ status: "failed", required: true }),
    "compliance fail required",
  );

  console.log("✓ compliance queries");
}

function testReport() {
  const incomplete = runCollaborationComplianceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { collaborationSimulationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete simulation catalog not ready");

  const ready = buildCollaborationComplianceCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V76_COLLABORATION_COMPLIANCE_VERSION, "compliance catalog version");
  check(ready.freezeVersion === V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.collaborationSimulationCatalogReady, "P6 simulation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCollaborationComplianceCatalogPass(ready);

  console.log("✓ collaboration compliance catalog report");
  console.log(formatCollaborationComplianceCatalogSummary(ready));
  console.log("\n✅ V76 P7 Collaboration Compliance Catalog — verify PASS");
}

function main() {
  console.log("V76 P7 Collaboration Compliance Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
