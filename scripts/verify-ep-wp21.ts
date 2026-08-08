/**
 * EP-1 / WP-21 — Enterprise Issue Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_1_ID,
  EP_ISSUE_REGISTRY_BASELINE,
  EP_ISSUE_REGISTRY_VERSION,
  EP_WP21_ID,
  ISSUE_REGISTRY_CAPABILITY,
  ISSUE_TYPES,
  buildAlertRegistry,
  buildApprovalRegistry,
  buildAssignmentRegistry,
  buildAuditRegistry,
  buildComplianceRegistry,
  buildControlRegistry,
  buildDepartmentRegistry,
  buildEscalationRegistry,
  buildIssueRegistry,
  buildNotificationRegistry,
  buildOrganizationRegistry,
  buildPermissionRegistry,
  buildPolicyRegistry,
  buildReviewRegistry,
  buildRiskRegistry,
  buildRoleRegistry,
  buildTeamRegistry,
  buildWorkflowRegistry,
  clearAlertRegistry,
  clearApprovalRegistry,
  clearAssignmentRegistry,
  clearAuditRegistry,
  clearComplianceRegistry,
  clearControlRegistry,
  clearDepartmentRegistry,
  clearEscalationRegistry,
  clearIssueRegistry,
  clearNotificationRegistry,
  clearOrganizationRegistry,
  clearPermissionRegistry,
  clearPolicyRegistry,
  clearReviewRegistry,
  clearRiskRegistry,
  clearRoleRegistry,
  clearTeamRegistry,
  clearWorkflowRegistry,
  getIssueRegistry,
  issueRegistryFingerprint,
  type IssueRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: IssueRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(row.organizationId.length > 0, `${label}.organizationId`);
  assert(row.roleId.length > 0, `${label}.roleId`);
  assert(row.permissionId.length > 0, `${label}.permissionId`);
  assert(row.policyId.length > 0, `${label}.policyId`);
  assert(row.assignmentId.length > 0, `${label}.assignmentId`);
  assert(row.notificationId.length > 0, `${label}.notificationId`);
  assert(row.alertId.length > 0, `${label}.alertId`);
  assert(row.escalationId.length > 0, `${label}.escalationId`);
  assert(row.workflowId.length > 0, `${label}.workflowId`);
  assert(row.approvalId.length > 0, `${label}.approvalId`);
  assert(row.reviewId.length > 0, `${label}.reviewId`);
  assert(row.auditId.length > 0, `${label}.auditId`);
  assert(row.complianceId.length > 0, `${label}.complianceId`);
  assert(row.controlId.length > 0, `${label}.controlId`);
  assert(row.riskId.length > 0, `${label}.riskId`);
  assert(row.issueId.length > 0, `${label}.issueId`);
  assert(row.issueName.length > 0, `${label}.issueName`);
  assert(
    (ISSUE_TYPES as readonly string[]).includes(row.issueType),
    `${label}.issueType`,
  );
  assert(row.status.length > 0, `${label}.status`);
  assert(row.createdAt.includes("T"), `${label}.createdAt`);
}

function compareChain(prev: IssueRegistry, curr: IssueRegistry, i: number) {
  const keys = [
    "organizationId",
    "roleId",
    "permissionId",
    "policyId",
    "assignmentId",
    "notificationId",
    "alertId",
    "escalationId",
    "workflowId",
    "approvalId",
    "reviewId",
    "auditId",
    "complianceId",
    "controlId",
    "riskId",
    "issueId",
  ] as const;
  for (const key of keys) {
    const cmp = prev[key].localeCompare(curr[key]);
    assert(cmp <= 0, `${key} order at ${i}`);
    if (cmp < 0) return;
  }
}

function main() {
  console.log("=== EP-1 / WP-21 Enterprise Issue Registry ===\n");

  clearOrganizationRegistry();
  clearDepartmentRegistry();
  clearTeamRegistry();
  clearRoleRegistry();
  clearPermissionRegistry();
  clearPolicyRegistry();
  clearAssignmentRegistry();
  clearNotificationRegistry();
  clearAlertRegistry();
  clearEscalationRegistry();
  clearWorkflowRegistry();
  clearApprovalRegistry();
  clearReviewRegistry();
  clearAuditRegistry();
  clearComplianceRegistry();
  clearControlRegistry();
  clearRiskRegistry();
  clearIssueRegistry();
  buildOrganizationRegistry();
  buildDepartmentRegistry();
  buildTeamRegistry();
  buildRoleRegistry();
  buildPermissionRegistry();
  buildPolicyRegistry();
  buildAssignmentRegistry();
  buildNotificationRegistry();
  buildAlertRegistry();
  buildEscalationRegistry();
  buildWorkflowRegistry();
  buildApprovalRegistry();
  buildReviewRegistry();
  buildAuditRegistry();
  buildComplianceRegistry();
  buildControlRegistry();
  buildRiskRegistry();

  const first = buildIssueRegistry();
  assert(first.length >= 3, "registry has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => r.id)).size === first.length,
    "unique registry ids",
  );
  assert(
    new Set(
      first.map(
        (r) =>
          `${r.organizationId}:${r.roleId}:${r.permissionId}:${r.policyId}:${r.assignmentId}:${r.notificationId}:${r.alertId}:${r.escalationId}:${r.workflowId}:${r.approvalId}:${r.reviewId}:${r.auditId}:${r.complianceId}:${r.controlId}:${r.riskId}:${r.issueId}`,
      ),
    ).size === first.length,
    "unique issue keys",
  );
  console.log("PASS Build");

  const second = buildIssueRegistry();
  assert(
    issueRegistryFingerprint(first) === issueRegistryFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  console.log("PASS Deterministic");

  for (let i = 1; i < first.length; i++) {
    compareChain(first[i - 1]!, first[i]!, i);
  }
  console.log("PASS Ordering");

  clearIssueRegistry();
  const viaGet = getIssueRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    issueRegistryFingerprint(viaGet) === issueRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getIssueRegistry();
  assert(
    issueRegistryFingerprint(again) === issueRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_1_ID === "EP-1", "EP-1 id");
  assert(EP_WP21_ID === "WP-21", "WP-21 id");
  assert(ISSUE_REGISTRY_CAPABILITY === "IssueRegistry", "capability");
  assert(EP_ISSUE_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(EP_ISSUE_REGISTRY_VERSION === "ep-1-wp-21-issue-registry-1", "version");
  console.log("PASS EP-1 WP-21");

  const tscBin = path.join(
    process.cwd(),
    "node_modules",
    "typescript",
    "bin",
    "tsc",
  );
  const tsc = spawnSync(
    process.execPath,
    [tscBin, "--noEmit", "--pretty", "false", "-p", "tsconfig.ep-wp1.json"],
    { encoding: "utf8", cwd: process.cwd() },
  );
  if (tsc.status !== 0) {
    const tscOut = `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim();
    throw new Error(`ASSERT: tsc failed\n${tscOut}`);
  }
  console.log("PASS tsc");

  const diffCheck = spawnSync(
    "git",
    [
      "diff",
      "--check",
      "--",
      "lib/enterprise",
      "scripts/verify-ep-wp21.ts",
      "tsconfig.ep-wp1.json",
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );
  if (diffCheck.status !== 0) {
    throw new Error(
      `ASSERT: git diff --check failed\n${diffCheck.stdout}\n${diffCheck.stderr}`,
    );
  }
  console.log("PASS git diff --check");

  console.log("\n=== ALL EP-1 / WP-21 CHECKS PASSED ===");
  console.log(
    `${EP_1_ID}/${EP_WP21_ID} · baseline ${EP_ISSUE_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
