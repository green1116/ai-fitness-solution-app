/**
 * EP-3 / WP-2 — Collaboration Thread Registry verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP2_ID,
  EP_COLLABORATION_THREAD_REGISTRY_BASELINE,
  EP_COLLABORATION_THREAD_REGISTRY_VERSION,
  COLLABORATION_THREAD_REGISTRY_CAPABILITY,
  COLLABORATION_THREAD_TYPES,
  buildCollaborationContext,
  buildCollaborationThreadRegistry,
  buildWorkspaceSnapshot,
  clearCollaborationContext,
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
  getCollaborationThreadRegistry,
  collaborationThreadRegistryFingerprint,
  type CollaborationThreadRegistry,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: CollaborationThreadRegistry, label: string) {
  assert(typeof row.id === "string" && row.id.length > 0, `${label}.id`);
  assert(
    typeof row.threadId === "string" && row.threadId.length > 0,
    `${label}.threadId`,
  );
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(
    typeof row.participantId === "string" && row.participantId.length > 0,
    `${label}.participantId`,
  );
  assert(
    (COLLABORATION_THREAD_TYPES as readonly string[]).includes(row.threadType),
    `${label}.threadType`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(
    typeof row.createdAt === "string" && row.createdAt.includes("T"),
    `${label}.createdAt`,
  );
}

function clearAll() {
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
  console.log("=== EP-3 / WP-2 Collaboration Thread Registry ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationContext();

  const first = buildCollaborationThreadRegistry();
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
      first.map((r) => `${r.workspaceId}|${r.participantId}|${r.threadId}`),
    ).size === first.length,
    "unique workspaceId+participantId+threadId",
  );
  console.log("PASS Build");

  const second = buildCollaborationThreadRegistry();
  assert(
    collaborationThreadRegistryFingerprint(first) ===
      collaborationThreadRegistryFingerprint(second),
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
      const byPart = prev.participantId.localeCompare(curr.participantId);
      assert(byPart <= 0, `participantId order at ${i}`);
      if (byPart === 0) {
        assert(
          prev.threadId.localeCompare(curr.threadId) <= 0,
          `threadId order at ${i}`,
        );
      }
    }
  }
  console.log("PASS Ordering");

  clearCollaborationThreadRegistry();
  const viaGet = getCollaborationThreadRegistry();
  assert(viaGet.length === first.length, "get length");
  assert(
    collaborationThreadRegistryFingerprint(viaGet) ===
      collaborationThreadRegistryFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationThreadRegistry();
  assert(
    collaborationThreadRegistryFingerprint(again) ===
      collaborationThreadRegistryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP2_ID === "WP-2", "WP-2 id");
  assert(
    COLLABORATION_THREAD_REGISTRY_CAPABILITY === "CollaborationThreadRegistry",
    "capability",
  );
  assert(
    EP_COLLABORATION_THREAD_REGISTRY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_THREAD_REGISTRY_VERSION ===
      "ep-3-wp-2-collaboration-thread-registry-1",
    "version",
  );
  console.log("PASS EP-3 WP-2");

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
      "scripts/verify-ep3-wp2.ts",
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

  console.log("\n=== ALL EP-3 / WP-2 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP2_ID} · baseline ${EP_COLLABORATION_THREAD_REGISTRY_BASELINE} · entries ${first.length}`,
  );
}

main();
