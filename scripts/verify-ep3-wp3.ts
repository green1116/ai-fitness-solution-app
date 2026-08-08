/**
 * EP-3 / WP-3 — Collaboration Message Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP3_ID,
  EP_COLLABORATION_MESSAGE_REGISTRY_BASELINE,
  EP_COLLABORATION_MESSAGE_REGISTRY_VERSION,
  COLLABORATION_MESSAGE_REGISTRY_CAPABILITY,
  COLLABORATION_MESSAGE_TYPES,
  buildCollaborationContext,
  buildCollaborationMessageRegistry,
  buildCollaborationThreadRegistry,
  buildWorkspaceSnapshot,
  clearCollaborationContext,
  clearCollaborationMessageRegistry,
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
  getCollaborationMessageRegistry,
  collaborationMessageRegistryFingerprint,
  type CollaborationMessageRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: CollaborationMessageRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(row.threadId.length > 0, `${label}.threadId`);
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(row.participantId.length > 0, `${label}.participantId`);
  assert(
    typeof row.messageId === "string" && row.messageId.length > 0,
    `${label}.messageId`,
  );
  assert(
    (COLLABORATION_MESSAGE_TYPES as readonly string[]).includes(
      row.messageType,
    ),
    `${label}.messageType`,
  );
  assert(
    typeof row.content === "string" && row.content.length > 0,
    `${label}.content`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function clearAll() {
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
  console.log("=== EP-3 / WP-3 Collaboration Message Registry ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationContext();
  buildCollaborationThreadRegistry();

  const first = buildCollaborationMessageRegistry();
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
          `${r.workspaceId}|${r.participantId}|${r.threadId}|${r.messageId}`,
      ),
    ).size === first.length,
    "unique chain+messageId",
  );
  console.log("PASS Build");

  const second = buildCollaborationMessageRegistry();
  assert(
    collaborationMessageRegistryFingerprint(first) ===
      collaborationMessageRegistryFingerprint(second),
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

  clearCollaborationMessageRegistry();
  const viaGet = getCollaborationMessageRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    collaborationMessageRegistryFingerprint(viaGet) ===
      collaborationMessageRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationMessageRegistry();
  assert(
    collaborationMessageRegistryFingerprint(again) ===
      collaborationMessageRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP3_ID === "WP-3", "WP-3 id");
  assert(
    COLLABORATION_MESSAGE_REGISTRY_CAPABILITY ===
      "CollaborationMessageRegistry",
    "capability",
  );
  assert(
    EP_COLLABORATION_MESSAGE_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_MESSAGE_REGISTRY_VERSION ===
      "ep-3-wp-3-collaboration-message-registry-1",
    "version",
  );
  console.log("PASS EP-3 WP-3");

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
      "scripts/verify-ep3-wp3.ts",
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

  console.log("\n=== ALL EP-3 / WP-3 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP3_ID} · baseline ${EP_COLLABORATION_MESSAGE_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
