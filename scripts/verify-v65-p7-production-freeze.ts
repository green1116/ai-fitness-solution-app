/**
 * V65 P7 — Production Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V65_PRODUCTION_ARTIFACT_SURFACE,
  V65_PRODUCTION_FREEZE_VERSION,
  V65_PRODUCTION_LAYER_VERSION_LOCK,
  EXPECTED_PRODUCTION_LAYER_VERSIONS,
  assertProductionFreezePass,
  buildProductionFreezeManifest,
  getProductionArtifactPath,
  isProductionLayerVersionLockIntact,
  productionVersionLockMatchesExpected,
  runProductionFreeze,
} from "../lib/production/v65/freeze";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v65-p7-production-freeze";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/production/v65/freeze.ts",
    "lib/production/v65/freeze.types.ts",
    "lib/production/v65/freeze.lock.ts",
    "lib/production/v65/freeze.surface.ts",
    "lib/production/v65/freeze.manifest.ts",
    "lib/production/v65/freeze.entry.ts",
    "docs/production/V65-PRODUCTION-FREEZE.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V65 production freeze module structure");
}

function testVersionLock() {
  assert(isProductionLayerVersionLockIntact(), "version lock intact");
  assert(productionVersionLockMatchesExpected(), "version lock matches expected");
  assert(
    V65_PRODUCTION_LAYER_VERSION_LOCK.freeze === V65_PRODUCTION_FREEZE_VERSION,
    "freeze version in lock",
  );
  assert(
    V65_PRODUCTION_LAYER_VERSION_LOCK.audit === EXPECTED_PRODUCTION_LAYER_VERSIONS.audit,
    "audit version lock",
  );
  console.log("✓ version/constants lock");
}

function testArtifactSurface() {
  for (const value of Object.values(V65_PRODUCTION_ARTIFACT_SURFACE)) {
    if (value.startsWith("npm run")) continue;
    assert(fs.existsSync(path.join(ROOT, value)), `missing artifact: ${value}`);
  }
  assert(
    getProductionArtifactPath("libEntry") === "lib/production/v65",
    "artifact path libEntry",
  );
  console.log("✓ production artifact surface");
}

function testFreezeManifest() {
  const manifest = runProductionFreeze({
    deploymentId: DEPLOYMENT_ID,
    signals: {
      verifyChainPass: true,
      typeScriptClean: true,
      buildPass: true,
      prismaPreflightPass: true,
    },
  });

  assert(manifest.version === V65_PRODUCTION_FREEZE_VERSION, "freeze version");
  assert(manifest.versionLockOk, "version lock ok");
  assert(manifest.releaseReady.releaseReady, "release ready in freeze");
  assert(manifest.backwardCompatible, "backward compatible");
  assert(manifest.frozen, "manifest frozen");

  const asserted = assertProductionFreezePass({
    deploymentId: DEPLOYMENT_ID,
    signals: {
      verifyChainPass: true,
      typeScriptClean: true,
      buildPass: true,
      prismaPreflightPass: true,
    },
  });
  assert(asserted.frozen, "assert freeze pass");

  console.log("✓ freeze manifest & unified entry");
  console.log(" ", buildProductionFreezeManifest({ deploymentId: DEPLOYMENT_ID, signals: { verifyChainPass: true, typeScriptClean: true, buildPass: true, prismaPreflightPass: true } }).summary);
  console.log("\n✅ V65 P7 Production Freeze — verify PASS");
}

function main() {
  console.log("V65 P7 Production Freeze Verification\n");
  checkModuleStructure();
  testVersionLock();
  testArtifactSurface();
  testFreezeManifest();
}

main();
