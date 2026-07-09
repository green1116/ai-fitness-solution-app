/**
 * V72 P3 — Intelligence Policy Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertIntelligencePolicyPass,
  AUDIT_TRAIL_CATALOG,
  buildIntelligencePolicy,
  computeDeclarativeEnforcementBlock,
  formatIntelligencePolicySummary,
  getAuditTrailByRuleRef,
  getExceptionByRuleRef,
  getPolicyRuleById,
  getPolicyRulesByScope,
  getRequiredCheckByRuleRef,
  isIntelligencePolicyRefsAligned,
  POLICY_EXCEPTION_CATALOG,
  POLICY_RULE_CATALOG,
  REQUIRED_CHECK_CATALOG,
  runIntelligencePolicy,
  V72_INTELLIGENCE_POLICY_FREEZE_VERSION,
  V72_INTELLIGENCE_POLICY_VERSION,
} from "../lib/intelligence/v72/policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p3-intelligence-policy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/intelligence.policy.ts",
    "lib/intelligence/v72/policy.rules.ts",
    "lib/intelligence/v72/policy.builder.ts",
    "lib/intelligence/v72/policy.entry.ts",
    "docs/V72-P3-INTELLIGENCE-POLICY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 intelligence policy module structure");
}

function testInventories() {
  check(POLICY_RULE_CATALOG.length >= 6, "policy rule catalog");
  check(REQUIRED_CHECK_CATALOG.length >= 6, "required check catalog");
  check(POLICY_EXCEPTION_CATALOG.length >= 6, "policy exception catalog");
  check(AUDIT_TRAIL_CATALOG.length >= 6, "audit trail catalog");
  check(isIntelligencePolicyRefsAligned(), "policy refs aligned");
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
  const rule = getPolicyRuleById("INT-POL-003");
  check(rule?.constraint === "dependency-acyclic", "INT-POL-003 constraint");
  check(rule?.enforcement === "declarative", "INT-POL-003 enforcement");

  const insightRules = getPolicyRulesByScope("insight");
  check(insightRules.length >= 3, "insight scope rules");

  const chk = getRequiredCheckByRuleRef("INT-POL-004");
  check(chk?.checkKind === "verify", "INT-POL-004 required check");

  const exc = getExceptionByRuleRef("INT-POL-002");
  check(exc?.status === "rejected", "INT-POL-002 exception rejected");

  const aud = getAuditTrailByRuleRef("INT-POL-005");
  check(aud?.event === "intelligence.confidence.gate", "INT-POL-005 audit trail");

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
  const incomplete = runIntelligencePolicy({
    deploymentId: DEPLOYMENT_ID,
    signals: { signalDependencyReady: false },
  });
  check(!incomplete.policyReady, "incomplete dependency not ready");

  const ready = buildIntelligencePolicy({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V72_INTELLIGENCE_POLICY_VERSION, "policy version");
  check(ready.freezeVersion === V72_INTELLIGENCE_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.signalDependencyReady, "P2 dependency ready");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.requiredChecks.catalogComplete, "checks complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.policyReady, "policy ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertIntelligencePolicyPass(ready);

  console.log("✓ intelligence policy report");
  console.log(formatIntelligencePolicySummary(ready));
  console.log("\n✅ V72 P3 Intelligence Policy — verify PASS");
}

function main() {
  console.log("V72 P3 Intelligence Policy Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
