/**
 * EP-2 / WP-3 — Enterprise Workspace Role Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP3_ID,
  EP_WORKSPACE_ROLE_REGISTRY_BASELINE,
  EP_WORKSPACE_ROLE_REGISTRY_VERSION,
  WORKSPACE_ROLE_REGISTRY_CAPABILITY,
  WORKSPACE_ROLE_TYPES,
  buildWorkspaceMemberRegistry,
  buildWorkspaceRegistry,
  buildWorkspaceRoleRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceRoleRegistry,
  getWorkspaceRoleRegistry,
  workspaceRoleRegistryFingerprint,
  type WorkspaceRoleRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceRoleRegistry, label: string) {
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
    (WORKSPACE_ROLE_TYPES as readonly string[]).includes(row.roleType),
    `${label}.roleType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function main() {
  console.log("=== EP-2 / WP-3 Enterprise Workspace Role Registry ===\n");

  clearWorkspaceRegistry();
  clearWorkspaceMemberRegistry();
  clearWorkspaceRoleRegistry();
  buildWorkspaceRegistry();
  buildWorkspaceMemberRegistry();

  const first = buildWorkspaceRoleRegistry();
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
      first.map((r) => `${r.workspaceId}|${r.memberId}|${r.roleId}`),
    ).size === first.length,
    "unique workspaceId+memberId+roleId",
  );
  console.log("PASS Build");

  const second = buildWorkspaceRoleRegistry();
  assert(
    workspaceRoleRegistryFingerprint(first) ===
      workspaceRoleRegistryFingerprint(second),
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
        assert(
          prev.roleId.localeCompare(curr.roleId) <= 0,
          `roleId order at ${i}`,
        );
      }
    }
  }
  console.log("PASS Ordering");

  clearWorkspaceRoleRegistry();
  const viaGet = getWorkspaceRoleRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceRoleRegistryFingerprint(viaGet) ===
      workspaceRoleRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceRoleRegistry();
  assert(
    workspaceRoleRegistryFingerprint(again) ===
      workspaceRoleRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP3_ID === "WP-3", "WP-3 id");
  assert(
    WORKSPACE_ROLE_REGISTRY_CAPABILITY === "WorkspaceRoleRegistry",
    "capability",
  );
  assert(
    EP_WORKSPACE_ROLE_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_ROLE_REGISTRY_VERSION ===
      "ep-2-wp-3-workspace-role-registry-1",
    "version",
  );
  console.log("PASS EP-2 WP-3");

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
      "scripts/verify-ep-wp3.ts",
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

  console.log("\n=== ALL EP-2 / WP-3 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP3_ID} · baseline ${EP_WORKSPACE_ROLE_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
