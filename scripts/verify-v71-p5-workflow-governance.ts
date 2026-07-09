/**
 * V71 P5 — Workflow Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertWorkflowGovernancePass,
  buildWorkflowGovernance,
  computeDeclarativeGovernanceRiskBlock,
  ESCALATION_CATALOG,
  formatWorkflowGovernanceSummary,
  FREEZE_GATE_CATALOG,
  getAuditTrailByRuleRef,
  getEscalationByRuleRef,
  getExceptionByRuleRef,
  getFreezeGateByRuleRef,
  getGovernanceRuleById,
  getGovernanceRulesByRiskLevel,
  getGovernanceRulesByScope,
  getReviewByRuleRef,
  getSignoffByRuleRef,
  GOVERNANCE_AUDIT_TRAIL_CATALOG,
  GOVERNANCE_EXCEPTION_CATALOG,
  GOVERNANCE_RULE_CATALOG,
  isWorkflowGovernanceRefsAligned,
  REVIEW_CATALOG,
  runWorkflowGovernance,
  SIGNOFF_CATALOG,
  V71_WORKFLOW_GOVERNANCE_FREEZE_VERSION,
  V71_WORKFLOW_GOVERNANCE_VERSION,
} from "../lib/orchestration/v71/governance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v71-p5-workflow-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/orchestration/v71/workflow.governance.ts",
    "lib/orchestration/v71/governance.rules.ts",
    "lib/orchestration/v71/governance.builder.ts",
    "lib/orchestration/v71/governance.entry.ts",
    "docs/V71-P5-WORKFLOW-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V71 workflow governance module structure");
}

function testInventories() {
  check(GOVERNANCE_RULE_CATALOG.length >= 6, "governance rule catalog");
  check(REVIEW_CATALOG.length >= 6, "review catalog");
  check(GOVERNANCE_EXCEPTION_CATALOG.length >= 6, "governance exception catalog");
  check(ESCALATION_CATALOG.length >= 6, "escalation catalog");
  check(GOVERNANCE_AUDIT_TRAIL_CATALOG.length >= 6, "audit trail catalog");
  check(FREEZE_GATE_CATALOG.length >= 6, "freeze gate catalog");
  check(SIGNOFF_CATALOG.length >= 6, "signoff catalog");
  check(isWorkflowGovernanceRefsAligned(), "workflow governance refs aligned");
  console.log("✓ rules, reviews, exceptions, escalations, audits, gates, signoffs & alignment");
}

function testGovernanceFields() {
  for (const rule of GOVERNANCE_RULE_CATALOG) {
    check(rule.scope.length > 0, `${rule.id} scope`);
    check(rule.approval.length > 0, `${rule.id} approval`);
    check(rule.review.length > 0, `${rule.id} review`);
    check(rule.exception.length > 0, `${rule.id} exception`);
    check(rule.escalation.length > 0, `${rule.id} escalation`);
    check(rule.auditTrail.length > 0, `${rule.id} auditTrail`);
    check(rule.freezeGate.length > 0, `${rule.id} freezeGate`);
    check(rule.signoff.length > 0, `${rule.id} signoff`);
    check(rule.riskLevel.length > 0, `${rule.id} riskLevel`);
    check(rule.compatibilityCheck.length > 0, `${rule.id} compatibilityCheck`);
  }
  console.log("✓ governance field coverage");
}

function testGovernanceQueries() {
  const rule = getGovernanceRuleById("ORC-GOV-003");
  check(rule?.compatibilityCheck === "ORC-WPX-002", "ORC-GOV-003 compatibility check");
  check(rule?.approval === "required", "ORC-GOV-003 approval");

  const workflowRules = getGovernanceRulesByScope("workflow");
  check(workflowRules.length >= 2, "workflow scope rules");

  const review = getReviewByRuleRef("ORC-GOV-004");
  check(review?.reviewKind === "policy", "ORC-GOV-004 review");

  const exc = getExceptionByRuleRef("ORC-GOV-002");
  check(exc?.status === "rejected", "ORC-GOV-002 exception rejected");

  const esc = getEscalationByRuleRef("ORC-GOV-006");
  check(esc?.escalationLevel === "L3", "ORC-GOV-006 escalation");

  const aud = getAuditTrailByRuleRef("ORC-GOV-007");
  check(aud?.event === "workflow.governance.compliance", "ORC-GOV-007 audit trail");

  const gate = getFreezeGateByRuleRef("ORC-GOV-005");
  check(gate?.freezeVersion === "v71-workflow-compatibility-freeze-1", "ORC-GOV-005 freeze gate");

  const sig = getSignoffByRuleRef("ORC-GOV-008");
  check(sig?.signoffKind === "final", "ORC-GOV-008 signoff");

  const critical = getGovernanceRulesByRiskLevel("critical");
  check(critical.length >= 1, "critical risk rules");

  check(
    computeDeclarativeGovernanceRiskBlock({ riskLevel: "critical", approval: "required" }),
    "risk block critical required",
  );
  check(
    !computeDeclarativeGovernanceRiskBlock({ riskLevel: "low", approval: "approved" }),
    "risk block low approved",
  );

  console.log("✓ governance queries");
}

function testReport() {
  const incomplete = runWorkflowGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { workflowCompatibilityReady: false },
  });
  check(!incomplete.governanceReady, "incomplete compatibility not ready");

  const ready = buildWorkflowGovernance({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V71_WORKFLOW_GOVERNANCE_VERSION, "governance version");
  check(ready.freezeVersion === V71_WORKFLOW_GOVERNANCE_FREEZE_VERSION, "freeze version");
  check(ready.workflowCompatibilityReady, "P4 compatibility ready");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.reviews.catalogComplete, "reviews complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.escalations.catalogComplete, "escalations complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.freezeGates.catalogComplete, "freeze gates complete");
  check(ready.signoffs.catalogComplete, "signoffs complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertWorkflowGovernancePass(ready);

  console.log("✓ workflow governance report");
  console.log(formatWorkflowGovernanceSummary(ready));
  console.log("\n✅ V71 P5 Workflow Governance — verify PASS");
}

function main() {
  console.log("V71 P5 Workflow Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testGovernanceFields();
  testGovernanceQueries();
  testReport();
}

main();
