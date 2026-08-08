/**
 * EP-4 / WP-11 — Closure & Freeze verification
 * Freezes WP-1~WP-10 against baseline v80-pilot-ga-1.0.0.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import * as enterprise from "../lib/enterprise";
import {
  EP_4_BASELINE,
  EP_4_CORE_MODELS_UNCHANGED,
  EP_4_FREEZE_VERSION,
  EP_4_PRODUCTION_HANDLERS,
  EP_4_PRODUCTION_PAGE_FILES,
  EP_4_PRODUCTION_ROUTES,
  EP_4_PRODUCTION_UI_HOST,
  EP_4_PRODUCTION_UI_HOST_FILE,
  EP_4_WORK_PACKAGES,
  EP_4_WP11_ID,
  buildEp4Manifest,
  computeEp4Fingerprint,
  listEp4ArtifactPresence,
  validateEp4DependencyChain,
} from "../lib/enterprise/ep4-manifest";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function clearWorkflowChain() {
  enterprise.clearWorkflowE2eVerification();
  enterprise.clearWorkflowProductionUi();
  enterprise.clearWorkflowEntryPanel();
  enterprise.clearWorkflowIntegration();
  enterprise.clearWorkflowExecutor();
  enterprise.clearWorkflowUiContract();
  enterprise.clearWorkflowApi();
  enterprise.clearWorkflowView();
  enterprise.clearWorkflowDefinition();
  enterprise.clearWorkflowContext();
}

function main() {
  console.log("=== EP-4 / WP-11 Closure & Freeze ===\n");

  assert(EP_4_WP11_ID === "WP-11", "WP-11 id");
  assert(EP_4_FREEZE_VERSION === "ep-4-freeze-1.0.0", "freeze version");
  assert(EP_4_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(EP_4_WORK_PACKAGES.length === 10, "WP-1~WP-10 count");
  assert(enterprise.EP_4_ID === "EP-4", "EP-4 id export");

  for (const wp of EP_4_WORK_PACKAGES) {
    const buildFn = (enterprise as Record<string, unknown>)[wp.buildApi];
    const getFn = (enterprise as Record<string, unknown>)[wp.getApi];
    assert(typeof buildFn === "function", `export ${wp.buildApi}`);
    assert(typeof getFn === "function", `export ${wp.getApi}`);
  }
  assert(
    typeof enterprise.buildEp4Manifest === "function" ||
      typeof buildEp4Manifest === "function",
    "manifest builder available",
  );
  assert(
    typeof enterprise.buildWorkflowE2eVerification === "function",
    "e2e export",
  );
  assert(
    typeof enterprise.buildWorkflowProductionUi === "function",
    "production ui export",
  );
  console.log("PASS All EP-4 exports");

  // --- routes work ---
  for (const route of EP_4_PRODUCTION_ROUTES) {
    const pageFile = EP_4_PRODUCTION_PAGE_FILES[route];
    assert(existsSync(root(pageFile)), `route page ${route}`);
    const pageSrc = readFileSync(root(pageFile), "utf8");
    assert(
      pageSrc.includes(EP_4_PRODUCTION_UI_HOST),
      `${route} mounts ${EP_4_PRODUCTION_UI_HOST}`,
    );
  }
  assert(
    existsSync(root(EP_4_PRODUCTION_UI_HOST_FILE)),
    "WorkflowEntryPanelActions file",
  );
  console.log("PASS routes work");

  clearWorkflowChain();
  enterprise.buildWorkspaceSnapshot();
  enterprise.buildCollaborationSnapshot();
  enterprise.buildWorkflowContext();
  enterprise.buildWorkflowDefinition();
  enterprise.buildWorkflowView();
  enterprise.buildWorkflowApi();
  enterprise.buildWorkflowUiContract();
  enterprise.buildWorkflowExecutor();
  enterprise.buildWorkflowIntegration();
  enterprise.buildWorkflowEntryPanel();
  const production = enterprise.buildWorkflowProductionUi();
  const e2e = enterprise.buildWorkflowE2eVerification();

  // --- actions visible ---
  assert(production.length >= 1, "production actions present");
  assert(
    production.every((a) => a.actionVisible === true),
    "all actions visible",
  );
  for (const route of EP_4_PRODUCTION_ROUTES) {
    const forHost = enterprise.getWorkflowProductionUiForHost(route);
    assert(forHost.length >= 1, `${route} has visible actions`);
  }
  assert(e2e.checks.actionsVisible === true, "e2e actionsVisible");
  console.log("PASS actions visible");

  // --- API mapping valid ---
  const handlersSeen = new Set(production.map((a) => a.handler));
  for (const handler of EP_4_PRODUCTION_HANDLERS) {
    assert(handlersSeen.has(handler), `covers handler ${handler}`);
  }
  for (const action of production) {
    assert(existsSync(root(action.apiRouteFile)), `api ${action.apiRouteFile}`);
    assert(
      existsSync(root(action.handlerFile)),
      `handler file ${action.handlerFile}`,
    );
    const handlerSrc = readFileSync(root(action.handlerFile), "utf8");
    assert(
      handlerSrc.includes(`function ${action.handler}`) ||
        handlerSrc.includes(` ${action.handler}(`) ||
        handlerSrc.includes(`export async function ${action.handler}`) ||
        handlerSrc.includes(`export function ${action.handler}`),
      `handler ${action.handler} present`,
    );
  }
  assert(e2e.checks.apiMappingValid === true, "e2e apiMappingValid");
  console.log("PASS API mapping valid");

  // --- no mock ---
  assert(production.every((a) => a.mocked === false), "production no mock");
  assert(e2e.surfaces.every((s) => s.mocked === false), "e2e no mock");
  assert(e2e.checks.noMock === true, "e2e checks.noMock");
  const productionSrc = readFileSync(
    root("lib/enterprise/workflow-production-ui.ts"),
    "utf8",
  );
  const e2eSrc = readFileSync(root("lib/enterprise/workflow-e2e.ts"), "utf8");
  assert(!/\bmock[A-Z(]/.test(productionSrc), "production-ui no mock APIs");
  assert(!/\bMock\b/.test(e2eSrc), "e2e no Mock");
  console.log("PASS no mock");

  // --- deterministic ---
  const fp1 = computeEp4Fingerprint();
  const fp2 = computeEp4Fingerprint();
  assert(fp1.length === 64, "fingerprint length");
  assert(fp1 === fp2, "deterministic fingerprint");
  const m1 = buildEp4Manifest();
  const m2 = buildEp4Manifest();
  assert(m1.fingerprint === m2.fingerprint, "manifest fingerprint stable");
  assert(m1.fingerprint === fp1, "manifest matches compute");
  assert(m1.baseline === "v80-pilot-ga-1.0.0", "manifest baseline");
  assert(m1.scope.noNewBusinessCapability === true, "no new capability");
  assert(
    m1.scope.projectQuoteTenderModelsUnchanged === true,
    "models unchanged flag",
  );
  assert(m1.scope.productionUiIntegrated === true, "production ui integrated");

  clearWorkflowChain();
  enterprise.buildWorkspaceSnapshot();
  enterprise.buildCollaborationSnapshot();
  const ctxA = enterprise.buildWorkflowContext();
  clearWorkflowChain();
  enterprise.buildWorkspaceSnapshot();
  enterprise.buildCollaborationSnapshot();
  const ctxB = enterprise.buildWorkflowContext();
  assert(
    enterprise.workflowContextFingerprint(ctxA) ===
      enterprise.workflowContextFingerprint(ctxB),
    "workflow context deterministic",
  );

  clearWorkflowChain();
  enterprise.buildWorkspaceSnapshot();
  enterprise.buildCollaborationSnapshot();
  enterprise.buildWorkflowContext();
  enterprise.buildWorkflowDefinition();
  enterprise.buildWorkflowView();
  enterprise.buildWorkflowApi();
  enterprise.buildWorkflowUiContract();
  enterprise.buildWorkflowExecutor();
  enterprise.buildWorkflowIntegration();
  enterprise.buildWorkflowEntryPanel();
  enterprise.buildWorkflowProductionUi();
  const e2eA = enterprise.buildWorkflowE2eVerification();
  enterprise.clearWorkflowE2eVerification();
  const e2eB = enterprise.buildWorkflowE2eVerification();
  assert(
    enterprise.workflowE2eFingerprint(e2eA) ===
      enterprise.workflowE2eFingerprint(e2eB),
    "e2e deterministic",
  );
  console.log("PASS deterministic");

  const chain = validateEp4DependencyChain();
  assert(chain.ok, `dependency chain: ${chain.errors.join("; ")}`);
  assert(
    m1.dependencyChain.join(",") ===
      EP_4_WORK_PACKAGES.map((w) => w.id).join(","),
    "chain order WP-1..WP-10",
  );
  console.log("PASS Dependency chain valid");

  for (const wp of EP_4_WORK_PACKAGES) {
    const src = readFileSync(path.join(process.cwd(), wp.modulePath), "utf8");
    for (const model of EP_4_CORE_MODELS_UNCHANGED) {
      assert(
        !src.includes(`prisma.${model.toLowerCase()}`) &&
          !src.includes(`model ${model}`),
        `${wp.id} must not touch core model ${model}`,
      );
    }
  }
  const manifestSrc = readFileSync(
    path.join(process.cwd(), "lib/enterprise/ep4-manifest.ts"),
    "utf8",
  );
  assert(
    !manifestSrc.includes("prisma.project") &&
      !manifestSrc.includes("prisma.quote") &&
      !manifestSrc.includes("prisma.tender"),
    "manifest must not touch core models",
  );
  console.log("PASS No core model changes");

  const presence = listEp4ArtifactPresence();
  assert(
    presence.every((p) => p.present),
    `missing artifacts: ${presence
      .filter((p) => !p.present)
      .map((p) => p.path)
      .join(", ")}`,
  );
  assert(m1.certification === "certified", "EP-4 certification");
  assert(m1.workPackages.every((w) => w.status === "frozen"), "all frozen");
  assert(m1.scope.workPackages === "WP-1~WP-10", "scope WP-1~WP-10");
  assert(m1.scope.closure === "WP-11", "scope closure WP-11");
  assert(
    JSON.stringify([...m1.productionRoutes]) ===
      JSON.stringify([...EP_4_PRODUCTION_ROUTES]),
    "production routes frozen",
  );
  assert(
    JSON.stringify([...m1.productionHandlers]) ===
      JSON.stringify([...EP_4_PRODUCTION_HANDLERS]),
    "production handlers frozen",
  );
  assert(m1.productionUiHost === EP_4_PRODUCTION_UI_HOST, "ui host frozen");
  console.log("PASS EP-4");

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
      "scripts/verify-ep4.ts",
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

  console.log("\n=== ALL EP-4 CHECKS PASSED ===");
  console.log(
    `EP-4 frozen · ${EP_4_FREEZE_VERSION} · baseline ${EP_4_BASELINE} · fingerprint ${fp1.slice(0, 16)}…`,
  );
}

main();
