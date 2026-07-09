/**
 * V71 P3 — Workflow Policy Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertWorkflowPolicyPass,
  AUDIT_TRAIL_CATALOG,
  buildWorkflowPolicy,
  computeDeclarativeEnforcementBlock,
  formatWorkflowPolicySummary,
  getAuditTrailByRuleRef,
  getExceptionByRuleRef,
  getPolicyRuleById,
  getPolicyRulesByScope,
  getRequiredCheckByRuleRef,
  isWorkflowPolicyRefsAligned,
  POLICY_EXCEPTION_CATALOG,
  POLICY_RULE_CATALOG,
  REQUIRED_CHECK_CATALOG,
  runWorkflowPolicy,
  V71_WORKFLOW_POLICY_FREEZE_VERSION,
  V71_WORKFLOW_POLICY_VERSION,
} from "../lib/orchestration/v71/policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v71-p3-workflow-policy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/orchestration/v71/workflow.policy.ts",
    "lib/orchestration/v71/policy.rules.ts",
    "lib/orchestration/v71/policy.builder.ts",
    "lib/orchestration/v71/policy.entry.ts",
    "docs/V71-P3-WORKFLOW-POLICY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V71 workflow policy module structure");
}

function testInventories() {
  check(POLICY_RULE_CATALOG.length >= 6, "policy rule catalog");
  check(REQUIRED_CHECK_CATALOG.length >= 6, "required check catalog");
  check(POLICY_EXCEPTION_CATALOG.length >= 6, "policy exception catalog");
  check(AUDIT_TRAIL_CATALOG.length >= 6, "audit trail catalog");
  check(isWorkflowPolicyRefsAligned(), "policy refs aligned");
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
  const rule = getPolicyRuleById("ORC-POL-003");
  check(rule?.constraint === "dependency-acyclic", "ORC-POL-003 constraint");
  check(rule?.enforcement === "declarative", "ORC-POL-003 enforcement");

  const workflowRules = getPolicyRulesByScope("workflow");
  check(workflowRules.length >= 3, "workflow scope rules");

  const chk = getRequiredCheckByRuleRef("ORC-POL-004");
  check(chk?.checkKind === "trigger", "ORC-POL-004 required check");

  const exc = getExceptionByRuleRef("ORC-POL-002");
  check(exc?.status === "rejected", "ORC-POL-002 exception rejected");

  const aud = getAuditTrailByRuleRef("ORC-POL-005");
  check(aud?.event === "workflow.action.verify", "ORC-POL-005 audit trail");

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
  const incomplete = runWorkflowPolicy({
    deploymentId: DEPLOYMENT_ID,
    signals: { workflowDependencyReady: false },
  });
  check(!incomplete.policyReady, "incomplete dependency not ready");

  const ready = buildWorkflowPolicy({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V71_WORKFLOW_POLICY_VERSION, "policy version");
  check(ready.freezeVersion === V71_WORKFLOW_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.workflowDependencyReady, "P2 dependency ready");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.requiredChecks.catalogComplete, "checks complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.policyReady, "policy ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertWorkflowPolicyPass(ready);

  console.log("✓ workflow policy report");
  console.log(formatWorkflowPolicySummary(ready));
  console.log("\n✅ V71 P3 Workflow Policy — verify PASS");
}

function main() {
  console.log("V71 P3 Workflow Policy Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
