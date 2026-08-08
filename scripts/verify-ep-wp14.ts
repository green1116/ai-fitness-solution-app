/**
 * EP-2 / WP-14 — Enterprise Workspace Snapshot verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_2_ID,
  EP_2_WP14_ID,
  EP_WORKSPACE_SNAPSHOT_BASELINE,
  EP_WORKSPACE_SNAPSHOT_VERSION,
  WORKSPACE_SNAPSHOT_CAPABILITY,
  buildWorkspaceSnapshot,
  clearWorkspaceAccessRegistry,
  clearWorkspaceActivityRegistry,
  clearWorkspaceAssignmentRegistry,
  clearWorkspaceEventRegistry,
  clearWorkspaceExecutionRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceQueueRegistry,
  clearWorkspaceRegistry,
  clearWorkspaceResultRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  clearWorkspaceSnapshot,
  clearWorkspaceTaskRegistry,
  getWorkspaceSnapshot,
  workspaceSnapshotFingerprint,
  type WorkspaceSnapshot,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertSnapshotShape(s: WorkspaceSnapshot) {
  const layers: Array<[keyof WorkspaceSnapshot, number]> = [
    ["workspace", s.workspace.length],
    ["members", s.members.length],
    ["roles", s.roles.length],
    ["permissions", s.permissions.length],
    ["access", s.access.length],
    ["sessions", s.sessions.length],
    ["events", s.events.length],
    ["activities", s.activities.length],
    ["tasks", s.tasks.length],
    ["queues", s.queues.length],
    ["assignments", s.assignments.length],
    ["executions", s.executions.length],
    ["results", s.results.length],
  ];
  for (const [name, len] of layers) {
    assert(len > 0, `${String(name)} non-empty`);
  }
}

function clearAll() {
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
  console.log("=== EP-2 / WP-14 Enterprise Workspace Snapshot ===\n");

  clearAll();
  const first = buildWorkspaceSnapshot();
  assertSnapshotShape(first);
  console.log("PASS Build");

  clearWorkspaceSnapshot();
  const second = buildWorkspaceSnapshot();
  assert(
    workspaceSnapshotFingerprint(first) ===
      workspaceSnapshotFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  console.log("PASS Deterministic");

  clearWorkspaceSnapshot();
  const viaGet = getWorkspaceSnapshot();
  assert(
    workspaceSnapshotFingerprint(viaGet) ===
      workspaceSnapshotFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkspaceSnapshot();
  assert(
    workspaceSnapshotFingerprint(again) ===
      workspaceSnapshotFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_2_ID === "EP-2", "EP-2 id");
  assert(EP_2_WP14_ID === "WP-14", "WP-14 id");
  assert(
    WORKSPACE_SNAPSHOT_CAPABILITY === "WorkspaceSnapshot",
    "capability",
  );
  assert(
    EP_WORKSPACE_SNAPSHOT_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKSPACE_SNAPSHOT_VERSION === "ep-2-wp-14-workspace-snapshot-1",
    "version",
  );
  console.log("PASS EP-2 WP-14");

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
      "scripts/verify-ep-wp14.ts",
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

  console.log("\n=== ALL EP-2 / WP-14 CHECKS PASSED ===");
  console.log(
    `${EP_2_ID}/${EP_2_WP14_ID} · baseline ${EP_WORKSPACE_SNAPSHOT_BASELINE} · layers 13`,
  );
}

main();
