/**
 * EP-3 / WP-1 — Collaboration Context verification
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  EP_3_ID,
  EP_3_WP1_ID,
  EP_COLLABORATION_CONTEXT_BASELINE,
  EP_COLLABORATION_CONTEXT_VERSION,
  COLLABORATION_CONTEXT_CAPABILITY,
  buildCollaborationContext,
  buildWorkspaceSnapshot,
  clearCollaborationContext,
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
  getCollaborationContext,
  collaborationContextFingerprint,
  type CollaborationContext,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: CollaborationContext, label: string) {
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(row.organizationId.length > 0, `${label}.organizationId`);
  assert(Array.isArray(row.participants), `${label}.participants`);
  assert(Array.isArray(row.roles), `${label}.roles`);
  assert(Array.isArray(row.activities), `${label}.activities`);
  assert(Array.isArray(row.tasks), `${label}.tasks`);
  assert(
    row.status === "ACTIVE" ||
      row.status === "INACTIVE" ||
      row.status === "SUSPENDED",
    `${label}.status`,
  );
  assert(row.participants.length > 0, `${label}.participants non-empty`);
}

function clearAll() {
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
  console.log("=== EP-3 / WP-1 Collaboration Context ===\n");

  clearAll();
  buildWorkspaceSnapshot();

  const first = buildCollaborationContext();
  assert(first.length >= 1, "context has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => `${r.workspaceId}|${r.organizationId}`)).size ===
      first.length,
    "unique workspaceId+organizationId",
  );
  console.log("PASS Build");

  clearCollaborationContext();
  const second = buildCollaborationContext();
  assert(
    collaborationContextFingerprint(first) ===
      collaborationContextFingerprint(second),
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
        prev.organizationId.localeCompare(curr.organizationId) <= 0,
        `organizationId order at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  clearCollaborationContext();
  const viaGet = getCollaborationContext();
  assert(viaGet.length === first.length, "get length");
  assert(
    collaborationContextFingerprint(viaGet) ===
      collaborationContextFingerprint(first),
    "get fingerprint",
  );
  const again = getCollaborationContext();
  assert(
    collaborationContextFingerprint(again) ===
      collaborationContextFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_3_ID === "EP-3", "EP-3 id");
  assert(EP_3_WP1_ID === "WP-1", "WP-1 id");
  assert(
    COLLABORATION_CONTEXT_CAPABILITY === "CollaborationContext",
    "capability",
  );
  assert(
    EP_COLLABORATION_CONTEXT_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_COLLABORATION_CONTEXT_VERSION ===
      "ep-3-wp-1-collaboration-context-1",
    "version",
  );

  const src = readFileSync(
    path.join(process.cwd(), "lib/enterprise/collaboration-context.ts"),
    "utf8",
  );
  assert(
    !src.includes("prisma.project") &&
      !src.includes("prisma.quote") &&
      !src.includes("prisma.tender"),
    "no core model changes",
  );
  console.log("PASS EP-3 WP-1");

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
      "scripts/verify-ep3-wp1.ts",
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

  console.log("\n=== ALL EP-3 / WP-1 CHECKS PASSED ===");
  console.log(
    `${EP_3_ID}/${EP_3_WP1_ID} · baseline ${EP_COLLABORATION_CONTEXT_BASELINE} · contexts ${first.length}`,
  );
}

main();
