/**
 * V73 P5 — Knowledge Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgeGovernancePass,
  buildKnowledgeGovernance,
  computeDeclarativeGovernanceRiskBlock,
  ESCALATION_CATALOG,
  formatKnowledgeGovernanceSummary,
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
  isKnowledgeGovernanceRefsAligned,
  REVIEW_CATALOG,
  runKnowledgeGovernance,
  SIGNOFF_CATALOG,
  V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  V73_KNOWLEDGE_GOVERNANCE_VERSION,
} from "../lib/knowledge/v73/governance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v73-p5-knowledge-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/knowledge/v73/knowledge.governance.ts",
    "lib/knowledge/v73/governance.rules.ts",
    "lib/knowledge/v73/governance.builder.ts",
    "lib/knowledge/v73/governance.entry.ts",
    "docs/V73-P5-KNOWLEDGE-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V73 knowledge governance module structure");
}

function testInventories() {
  check(GOVERNANCE_RULE_CATALOG.length >= 6, "governance rule catalog");
  check(REVIEW_CATALOG.length >= 6, "review catalog");
  check(GOVERNANCE_EXCEPTION_CATALOG.length >= 6, "governance exception catalog");
  check(ESCALATION_CATALOG.length >= 6, "escalation catalog");
  check(GOVERNANCE_AUDIT_TRAIL_CATALOG.length >= 6, "audit trail catalog");
  check(FREEZE_GATE_CATALOG.length >= 6, "freeze gate catalog");
  check(SIGNOFF_CATALOG.length >= 6, "signoff catalog");
  check(isKnowledgeGovernanceRefsAligned(), "knowledge governance refs aligned");
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
  const rule = getGovernanceRuleById("KNW-GOV-003");
  check(rule?.compatibilityCheck === "KNW-VPX-002", "KNW-GOV-003 compatibility check");
  check(rule?.approval === "required", "KNW-GOV-003 approval");

  const topicRules = getGovernanceRulesByScope("topic");
  check(topicRules.length >= 2, "topic scope rules");

  const review = getReviewByRuleRef("KNW-GOV-004");
  check(review?.reviewKind === "policy", "KNW-GOV-004 review");

  const exc = getExceptionByRuleRef("KNW-GOV-002");
  check(exc?.status === "rejected", "KNW-GOV-002 exception rejected");

  const esc = getEscalationByRuleRef("KNW-GOV-006");
  check(esc?.escalationLevel === "L3", "KNW-GOV-006 escalation");

  const aud = getAuditTrailByRuleRef("KNW-GOV-007");
  check(aud?.event === "knowledge.governance.compliance", "KNW-GOV-007 audit trail");

  const gate = getFreezeGateByRuleRef("KNW-GOV-005");
  check(gate?.freezeVersion === "v73-knowledge-compatibility-freeze-1", "KNW-GOV-005 freeze gate");

  const sig = getSignoffByRuleRef("KNW-GOV-008");
  check(sig?.signoffKind === "final", "KNW-GOV-008 signoff");

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
  const incomplete = runKnowledgeGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { knowledgeCompatibilityReady: false },
  });
  check(!incomplete.governanceReady, "incomplete compatibility not ready");

  const ready = buildKnowledgeGovernance({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V73_KNOWLEDGE_GOVERNANCE_VERSION, "governance version");
  check(ready.freezeVersion === V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION, "freeze version");
  check(ready.knowledgeCompatibilityReady, "P4 compatibility ready");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.reviews.catalogComplete, "reviews complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.escalations.catalogComplete, "escalations complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.freezeGates.catalogComplete, "freeze gates complete");
  check(ready.signoffs.catalogComplete, "signoffs complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertKnowledgeGovernancePass(ready);

  console.log("✓ knowledge governance report");
  console.log(formatKnowledgeGovernanceSummary(ready));
  console.log("\n✅ V73 P5 Knowledge Governance — verify PASS");
}

function main() {
  console.log("V73 P5 Knowledge Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testGovernanceFields();
  testGovernanceQueries();
  testReport();
}

main();
