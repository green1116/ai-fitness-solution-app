/**
 * V3.7 Build Stabilization — minimal regression guard
 *
 * Lightweight checks for missing exports, verify script drift, and freeze manifest.
 */
import fs from "node:fs";
import path from "node:path";

import {
  BUILD_FREEZE_MANIFEST,
  formatBuildFreezeSummary,
} from "../lib/commercialization/stabilization/build-freeze";
import { VERIFY_REGISTRY } from "./verify-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`STABILITY: ${msg}`);
}

function readPackageScripts(): Record<string, string> {
  const pkgPath = path.resolve(__dirname, "../package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, string> };
  return pkg.scripts ?? {};
}

function checkVerifyScriptsExist() {
  const root = path.resolve(__dirname, "..");
  for (const entry of VERIFY_REGISTRY) {
    const filePath = path.join(root, entry.file);
    assert(fs.existsSync(filePath), `missing verify file: ${entry.file}`);
  }
}

function checkPackageScriptRegistry() {
  const scripts = readPackageScripts();
  for (const entry of VERIFY_REGISTRY) {
    assert(
      typeof scripts[entry.npmScript] === "string",
      `missing npm script: ${entry.npmScript}`,
    );
  }

  for (const key of ["verify:all", "verify:stability", "verify:runtime-freeze"]) {
    assert(typeof scripts[key] === "string", `missing aggregator script: ${key}`);
  }
}

async function checkEvidenceExports() {
  const evidence = await import("../lib/evidence");
  assert(typeof evidence.runExternalEvidenceRuntime === "function", "evidence.runExternalEvidenceRuntime");
  assert(typeof evidence.runEvidenceCoverageRuntime === "function", "evidence.runEvidenceCoverageRuntime");
  assert(typeof evidence.runExecutiveReleaseSurfaceRuntime === "function", "evidence.runExecutiveReleaseSurfaceRuntime");
  assert(typeof evidence.buildRuntimeVisualization === "function", "evidence.buildRuntimeVisualization");
}

async function checkOrchestrationExports() {
  const orchestration = await import("../lib/tender/orchestration");
  assert(typeof orchestration.runTenderOrchestration === "function", "orchestration.runTenderOrchestration");
  assert(typeof orchestration.buildDecisionRoute === "function", "orchestration.buildDecisionRoute");
  assert(typeof orchestration.buildEscalation === "function", "orchestration.buildEscalation");
}

async function checkCommercializationExports() {
  const stabilization = await import("../lib/commercialization/stabilization");
  assert(
    typeof stabilization.runCommercialV37StabilizationFoundation === "function",
    "stabilization.runCommercialV37StabilizationFoundation",
  );
  assert(typeof stabilization.buildRegressionBaselineSummary === "function", "stabilization.buildRegressionBaselineSummary");
  assert(typeof stabilization.BUILD_FREEZE_MANIFEST === "object", "stabilization.BUILD_FREEZE_MANIFEST");
}

function checkBuildFreezeManifest() {
  assert(BUILD_FREEZE_MANIFEST.version.startsWith("3.7"), "BUILD_FREEZE_VERSION");
  assert(BUILD_FREEZE_MANIFEST.buildPassed === true, "buildPassed must be true at freeze");
  assert(BUILD_FREEZE_MANIFEST.tscPassed === true, "tscPassed must be true at freeze");
  assert(BUILD_FREEZE_MANIFEST.runtimeVerified === true, "runtimeVerified must be true at freeze");
  assert(BUILD_FREEZE_MANIFEST.evidenceVerified === true, "evidenceVerified must be true at freeze");
  assert(BUILD_FREEZE_MANIFEST.executiveVerified === true, "executiveVerified must be true at freeze");
  console.log(formatBuildFreezeSummary());
}

async function main() {
  console.log("=== V3.7 Build Stability Guard ===");

  checkVerifyScriptsExist();
  console.log("✓ verify script files exist");

  checkPackageScriptRegistry();
  console.log("✓ package.json verify registry");

  await checkEvidenceExports();
  console.log("✓ evidence exports");

  await checkOrchestrationExports();
  console.log("✓ orchestration exports");

  await checkCommercializationExports();
  console.log("✓ commercialization / stabilization exports");

  checkBuildFreezeManifest();
  console.log("✓ build freeze manifest");

  console.log("");
  console.log("Build stability guard PASSED.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
