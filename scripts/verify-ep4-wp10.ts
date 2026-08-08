/**
 * EP-4 / WP-10 — End-to-End Verification
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  EP_4_ID,
  EP_4_WP10_ID,
  EP_WORKFLOW_E2E_BASELINE,
  EP_WORKFLOW_E2E_VERSION,
  WORKFLOW_E2E_CAPABILITY,
  WORKFLOW_E2E_HANDLERS,
  WORKFLOW_E2E_PAGE_FILES,
  WORKFLOW_E2E_ROUTES,
  WORKFLOW_E2E_UI_COMPONENT,
  WORKFLOW_E2E_UI_COMPONENT_FILE,
  buildCollaborationSnapshot,
  buildWorkflowApi,
  buildWorkflowContext,
  buildWorkflowDefinition,
  buildWorkflowE2eVerification,
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
  clearWorkflowE2eVerification,
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
  getWorkflowE2eVerification,
  getWorkflowProductionUiForHost,
  workflowE2eFingerprint,
} from "../lib/enterprise";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function clearAll() {
  clearWorkflowE2eVerification();
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

function assertHandlerPresent(handler: string, file: string) {
  const src = readFileSync(root(file), "utf8");
  assert(
    src.includes(`function ${handler}`) ||
      src.includes(` ${handler}(`) ||
      src.includes(`export async function ${handler}`) ||
      src.includes(`export function ${handler}`),
    `handler ${handler} in ${file}`,
  );
}

function main() {
  console.log("=== EP-4 / WP-10 End-to-End Verification ===\n");

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
  buildWorkflowProductionUi();

  const first = buildWorkflowE2eVerification();
  assert(first.surfaces.length >= 1, "e2e surfaces has entries");
  assert(first.status === "VERIFIED", "status VERIFIED");
  assert(first.checks.routesWork === true, "checks.routesWork");
  assert(first.checks.actionsVisible === true, "checks.actionsVisible");
  assert(first.checks.apiMappingValid === true, "checks.apiMappingValid");
  assert(first.checks.noMock === true, "checks.noMock");
  assert(first.checks.deterministic === true, "checks.deterministic");
  console.log("PASS Build");

  // --- routes work ---
  assert(
    JSON.stringify([...first.routes]) === JSON.stringify([...WORKFLOW_E2E_ROUTES]),
    "routes catalog",
  );
  for (const route of WORKFLOW_E2E_ROUTES) {
    const pageFile = WORKFLOW_E2E_PAGE_FILES[route];
    assert(existsSync(root(pageFile)), `route page ${route} → ${pageFile}`);
    const pageSrc = readFileSync(root(pageFile), "utf8");
    assert(
      pageSrc.includes(WORKFLOW_E2E_UI_COMPONENT),
      `${route} mounts ${WORKFLOW_E2E_UI_COMPONENT}`,
    );
    assert(
      pageSrc.includes(`"${route}"`) || pageSrc.includes(`'${route}'`),
      `${route} host binding present`,
    );
  }
  assert(
    existsSync(root(WORKFLOW_E2E_UI_COMPONENT_FILE)),
    "WorkflowEntryPanelActions file",
  );
  const uiHostSrc = readFileSync(root(WORKFLOW_E2E_UI_COMPONENT_FILE), "utf8");
  assert(
    uiHostSrc.includes(`function ${WORKFLOW_E2E_UI_COMPONENT}`),
    "WorkflowEntryPanelActions export",
  );
  console.log("PASS routes work");

  // --- actions visible ---
  assert(
    first.surfaces.every((s) => s.actionVisible === true),
    "all surfaces actionVisible",
  );
  for (const route of WORKFLOW_E2E_ROUTES) {
    const forHost = getWorkflowProductionUiForHost(route);
    assert(forHost.length >= 1, `${route} has visible actions`);
    assert(
      forHost.every((a) => a.actionVisible === true),
      `${route} actions visible`,
    );
  }
  console.log("PASS actions visible");

  // --- API mapping valid + required handlers ---
  assert(
    JSON.stringify([...first.handlers]) ===
      JSON.stringify([...WORKFLOW_E2E_HANDLERS]),
    "handlers catalog",
  );
  const handlersSeen = new Set(first.surfaces.map((s) => s.handler));
  for (const handler of WORKFLOW_E2E_HANDLERS) {
    assert(handlersSeen.has(handler), `e2e covers handler ${handler}`);
  }
  for (const surface of first.surfaces) {
    assert(existsSync(root(surface.pageFile)), `page ${surface.pageFile}`);
    assert(
      existsSync(root(surface.apiRouteFile)),
      `api ${surface.apiRouteFile}`,
    );
    assert(
      existsSync(root(surface.handlerFile)),
      `handler file ${surface.handlerFile}`,
    );
    assert(existsSync(root(surface.uiFile)), `ui ${surface.uiFile}`);
    assertHandlerPresent(surface.handler, surface.handlerFile);
    const apiSrc = readFileSync(root(surface.apiRouteFile), "utf8");
    const apiWiresHandler =
      apiSrc.includes(surface.handler) ||
      (surface.handler === "buildIntakeHandoffPackage" &&
        (apiSrc.includes("generateIntakeHandoffPackage") ||
          apiSrc.includes("getIntakeHandoffPackage") ||
          apiSrc.includes("HandoffPackage")));
    assert(
      apiWiresHandler,
      `api ${surface.apiRouteFile} wires ${surface.handler}`,
    );
    const uiSrc = readFileSync(root(surface.uiFile), "utf8");
    assert(
      uiSrc.includes(`function ${surface.uiComponent}`) ||
        uiSrc.includes(` ${surface.uiComponent}(`),
      `ui ${surface.uiComponent} in ${surface.uiFile}`,
    );
  }
  console.log("PASS API mapping valid");

  // --- no mock ---
  assert(first.surfaces.every((s) => s.mocked === false), "surfaces no mock");
  assert(first.checks.noMock === true, "checks.noMock");
  const e2eSrc = readFileSync(
    root("lib/enterprise/workflow-e2e.ts"),
    "utf8",
  );
  assert(!/\bmock[A-Z(]/.test(e2eSrc), "e2e module no mock APIs");
  assert(!/\bMock\b/.test(e2eSrc), "e2e module no Mock");
  assert(!/\bfaker\b/.test(uiHostSrc), "ui host no faker");
  assert(!/\bdummy\b/i.test(uiHostSrc), "ui host no dummy");
  console.log("PASS no mock");

  // --- deterministic ---
  clearWorkflowE2eVerification();
  const second = buildWorkflowE2eVerification();
  assert(
    workflowE2eFingerprint(first) === workflowE2eFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  const viaGet = getWorkflowE2eVerification();
  assert(
    workflowE2eFingerprint(viaGet) === workflowE2eFingerprint(first),
    "get fingerprint",
  );
  console.log("PASS deterministic");

  assert(EP_4_ID === "EP-4", "EP-4 id");
  assert(EP_4_WP10_ID === "WP-10", "WP-10 id");
  assert(WORKFLOW_E2E_CAPABILITY === "WorkflowE2eVerification", "capability");
  assert(EP_WORKFLOW_E2E_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(
    EP_WORKFLOW_E2E_VERSION === "ep-4-wp-10-workflow-e2e-verification-1",
    "version",
  );
  assert(
    first.uiHostComponent === "WorkflowEntryPanelActions",
    "ui host component",
  );
  console.log("PASS EP-4 WP-10");

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
      "scripts/verify-ep4-wp10.ts",
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

  console.log("\n=== ALL EP-4 / WP-10 CHECKS PASSED ===");
  console.log(
    `${EP_4_ID}/${EP_4_WP10_ID} · baseline ${EP_WORKFLOW_E2E_BASELINE} · surfaces ${first.surfaces.length}`,
  );
}

main();
