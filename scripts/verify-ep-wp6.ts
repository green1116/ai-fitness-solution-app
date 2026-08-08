/**
 * EP-2 / WP-6 — Enterprise Workspace Session Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP6_ID,
  EP_WORKSPACE_SESSION_REGISTRY_BASELINE,
  EP_WORKSPACE_SESSION_REGISTRY_VERSION,
  WORKSPACE_SESSION_REGISTRY_CAPABILITY,
  WORKSPACE_SESSION_TYPES,
  buildWorkspaceAccessRegistry,
  buildWorkspaceMemberRegistry,
  buildWorkspacePermissionRegistry,
  buildWorkspaceRegistry,
  buildWorkspaceRoleRegistry,
  buildWorkspaceSessionRegistry,
  clearWorkspaceAccessRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  getWorkspaceSessionRegistry,
  workspaceSessionRegistryFingerprint,
  type WorkspaceSessionRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceSessionRegistry, label: string) {
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
    (WORKSPACE_SESSION_TYPES as readonly string[]).includes(row.sessionType),
    `${label}.sessionType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function main() {
  console.log("=== EP-2 / WP-6 Enterprise Workspace Session Registry ===\n");

  clearWorkspaceRegistry();
  clearWorkspaceMemberRegistry();
  clearWorkspaceRoleRegistry();
  clearWorkspacePermissionRegistry();
  clearWorkspaceAccessRegistry();
  clearWorkspaceSessionRegistry();
  buildWorkspaceRegistry();
  buildWorkspaceMemberRegistry();
  buildWorkspaceRoleRegistry();
  buildWorkspacePermissionRegistry();
  buildWorkspaceAccessRegistry();

  const first = buildWorkspaceSessionRegistry();
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
          `${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}`,
      ),
    ).size === first.length,
    "unique workspaceId+memberId+roleId+permissionId+accessId+sessionId",
  );
  console.log("PASS Build");

  const second = buildWorkspaceSessionRegistry();
  assert(
    workspaceSessionRegistryFingerprint(first) ===
      workspaceSessionRegistryFingerprint(second),
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
              assert(
                prev.sessionId.localeCompare(curr.sessionId) <= 0,
                `sessionId order at ${i}`,
              );
            }
          }
        }
      }
    }
  }
  console.log("PASS Ordering");

  clearWorkspaceSessionRegistry();
  const viaGet = getWorkspaceSessionRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceSessionRegistryFingerprint(viaGet) ===
      workspaceSessionRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceSessionRegistry();
  assert(
    workspaceSessionRegistryFingerprint(again) ===
      workspaceSessionRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP6_ID === "WP-6", "WP-6 id");
  assert(
    WORKSPACE_SESSION_REGISTRY_CAPABILITY === "WorkspaceSessionRegistry",
    "capability",
  );
  assert(
    EP_WORKSPACE_SESSION_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_SESSION_REGISTRY_VERSION ===
      "ep-2-wp-6-workspace-session-registry-1",
    "version",
  );
  console.log("PASS EP-2 WP-6");

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
      "scripts/verify-ep-wp6.ts",
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

  console.log("\n=== ALL EP-2 / WP-6 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP6_ID} · baseline ${EP_WORKSPACE_SESSION_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
