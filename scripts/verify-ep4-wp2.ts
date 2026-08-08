/**
 * EP-4 / WP-2 — Application Workflow Definition verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP2_ID,
  EP_WORKFLOW_DEFINITION_BASELINE,
  EP_WORKFLOW_DEFINITION_VERSION,
  WORKFLOW_DEFINITION_CAPABILITY,
  WORKFLOW_SCENARIOS,
  WORKFLOW_TRIGGERS,
  WORKFLOW_ACTIONS,
  buildCollaborationSnapshot,
  buildWorkflowContext,
  buildWorkflowDefinition,
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
  getWorkflowDefinition,
  workflowDefinitionFingerprint,
  type WorkflowDefinition,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkflowDefinition, label: string) {
  assert(row.workflowId.length > 0, `${label}.workflowId`);
  assert(row.workflowKey.length > 0, `${label}.workflowKey`);
  assert(
    (WORKFLOW_SCENARIOS as readonly string[]).includes(row.scenario),
    `${label}.scenario`,
  );
  assert(
    (WORKFLOW_TRIGGERS as readonly string[]).includes(row.trigger),
    `${label}.trigger`,
  );
  assert(
    (WORKFLOW_ACTIONS as readonly string[]).includes(row.action),
    `${label}.action`,
  );
  assert(row.route.length > 0, `${label}.route`);
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
}

function clearAll() {
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
  console.log("=== EP-4 / WP-2 Application Workflow Definition ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationSnapshot();
  buildWorkflowContext();

  const first = buildWorkflowDefinition();
  assert(first.length >= 1, "definitions has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => `${r.workflowId}|${r.workflowKey}`)).size ===
      first.length,
    "unique workflowId+workflowKey",
  );
  console.log("PASS Build");

  clearWorkflowDefinition();
  const second = buildWorkflowDefinition();
  assert(
    workflowDefinitionFingerprint(first) ===
      workflowDefinitionFingerprint(second),
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
        prev.workflowKey.localeCompare(curr.workflowKey) <= 0,
        `workflowKey order at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  clearWorkflowDefinition();
  const viaGet = getWorkflowDefinition();
  assert(viaGet.length === first.length, "get length");
  assert(
    workflowDefinitionFingerprint(viaGet) ===
      workflowDefinitionFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkflowDefinition();
  assert(
    workflowDefinitionFingerprint(again) ===
      workflowDefinitionFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP2_ID === "WP-2", "WP-2 id");
  assert(
    WORKFLOW_DEFINITION_CAPABILITY === "WorkflowDefinition",
    "capability",
  );
  assert(
    EP_WORKFLOW_DEFINITION_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKFLOW_DEFINITION_VERSION === "ep-4-wp-2-workflow-definition-1",
    "version",
  );
  console.log("PASS EP-4 WP-2");

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
      "scripts/verify-ep4-wp2.ts",
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

  console.log("\n=== ALL EP-4 / WP-2 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP2_ID} · baseline ${EP_WORKFLOW_DEFINITION_BASELINE} · definitions ${first.length}`,
  );
}

main();
