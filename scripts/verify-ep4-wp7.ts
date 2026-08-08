/**
 * EP-4 / WP-7 — Workflow Integration verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP7_ID,
  EP_WORKFLOW_INTEGRATION_BASELINE,
  EP_WORKFLOW_INTEGRATION_VERSION,
  WORKFLOW_INTEGRATION_CAPABILITY,
  WORKFLOW_SCENARIOS,
  WORKFLOW_ACTIONS,
  WORKFLOW_API_METHODS,
  WORKFLOW_HANDLERS,
  buildCollaborationSnapshot,
  buildWorkflowApi,
  buildWorkflowContext,
  buildWorkflowDefinition,
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
  getWorkflowIntegration,
  resolveWorkflowAppSurface,
  workflowIntegrationFingerprint,
  type WorkflowIntegration,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertShape(row: WorkflowIntegration, label: string) {
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
  assert(row.endpoint.length > 0, `${label}.endpoint`);
  assert(
    (WORKFLOW_API_METHODS as readonly string[]).includes(row.method),
    `${label}.method`,
  );
  assert(
    (WORKFLOW_HANDLERS as readonly string[]).includes(row.handler),
    `${label}.handler`,
  );
  assert(row.appRoute.startsWith("/"), `${label}.appRoute`);
  assert(row.appEndpoint.startsWith("/api/"), `${label}.appEndpoint`);
  assert(
    (WORKFLOW_API_METHODS as readonly string[]).includes(row.appMethod),
    `${label}.appMethod`,
  );
  assert(row.appHandler.length > 0, `${label}.appHandler`);
  assert(row.uiSurface.length > 0, `${label}.uiSurface`);
  assert(row.routeResolved === true, `${label}.routeResolved`);
  assert(row.endpointResolved === true, `${label}.endpointResolved`);
}

function clearAll() {
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
  console.log("=== EP-4 / WP-7 Workflow Integration ===\n");

  clearAll();
  buildWorkspaceSnapshot();
  buildCollaborationSnapshot();
  buildWorkflowContext();
  buildWorkflowDefinition();
  buildWorkflowView();
  buildWorkflowApi();
  buildWorkflowUiContract();
  buildWorkflowExecutor();

  const first = buildWorkflowIntegration();
  assert(first.length >= 1, "integrations has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => `${r.workflowId}|${r.appEndpoint}`)).size ===
      first.length,
    "unique workflowId+appEndpoint",
  );
  console.log("PASS Build");

  assert(
    first.every((r) => r.routeResolved === true),
    "all routes resolved",
  );
  console.log("PASS route resolved");

  assert(
    first.every((r) => r.endpointResolved === true),
    "all endpoints resolved",
  );
  for (const scenario of WORKFLOW_SCENARIOS) {
    const surface = resolveWorkflowAppSurface(scenario);
    assert(surface.appRoute.startsWith("/"), `${scenario} appRoute`);
    assert(surface.appEndpoint.startsWith("/api/"), `${scenario} appEndpoint`);
  }
  console.log("PASS endpoint resolved");

  clearWorkflowIntegration();
  const second = buildWorkflowIntegration();
  assert(
    workflowIntegrationFingerprint(first) ===
      workflowIntegrationFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  console.log("PASS Deterministic");

  clearWorkflowIntegration();
  const viaGet = getWorkflowIntegration();
  assert(viaGet.length === first.length, "get length");
  assert(
    workflowIntegrationFingerprint(viaGet) ===
      workflowIntegrationFingerprint(first),
    "get fingerprint",
  );
  console.log("PASS Get");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP7_ID === "WP-7", "WP-7 id");
  assert(
    WORKFLOW_INTEGRATION_CAPABILITY === "WorkflowIntegration",
    "capability",
  );
  assert(
    EP_WORKFLOW_INTEGRATION_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKFLOW_INTEGRATION_VERSION === "ep-4-wp-7-workflow-integration-1",
    "version",
  );
  console.log("PASS EP-4 WP-7");

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
      "scripts/verify-ep4-wp7.ts",
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

  console.log("\n=== ALL EP-4 / WP-7 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP7_ID} · baseline ${EP_WORKFLOW_INTEGRATION_BASELINE} · integrations ${first.length}`,
  );
}

main();
