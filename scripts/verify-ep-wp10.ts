/**
 * EP-2 / WP-10 — Enterprise Workspace Queue Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP10_ID,
  EP_WORKSPACE_QUEUE_REGISTRY_BASELINE,
  EP_WORKSPACE_QUEUE_REGISTRY_VERSION,
  WORKSPACE_QUEUE_REGISTRY_CAPABILITY,
  WORKSPACE_QUEUE_TYPES,
  buildWorkspaceAccessRegistry,
  buildWorkspaceActivityRegistry,
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
  clearWorkspaceEventRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceQueueRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  clearWorkspaceTaskRegistry,
  getWorkspaceQueueRegistry,
  workspaceQueueRegistryFingerprint,
  type WorkspaceQueueRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceQueueRegistry, label: string) {
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
  assert(
    typeof row.queueId === "string" && row.queueId.length > 0,
    `${label}.queueId`,
  );
  assert(
    (WORKSPACE_QUEUE_TYPES as readonly string[]).includes(row.queueType),
    `${label}.queueType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function main() {
  console.log("=== EP-2 / WP-10 Enterprise Workspace Queue Registry ===\n");

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
  buildWorkspaceRegistry();
  buildWorkspaceMemberRegistry();
  buildWorkspaceRoleRegistry();
  buildWorkspacePermissionRegistry();
  buildWorkspaceAccessRegistry();
  buildWorkspaceSessionRegistry();
  buildWorkspaceEventRegistry();
  buildWorkspaceActivityRegistry();
  buildWorkspaceTaskRegistry();

  const first = buildWorkspaceQueueRegistry();
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
          `${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.taskId}|${r.queueId}`,
      ),
    ).size === first.length,
    "unique chain+queueId",
  );
  console.log("PASS Build");

  const second = buildWorkspaceQueueRegistry();
  assert(
    workspaceQueueRegistryFingerprint(first) ===
      workspaceQueueRegistryFingerprint(second),
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

  clearWorkspaceQueueRegistry();
  const viaGet = getWorkspaceQueueRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceQueueRegistryFingerprint(viaGet) ===
      workspaceQueueRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceQueueRegistry();
  assert(
    workspaceQueueRegistryFingerprint(again) ===
      workspaceQueueRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP10_ID === "WP-10", "WP-10 id");
  assert(
    WORKSPACE_QUEUE_REGISTRY_CAPABILITY === "WorkspaceQueueRegistry",
    "capability",
  );
  assert(
    EP_WORKSPACE_QUEUE_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_QUEUE_REGISTRY_VERSION ===
      "ep-2-wp-10-workspace-queue-registry-1",
    "version",
  );
  console.log("PASS EP-2 WP-10");

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
      "scripts/verify-ep-wp10.ts",
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

  console.log("\n=== ALL EP-2 / WP-10 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP10_ID} · baseline ${EP_WORKSPACE_QUEUE_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
