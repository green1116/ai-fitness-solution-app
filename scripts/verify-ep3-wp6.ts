/**
 * EP-3 / WP-6 — Collaboration Status Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP6_ID,
  EP_COLLABORATION_STATUS_REGISTRY_BASELINE,
  EP_COLLABORATION_STATUS_REGISTRY_VERSION,
  COLLABORATION_STATUS_REGISTRY_CAPABILITY,
  COLLABORATION_STATUS_TYPES,
  buildCollaborationContext,
  buildCollaborationMessageRegistry,
  buildCollaborationPresenceRegistry,
  buildCollaborationReactionRegistry,
  buildCollaborationStatusRegistry,
  buildCollaborationThreadRegistry,
  buildWorkspaceSnapshot,
  clearCollaborationContext,
  clearCollaborationMessageRegistry,
  clearCollaborationPresenceRegistry,
  clearCollaborationReactionRegistry,
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
  getCollaborationStatusRegistry,
  collaborationStatusRegistryFingerprint,
  type CollaborationStatusRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: CollaborationStatusRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(row.threadId.length > 0, `${label}.threadId`);
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(row.participantId.length > 0, `${label}.participantId`);
  assert(row.messageId.length > 0, `${label}.messageId`);
  assert(row.reactionId.length > 0, `${label}.reactionId`);
  assert(row.presenceId.length > 0, `${label}.presenceId`);
  assert(
    typeof row.statusId === "string" && row.statusId.length > 0,
    `${label}.statusId`,
  );
  assert(
    (COLLABORATION_STATUS_TYPES as readonly string[]).includes(row.statusType),
    `${label}.statusType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function clearAll() {
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
  console.log("=== EP-3 / WP-6 Collaboration Status Registry ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationContext();
  buildCollaborationThreadRegistry();
  buildCollaborationMessageRegistry();
  buildCollaborationReactionRegistry();
  buildCollaborationPresenceRegistry();

  const first = buildCollaborationStatusRegistry();
  assert(first.length >= 1, "registry has entries");
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
          `${r.workspaceId}|${r.participantId}|${r.threadId}|${r.messageId}|${r.reactionId}|${r.presenceId}|${r.statusId}`,
      ),
    ).size === first.length,
    "unique chain+statusId",
  );
  console.log("PASS Build");

  const second = buildCollaborationStatusRegistry();
  assert(
    collaborationStatusRegistryFingerprint(first) ===
      collaborationStatusRegistryFingerprint(second),
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
      "participantId",
      "threadId",
      "messageId",
      "reactionId",
      "presenceId",
      "statusId",
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

  clearCollaborationStatusRegistry();
  const viaGet = getCollaborationStatusRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    collaborationStatusRegistryFingerprint(viaGet) ===
      collaborationStatusRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationStatusRegistry();
  assert(
    collaborationStatusRegistryFingerprint(again) ===
      collaborationStatusRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP6_ID === "WP-6", "WP-6 id");
  assert(
    COLLABORATION_STATUS_REGISTRY_CAPABILITY === "CollaborationStatusRegistry",
    "capability",
  );
  assert(
    EP_COLLABORATION_STATUS_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_STATUS_REGISTRY_VERSION ===
      "ep-3-wp-6-collaboration-status-registry-1",
    "version",
  );
  console.log("PASS EP-3 WP-6");

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
      "scripts/verify-ep3-wp6.ts",
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

  console.log("\n=== ALL EP-3 / WP-6 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP6_ID} · baseline ${EP_COLLABORATION_STATUS_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
