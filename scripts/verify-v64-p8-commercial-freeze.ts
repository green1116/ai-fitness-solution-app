/**
 * V64 P8 — Commercial Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_COMMERCIAL_FREEZE_VERSION,
  V64_COMMERCIAL_LAYER_VERSION_LOCK,
  V64_VERIFY_LAYER_VERSION,
  assertCommercialFreezePass,
  assertCommercialVerificationPass,
  buildCommercialFreezeManifest,
  isCommercialLayerVersionLockIntact,
  runCommercialFreeze,
} from "../lib/commercial/v64";
import { EXPECTED_LAYER_VERSIONS } from "../lib/commercial/v64/verify.versions";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p8-commercial-freeze";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/index.ts",
    "lib/commercial/v64/freeze.ts",
    "lib/commercial/v64/freeze.types.ts",
    "lib/commercial/v64/freeze.lock.ts",
    "lib/commercial/v64/freeze.manifest.ts",
    "lib/commercial/v64/freeze.entry.ts",
    "docs/production/V64-COMMERCIAL-FREEZE.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 commercial freeze module structure");
}

function testVersionLock() {
  assert(isCommercialLayerVersionLockIntact(), "layer version lock intact");
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.freeze === V64_COMMERCIAL_FREEZE_VERSION,
    "freeze version in lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.foundation === EXPECTED_LAYER_VERSIONS.foundation,
    "foundation version lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.pricing === EXPECTED_LAYER_VERSIONS.pricing,
    "pricing version lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.featureMatrix === EXPECTED_LAYER_VERSIONS.featureMatrix,
    "feature matrix version lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.capability === EXPECTED_LAYER_VERSIONS.capability,
    "capability version lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.catalog === EXPECTED_LAYER_VERSIONS.catalog,
    "catalog version lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.transition === EXPECTED_LAYER_VERSIONS.transition,
    "transition version lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.verify === EXPECTED_LAYER_VERSIONS.verify,
    "verify version lock",
  );
  assert(
    V64_COMMERCIAL_LAYER_VERSION_LOCK.packaging === EXPECTED_LAYER_VERSIONS.packaging,
    "packaging version lock",
  );
  console.log("✓ version/constants lock");
}

function testFreezeManifest() {
  const verification = assertCommercialVerificationPass({ deploymentId: DEPLOYMENT_ID });
  assert(verification.version === V64_VERIFY_LAYER_VERSION, "P7 verification version");

  const manifest = buildCommercialFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  assert(manifest.version === V64_COMMERCIAL_FREEZE_VERSION, "freeze manifest version");
  assert(manifest.versionLockOk, "version lock ok");
  assert(manifest.verification.verificationOk, "verification ok in manifest");
  assert(manifest.backwardCompatible, "backward compatible");
  assert(manifest.frozen, "manifest frozen");

  const asserted = assertCommercialFreezePass({ deploymentId: DEPLOYMENT_ID });
  assert(asserted.frozen, "assert freeze pass");

  const entry = runCommercialFreeze({ deploymentId: DEPLOYMENT_ID });
  assert(entry.frozen, "unified freeze entry");

  console.log("✓ freeze manifest & unified entry");
  console.log(" ", manifest.summary);
  console.log("\n✅ V64 P8 Commercial Freeze — verify PASS");
}

function main() {
  console.log("V64 P8 Commercial Freeze Verification\n");
  checkModuleStructure();
  testVersionLock();
  testFreezeManifest();
}

main();
