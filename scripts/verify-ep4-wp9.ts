/**
 * EP-4 / WP-9 — Production UI Integration verification
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP9_ID,
  EP_WORKFLOW_PRODUCTION_UI_BASELINE,
  EP_WORKFLOW_PRODUCTION_UI_VERSION,
  WORKFLOW_PRODUCTION_HOSTS,
  WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO,
  WORKFLOW_PRODUCTION_UI_CAPABILITY,
  WORKFLOW_SCENARIOS,
  buildCollaborationSnapshot,
  buildWorkflowApi,
  buildWorkflowContext,
  buildWorkflowDefinition,
  buildWorkflowEntryPanel,
  buildWorkflowExecutor,
  buildWorkflowIntegration,
  buildWorkflowProductionUi,
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
  clearWorkflowProductionUi,
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
  getWorkflowProductionUi,
  getWorkflowProductionUiForHost,
  resolveWorkflowProductionSurface,
  workflowProductionUiFingerprint,
  type WorkflowProductionUiAction,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function assertShape(row: WorkflowProductionUiAction, label: string) {
  assert(row.workflowId.length > 0, `${label}.workflowId`);
  assert(
    (WORKFLOW_SCENARIOS as readonly string[]).includes(row.scenario),
    `${label}.scenario`,
  );
  assert(
    (WORKFLOW_PRODUCTION_HOSTS as readonly string[]).includes(row.hostRoute),
    `${label}.hostRoute`,
  );
  assert(row.route === row.hostRoute, `${label}.route===hostRoute`);
  assert(row.endpoint.startsWith("/api/"), `${label}.endpoint`);
  assert(row.handler.length > 0, `${label}.handler`);
  assert(row.uiComponent.length > 0, `${label}.uiComponent`);
  assert(row.actionVisible === true, `${label}.actionVisible`);
  assert(row.mocked === false, `${label}.mocked`);
  assert(row.pageFile.length > 0, `${label}.pageFile`);
  assert(row.apiRouteFile.length > 0, `${label}.apiRouteFile`);
  assert(row.handlerFile.length > 0, `${label}.handlerFile`);
  assert(row.uiFile.length > 0, `${label}.uiFile`);
}

function clearAll() {
  clearWorkflowProductionUi();
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
  console.log("=== EP-4 / WP-9 Production UI Integration ===\n");

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
  buildWorkflowEntryPanel();

  const first = buildWorkflowProductionUi();
  assert(first.length >= 1, "production actions has entries");
  for (let i = 0; i < first.length; i++) {
    assertShape(first[i]!, `entry[${i}]`);
  }
  assert(
    new Set(first.map((r) => `${r.workflowId}|${r.scenario}`)).size ===
      first.length,
    "unique workflowId+scenario",
  );
  console.log("PASS Build");

  assert(
    first.every((r) => r.actionVisible === true),
    "all actions visible",
  );
  for (const host of WORKFLOW_PRODUCTION_HOSTS) {
    const forHost = getWorkflowProductionUiForHost(host);
    assert(forHost.length >= 1, `host ${host} has visible actions`);
    assert(
      forHost.every((a) => a.hostRoute === host && a.actionVisible),
      `host ${host} actions bound`,
    );
  }
  console.log("PASS workflow actions visible");

  const intakePage = root("app/(pilot)/pilot/intake/page.tsx");
  const commandPage = root("app/dashboard/command-center/page.tsx");
  const actionsComponent = root(
    "components/enterprise/WorkflowEntryPanelActions.tsx",
  );
  assert(existsSync(intakePage), "intake page exists");
  assert(existsSync(commandPage), "command-center page exists");
  assert(existsSync(actionsComponent), "WorkflowEntryPanelActions exists");
  const intakeSrc = readFileSync(intakePage, "utf8");
  const commandSrc = readFileSync(commandPage, "utf8");
  assert(
    intakeSrc.includes("WorkflowEntryPanelActions"),
    "intake integrates WorkflowEntryPanelActions",
  );
  assert(
    intakeSrc.includes('host="/pilot/intake"'),
    "intake host binding",
  );
  assert(
    commandSrc.includes("WorkflowEntryPanelActions"),
    "command-center integrates WorkflowEntryPanelActions",
  );
  assert(
    commandSrc.includes('host="/dashboard/command-center"') ||
      commandSrc.includes('"/dashboard/command-center"'),
    "command-center host binding",
  );
  for (const host of WORKFLOW_PRODUCTION_HOSTS) {
    assert(host.startsWith("/"), `host route ${host}`);
  }
  console.log("PASS routes work");

  for (const scenario of WORKFLOW_SCENARIOS) {
    const proof = resolveWorkflowProductionSurface(scenario);
    assert(
      existsSync(root(proof.pageFile)),
      `${scenario} pageFile ${proof.pageFile}`,
    );
    assert(
      existsSync(root(proof.apiRouteFile)),
      `${scenario} apiRouteFile ${proof.apiRouteFile}`,
    );
    assert(
      existsSync(root(proof.handlerFile)),
      `${scenario} handlerFile ${proof.handlerFile}`,
    );
    assert(
      existsSync(root(proof.uiFile)),
      `${scenario} uiFile ${proof.uiFile}`,
    );
    const catalog = WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[scenario];
    assert(
      catalog.apiRouteFile === proof.apiRouteFile,
      `${scenario} catalog api match`,
    );
  }
  for (const row of first) {
    const proof = WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[row.scenario];
    assert(row.apiRouteFile === proof.apiRouteFile, `${row.scenario} api map`);
    assert(row.handlerFile === proof.handlerFile, `${row.scenario} handler map`);
    assert(row.uiFile === proof.uiFile, `${row.scenario} ui map`);
    const handlerSrc = readFileSync(root(row.handlerFile), "utf8");
    assert(
      handlerSrc.includes(`function ${row.handler}`) ||
        handlerSrc.includes(` ${row.handler}(`) ||
        handlerSrc.includes(`export async function ${row.handler}`) ||
        handlerSrc.includes(`export function ${row.handler}`),
      `${row.handler} exported in ${row.handlerFile}`,
    );
    const uiSrc = readFileSync(root(row.uiFile), "utf8");
    assert(
      uiSrc.includes(`function ${row.uiComponent}`) ||
        uiSrc.includes(` ${row.uiComponent}(`),
      `${row.uiComponent} in ${row.uiFile}`,
    );
  }
  console.log("PASS API mapping valid");

  assert(first.every((r) => r.mocked === false), "no mock flag");
  const productionUiSrc = readFileSync(
    root("lib/enterprise/workflow-production-ui.ts"),
    "utf8",
  );
  const actionsSrc = readFileSync(actionsComponent, "utf8");
  assert(!/\bmock[A-Z(]/.test(productionUiSrc), "production-ui no mock APIs");
  assert(!/\bMock\b/.test(productionUiSrc), "production-ui no Mock");
  assert(!/\bmock[A-Z(]/.test(actionsSrc), "actions component no mock APIs");
  assert(
    !actionsSrc.includes("faker") && !actionsSrc.includes("dummy"),
    "actions component no dummy data",
  );
  console.log("PASS no mock");

  clearWorkflowProductionUi();
  const second = buildWorkflowProductionUi();
  assert(
    workflowProductionUiFingerprint(first) ===
      workflowProductionUiFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  const viaGet = getWorkflowProductionUi();
  assert(
    workflowProductionUiFingerprint(viaGet) ===
      workflowProductionUiFingerprint(first),
    "get fingerprint",
  );
  console.log("PASS Deterministic");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP9_ID === "WP-9", "WP-9 id");
  assert(
    WORKFLOW_PRODUCTION_UI_CAPABILITY === "WorkflowProductionUi",
    "capability",
  );
  assert(
    EP_WORKFLOW_PRODUCTION_UI_BASELINE === "v80-pilot-ga-1.0.0",
    "baseline",
  );
  assert(
    EP_WORKFLOW_PRODUCTION_UI_VERSION ===
      "ep-4-wp-9-workflow-production-ui-1",
    "version",
  );
  console.log("PASS EP-4 WP-9");

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
      "components/enterprise",
      "app/(pilot)/pilot/intake/page.tsx",
      "app/dashboard/command-center/page.tsx",
      "scripts/verify-ep4-wp9.ts",
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

  console.log("\n=== ALL EP-4 / WP-9 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP9_ID} · baseline ${EP_WORKFLOW_PRODUCTION_UI_BASELINE} · actions ${first.length}`,
  );
}

main();
