/**
 * EP-3 / WP-5 — Collaboration Presence Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP5_ID,
  EP_COLLABORATION_PRESENCE_REGISTRY_BASELINE,
  EP_COLLABORATION_PRESENCE_REGISTRY_VERSION,
  COLLABORATION_PRESENCE_REGISTRY_CAPABILITY,
  COLLABORATION_PRESENCE_TYPES,
  buildCollaborationContext,
  buildCollaborationMessageRegistry,
  buildCollaborationPresenceRegistry,
  buildCollaborationReactionRegistry,
  buildCollaborationThreadRegistry,
  buildWorkspaceSnapshot,
  clearCollaborationContext,
  clearCollaborationMessageRegistry,
  clearCollaborationPresenceRegistry,
  clearCollaborationReactionRegistry,
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
  getCollaborationPresenceRegistry,
  collaborationPresenceRegistryFingerprint,
  type CollaborationPresenceRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: CollaborationPresenceRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(row.threadId.length > 0, `${label}.threadId`);
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(row.participantId.length > 0, `${label}.participantId`);
  assert(row.messageId.length > 0, `${label}.messageId`);
  assert(row.reactionId.length > 0, `${label}.reactionId`);
  assert(
    typeof row.presenceId === "string" && row.presenceId.length > 0,
    `${label}.presenceId`,
  );
  assert(
    (COLLABORATION_PRESENCE_TYPES as readonly string[]).includes(
      row.presenceType,
    ),
    `${label}.presenceType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function clearAll() {
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
  console.log("=== EP-3 / WP-5 Collaboration Presence Registry ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationContext();
  buildCollaborationThreadRegistry();
  buildCollaborationMessageRegistry();
  buildCollaborationReactionRegistry();

  const first = buildCollaborationPresenceRegistry();
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
          `${r.workspaceId}|${r.participantId}|${r.threadId}|${r.messageId}|${r.reactionId}|${r.presenceId}`,
      ),
    ).size === first.length,
    "unique chain+presenceId",
  );
  console.log("PASS Build");

  const second = buildCollaborationPresenceRegistry();
  assert(
    collaborationPresenceRegistryFingerprint(first) ===
      collaborationPresenceRegistryFingerprint(second),
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

  clearCollaborationPresenceRegistry();
  const viaGet = getCollaborationPresenceRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    collaborationPresenceRegistryFingerprint(viaGet) ===
      collaborationPresenceRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationPresenceRegistry();
  assert(
    collaborationPresenceRegistryFingerprint(again) ===
      collaborationPresenceRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP5_ID === "WP-5", "WP-5 id");
  assert(
    COLLABORATION_PRESENCE_REGISTRY_CAPABILITY ===
      "CollaborationPresenceRegistry",
    "capability",
  );
  assert(
    EP_COLLABORATION_PRESENCE_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_PRESENCE_REGISTRY_VERSION ===
      "ep-3-wp-5-collaboration-presence-registry-1",
    "version",
  );
  console.log("PASS EP-3 WP-5");

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
      "scripts/verify-ep3-wp5.ts",
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

  console.log("\n=== ALL EP-3 / WP-5 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP5_ID} · baseline ${EP_COLLABORATION_PRESENCE_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
