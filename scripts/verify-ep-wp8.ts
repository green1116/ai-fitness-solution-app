/**
 * EP-2 / WP-8 — Enterprise Workspace Activity Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP8_ID,
  EP_WORKSPACE_ACTIVITY_REGISTRY_BASELINE,
  EP_WORKSPACE_ACTIVITY_REGISTRY_VERSION,
  WORKSPACE_ACTIVITY_REGISTRY_CAPABILITY,
  WORKSPACE_ACTIVITY_TYPES,
  buildWorkspaceAccessRegistry,
  buildWorkspaceActivityRegistry,
  buildWorkspaceEventRegistry,
  buildWorkspaceMemberRegistry,
  buildWorkspacePermissionRegistry,
  buildWorkspaceRegistry,
  buildWorkspaceRoleRegistry,
  buildWorkspaceSessionRegistry,
  clearWorkspaceAccessRegistry,
  clearWorkspaceActivityRegistry,
  clearWorkspaceEventRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  getWorkspaceActivityRegistry,
  workspaceActivityRegistryFingerprint,
  type WorkspaceActivityRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceActivityRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(
    typeof row.workspaceId === "string" && row.workspaceId.length > 0,
    `${label}.workspaceId`,
  );
  assert(
    typeof row.memberId === "string" && row.memberId.length > 0,
    `${label}.memberId`,
  );
  assert(
    typeof row.roleId === "string" && row.roleId.length > 0,
    `${label}.roleId`,
  );
  assert(
    typeof row.permissionId === "string" && row.permissionId.length > 0,
    `${label}.permissionId`,
  );
  assert(
    typeof row.accessId === "string" && row.accessId.length > 0,
    `${label}.accessId`,
  );
  assert(
    typeof row.sessionId === "string" && row.sessionId.length > 0,
    `${label}.sessionId`,
  );
  assert(
    typeof row.eventId === "string" && row.eventId.length > 0,
    `${label}.eventId`,
  );
  assert(
    typeof row.activityId === "string" && row.activityId.length > 0,
    `${label}.activityId`,
  );
  assert(
    (WORKSPACE_ACTIVITY_TYPES as readonly string[]).includes(row.activityType),
    `${label}.activityType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function main() {
  console.log("=== EP-2 / WP-8 Enterprise Workspace Activity Registry ===\n");

  clearWorkspaceRegistry();
  clearWorkspaceMemberRegistry();
  clearWorkspaceRoleRegistry();
  clearWorkspacePermissionRegistry();
  clearWorkspaceAccessRegistry();
  clearWorkspaceSessionRegistry();
  clearWorkspaceEventRegistry();
  clearWorkspaceActivityRegistry();
  buildWorkspaceRegistry();
  buildWorkspaceMemberRegistry();
  buildWorkspaceRoleRegistry();
  buildWorkspacePermissionRegistry();
  buildWorkspaceAccessRegistry();
  buildWorkspaceSessionRegistry();
  buildWorkspaceEventRegistry();

  const first = buildWorkspaceActivityRegistry();
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
          `${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}`,
      ),
    ).size === first.length,
    "unique workspaceId+memberId+roleId+permissionId+accessId+sessionId+eventId+activityId",
  );
  console.log("PASS Build");

  const second = buildWorkspaceActivityRegistry();
  assert(
    workspaceActivityRegistryFingerprint(first) ===
      workspaceActivityRegistryFingerprint(second),
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
    const byWs = prev.workspaceId.localeCompare(curr.workspaceId);
    assert(byWs <= 0, `workspaceId order at ${i}`);
    if (byWs === 0) {
      const byMem = prev.memberId.localeCompare(curr.memberId);
      assert(byMem <= 0, `memberId order at ${i}`);
      if (byMem === 0) {
        const byRole = prev.roleId.localeCompare(curr.roleId);
        assert(byRole <= 0, `roleId order at ${i}`);
        if (byRole === 0) {
          const byPerm = prev.permissionId.localeCompare(curr.permissionId);
          assert(byPerm <= 0, `permissionId order at ${i}`);
          if (byPerm === 0) {
            const byAcc = prev.accessId.localeCompare(curr.accessId);
            assert(byAcc <= 0, `accessId order at ${i}`);
            if (byAcc === 0) {
              const bySess = prev.sessionId.localeCompare(curr.sessionId);
              assert(bySess <= 0, `sessionId order at ${i}`);
              if (bySess === 0) {
                const byEvt = prev.eventId.localeCompare(curr.eventId);
                assert(byEvt <= 0, `eventId order at ${i}`);
                if (byEvt === 0) {
                  assert(
                    prev.activityId.localeCompare(curr.activityId) <= 0,
                    `activityId order at ${i}`,
                  );
                }
              }
            }
          }
        }
      }
    }
  }
  console.log("PASS Ordering");

  clearWorkspaceActivityRegistry();
  const viaGet = getWorkspaceActivityRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceActivityRegistryFingerprint(viaGet) ===
      workspaceActivityRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceActivityRegistry();
  assert(
    workspaceActivityRegistryFingerprint(again) ===
      workspaceActivityRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP8_ID === "WP-8", "WP-8 id");
  assert(
    WORKSPACE_ACTIVITY_REGISTRY_CAPABILITY === "WorkspaceActivityRegistry",
    "capability",
  );
  assert(
    EP_WORKSPACE_ACTIVITY_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_ACTIVITY_REGISTRY_VERSION ===
      "ep-2-wp-8-workspace-activity-registry-1",
    "version",
  );
  console.log("PASS EP-2 WP-8");

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
      "scripts/verify-ep-wp8.ts",
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

  console.log("\n=== ALL EP-2 / WP-8 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP8_ID} · baseline ${EP_WORKSPACE_ACTIVITY_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
