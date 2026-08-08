/**
 * EP-4 / WP-4 — Application Workflow API verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP4_ID,
  EP_WORKFLOW_API_BASELINE,
  EP_WORKFLOW_API_VERSION,
  WORKFLOW_API_CAPABILITY,
  WORKFLOW_API_METHODS,
  WORKFLOW_SCENARIOS,
  WORKFLOW_ACTIONS,
  buildCollaborationSnapshot,
  buildWorkflowApi,
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
  clearWorkflowApi,
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
  getWorkflowApi,
  workflowApiFingerprint,
  type WorkflowApi,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkflowApi, label: string) {
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
  assert(row.nextRoute.length > 0, `${label}.nextRoute`);
  assert(
    typeof row.endpoint === "string" && row.endpoint.startsWith("/api/"),
    `${label}.endpoint`,
  );
  assert(
    (WORKFLOW_API_METHODS as readonly string[]).includes(row.method),
    `${label}.method`,
  );
}

function clearAll() {
  clearWorkflowApi();
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
  console.log("=== EP-4 / WP-4 Application Workflow API ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationSnapshot();
  buildWorkflowContext();
  buildWorkflowDefinition();
  buildWorkflowView();

  const first = buildWorkflowApi();
  assert(first.length >= 1, "apis has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => `${r.workflowId}|${r.endpoint}`)).size ===
      first.length,
    "unique workflowId+endpoint",
  );
  console.log("PASS Build");

  clearWorkflowApi();
  const second = buildWorkflowApi();
  assert(
    workflowApiFingerprint(first) === workflowApiFingerprint(second),
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
    const byId = prev.workflowId.localeCompare(curr.workflowId);
    assert(byId <= 0, `workflowId order at ${i}`);
    if (byId === 0) {
      assert(
        prev.endpoint.localeCompare(curr.endpoint) <= 0,
        `endpoint order at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  clearWorkflowApi();
  const viaGet = getWorkflowApi();
  assert(viaGet.length === first.length, "get length");
  assert(
    workflowApiFingerprint(viaGet) === workflowApiFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkflowApi();
  assert(
    workflowApiFingerprint(again) === workflowApiFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP4_ID === "WP-4", "WP-4 id");
  assert(WORKFLOW_API_CAPABILITY === "WorkflowApi", "capability");
  assert(EP_WORKFLOW_API_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(EP_WORKFLOW_API_VERSION === "ep-4-wp-4-workflow-api-1", "version");
  console.log("PASS EP-4 WP-4");

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
      "scripts/verify-ep4-wp4.ts",
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

  console.log("\n=== ALL EP-4 / WP-4 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP4_ID} · baseline ${EP_WORKFLOW_API_BASELINE} · apis ${first.length}`,
  );
}

main();
