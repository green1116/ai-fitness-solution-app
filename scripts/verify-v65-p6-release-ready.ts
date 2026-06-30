/**
 * V65 P6 — Release-Ready Gate Verification
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { runPrismaPreflight } from "../lib/prisma-stability/ci/prisma.preflight";
import {
  V65_RELEASE_READY_VERSION,
  assertReleaseReadyPass,
  buildReleaseReadyManifest,
  runReleaseReadyGate,
} from "../lib/production/v65/release";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v65-p6-release-ready";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/production/v65/release.ts",
    "lib/production/v65/release.types.ts",
    "lib/production/v65/release.builder.ts",
    "lib/production/v65/release.entry.ts",
    "docs/production/V65-RELEASE-READY.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V65 release-ready module structure");
}

function runTypeScriptGate() {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  console.log("✓ TypeScript gate");
}

function runPrismaGate() {
  const preflight = runPrismaPreflight();
  assert(preflight.ok, `prisma preflight: ${preflight.errors.join("; ")}`);
  console.log("✓ Prisma preflight gate");
}

function testReleaseReadyGate() {
  const manifest = runReleaseReadyGate({
    deploymentId: DEPLOYMENT_ID,
    signals: {
      verifyChainPass: true,
      typeScriptClean: true,
      buildPass: true,
      prismaPreflightPass: true,
    },
  });

  assert(manifest.version === V65_RELEASE_READY_VERSION, "release version");
  assert(manifest.commercialFrozen, "commercial frozen");
  assert(manifest.runtimeRiskOk, "runtime risk");
  assert(manifest.openBlockerCount === 0, "no open blockers");
  assert(manifest.releaseReady, "release ready");

  const asserted = assertReleaseReadyPass({
    deploymentId: DEPLOYMENT_ID,
    signals: {
      verifyChainPass: true,
      typeScriptClean: true,
      buildPass: true,
      prismaPreflightPass: true,
    },
  });
  assert(asserted.releaseReady, "assert release ready");

  console.log("✓ release-ready gate");
  console.log(" ", buildReleaseReadyManifest({ deploymentId: DEPLOYMENT_ID, signals: { verifyChainPass: true, typeScriptClean: true, buildPass: true, prismaPreflightPass: true } }).summary);
  console.log("\n✅ V65 P6 Release-Ready Gate — verify PASS");
}

function main() {
  console.log("V65 P6 Release-Ready Gate Verification\n");
  checkModuleStructure();
  runPrismaGate();
  runTypeScriptGate();
  testReleaseReadyGate();
}

main();
