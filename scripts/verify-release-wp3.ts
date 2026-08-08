/**
 * Release / WP-3 — Production Validation verification
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
import { WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO } from "../lib/enterprise/workflow-production-ui";
import {
  PRODUCTION_VALIDATION_BASELINE,
  PRODUCTION_VALIDATION_CAPABILITY,
  PRODUCTION_VALIDATION_VERSION,
  RELEASE_WP3_ID,
  buildProductionValidation,
  clearProductionValidation,
  getProductionValidation,
  productionValidationFingerprint,
} from "../lib/release/production-validation";
import {
  buildReleaseCandidate,
  clearReleaseCandidate,
} from "../lib/release/release-candidate";
import {
  RELEASE_ID,
  buildReleaseReadiness,
  clearReleaseReadiness,
} from "../lib/release/release-readiness";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function main() {
  console.log("=== Release / WP-3 Production Validation ===\n");

  clearProductionValidation();
  clearReleaseCandidate();
  clearReleaseReadiness();
  buildReleaseReadiness();
  buildReleaseCandidate();

  const first = buildProductionValidation();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RELEASE_WP3_ID, "WP-3 id");
  assert(first.capability === PRODUCTION_VALIDATION_CAPABILITY, "capability");
  assert(first.version === PRODUCTION_VALIDATION_VERSION, "version");
  assert(first.baseline === "v80-pilot-ga-1.0.0", "baseline");
  assert(first.baseline === PRODUCTION_VALIDATION_BASELINE, "baseline const");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.candidateFingerprint.length === 64, "candidate fingerprint");
  assert(first.mocked === false, "mocked false");
  console.log("PASS Build");

  // --- production routes ---
  assert(first.checks.productionRoutes === true, "checks.productionRoutes");
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
  assert(existsSync(root(EP_4_PRODUCTION_UI_HOST_FILE)), "ui host file");
  console.log("PASS production routes");

  // --- actions ---
  assert(first.checks.actions === true, "checks.actions");
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
  assert(actions.length >= 1, "actions present");
  assert(
    actions.every((a) => a.actionVisible === true),
    "actions visible",
  );
  for (const scenario of Object.keys(
    WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO,
  ) as Array<keyof typeof WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO>) {
    const uiFile = WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[scenario].uiFile;
    assert(existsSync(root(uiFile)), `ui ${uiFile}`);
  }
  console.log("PASS actions");

  // --- APIs ---
  assert(first.checks.apis === true, "checks.apis");
  assert(
    JSON.stringify([...first.handlers]) ===
      JSON.stringify([...EP_4_PRODUCTION_HANDLERS]),
    "handlers catalog",
  );
  for (const scenario of Object.keys(
    WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO,
  ) as Array<keyof typeof WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO>) {
    const files = WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[scenario];
    assert(existsSync(root(files.apiRouteFile)), `api ${files.apiRouteFile}`);
    assert(existsSync(root(files.handlerFile)), `handler ${files.handlerFile}`);
  }
  console.log("PASS APIs");

  // --- no mock ---
  assert(first.checks.noMock === true, "checks.noMock");
  assert(actions.every((a) => a.mocked === false), "actions no mock");
  assert(first.rollback.mocked === false, "rollback no mock");
  const src = readFileSync(
    root("lib/release/production-validation.ts"),
    "utf8",
  );
  assert(!/\bmock[A-Z(]/.test(src), "module no mock APIs");
  assert(!/\bMock\b/.test(src), "module no Mock type");
  console.log("PASS no mock");

  // --- rollback ---
  assert(first.checks.rollback === true, "checks.rollback");
  assert(first.rollback.ready === true, "rollback ready");
  assert(first.rollback.strategy === "ep-freeze-baseline", "rollback strategy");
  assert(first.rollback.restoreTargets.length === 4, "rollback targets");
  console.log("PASS rollback");

  // --- fingerprint ---
  assert(first.checks.fingerprint === true, "checks.fingerprint");
  assert(first.fingerprint.length === 64, "validation fingerprint");
  console.log("PASS fingerprint");

  assert(first.status === "PASS", "status PASS");
  console.log("PASS PASS");

  clearProductionValidation();
  const second = buildProductionValidation();
  assert(
    productionValidationFingerprint(first) ===
      productionValidationFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  const viaGet = getProductionValidation();
  assert(
    productionValidationFingerprint(viaGet) ===
      productionValidationFingerprint(first),
    "get fingerprint",
  );
  console.log("PASS deterministic");

  assert(RELEASE_WP3_ID === "WP-3", "WP-3 const");
  console.log("PASS Release WP-3");

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
      "scripts/verify-release-wp3.ts",
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

  console.log("\n=== ALL RELEASE / WP-3 CHECKS PASSED ===");
  console.log(
    `${RELEASE_ID}/${RELEASE_WP3_ID} · ${first.version} · baseline ${first.baseline} · ${first.status} · fingerprint ${first.fingerprint.slice(0, 16)}…`,
  );
}

main();
