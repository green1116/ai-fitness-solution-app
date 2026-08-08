/**
 * EP-1 / WP-25 — Enterprise Restore Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_1_ID,
  EP_RESTORE_REGISTRY_BASELINE,
  EP_RESTORE_REGISTRY_VERSION,
  EP_WP25_ID,
  RESTORE_REGISTRY_CAPABILITY,
  RESTORE_TYPES,
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
  buildRecoveryRegistry,
  buildRemedyRegistry,
  buildResolutionRegistry,
  buildRestoreRegistry,
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
  clearRecoveryRegistry,
  clearRemedyRegistry,
  clearResolutionRegistry,
  clearRestoreRegistry,
  clearReviewRegistry,
  clearRiskRegistry,
  clearRoleRegistry,
  clearTeamRegistry,
  clearWorkflowRegistry,
  getRestoreRegistry,
  restoreRegistryFingerprint,
  type RestoreRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: RestoreRegistry, label: string) {
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
  assert(row.resolutionId.length > 0, `${label}.resolutionId`);
  assert(row.remedyId.length > 0, `${label}.remedyId`);
  assert(row.recoveryId.length > 0, `${label}.recoveryId`);
  assert(row.restoreId.length > 0, `${label}.restoreId`);
  assert(row.restoreName.length > 0, `${label}.restoreName`);
  assert(
    (RESTORE_TYPES as readonly string[]).includes(row.restoreType),
    `${label}.restoreType`,
  );
  assert(row.status.length > 0, `${label}.status`);
  assert(row.createdAt.includes("T"), `${label}.createdAt`);
}

function compareChain(prev: RestoreRegistry, curr: RestoreRegistry, i: number) {
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
    "resolutionId",
    "remedyId",
    "recoveryId",
    "restoreId",
  ] as const;
  for (const key of keys) {
    const cmp = prev[key].localeCompare(curr[key]);
    assert(cmp <= 0, `${key} order at ${i}`);
    if (cmp < 0) return;
  }
}

function main() {
  console.log("=== EP-1 / WP-25 Enterprise Restore Registry ===\n");

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
  clearResolutionRegistry();
  clearRemedyRegistry();
  clearRecoveryRegistry();
  clearRestoreRegistry();
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
  buildIssueRegistry();
  buildResolutionRegistry();
  buildRemedyRegistry();
  buildRecoveryRegistry();

  const first = buildRestoreRegistry();
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
          `${r.organizationId}:${r.roleId}:${r.permissionId}:${r.policyId}:${r.assignmentId}:${r.notificationId}:${r.alertId}:${r.escalationId}:${r.workflowId}:${r.approvalId}:${r.reviewId}:${r.auditId}:${r.complianceId}:${r.controlId}:${r.riskId}:${r.issueId}:${r.resolutionId}:${r.remedyId}:${r.recoveryId}:${r.restoreId}`,
      ),
    ).size === first.length,
    "unique restore keys",
  );
  console.log("PASS Build");

  const second = buildRestoreRegistry();
  assert(
    restoreRegistryFingerprint(first) === restoreRegistryFingerprint(second),
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

  clearRestoreRegistry();
  const viaGet = getRestoreRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    restoreRegistryFingerprint(viaGet) === restoreRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getRestoreRegistry();
  assert(
    restoreRegistryFingerprint(again) === restoreRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_1_ID === "EP-1", "EP-1 id");
  assert(EP_WP25_ID === "WP-25", "WP-25 id");
  assert(RESTORE_REGISTRY_CAPABILITY === "RestoreRegistry", "capability");
  assert(EP_RESTORE_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(
    EP_RESTORE_REGISTRY_VERSION === "ep-1-wp-25-restore-registry-1",
    "version",
  );
  console.log("PASS EP-1 WP-25");

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
      "scripts/verify-ep-wp25.ts",
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

  console.log("\n=== ALL EP-1 / WP-25 CHECKS PASSED ===");
  console.log(
    `${EP_1_ID}/${EP_WP25_ID} · baseline ${EP_RESTORE_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
