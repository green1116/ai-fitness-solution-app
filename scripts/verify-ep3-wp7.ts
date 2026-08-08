/**
 * EP-3 / WP-7 — Collaboration Snapshot verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP7_ID,
  EP_COLLABORATION_SNAPSHOT_BASELINE,
  EP_COLLABORATION_SNAPSHOT_VERSION,
  COLLABORATION_SNAPSHOT_CAPABILITY,
  buildCollaborationSnapshot,
  clearCollaborationContext,
  clearCollaborationMessageRegistry,
  clearCollaborationPresenceRegistry,
  clearCollaborationReactionRegistry,
  clearCollaborationSnapshot,
  clearCollaborationStatusRegistry,
  clearCollaborationThreadRegistry,
  clearOrganizationRegistry,
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
  getCollaborationSnapshot,
  collaborationSnapshotFingerprint,
  type CollaborationSnapshot,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertSnapshotShape(s: CollaborationSnapshot) {
  const layers: Array<[keyof CollaborationSnapshot, number]> = [
    ["context", s.context.length],
    ["threads", s.threads.length],
    ["messages", s.messages.length],
    ["reactions", s.reactions.length],
    ["presences", s.presences.length],
    ["statuses", s.statuses.length],
  ];
  for (const [name, len] of layers) {
    assert(len > 0, `${String(name)} non-empty`);
  }
}

function clearAll() {
  clearCollaborationSnapshot();
  clearCollaborationStatusRegistry();
  clearCollaborationPresenceRegistry();
  clearCollaborationReactionRegistry();
  clearCollaborationMessageRegistry();
  clearCollaborationThreadRegistry();
  clearCollaborationContext();
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
  clearOrganizationRegistry();
}

function main() {
  console.log("=== EP-3 / WP-7 Collaboration Snapshot ===\n");

  clearAll();
  const first = buildCollaborationSnapshot();
  assertSnapshotShape(first);
  console.log("PASS Build");

  clearCollaborationSnapshot();
  const second = buildCollaborationSnapshot();
  assert(
    collaborationSnapshotFingerprint(first) ===
      collaborationSnapshotFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  console.log("PASS Deterministic");

  clearCollaborationSnapshot();
  const viaGet = getCollaborationSnapshot();
  assert(
    collaborationSnapshotFingerprint(viaGet) ===
      collaborationSnapshotFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationSnapshot();
  assert(
    collaborationSnapshotFingerprint(again) ===
      collaborationSnapshotFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP7_ID === "WP-7", "WP-7 id");
  assert(
    COLLABORATION_SNAPSHOT_CAPABILITY === "CollaborationSnapshot",
    "capability",
  );
  assert(
    EP_COLLABORATION_SNAPSHOT_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_SNAPSHOT_VERSION ===
      "ep-3-wp-7-collaboration-snapshot-1",
    "version",
  );
  console.log("PASS EP-3 WP-7");

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
      "scripts/verify-ep3-wp7.ts",
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

  console.log("\n=== ALL EP-3 / WP-7 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP7_ID} · baseline ${EP_COLLABORATION_SNAPSHOT_BASELINE} · layers 6`,
  );
}

main();
