/**
 * EP-4 / WP-8 — Workflow Entry Panel verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP8_ID,
  EP_WORKFLOW_ENTRY_PANEL_BASELINE,
  EP_WORKFLOW_ENTRY_PANEL_VERSION,
  WORKFLOW_ENTRY_PANEL_CAPABILITY,
  WORKFLOW_SCENARIOS,
  buildCollaborationSnapshot,
  buildWorkflowApi,
  buildWorkflowContext,
  buildWorkflowDefinition,
  buildWorkflowEntryPanel,
  buildWorkflowExecutor,
  buildWorkflowIntegration,
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
  clearWorkflowEntryPanel,
  clearWorkflowExecutor,
  clearWorkflowIntegration,
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
  getWorkflowEntryPanel,
  workflowEntryPanelFingerprint,
  type WorkflowEntryPanel,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkflowEntryPanel, label: string) {
  assert(row.workflowId.length > 0, `${label}.workflowId`);
  assert(
    (WORKFLOW_SCENARIOS as readonly string[]).includes(row.scenario),
    `${label}.scenario`,
  );
  assert(row.route.startsWith("/"), `${label}.route`);
  assert(row.endpoint.startsWith("/api/"), `${label}.endpoint`);
  assert(row.handler.length > 0, `${label}.handler`);
  assert(row.uiComponent.length > 0, `${label}.uiComponent`);
  assert(typeof row.status === "string" && row.status.length > 0, `${label}.status`);
}

function clearAll() {
  clearWorkflowEntryPanel();
  clearWorkflowIntegration();
  clearWorkflowExecutor();
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
  console.log("=== EP-4 / WP-8 Workflow Entry Panel ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationSnapshot();
  buildWorkflowContext();
  buildWorkflowDefinition();
  buildWorkflowView();
  buildWorkflowApi();
  buildWorkflowUiContract();
  buildWorkflowExecutor();
  buildWorkflowIntegration();

  const first = buildWorkflowEntryPanel();
  assert(first.length >= 1, "panels has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => `${r.workflowId}|${r.scenario}`)).size ===
      first.length,
    "unique workflowId+scenario",
  );
  console.log("PASS Build");

  clearWorkflowEntryPanel();
  const second = buildWorkflowEntryPanel();
  assert(
    workflowEntryPanelFingerprint(first) ===
      workflowEntryPanelFingerprint(second),
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
        prev.scenario.localeCompare(curr.scenario) <= 0,
        `scenario order at ${i}`,
      );
    }
  }
  console.log("PASS Ordering");

  clearWorkflowEntryPanel();
  const viaGet = getWorkflowEntryPanel();
  assert(viaGet.length === first.length, "get length");
  assert(
    workflowEntryPanelFingerprint(viaGet) ===
      workflowEntryPanelFingerprint(first),
    "get fingerprint",
  );
  const again = getWorkflowEntryPanel();
  assert(
    workflowEntryPanelFingerprint(again) ===
      workflowEntryPanelFingerprint(viaGet),
    "get cache stable",
  );
  console.log("PASS Get");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP8_ID === "WP-8", "WP-8 id");
  assert(
    WORKFLOW_ENTRY_PANEL_CAPABILITY === "WorkflowEntryPanel",
    "capability",
  );
  assert(
    EP_WORKFLOW_ENTRY_PANEL_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKFLOW_ENTRY_PANEL_VERSION === "ep-4-wp-8-workflow-entry-panel-1",
    "version",
  );
  console.log("PASS EP-4 WP-8");

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
      "scripts/verify-ep4-wp8.ts",
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

  console.log("\n=== ALL EP-4 / WP-8 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP8_ID} · baseline ${EP_WORKFLOW_ENTRY_PANEL_BASELINE} · panels ${first.length}`,
  );
}

main();
