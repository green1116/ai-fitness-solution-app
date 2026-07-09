/**
 * V75 P7 — Agent Compliance Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_COMPLIANCE_CATALOG_ENTRIES,
  AGENT_COMPLIANCE_VALIDATION_CATALOG,
  assertAgentComplianceCatalogPass,
  buildAgentComplianceCatalog,
  computeAgentDeclarativeCompliancePass,
  formatAgentComplianceCatalogSummary,
  getAgentComplianceCatalogEntriesByDomain,
  getAgentComplianceCatalogEntryById,
  getAgentComplianceValidationByComplianceRef,
  isAgentComplianceCatalogRefsAligned,
  runAgentComplianceCatalog,
  V75_AGENT_COMPLIANCE_FREEZE_VERSION,
  V75_AGENT_COMPLIANCE_VERSION,
} from "../lib/agent/v75/agent.compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p7-agent-compliance-catalog";

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
    "lib/agent/v75/agent.compliance.ts",
    "lib/agent/v75/agent.compliance.catalog.ts",
    "lib/agent/v75/agent.compliance.builder.ts",
    "lib/agent/v75/agent.compliance.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent compliance catalog module structure");
}

function testInventories() {
  check(AGENT_COMPLIANCE_CATALOG_ENTRIES.length === 8, "compliance catalog entries");
  check(AGENT_COMPLIANCE_VALIDATION_CATALOG.length === 8, "compliance validation catalog");
  check(isAgentComplianceCatalogRefsAligned(), "compliance catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getAgentComplianceCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ compliance items, validations, domains & alignment");
}

function testComplianceFields() {
  for (const item of AGENT_COMPLIANCE_CATALOG_ENTRIES) {
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
  const policy = getAgentComplianceCatalogEntryById("AGT-CMP-001");
  check(policy?.domain === "policyMatch", "AGT-CMP-001 policyMatch");
  check(policy?.status === "passed", "AGT-CMP-001 passed");

  const rollback = getAgentComplianceCatalogEntriesByDomain("rollbackReadiness");
  check(rollback.length >= 1, "rollbackReadiness domain");
  check(rollback[0]?.upstreamRef === "AGT-SIM-008", "rollback upstream ref");

  const audit = getAgentComplianceCatalogEntryById("AGT-CMP-006");
  check(audit?.domain === "auditTrace", "AGT-CMP-006 auditTrace");

  const validation = getAgentComplianceValidationByComplianceRef("AGT-CMP-007");
  check(validation?.validationKind === "versionConsistency", "AGT-CMP-007 validation");

  check(
    computeAgentDeclarativeCompliancePass({ status: "passed", required: true }),
    "compliance pass required",
  );
  check(
    !computeAgentDeclarativeCompliancePass({ status: "failed", required: true }),
    "compliance fail required",
  );

  console.log("✓ compliance queries");
}

function testReport() {
  const incomplete = runAgentComplianceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { agentSimulationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete simulation catalog not ready");

  const ready = buildAgentComplianceCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V75_AGENT_COMPLIANCE_VERSION, "compliance catalog version");
  check(ready.freezeVersion === V75_AGENT_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.agentSimulationCatalogReady, "P6 simulation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAgentComplianceCatalogPass(ready);

  console.log("✓ agent compliance catalog report");
  console.log(formatAgentComplianceCatalogSummary(ready));
  console.log("\n✅ V75 P7 Agent Compliance Catalog — verify PASS");
}

function main() {
  console.log("V75 P7 Agent Compliance Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
