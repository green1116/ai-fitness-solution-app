/**
 * EP-2 / WP-11 — Enterprise Workspace Assignment Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP11_ID,
  EP_WORKSPACE_ASSIGNMENT_REGISTRY_BASELINE,
  EP_WORKSPACE_ASSIGNMENT_REGISTRY_VERSION,
  WORKSPACE_ASSIGNMENT_REGISTRY_CAPABILITY,
  WORKSPACE_ASSIGNMENT_TYPES,
  buildWorkspaceAccessRegistry,
  buildWorkspaceActivityRegistry,
  buildWorkspaceAssignmentRegistry,
  buildWorkspaceEventRegistry,
  buildWorkspaceMemberRegistry,
  buildWorkspacePermissionRegistry,
  buildWorkspaceQueueRegistry,
  buildWorkspaceRegistry,
  buildWorkspaceRoleRegistry,
  buildWorkspaceSessionRegistry,
  buildWorkspaceTaskRegistry,
  clearWorkspaceAccessRegistry,
  clearWorkspaceActivityRegistry,
  clearWorkspaceAssignmentRegistry,
  clearWorkspaceEventRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceQueueRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  clearWorkspaceTaskRegistry,
  getWorkspaceAssignmentRegistry,
  workspaceAssignmentRegistryFingerprint,
  type WorkspaceAssignmentRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceAssignmentRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(row.memberId.length > 0, `${label}.memberId`);
  assert(row.roleId.length > 0, `${label}.roleId`);
  assert(row.permissionId.length > 0, `${label}.permissionId`);
  assert(row.accessId.length > 0, `${label}.accessId`);
  assert(row.sessionId.length > 0, `${label}.sessionId`);
  assert(row.eventId.length > 0, `${label}.eventId`);
  assert(row.activityId.length > 0, `${label}.activityId`);
  assert(row.taskId.length > 0, `${label}.taskId`);
  assert(row.queueId.length > 0, `${label}.queueId`);
  assert(
    typeof row.assignmentId === "string" && row.assignmentId.length > 0,
    `${label}.assignmentId`,
  );
  assert(
    (WORKSPACE_ASSIGNMENT_TYPES as readonly string[]).includes(
      row.assignmentType,
    ),
    `${label}.assignmentType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function main() {
  console.log(
    "=== EP-2 / WP-11 Enterprise Workspace Assignment Registry ===\n",
  );

  clearWorkspaceRegistry();
  clearWorkspaceMemberRegistry();
  clearWorkspaceRoleRegistry();
  clearWorkspacePermissionRegistry();
  clearWorkspaceAccessRegistry();
  clearWorkspaceSessionRegistry();
  clearWorkspaceEventRegistry();
  clearWorkspaceActivityRegistry();
  clearWorkspaceTaskRegistry();
  clearWorkspaceQueueRegistry();
  clearWorkspaceAssignmentRegistry();
  buildWorkspaceRegistry();
  buildWorkspaceMemberRegistry();
  buildWorkspaceRoleRegistry();
  buildWorkspacePermissionRegistry();
  buildWorkspaceAccessRegistry();
  buildWorkspaceSessionRegistry();
  buildWorkspaceEventRegistry();
  buildWorkspaceActivityRegistry();
  buildWorkspaceTaskRegistry();
  buildWorkspaceQueueRegistry();

  const first = buildWorkspaceAssignmentRegistry();
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
          `${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.taskId}|${r.queueId}|${r.assignmentId}`,
      ),
    ).size === first.length,
    "unique chain+assignmentId",
  );
  console.log("PASS Build");

  const second = buildWorkspaceAssignmentRegistry();
  assert(
    workspaceAssignmentRegistryFingerprint(first) ===
      workspaceAssignmentRegistryFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  console.log("PASS Deterministic");

  for (let i = 1; i < first.length; i++) {
    const prev = first[i - 1]!;
    const curr = first[i]!;
    const keys = [
      "workspaceId",
      "memberId",
      "roleId",
      "permissionId",
      "accessId",
      "sessionId",
      "eventId",
      "activityId",
      "taskId",
      "queueId",
      "assignmentId",
    ] as const;
    for (const key of keys) {
      const cmp = prev[key].localeCompare(curr[key]);
      if (cmp !== 0) {
        assert(cmp <= 0, `${key} order at ${i}`);
        break;
      }
    }
  }
  console.log("PASS Ordering");

  clearWorkspaceAssignmentRegistry();
  const viaGet = getWorkspaceAssignmentRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceAssignmentRegistryFingerprint(viaGet) ===
      workspaceAssignmentRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceAssignmentRegistry();
  assert(
    workspaceAssignmentRegistryFingerprint(again) ===
      workspaceAssignmentRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP11_ID === "WP-11", "WP-11 id");
  assert(
    WORKSPACE_ASSIGNMENT_REGISTRY_CAPABILITY === "WorkspaceAssignmentRegistry",
    "capability",
  );
  assert(
    EP_WORKSPACE_ASSIGNMENT_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_ASSIGNMENT_REGISTRY_VERSION ===
      "ep-2-wp-11-workspace-assignment-registry-1",
    "version",
  );
  console.log("PASS EP-2 WP-11");

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
      "scripts/verify-ep-wp11.ts",
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

  console.log("\n=== ALL EP-2 / WP-11 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP11_ID} · baseline ${EP_WORKSPACE_ASSIGNMENT_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
