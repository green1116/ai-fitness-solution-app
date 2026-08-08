/**
 * EP-2 / WP-2 — Enterprise Workspace Member Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP2_ID,
  EP_WORKSPACE_MEMBER_REGISTRY_BASELINE,
  EP_WORKSPACE_MEMBER_REGISTRY_VERSION,
  WORKSPACE_MEMBER_REGISTRY_CAPABILITY,
  WORKSPACE_MEMBER_TYPES,
  buildWorkspaceMemberRegistry,
  buildWorkspaceRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspaceRegistry,
  getWorkspaceMemberRegistry,
  workspaceMemberRegistryFingerprint,
  type WorkspaceMemberRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceMemberRegistry, label: string) {
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
    (WORKSPACE_MEMBER_TYPES as readonly string[]).includes(row.memberType),
    `${label}.memberType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function main() {
  console.log("=== EP-2 / WP-2 Enterprise Workspace Member Registry ===\n");

  clearWorkspaceRegistry();
  clearWorkspaceMemberRegistry();
  buildWorkspaceRegistry();

  const first = buildWorkspaceMemberRegistry();
  assert(first.length >= 3, "registry has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => r.id)).size === first.length,
    "unique registry ids",
  );
  assert(
    new Set(first.map((r) => `${r.workspaceId}|${r.memberId}`)).size ===
      first.length,
    "unique workspaceId+memberId",
  );
  console.log("PASS Build");

  const second = buildWorkspaceMemberRegistry();
  assert(
    workspaceMemberRegistryFingerprint(first) ===
      workspaceMemberRegistryFingerprint(second),
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
      assert(
        prev.memberId.localeCompare(curr.memberId) <= 0,
        `memberId order at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  clearWorkspaceMemberRegistry();
  const viaGet = getWorkspaceMemberRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceMemberRegistryFingerprint(viaGet) ===
      workspaceMemberRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceMemberRegistry();
  assert(
    workspaceMemberRegistryFingerprint(again) ===
      workspaceMemberRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP2_ID === "WP-2", "WP-2 id");
  assert(
    WORKSPACE_MEMBER_REGISTRY_CAPABILITY === "WorkspaceMemberRegistry",
    "capability",
  );
  assert(
    EP_WORKSPACE_MEMBER_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_MEMBER_REGISTRY_VERSION ===
      "ep-2-wp-2-workspace-member-registry-1",
    "version",
  );
  console.log("PASS EP-2 WP-2");

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
      "scripts/verify-ep-wp2.ts",
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

  console.log("\n=== ALL EP-2 / WP-2 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP2_ID} · baseline ${EP_WORKSPACE_MEMBER_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
