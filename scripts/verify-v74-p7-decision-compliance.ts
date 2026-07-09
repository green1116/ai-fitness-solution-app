/**
 * V74 P7 — Decision Compliance Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionComplianceCatalogPass,
  buildDecisionComplianceCatalog,
  COMPLIANCE_CATALOG_ENTRIES,
  COMPLIANCE_VALIDATION_CATALOG,
  computeDeclarativeCompliancePass,
  formatDecisionComplianceCatalogSummary,
  getComplianceCatalogEntriesByDomain,
  getComplianceCatalogEntryById,
  getComplianceValidationByComplianceRef,
  isDecisionComplianceCatalogRefsAligned,
  runDecisionComplianceCatalog,
  V74_DECISION_COMPLIANCE_FREEZE_VERSION,
  V74_DECISION_COMPLIANCE_VERSION,
} from "../lib/decision/v74/decision.compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p7-decision-compliance";

const REQUIRED_DOMAINS = [
  "policyMatch",
  "constraintMatch",
  "contextIntegrity",
  "evaluationIntegrity",
  "simulationIntegrity",
  "auditTrace",
  "versionConsistency",
  "rollbackReadiness",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/decision.compliance.ts",
    "lib/decision/v74/decision.compliance.catalog.ts",
    "lib/decision/v74/decision.compliance.builder.ts",
    "lib/decision/v74/decision.compliance.entry.ts",
    "docs/V74-DECISION-COMPLIANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision compliance catalog module structure");
}

function testInventories() {
  check(COMPLIANCE_CATALOG_ENTRIES.length === 8, "compliance catalog entries");
  check(COMPLIANCE_VALIDATION_CATALOG.length === 8, "compliance validation catalog");
  check(isDecisionComplianceCatalogRefsAligned(), "compliance catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getComplianceCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ compliance items, validations, domains & alignment");
}

function testComplianceFields() {
  for (const item of COMPLIANCE_CATALOG_ENTRIES) {
    check(item.purpose.length > 0, `${item.id} purpose`);
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
  const policy = getComplianceCatalogEntryById("DEC-CMP-001");
  check(policy?.domain === "policyMatch", "DEC-CMP-001 policyMatch");
  check(policy?.status === "passed", "DEC-CMP-001 passed");

  const rollback = getComplianceCatalogEntriesByDomain("rollbackReadiness");
  check(rollback.length >= 1, "rollbackReadiness domain");
  check(rollback[0]?.upstreamRef === "DEC-SIM-008", "rollback upstream ref");

  const audit = getComplianceCatalogEntryById("DEC-CMP-006");
  check(audit?.domain === "auditTrace", "DEC-CMP-006 auditTrace");

  const validation = getComplianceValidationByComplianceRef("DEC-CMP-007");
  check(validation?.validationKind === "versionConsistency", "DEC-CMP-007 validation");

  check(
    computeDeclarativeCompliancePass({ status: "passed", required: true }),
    "compliance pass required",
  );
  check(
    !computeDeclarativeCompliancePass({ status: "failed", required: true }),
    "compliance fail required",
  );

  console.log("✓ compliance queries");
}

function testReport() {
  const incomplete = runDecisionComplianceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { decisionSimulationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete simulation catalog not ready");

  const ready = buildDecisionComplianceCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V74_DECISION_COMPLIANCE_VERSION, "compliance catalog version");
  check(ready.freezeVersion === V74_DECISION_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.decisionSimulationCatalogReady, "P6 simulation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDecisionComplianceCatalogPass(ready);

  console.log("✓ decision compliance catalog report");
  console.log(formatDecisionComplianceCatalogSummary(ready));
  console.log("\n✅ V74 P7 Decision Compliance Catalog — verify PASS");
}

function main() {
  console.log("V74 P7 Decision Compliance Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
