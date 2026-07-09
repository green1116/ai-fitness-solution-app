/**
 * V73 P3 — Knowledge Policy Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgePolicyPass,
  AUDIT_TRAIL_CATALOG,
  buildKnowledgePolicy,
  computeDeclarativeEnforcementBlock,
  formatKnowledgePolicySummary,
  getAuditTrailByRuleRef,
  getExceptionByRuleRef,
  getPolicyRuleById,
  getPolicyRulesByScope,
  getRequiredCheckByRuleRef,
  isKnowledgePolicyRefsAligned,
  POLICY_EXCEPTION_CATALOG,
  POLICY_RULE_CATALOG,
  REQUIRED_CHECK_CATALOG,
  runKnowledgePolicy,
  V73_KNOWLEDGE_POLICY_FREEZE_VERSION,
  V73_KNOWLEDGE_POLICY_VERSION,
} from "../lib/knowledge/v73/policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v73-p3-knowledge-policy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/knowledge/v73/knowledge.policy.ts",
    "lib/knowledge/v73/policy.rules.ts",
    "lib/knowledge/v73/policy.builder.ts",
    "lib/knowledge/v73/policy.entry.ts",
    "docs/V73-P3-KNOWLEDGE-POLICY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V73 knowledge policy module structure");
}

function testInventories() {
  check(POLICY_RULE_CATALOG.length >= 6, "policy rule catalog");
  check(REQUIRED_CHECK_CATALOG.length >= 6, "required check catalog");
  check(POLICY_EXCEPTION_CATALOG.length >= 6, "policy exception catalog");
  check(AUDIT_TRAIL_CATALOG.length >= 6, "audit trail catalog");
  check(isKnowledgePolicyRefsAligned(), "policy refs aligned");
  console.log("✓ rules, checks, exceptions, audits & alignment");
}

function testPolicyFields() {
  for (const rule of POLICY_RULE_CATALOG) {
    check(rule.scope.length > 0, `${rule.id} scope`);
    check(rule.constraint.length > 0, `${rule.id} constraint`);
    check(rule.allowed.length >= 1, `${rule.id} allowed`);
    check(rule.blocked.length >= 1, `${rule.id} blocked`);
    check(rule.requiredCheck.length > 0, `${rule.id} requiredCheck`);
    check(rule.exception.length > 0, `${rule.id} exception`);
    check(rule.enforcement.length > 0, `${rule.id} enforcement`);
    check(rule.auditTrail.length > 0, `${rule.id} auditTrail`);
  }
  console.log("✓ policy field coverage");
}

function testPolicyQueries() {
  const rule = getPolicyRuleById("KNW-POL-003");
  check(rule?.constraint === "dependency-acyclic", "KNW-POL-003 constraint");
  check(rule?.enforcement === "declarative", "KNW-POL-003 enforcement");

  const documentRules = getPolicyRulesByScope("document");
  check(documentRules.length >= 3, "document scope rules");

  const chk = getRequiredCheckByRuleRef("KNW-POL-004");
  check(chk?.checkKind === "verify", "KNW-POL-004 required check");

  const exc = getExceptionByRuleRef("KNW-POL-002");
  check(exc?.status === "rejected", "KNW-POL-002 exception rejected");

  const aud = getAuditTrailByRuleRef("KNW-POL-005");
  check(aud?.event === "knowledge.confidence.gate", "KNW-POL-005 audit trail");

  check(
    computeDeclarativeEnforcementBlock({
      enforcement: "gate",
      blocked: ["verify-failure"],
    }),
    "enforcement block gate",
  );
  check(
    !computeDeclarativeEnforcementBlock({
      enforcement: "audit-only",
      blocked: ["verify-failure"],
    }),
    "enforcement no block audit-only",
  );

  console.log("✓ policy queries");
}

function testReport() {
  const incomplete = runKnowledgePolicy({
    deploymentId: DEPLOYMENT_ID,
    signals: { knowledgeDependencyReady: false },
  });
  check(!incomplete.policyReady, "incomplete dependency not ready");

  const ready = buildKnowledgePolicy({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V73_KNOWLEDGE_POLICY_VERSION, "policy version");
  check(ready.freezeVersion === V73_KNOWLEDGE_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.knowledgeDependencyReady, "P2 dependency ready");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.requiredChecks.catalogComplete, "checks complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.policyReady, "policy ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertKnowledgePolicyPass(ready);

  console.log("✓ knowledge policy report");
  console.log(formatKnowledgePolicySummary(ready));
  console.log("\n✅ V73 P3 Knowledge Policy — verify PASS");
}

function main() {
  console.log("V73 P3 Knowledge Policy Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
