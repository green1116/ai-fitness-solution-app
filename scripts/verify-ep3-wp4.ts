/**
 * EP-3 / WP-4 — Collaboration Reaction Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP4_ID,
  EP_COLLABORATION_REACTION_REGISTRY_BASELINE,
  EP_COLLABORATION_REACTION_REGISTRY_VERSION,
  COLLABORATION_REACTION_REGISTRY_CAPABILITY,
  COLLABORATION_REACTION_TYPES,
  buildCollaborationContext,
  buildCollaborationMessageRegistry,
  buildCollaborationReactionRegistry,
  buildCollaborationThreadRegistry,
  buildWorkspaceSnapshot,
  clearCollaborationContext,
  clearCollaborationMessageRegistry,
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
  getCollaborationReactionRegistry,
  collaborationReactionRegistryFingerprint,
  type CollaborationReactionRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: CollaborationReactionRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(row.threadId.length > 0, `${label}.threadId`);
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(row.participantId.length > 0, `${label}.participantId`);
  assert(row.messageId.length > 0, `${label}.messageId`);
  assert(
    typeof row.reactionId === "string" && row.reactionId.length > 0,
    `${label}.reactionId`,
  );
  assert(
    (COLLABORATION_REACTION_TYPES as readonly string[]).includes(
      row.reactionType,
    ),
    `${label}.reactionType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function clearAll() {
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
  console.log("=== EP-3 / WP-4 Collaboration Reaction Registry ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationContext();
  buildCollaborationThreadRegistry();
  buildCollaborationMessageRegistry();

  const first = buildCollaborationReactionRegistry();
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
          `${r.workspaceId}|${r.participantId}|${r.threadId}|${r.messageId}|${r.reactionId}`,
      ),
    ).size === first.length,
    "unique chain+reactionId",
  );
  console.log("PASS Build");

  const second = buildCollaborationReactionRegistry();
  assert(
    collaborationReactionRegistryFingerprint(first) ===
      collaborationReactionRegistryFingerprint(second),
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

  clearCollaborationReactionRegistry();
  const viaGet = getCollaborationReactionRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    collaborationReactionRegistryFingerprint(viaGet) ===
      collaborationReactionRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationReactionRegistry();
  assert(
    collaborationReactionRegistryFingerprint(again) ===
      collaborationReactionRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP4_ID === "WP-4", "WP-4 id");
  assert(
    COLLABORATION_REACTION_REGISTRY_CAPABILITY ===
      "CollaborationReactionRegistry",
    "capability",
  );
  assert(
    EP_COLLABORATION_REACTION_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_REACTION_REGISTRY_VERSION ===
      "ep-3-wp-4-collaboration-reaction-registry-1",
    "version",
  );
  console.log("PASS EP-3 WP-4");

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
      "scripts/verify-ep3-wp4.ts",
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

  console.log("\n=== ALL EP-3 / WP-4 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP4_ID} · baseline ${EP_COLLABORATION_REACTION_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
