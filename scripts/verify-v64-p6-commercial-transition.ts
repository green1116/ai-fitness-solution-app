/**
 * V64 P6 — Commercial Upgrade/Downgrade Layer Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_TRANSITION_LAYER_VERSION,
  buildCommercialTransitionBundle,
  buildCommercialTransitionSnapshot,
  buildDowngradePathMap,
  buildTierCompatibilityMatrix,
  buildUpgradePathMap,
  lookupDowngradePath,
  lookupUpgradePath,
  resolveNextDowngradeTier,
  resolveNextUpgradeTier,
  validateCommercialTransition,
} from "../lib/commercial/v64/transition";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p6-commercial-transition-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertDefined<T>(value: T | null | undefined, msg: string): asserts value is T {
  if (value == null) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/transition.ts",
    "lib/commercial/v64/transition.types.ts",
    "lib/commercial/v64/transition.rank.ts",
    "lib/commercial/v64/transition.compatibility.ts",
    "lib/commercial/v64/transition.paths.ts",
    "lib/commercial/v64/transition.builder.ts",
    "lib/commercial/v64/transition.snapshot.ts",
    "lib/commercial/v64/transition.validate.ts",
    "docs/production/V64-TRANSITION-LAYER.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 transition layer module structure");
}

function testPathMapsAndCompatibility() {
  const upgrades = buildUpgradePathMap();
  assert(upgrades.length === 3, "upgrade path count");
  assert(
    upgrades.some((p) => p.fromProductTier === "starter" && p.toProductTier === "professional"),
    "starter to pro upgrade",
  );

  const downgrades = buildDowngradePathMap();
  assert(downgrades.length === 3, "downgrade path count");
  assert(
    downgrades.some((p) => p.fromProductTier === "enterprise" && p.toProductTier === "professional"),
    "enterprise to pro downgrade",
  );

  const matrix = buildTierCompatibilityMatrix({ deploymentId: DEPLOYMENT_ID });
  assert(matrix.cells.length === 9, "compatibility matrix cells");

  const stepUp = lookupUpgradePath("professional", "enterprise");
  assertDefined(stepUp, "pro to enterprise upgrade path");
  assert(stepUp.gainedFeatureFlags.includes("canGenerateTender"), "pro to enterprise tender flag");
  assert(stepUp.monthlyPriceDeltaCny > 0, "upgrade price delta positive");

  const stepDown = lookupDowngradePath("professional", "starter");
  assertDefined(stepDown, "pro to starter downgrade path");
  assert(stepDown.lostFeatureFlags.length > 0, "downgrade loses flags");
  assert(stepDown.monthlyPriceDeltaCny < 0, "downgrade price delta negative");

  assert(resolveNextUpgradeTier("starter") === "professional", "next upgrade tier");
  assert(resolveNextDowngradeTier("enterprise") === "professional", "next downgrade tier");

  console.log("✓ upgrade/downgrade paths & compatibility matrix");
}

function testBuilderSnapshotAndValidation() {
  const bundle = buildCommercialTransitionBundle({ deploymentId: DEPLOYMENT_ID });
  assert(bundle.version === V64_TRANSITION_LAYER_VERSION, "bundle version");
  assert(bundle.upgradePaths.length === 3, "bundle upgrades");
  assert(bundle.downgradePaths.length === 3, "bundle downgrades");

  const snapshot = buildCommercialTransitionSnapshot({ deploymentId: DEPLOYMENT_ID });
  assert(snapshot.generatedAt.length > 0, "snapshot timestamp");
  assert(snapshot.bundle.bundleId.includes(DEPLOYMENT_ID), "snapshot bundle id");

  const validation = validateCommercialTransition({ deploymentId: DEPLOYMENT_ID });
  assert(validation.upgradePathsOk, "validation upgrades");
  assert(validation.downgradePathsOk, "validation downgrades");
  assert(validation.compatibilityOk, "validation compatibility");
  assert(validation.runtimeAligned, "validation runtime aligned");
  assert(validation.backwardCompatible, "validation backward compatible");
  assert(validation.transitionOk, "validation transition ok");

  console.log("✓ transition builder, snapshot & validation");
  console.log(" ", snapshot.summary);
  console.log("\n✅ V64 P6 Commercial Upgrade/Downgrade Layer — verify PASS");
}

function main() {
  console.log("V64 P6 Commercial Upgrade/Downgrade Layer Verification\n");
  checkModuleStructure();
  testPathMapsAndCompatibility();
  testBuilderSnapshotAndValidation();
}

main();
