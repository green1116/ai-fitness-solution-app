/**
 * EP-4 / WP-1 — Workflow Context verification
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP1_ID,
  EP_WORKFLOW_CONTEXT_BASELINE,
  EP_WORKFLOW_CONTEXT_VERSION,
  WORKFLOW_CONTEXT_CAPABILITY,
  buildCollaborationSnapshot,
  buildWorkflowContext,
  buildWorkspaceSnapshot,
  clearCollaborationContext,
  clearCollaborationMessageRegistry,
  clearCollaborationPresenceRegistry,
  clearCollaborationQuery,
  clearCollaborationReactionRegistry,
  clearCollaborationSnapshot,
  clearCollaborationStatusRegistry,
  clearCollaborationThreadRegistry,
  clearOrganizationRegistry,
  clearWorkflowContext,
  clearWorkspaceAccessRegistry,
  clearWorkspaceActivityRegistry,
  clearWorkspaceAssignmentRegistry,
  clearWorkspaceEventRegistry,
  clearWorkspaceExecutionRegistry,
  clearWorkspaceMemberRegistry,
  clearWorkspacePermissionRegistry,
  clearWorkspaceQueueRegistry,
  clearWorkspaceQuery,
  clearWorkspaceRegistry,
  clearWorkspaceResultRegistry,
  clearWorkspaceRoleRegistry,
  clearWorkspaceSessionRegistry,
  clearWorkspaceSnapshot,
  clearWorkspaceTaskRegistry,
  getWorkflowContext,
  workflowContextFingerprint,
  type WorkflowContext,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkflowContext, label: string) {
  assert(row.workflowId.length > 0, `${label}.workflowId`);
  assert(row.organizationId.length > 0, `${label}.organizationId`);
  assert(row.workspaceId.length > 0, `${label}.workspaceId`);
  assert(Array.isArray(row.participants), `${label}.participants`);
  assert(Array.isArray(row.tasks), `${label}.tasks`);
  assert(Array.isArray(row.assignments), `${label}.assignments`);
  assert(Array.isArray(row.activities), `${label}.activities`);
  assert(
    row.status === "ACTIVE" ||
      row.status === "INACTIVE" ||
      row.status === "SUSPENDED",
    `${label}.status`,
  );
  assert(row.participants.length > 0, `${label}.participants non-empty`);
  assert(row.tasks.length > 0, `${label}.tasks non-empty`);
}

function clearAll() {
  clearWorkflowContext();
  clearCollaborationQuery();
  clearCollaborationSnapshot();
  clearCollaborationStatusRegistry();
  clearCollaborationPresenceRegistry();
  clearCollaborationReactionRegistry();
  clearCollaborationMessageRegistry();
  clearCollaborationThreadRegistry();
  clearCollaborationContext();
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
  clearOrganizationRegistry();
}

function main() {
  console.log("=== EP-4 / WP-1 Workflow Context ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationSnapshot();

  const first = buildWorkflowContext();
  assert(first.length >= 1, "context has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => r.workflowId)).size === first.length,
    "unique workflowIds",
  );
  console.log("PASS Build");

  clearWorkflowContext();
  const second = buildWorkflowContext();
  assert(
    workflowContextFingerprint(first) === workflowContextFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  console.log("PASS Deterministic");

  for (let i = 1; i < first.length; i++) {
    assert(
      first[i - 1]!.workflowId.localeCompare(first[i]!.workflowId) <= 0,
      `workflowId order at ${i}`,
    );
  }
  console.log("PASS Ordering");

  clearWorkflowContext();
  const viaGet = getWorkflowContext();
  assert(viaGet.length === first.length, "get length");
  assert(
    workflowContextFingerprint(viaGet) === workflowContextFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkflowContext();
  assert(
    workflowContextFingerprint(again) === workflowContextFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP1_ID === "WP-1", "WP-1 id");
  assert(WORKFLOW_CONTEXT_CAPABILITY === "WorkflowContext", "capability");
  assert(EP_WORKFLOW_CONTEXT_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(
    EP_WORKFLOW_CONTEXT_VERSION === "ep-4-wp-1-workflow-context-1",
    "version",
  );

  const src = readFileSync(
    path.join(process.cwd(), "lib/enterprise/workflow-context.ts"),
    "utf8",
  );
  assert(
    !src.includes("prisma.project") &&
      !src.includes("prisma.quote") &&
      !src.includes("prisma.tender"),
    "no core model changes",
  );
  console.log("PASS EP-4 WP-1");

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
      "scripts/verify-ep4-wp1.ts",
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

  console.log("\n=== ALL EP-4 / WP-1 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP1_ID} · baseline ${EP_WORKFLOW_CONTEXT_BASELINE} · contexts ${first.length}`,
  );
}

main();
