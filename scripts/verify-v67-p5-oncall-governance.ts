/**
 * V67 P5 — On-call & Escalation Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ESCALATION_POLICY_CATALOG,
  HANDOFF_RULE_CATALOG,
  ONCALL_ROSTER_CATALOG,
  RESPONSE_TARGET_CATALOG,
  V67_ONCALL_GOVERNANCE_ARTIFACT_SURFACE,
  V67_ONCALL_GOVERNANCE_VERSION,
  assertOncallGovernancePass,
  buildEscalationPolicyManifest,
  buildHandoffContractManifest,
  buildOncallGovernanceReport,
  buildOncallRosterManifest,
  buildResponseTargetManifest,
  computeDeclarativeResponseWindow,
  formatOncallGovernanceSummary,
  getEscalationPoliciesBySeverity,
  getHandoffRulesByKind,
  getResponseTargetsBySeverity,
  getRosterByFoundationRef,
  isFoundationOncallAligned,
  runOncallGovernance,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p5-oncall-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/oncall/oncall.ts",
    "lib/monitoring/v67/oncall/governance.types.ts",
    "lib/monitoring/v67/oncall/governance.surface.ts",
    "lib/monitoring/v67/oncall/governance.builder.ts",
    "lib/monitoring/v67/oncall/governance.entry.ts",
    "lib/monitoring/v67/oncall/roster.catalog.ts",
    "lib/monitoring/v67/oncall/escalation.policy.catalog.ts",
    "lib/monitoring/v67/oncall/response.target.catalog.ts",
    "lib/monitoring/v67/oncall/handoff.contract.ts",
    "docs/monitoring/V67-ONCALL-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 on-call governance module structure");
}

function testInventories() {
  check(ONCALL_ROSTER_CATALOG.length >= 6, "oncall roster catalog");
  check(ESCALATION_POLICY_CATALOG.length >= 6, "escalation policy catalog");
  check(RESPONSE_TARGET_CATALOG.length >= 6, "response target catalog");
  check(HANDOFF_RULE_CATALOG.length >= 6, "handoff rule catalog");
  console.log("✓ roster, escalation, response & handoff inventories");
}

function testCrossReferences() {
  check(isFoundationOncallAligned(), "foundation oncall alignment");

  const oc001 = getRosterByFoundationRef("OC-001");
  check(oc001?.foundationRef === "OC-001", "foundation OC-001 roster mapping");

  const p0Policies = getEscalationPoliciesBySeverity("P0");
  check(p0Policies.length >= 2, "P0 escalation policies");

  const p0Targets = getResponseTargetsBySeverity("P0");
  check(p0Targets.length >= 2, "P0 response targets");

  const escalationHandoffs = getHandoffRulesByKind("escalation");
  check(escalationHandoffs.length >= 2, "escalation handoff rules");

  const ackWindow = computeDeclarativeResponseWindow({ severityRef: "P0", kind: "acknowledge" });
  check(ackWindow === 5, "declarative P0 acknowledge window");
  console.log("✓ cross-references & foundation alignment");
}

function testManifests() {
  check(buildOncallRosterManifest().catalogComplete, "roster manifest complete");
  check(buildEscalationPolicyManifest().catalogComplete, "escalation policy complete");
  check(buildResponseTargetManifest().catalogComplete, "response targets complete");
  check(buildHandoffContractManifest().contractComplete, "handoff contract complete");
  console.log("✓ governance manifests");
}

function testReport() {
  const incomplete = runOncallGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { sloGovernanceReady: false },
  });
  check(!incomplete.governanceReady, "incomplete slo governance not ready");

  const ready = buildOncallGovernanceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V67_ONCALL_GOVERNANCE_VERSION, "governance version");
  check(ready.sloGovernanceReady, "slo governance ready");
  check(ready.roster.catalogComplete, "roster catalog complete");
  check(ready.escalationPolicy.catalogComplete, "escalation policy complete");
  check(ready.responseTargets.catalogComplete, "response targets complete");
  check(ready.handoffContract.contractComplete, "handoff contract complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertOncallGovernancePass(ready);

  check(
    V67_ONCALL_GOVERNANCE_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v67-p5"),
    "artifact surface verify script",
  );

  console.log("✓ on-call governance report");
  console.log(formatOncallGovernanceSummary(ready));
  console.log("\n✅ V67 P5 On-call & Escalation Governance — verify PASS");
}

function main() {
  console.log("V67 P5 On-call & Escalation Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
