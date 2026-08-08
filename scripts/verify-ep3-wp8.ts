/**
 * EP-3 / WP-8 — Collaboration Query verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP8_ID,
  EP_COLLABORATION_QUERY_BASELINE,
  EP_COLLABORATION_QUERY_VERSION,
  COLLABORATION_QUERY_CAPABILITY,
  buildCollaborationQuery,
  buildCollaborationSnapshot,
  clearCollaborationContext,
  clearCollaborationMessageRegistry,
  clearCollaborationPresenceRegistry,
  clearCollaborationQuery,
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
  getCollaborationQuery,
  collaborationQueryFingerprint,
  type CollaborationQuery,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: CollaborationQuery, label: string) {
  assert(
    typeof row.workspaceId === "string" && row.workspaceId.length > 0,
    `${label}.workspaceId`,
  );
  assert(
    typeof row.summary === "string" && row.summary.length > 0,
    `${label}.summary`,
  );
  assert(typeof row.counts === "object" && row.counts !== null, `${label}.counts`);
  assert(row.counts.threads >= 0, `${label}.counts.threads`);
  assert(row.counts.messages >= 0, `${label}.counts.messages`);
  assert(Array.isArray(row.topThreads), `${label}.topThreads`);
  assert(Array.isArray(row.topMessages), `${label}.topMessages`);
  assert(Array.isArray(row.topReactions), `${label}.topReactions`);
  assert(Array.isArray(row.topPresences), `${label}.topPresences`);
  assert(Array.isArray(row.topStatuses), `${label}.topStatuses`);
  for (const top of row.topThreads) {
    assert(top.key.length > 0, `${label}.topThreads.key`);
    assert(top.count > 0, `${label}.topThreads.count`);
  }
}

function clearAll() {
  clearCollaborationQuery();
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
  console.log("=== EP-3 / WP-8 Collaboration Query ===\n");

  clearAll();
  buildCollaborationSnapshot();

  const first = buildCollaborationQuery();
  assert(first.length >= 1, "query has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => r.workspaceId)).size === first.length,
    "unique workspaceIds",
  );
  console.log("PASS Build");

  clearCollaborationQuery();
  const second = buildCollaborationQuery();
  assert(
    collaborationQueryFingerprint(first) ===
      collaborationQueryFingerprint(second),
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

  clearCollaborationQuery();
  const viaGet = getCollaborationQuery();
  assert(viaGet.length === first.length, "get length");
  assert(
    collaborationQueryFingerprint(viaGet) ===
      collaborationQueryFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationQuery();
  assert(
    collaborationQueryFingerprint(again) ===
      collaborationQueryFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP8_ID === "WP-8", "WP-8 id");
  assert(
    COLLABORATION_QUERY_CAPABILITY === "CollaborationQuery",
    "capability",
  );
  assert(
    EP_COLLABORATION_QUERY_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_QUERY_VERSION === "ep-3-wp-8-collaboration-query-1",
    "version",
  );
  console.log("PASS EP-3 WP-8");

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
      "scripts/verify-ep3-wp8.ts",
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

  console.log("\n=== ALL EP-3 / WP-8 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP8_ID} · baseline ${EP_COLLABORATION_QUERY_BASELINE} · workspaces ${first.length}`,
  );
}

main();
