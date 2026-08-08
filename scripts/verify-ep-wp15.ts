/**
 * EP-2 / WP-15 — Enterprise Workspace Query verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP15_ID,
  EP_WORKSPACE_QUERY_BASELINE,
  EP_WORKSPACE_QUERY_VERSION,
  WORKSPACE_QUERY_CAPABILITY,
  buildWorkspaceQuery,
  buildWorkspaceSnapshot,
  clearWorkspaceAccessRegistry,
  clearWorkspaceActivityRegistry,
  clearWorkspaceAssignmentRegistry,
  clearWorkspaceEventRegistry,
  clearWorkspaceExecutionRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceQuery,
  clearWorkspaceQueueRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceResultRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  clearWorkspaceSnapshot,
  clearWorkspaceTaskRegistry,
  getWorkspaceQuery,
  workspaceQueryFingerprint,
  type WorkspaceQuery,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkspaceQuery, label: string) {
  assert(
    typeof row.workspaceId === "string" && row.workspaceId.length > 0,
    `${label}.workspaceId`,
  );
  assert(
    typeof row.summary === "string" && row.summary.length > 0,
    `${label}.summary`,
  );
  assert(typeof row.counts === "object" && row.counts !== null, `${label}.counts`);
  assert(row.counts.members >= 0, `${label}.counts.members`);
  assert(row.counts.results >= 0, `${label}.counts.results`);
  assert(Array.isArray(row.topMembers), `${label}.topMembers`);
  assert(Array.isArray(row.topRoles), `${label}.topRoles`);
  assert(Array.isArray(row.topPermissions), `${label}.topPermissions`);
  assert(Array.isArray(row.topActivities), `${label}.topActivities`);
  assert(Array.isArray(row.topTasks), `${label}.topTasks`);
  assert(Array.isArray(row.topResults), `${label}.topResults`);
  for (const top of row.topMembers) {
    assert(top.key.length > 0, `${label}.topMembers.key`);
    assert(top.count > 0, `${label}.topMembers.count`);
  }
}

function clearAll() {
  clearWorkspaceQuery();
  clearWorkspaceSnapshot();
  clearWorkspaceResultRegistry();
  clearWorkspaceExecutionRegistry();
  clearWorkspaceAssignmentRegistry();
  clearWorkspaceQueueRegistry();
  clearWorkspaceTaskRegistry();
  clearWorkspaceActivityRegistry();
  clearWorkspaceEventRegistry();
  clearWorkspaceSessionRegistry();
  clearWorkspaceAccessRegistry();
  clearWorkspacePermissionRegistry();
  clearWorkspaceRoleRegistry();
  clearWorkspaceMemberRegistry();
  clearWorkspaceRegistry();
}

function main() {
  console.log("=== EP-2 / WP-15 Enterprise Workspace Query ===\n");

  clearAll();
  buildWorkspaceSnapshot();

  const first = buildWorkspaceQuery();
  assert(first.length >= 1, "query has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => r.workspaceId)).size === first.length,
    "unique workspaceIds",
  );
  console.log("PASS Build");

  clearWorkspaceQuery();
  const second = buildWorkspaceQuery();
  assert(
    workspaceQueryFingerprint(first) === workspaceQueryFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  console.log("PASS Deterministic");

  for (let i = 1; i < first.length; i++) {
    assert(
      first[i - 1]!.workspaceId.localeCompare(first[i]!.workspaceId) <= 0,
      `workspaceId order at ${i}`,
    );
  }
  console.log("PASS Ordering");

  clearWorkspaceQuery();
  const viaGet = getWorkspaceQuery();
  assert(viaGet.length === first.length, "get length");
  assert(
    workspaceQueryFingerprint(viaGet) === workspaceQueryFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceQuery();
  assert(
    workspaceQueryFingerprint(again) === workspaceQueryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP15_ID === "WP-15", "WP-15 id");
  assert(WORKSPACE_QUERY_CAPABILITY === "WorkspaceQuery", "capability");
  assert(EP_WORKSPACE_QUERY_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(
    EP_WORKSPACE_QUERY_VERSION === "ep-2-wp-15-workspace-query-1",
    "version",
  );
  console.log("PASS EP-2 WP-15");

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
      "scripts/verify-ep-wp15.ts",
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

  console.log("\n=== ALL EP-2 / WP-15 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP15_ID} · baseline ${EP_WORKSPACE_QUERY_BASELINE} · workspaces ${first.length}`,
  );
}

main();
