/**
 * EP-2 / WP-7 — Enterprise Workspace Event Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP7_ID,
  EP_WORKSPACE_EVENT_REGISTRY_BASELINE,
  EP_WORKSPACE_EVENT_REGISTRY_VERSION,
  WORKSPACE_EVENT_REGISTRY_CAPABILITY,
  WORKSPACE_EVENT_TYPES,
  buildWorkspaceAccessRegistry,
  buildWorkspaceEventRegistry,
  buildWorkspaceMemberRegistry,
  buildWorkspacePermissionRegistry,
  buildWorkspaceRegistry,
  buildWorkspaceRoleRegistry,
  buildWorkspaceSessionRegistry,
  clearWorkspaceAccessRegistry,
  clearWorkspaceEventRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  getWorkspaceEventRegistry,
  workspaceEventRegistryFingerprint,
  type WorkspaceEventRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceEventRegistry, label: string) {
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
    (WORKSPACE_EVENT_TYPES as readonly string[]).includes(row.eventType),
    `${label}.eventType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function main() {
  console.log("=== EP-2 / WP-7 Enterprise Workspace Event Registry ===\n");

  clearWorkspaceRegistry();
  clearWorkspaceMemberRegistry();
  clearWorkspaceRoleRegistry();
  clearWorkspacePermissionRegistry();
  clearWorkspaceAccessRegistry();
  clearWorkspaceSessionRegistry();
  clearWorkspaceEventRegistry();
  buildWorkspaceRegistry();
  buildWorkspaceMemberRegistry();
  buildWorkspaceRoleRegistry();
  buildWorkspacePermissionRegistry();
  buildWorkspaceAccessRegistry();
  buildWorkspaceSessionRegistry();

  const first = buildWorkspaceEventRegistry();
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
          `${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}`,
      ),
    ).size === first.length,
    "unique workspaceId+memberId+roleId+permissionId+accessId+sessionId+eventId",
  );
  console.log("PASS Build");

  const second = buildWorkspaceEventRegistry();
  assert(
    workspaceEventRegistryFingerprint(first) ===
      workspaceEventRegistryFingerprint(second),
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
                assert(
                  prev.eventId.localeCompare(curr.eventId) <= 0,
                  `eventId order at ${i}`,
                );
              }
            }
          }
        }
      }
    }
  }
  console.log("PASS Ordering");

  clearWorkspaceEventRegistry();
  const viaGet = getWorkspaceEventRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceEventRegistryFingerprint(viaGet) ===
      workspaceEventRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceEventRegistry();
  assert(
    workspaceEventRegistryFingerprint(again) ===
      workspaceEventRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP7_ID === "WP-7", "WP-7 id");
  assert(
    WORKSPACE_EVENT_REGISTRY_CAPABILITY === "WorkspaceEventRegistry",
    "capability",
  );
  assert(
    EP_WORKSPACE_EVENT_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_EVENT_REGISTRY_VERSION ===
      "ep-2-wp-7-workspace-event-registry-1",
    "version",
  );
  console.log("PASS EP-2 WP-7");

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
      "scripts/verify-ep-wp7.ts",
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

  console.log("\n=== ALL EP-2 / WP-7 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP7_ID} · baseline ${EP_WORKSPACE_EVENT_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
