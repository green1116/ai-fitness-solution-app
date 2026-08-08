/**
 * EP-4 / WP-5 — Application Workflow UI Contract verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP5_ID,
  EP_WORKFLOW_UI_CONTRACT_BASELINE,
  EP_WORKFLOW_UI_CONTRACT_VERSION,
  WORKFLOW_UI_CONTRACT_CAPABILITY,
  WORKFLOW_UI_COMPONENTS,
  WORKFLOW_API_METHODS,
  WORKFLOW_SCENARIOS,
  WORKFLOW_ACTIONS,
  buildCollaborationSnapshot,
  buildWorkflowApi,
  buildWorkflowContext,
  buildWorkflowDefinition,
  buildWorkflowUiContract,
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
  clearWorkflowUiContract,
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
  getWorkflowUiContract,
  workflowUiContractFingerprint,
  type WorkflowUiContract,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkflowUiContract, label: string) {
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
  assert(row.endpoint.startsWith("/api/"), `${label}.endpoint`);
  assert(
    (WORKFLOW_API_METHODS as readonly string[]).includes(row.method),
    `${label}.method`,
  );
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
  assert(Array.isArray(row.availableActions), `${label}.availableActions`);
  assert(row.availableActions.length > 0, `${label}.availableActions non-empty`);
  assert(row.nextRoute.length > 0, `${label}.nextRoute`);
  assert(
    (WORKFLOW_UI_COMPONENTS as readonly string[]).includes(row.uiComponent),
    `${label}.uiComponent`,
  );
}

function clearAll() {
  clearWorkflowUiContract();
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
  console.log("=== EP-4 / WP-5 Application Workflow UI Contract ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationSnapshot();
  buildWorkflowContext();
  buildWorkflowDefinition();
  buildWorkflowView();
  buildWorkflowApi();

  const first = buildWorkflowUiContract();
  assert(first.length >= 1, "contracts has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => `${r.workflowId}|${r.uiComponent}`)).size ===
      first.length,
    "unique workflowId+uiComponent",
  );
  console.log("PASS Build");

  clearWorkflowUiContract();
  const second = buildWorkflowUiContract();
  assert(
    workflowUiContractFingerprint(first) ===
      workflowUiContractFingerprint(second),
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
        prev.uiComponent.localeCompare(curr.uiComponent) <= 0,
        `uiComponent order at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  clearWorkflowUiContract();
  const viaGet = getWorkflowUiContract();
  assert(viaGet.length === first.length, "get length");
  assert(
    workflowUiContractFingerprint(viaGet) ===
      workflowUiContractFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkflowUiContract();
  assert(
    workflowUiContractFingerprint(again) ===
      workflowUiContractFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP5_ID === "WP-5", "WP-5 id");
  assert(
    WORKFLOW_UI_CONTRACT_CAPABILITY === "WorkflowUiContract",
    "capability",
  );
  assert(
    EP_WORKFLOW_UI_CONTRACT_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKFLOW_UI_CONTRACT_VERSION === "ep-4-wp-5-workflow-ui-contract-1",
    "version",
  );
  console.log("PASS EP-4 WP-5");

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
      "scripts/verify-ep4-wp5.ts",
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

  console.log("\n=== ALL EP-4 / WP-5 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP5_ID} · baseline ${EP_WORKFLOW_UI_CONTRACT_BASELINE} · contracts ${first.length}`,
  );
}

main();
