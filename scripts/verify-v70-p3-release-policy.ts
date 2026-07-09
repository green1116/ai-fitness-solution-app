/**
 * V70 P3 — Release Policy Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertReleasePolicyPass,
  AUDIT_TRAIL_CATALOG,
  buildReleasePolicy,
  computeDeclarativeEnforcementBlock,
  formatReleasePolicySummary,
  getAuditTrailByRuleRef,
  getExceptionByRuleRef,
  getPolicyRuleById,
  getPolicyRulesByScope,
  getRequiredCheckByRuleRef,
  isReleasePolicyRefsAligned,
  POLICY_EXCEPTION_CATALOG,
  POLICY_RULE_CATALOG,
  REQUIRED_CHECK_CATALOG,
  runReleasePolicy,
  V70_RELEASE_POLICY_FREEZE_VERSION,
  V70_RELEASE_POLICY_VERSION,
} from "../lib/delivery/v70/policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p3-release-policy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/release.policy.ts",
    "lib/delivery/v70/policy.rules.ts",
    "lib/delivery/v70/policy.builder.ts",
    "lib/delivery/v70/policy.entry.ts",
    "docs/V70-P3-RELEASE-POLICY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 release policy module structure");
}

function testInventories() {
  check(POLICY_RULE_CATALOG.length >= 6, "policy rule catalog");
  check(REQUIRED_CHECK_CATALOG.length >= 6, "required check catalog");
  check(POLICY_EXCEPTION_CATALOG.length >= 6, "policy exception catalog");
  check(AUDIT_TRAIL_CATALOG.length >= 6, "audit trail catalog");
  check(isReleasePolicyRefsAligned(), "policy refs aligned");
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
  const rule = getPolicyRuleById("DLV-POL-003");
  check(rule?.constraint === "dependency-acyclic", "DLV-POL-003 constraint");
  check(rule?.enforcement === "declarative", "DLV-POL-003 enforcement");

  const releaseRules = getPolicyRulesByScope("release");
  check(releaseRules.length >= 3, "release scope rules");

  const chk = getRequiredCheckByRuleRef("DLV-POL-004");
  check(chk?.checkKind === "approval", "DLV-POL-004 required check");

  const exc = getExceptionByRuleRef("DLV-POL-002");
  check(exc?.status === "rejected", "DLV-POL-002 exception rejected");

  const aud = getAuditTrailByRuleRef("DLV-POL-005");
  check(aud?.event === "release.staging.verify", "DLV-POL-005 audit trail");

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
  const incomplete = runReleasePolicy({
    deploymentId: DEPLOYMENT_ID,
    signals: { releaseDependencyReady: false },
  });
  check(!incomplete.policyReady, "incomplete dependency not ready");

  const ready = buildReleasePolicy({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V70_RELEASE_POLICY_VERSION, "policy version");
  check(ready.freezeVersion === V70_RELEASE_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.releaseDependencyReady, "P2 dependency ready");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.requiredChecks.catalogComplete, "checks complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.policyReady, "policy ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertReleasePolicyPass(ready);

  console.log("✓ release policy report");
  console.log(formatReleasePolicySummary(ready));
  console.log("\n✅ V70 P3 Release Policy — verify PASS");
}

function main() {
  console.log("V70 P3 Release Policy Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
