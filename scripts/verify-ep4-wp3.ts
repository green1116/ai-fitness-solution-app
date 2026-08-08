/**
 * EP-4 / WP-3 — Application Workflow View verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP3_ID,
  EP_WORKFLOW_VIEW_BASELINE,
  EP_WORKFLOW_VIEW_VERSION,
  WORKFLOW_VIEW_CAPABILITY,
  WORKFLOW_SCENARIOS,
  WORKFLOW_ACTIONS,
  buildCollaborationSnapshot,
  buildWorkflowContext,
  buildWorkflowDefinition,
  buildWorkflowView,
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
  clearWorkflowDefinition,
  clearWorkflowView,
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
  getWorkflowView,
  workflowViewFingerprint,
  type WorkflowView,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkflowView, label: string) {
  assert(row.workflowId.length > 0, `${label}.workflowId`);
  assert(
    (WORKFLOW_SCENARIOS as readonly string[]).includes(row.scenario),
    `${label}.scenario`,
  );
  assert(
    (WORKFLOW_ACTIONS as readonly string[]).includes(row.action),
    `${label}.action`,
  );
  assert(row.route.length > 0, `${label}.route`);
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(Array.isArray(row.availableActions), `${label}.availableActions`);
  assert(row.availableActions.length > 0, `${label}.availableActions non-empty`);
  for (const action of row.availableActions) {
    assert(
      (WORKFLOW_ACTIONS as readonly string[]).includes(action),
      `${label}.availableActions item`,
    );
  }
  assert(row.nextRoute.length > 0, `${label}.nextRoute`);
}

function clearAll() {
  clearWorkflowView();
  clearWorkflowDefinition();
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
  console.log("=== EP-4 / WP-3 Application Workflow View ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationSnapshot();
  buildWorkflowContext();
  buildWorkflowDefinition();

  const first = buildWorkflowView();
  assert(first.length >= 1, "views has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => r.workflowId)).size === first.length,
    "unique workflowIds",
  );
  console.log("PASS Build");

  clearWorkflowView();
  const second = buildWorkflowView();
  assert(
    workflowViewFingerprint(first) === workflowViewFingerprint(second),
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

  clearWorkflowView();
  const viaGet = getWorkflowView();
  assert(viaGet.length === first.length, "get length");
  assert(
    workflowViewFingerprint(viaGet) === workflowViewFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkflowView();
  assert(
    workflowViewFingerprint(again) === workflowViewFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP3_ID === "WP-3", "WP-3 id");
  assert(WORKFLOW_VIEW_CAPABILITY === "WorkflowView", "capability");
  assert(EP_WORKFLOW_VIEW_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(EP_WORKFLOW_VIEW_VERSION === "ep-4-wp-3-workflow-view-1", "version");
  console.log("PASS EP-4 WP-3");

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
      "scripts/verify-ep4-wp3.ts",
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

  console.log("\n=== ALL EP-4 / WP-3 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP3_ID} · baseline ${EP_WORKFLOW_VIEW_BASELINE} · views ${first.length}`,
  );
}

main();
