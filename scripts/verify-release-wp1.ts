/**
 * Release / WP-1 — Release Readiness verification
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import * as enterprise from "../lib/enterprise";
import {
  EP_4_PRODUCTION_HANDLERS,
  EP_4_PRODUCTION_PAGE_FILES,
  EP_4_PRODUCTION_ROUTES,
  EP_4_PRODUCTION_UI_HOST,
  EP_4_PRODUCTION_UI_HOST_FILE,
} from "../lib/enterprise/ep4-manifest";
import {
  RELEASE_EP_FREEZE_IDS,
  RELEASE_ID,
  RELEASE_READINESS_BASELINE,
  RELEASE_READINESS_CAPABILITY,
  RELEASE_READINESS_VERSION,
  RELEASE_WP1_ID,
  buildReleaseReadiness,
  clearReleaseReadiness,
  getReleaseReadiness,
  releaseReadinessFingerprint,
} from "../lib/release/release-readiness";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function main() {
  console.log("=== Release / WP-1 Release Readiness ===\n");

  clearReleaseReadiness();
  const first = buildReleaseReadiness();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RELEASE_WP1_ID, "WP-1 id");
  assert(first.capability === RELEASE_READINESS_CAPABILITY, "capability");
  assert(first.baseline === "v80-pilot-ga-1.0.0", "baseline");
  assert(first.version === RELEASE_READINESS_VERSION, "version");
  assert(first.epFreezes.length === 4, "EP-1~EP-4 freezes");
  assert(
    first.epFreezes.map((e) => e.epId).join(",") ===
      RELEASE_EP_FREEZE_IDS.join(","),
    "EP freeze order",
  );

  // --- exports ---
  assert(typeof enterprise.buildEp1Manifest === "function", "export EP-1");
  assert(typeof enterprise.buildEp2Manifest === "function", "export EP-2");
  assert(typeof enterprise.buildEp3Manifest === "function", "export EP-3");
  assert(typeof enterprise.buildEp4Manifest === "function", "export EP-4");
  assert(typeof enterprise.buildWorkflowProductionUi === "function", "export WP-9");
  assert(
    typeof enterprise.buildWorkflowE2eVerification === "function",
    "export WP-10",
  );
  for (const ep of first.epFreezes) {
    assert(ep.certification === "certified", `${ep.epId} certified`);
    assert(ep.baseline === RELEASE_READINESS_BASELINE, `${ep.epId} baseline`);
    assert(ep.fingerprint.length === 64, `${ep.epId} fingerprint`);
  }
  assert(first.checks.exportsOk === true, "checks.exportsOk");
  console.log("PASS exports");

  // --- routes ---
  assert(
    JSON.stringify([...first.routes]) ===
      JSON.stringify([...EP_4_PRODUCTION_ROUTES]),
    "routes catalog",
  );
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
  assert(first.checks.routesOk === true, "checks.routesOk");
  console.log("PASS routes");

  // --- actions ---
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
  const actions = enterprise.buildWorkflowProductionUi();
  assert(actions.length >= 1, "production actions present");
  assert(
    actions.every((a) => a.actionVisible === true),
    "all actions visible",
  );
  for (const route of EP_4_PRODUCTION_ROUTES) {
    const forHost = enterprise.getWorkflowProductionUiForHost(route);
    assert(forHost.length >= 1, `${route} has actions`);
  }
  assert(first.uiHostComponent === EP_4_PRODUCTION_UI_HOST, "ui host");
  assert(first.checks.actionsOk === true, "checks.actionsOk");
  console.log("PASS actions");

  // --- APIs ---
  assert(
    JSON.stringify([...first.handlers]) ===
      JSON.stringify([...EP_4_PRODUCTION_HANDLERS]),
    "handlers catalog",
  );
  const handlersSeen = new Set(actions.map((a) => a.handler));
  for (const handler of EP_4_PRODUCTION_HANDLERS) {
    assert(handlersSeen.has(handler), `covers ${handler}`);
  }
  for (const action of actions) {
    assert(existsSync(root(action.apiRouteFile)), `api ${action.apiRouteFile}`);
    assert(
      existsSync(root(action.handlerFile)),
      `handler ${action.handlerFile}`,
    );
  }
  assert(first.checks.apisOk === true, "checks.apisOk");
  console.log("PASS APIs");

  // --- no mock ---
  assert(actions.every((a) => a.mocked === false), "actions no mock");
  assert(first.rollback.mocked === false, "rollback no mock");
  assert(first.checks.noMock === true, "checks.noMock");
  const readinessSrc = readFileSync(
    root("lib/release/release-readiness.ts"),
    "utf8",
  );
  assert(!/\bmock[A-Z(]/.test(readinessSrc), "readiness no mock APIs");
  assert(!/\bMock\b/.test(readinessSrc), "readiness no Mock type");
  console.log("PASS no mock");

  // --- rollback ---
  assert(first.rollback.ready === true, "rollback ready");
  assert(first.rollback.strategy === "ep-freeze-baseline", "rollback strategy");
  assert(
    first.rollback.restoreTargets.length === 4,
    "rollback restore targets",
  );
  assert(
    first.rollback.restoreTargets.join(",") ===
      first.epFreezes.map((e) => e.freezeVersion).join(","),
    "rollback targets match freezes",
  );
  assert(first.checks.rollbackOk === true, "checks.rollbackOk");
  assert(first.status === "READY", "status READY");
  console.log("PASS rollback");

  // --- deterministic ---
  clearReleaseReadiness();
  const second = buildReleaseReadiness();
  assert(
    releaseReadinessFingerprint(first) ===
      releaseReadinessFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify({ ...first, epFreezes: first.epFreezes }) ===
      JSON.stringify({ ...second, epFreezes: second.epFreezes }) ||
      first.fingerprint === second.fingerprint,
    "deterministic readiness",
  );
  const viaGet = getReleaseReadiness();
  assert(
    releaseReadinessFingerprint(viaGet) ===
      releaseReadinessFingerprint(first),
    "get fingerprint",
  );
  console.log("PASS deterministic");

  assert(RELEASE_WP1_ID === "WP-1", "WP-1 const");
  assert(RELEASE_READINESS_BASELINE === "v80-pilot-ga-1.0.0", "baseline const");
  console.log("PASS Release WP-1");

  const tscBin = path.join(
    process.cwd(),
    "node_modules",
    "typescript",
    "bin",
    "tsc",
  );
  const tsc = spawnSync(
    process.execPath,
    [
      tscBin,
      "--noEmit",
      "--pretty",
      "false",
      "-p",
      "tsconfig.release-wp1.json",
    ],
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
      "lib/release",
      "scripts/verify-release-wp1.ts",
      "tsconfig.release-wp1.json",
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );
  if (diffCheck.status !== 0) {
    throw new Error(
      `ASSERT: git diff --check failed\n${diffCheck.stdout}\n${diffCheck.stderr}`,
    );
  }
  console.log("PASS git diff --check");

  console.log("\n=== ALL RELEASE / WP-1 CHECKS PASSED ===");
  console.log(
    `${RELEASE_ID}/${RELEASE_WP1_ID} · baseline ${RELEASE_READINESS_BASELINE} · status ${first.status} · fingerprint ${first.fingerprint.slice(0, 16)}…`,
  );
}

main();
