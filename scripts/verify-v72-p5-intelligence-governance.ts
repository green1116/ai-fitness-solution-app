/**
 * V72 P5 — Intelligence Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertIntelligenceGovernancePass,
  buildIntelligenceGovernance,
  computeDeclarativeGovernanceRiskBlock,
  ESCALATION_CATALOG,
  formatIntelligenceGovernanceSummary,
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
  isIntelligenceGovernanceRefsAligned,
  REVIEW_CATALOG,
  runIntelligenceGovernance,
  SIGNOFF_CATALOG,
  V72_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  V72_INTELLIGENCE_GOVERNANCE_VERSION,
} from "../lib/intelligence/v72/governance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p5-intelligence-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/intelligence.governance.ts",
    "lib/intelligence/v72/governance.rules.ts",
    "lib/intelligence/v72/governance.builder.ts",
    "lib/intelligence/v72/governance.entry.ts",
    "docs/V72-P5-INTELLIGENCE-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 intelligence governance module structure");
}

function testInventories() {
  check(GOVERNANCE_RULE_CATALOG.length >= 6, "governance rule catalog");
  check(REVIEW_CATALOG.length >= 6, "review catalog");
  check(GOVERNANCE_EXCEPTION_CATALOG.length >= 6, "governance exception catalog");
  check(ESCALATION_CATALOG.length >= 6, "escalation catalog");
  check(GOVERNANCE_AUDIT_TRAIL_CATALOG.length >= 6, "audit trail catalog");
  check(FREEZE_GATE_CATALOG.length >= 6, "freeze gate catalog");
  check(SIGNOFF_CATALOG.length >= 6, "signoff catalog");
  check(isIntelligenceGovernanceRefsAligned(), "intelligence governance refs aligned");
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
  const rule = getGovernanceRuleById("INT-GOV-003");
  check(rule?.compatibilityCheck === "INT-VPX-002", "INT-GOV-003 compatibility check");
  check(rule?.approval === "required", "INT-GOV-003 approval");

  const signalRules = getGovernanceRulesByScope("signal");
  check(signalRules.length >= 2, "signal scope rules");

  const review = getReviewByRuleRef("INT-GOV-004");
  check(review?.reviewKind === "policy", "INT-GOV-004 review");

  const exc = getExceptionByRuleRef("INT-GOV-002");
  check(exc?.status === "rejected", "INT-GOV-002 exception rejected");

  const esc = getEscalationByRuleRef("INT-GOV-006");
  check(esc?.escalationLevel === "L3", "INT-GOV-006 escalation");

  const aud = getAuditTrailByRuleRef("INT-GOV-007");
  check(aud?.event === "intelligence.governance.compliance", "INT-GOV-007 audit trail");

  const gate = getFreezeGateByRuleRef("INT-GOV-005");
  check(gate?.freezeVersion === "v72-intelligence-compatibility-freeze-1", "INT-GOV-005 freeze gate");

  const sig = getSignoffByRuleRef("INT-GOV-008");
  check(sig?.signoffKind === "final", "INT-GOV-008 signoff");

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
  const incomplete = runIntelligenceGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { intelligenceCompatibilityReady: false },
  });
  check(!incomplete.governanceReady, "incomplete compatibility not ready");

  const ready = buildIntelligenceGovernance({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V72_INTELLIGENCE_GOVERNANCE_VERSION, "governance version");
  check(ready.freezeVersion === V72_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION, "freeze version");
  check(ready.intelligenceCompatibilityReady, "P4 compatibility ready");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.reviews.catalogComplete, "reviews complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.escalations.catalogComplete, "escalations complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.freezeGates.catalogComplete, "freeze gates complete");
  check(ready.signoffs.catalogComplete, "signoffs complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertIntelligenceGovernancePass(ready);

  console.log("✓ intelligence governance report");
  console.log(formatIntelligenceGovernanceSummary(ready));
  console.log("\n✅ V72 P5 Intelligence Governance — verify PASS");
}

function main() {
  console.log("V72 P5 Intelligence Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testGovernanceFields();
  testGovernanceQueries();
  testReport();
}

main();
