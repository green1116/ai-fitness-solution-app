/**
 * V64 P3 — Commercial Feature Matrix Layer Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_FEATURE_MATRIX_LAYER_VERSION,
  buildCommercialFeatureGatingMatrix,
  buildCommercialFeatureMatrixSnapshot,
  buildExposedCapabilities,
  buildPlanFeatureMappings,
  buildTierEntitlementMappings,
  lookupPlanFeatureMappingBySaasPlan,
  validateCommercialFeatureMatrix,
} from "../lib/commercial/v64/feature";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p3-commercial-feature-matrix-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/feature.ts",
    "lib/commercial/v64/feature.types.ts",
    "lib/commercial/v64/feature.builder.ts",
    "lib/commercial/v64/feature.plan-map.ts",
    "lib/commercial/v64/feature.entitlement-map.ts",
    "lib/commercial/v64/feature.exposure.ts",
    "lib/commercial/v64/feature.snapshot.ts",
    "lib/commercial/v64/feature.validate.ts",
    "docs/production/V64-FEATURE-MATRIX.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 feature matrix layer module structure");
}

function testPlanAndEntitlementMaps() {
  const planMap = buildPlanFeatureMappings({ deploymentId: DEPLOYMENT_ID });
  assert(planMap.length === 3, "plan feature map count");

  const enterprise = lookupPlanFeatureMappingBySaasPlan("ENTERPRISE");
  assert(enterprise.featureKeys.includes("tenderPackage"), "enterprise tender feature");
  assert(enterprise.runtimeFeatureFlags.includes("canGenerateTender"), "enterprise runtime tender");

  const starter = planMap.find((p) => p.productTier === "starter");
  assert(Boolean(starter && !starter.featureKeys.includes("tenderPackage")), "starter no tender");

  const entitlements = buildTierEntitlementMappings();
  assert(entitlements.length === 3, "tier entitlements count");
  assert(entitlements.every((e) => e.catalogFeatures.length > 0), "catalog features per tier");
  assert(entitlements.find((e) => e.productTier === "starter")?.usageLimits.QUOTE === 50, "starter quote limit");
  assert(entitlements.find((e) => e.productTier === "enterprise")?.usageLimits.QUOTE === -1, "enterprise unlimited");

  console.log("✓ plan → feature & tier → entitlement mapping");
}

function testCapabilityExposureAndSnapshot() {
  const capabilities = buildExposedCapabilities();
  assert(capabilities.length >= 7, "exposed capabilities");
  const tender = capabilities.find((c) => c.productFeatureKey === "tenderPackage");
  assert(Boolean(tender?.enabledByTier.enterprise), "enterprise tender exposed");
  assert(!tender?.enabledByTier.starter, "starter tender off");

  const matrix = buildCommercialFeatureGatingMatrix({ deploymentId: DEPLOYMENT_ID });
  assert(matrix.version === V64_FEATURE_MATRIX_LAYER_VERSION, "gating matrix version");
  assert(matrix.catalogMatrix.features.length >= 7, "catalog matrix in gating");

  const snapshot = buildCommercialFeatureMatrixSnapshot({ deploymentId: DEPLOYMENT_ID });
  assert(snapshot.gatingMatrix.planFeatureMap.length === 3, "snapshot plan map");
  assert(snapshot.generatedAt.length > 0, "snapshot timestamp");

  console.log("✓ capability exposure & matrix snapshot");
  console.log(" ", snapshot.summary);
}

function testValidation() {
  const validation = validateCommercialFeatureMatrix({ deploymentId: DEPLOYMENT_ID });
  assert(validation.catalogMatrixOk, "validation catalog matrix");
  assert(validation.planFeatureMapOk, "validation plan map");
  assert(validation.tierEntitlementsOk, "validation entitlements");
  assert(validation.capabilitiesExposedOk, "validation capabilities");
  assert(validation.runtimeMatrixAligned, "validation runtime aligned");
  assert(validation.backwardCompatible, "validation backward compatible");
  assert(validation.featureMatrixOk, "validation feature matrix ok");

  console.log("✓ feature matrix validation");
  console.log("\n✅ V64 P3 Commercial Feature Matrix Layer — verify PASS");
}

function main() {
  console.log("V64 P3 Commercial Feature Matrix Layer Verification\n");
  checkModuleStructure();
  testPlanAndEntitlementMaps();
  testCapabilityExposureAndSnapshot();
  testValidation();
}

main();
