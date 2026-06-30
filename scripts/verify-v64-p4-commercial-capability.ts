/**
 * V64 P4 — Commercial Capability Layer Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_CAPABILITY_LAYER_VERSION,
  buildCommercialCapabilityBundle,
  buildCommercialCapabilitySnapshot,
  lookupAllCommercialCapabilities,
  lookupCommercialCapabilityByProductTier,
  lookupCommercialCapabilityBySaasPlan,
  lookupCommercialCapabilityByUserTier,
  validateCommercialCapability,
} from "../lib/commercial/v64/capability";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p4-commercial-capability-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/capability.ts",
    "lib/commercial/v64/capability.types.ts",
    "lib/commercial/v64/capability.aggregate.ts",
    "lib/commercial/v64/capability.builder.ts",
    "lib/commercial/v64/capability.lookup.ts",
    "lib/commercial/v64/capability.snapshot.ts",
    "lib/commercial/v64/capability.validate.ts",
    "docs/production/V64-CAPABILITY-LAYER.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 capability layer module structure");
}

function testAggregationAndLookup() {
  const byProduct = lookupCommercialCapabilityByProductTier("enterprise");
  assert(byProduct.saasPlan === "ENTERPRISE", "product tier aggregate");
  assert(byProduct.featureFlags.includes("canUseAPI"), "enterprise API flag");

  const bySaas = lookupCommercialCapabilityBySaasPlan("PRO");
  assert(bySaas.productTier === "professional", "saas plan aggregate");
  assert(bySaas.usageLimits.BUDGET === 200, "pro budget limit");

  const byUser = lookupCommercialCapabilityByUserTier("free");
  assert(byUser?.productTier === "starter", "user tier aggregate");
  assert(byUser?.usageLimits.QUOTE === 50, "starter quote limit");

  const all = lookupAllCommercialCapabilities();
  assert(all.length === 3, "all capability aggregates");

  console.log("✓ tier aggregation & unified lookup");
}

function testBuilderAndSnapshot() {
  const bundle = buildCommercialCapabilityBundle({ deploymentId: DEPLOYMENT_ID });
  assert(bundle.version === V64_CAPABILITY_LAYER_VERSION, "bundle version");
  assert(bundle.foundationMap.tiers.length === 3, "foundation map in bundle");
  assert(bundle.tierAggregates.length === 3, "tier aggregates in bundle");
  assert(bundle.allExposedCapabilities.length >= 7, "exposed capabilities in bundle");

  const enterprise = bundle.tierAggregates.find((t) => t.productTier === "enterprise");
  assert(Boolean(enterprise && enterprise.enabledCapabilityCount >= 5), "enterprise capabilities");

  const snapshot = buildCommercialCapabilitySnapshot({ deploymentId: DEPLOYMENT_ID });
  assert(snapshot.generatedAt.length > 0, "snapshot timestamp");
  assert(snapshot.bundle.bundleId.includes(DEPLOYMENT_ID), "snapshot bundle id");

  console.log("✓ capability builder & snapshot");
  console.log(" ", snapshot.summary);
}

function testValidation() {
  const validation = validateCommercialCapability({ deploymentId: DEPLOYMENT_ID });
  assert(validation.foundationMapOk, "validation foundation map");
  assert(validation.tierAggregatesOk, "validation tier aggregates");
  assert(validation.exposureOk, "validation exposure");
  assert(validation.runtimeAligned, "validation runtime aligned");
  assert(validation.backwardCompatible, "validation backward compatible");
  assert(validation.capabilityOk, "validation capability ok");

  console.log("✓ capability validation");
  console.log("\n✅ V64 P4 Commercial Capability Layer — verify PASS");
}

function main() {
  console.log("V64 P4 Commercial Capability Layer Verification\n");
  checkModuleStructure();
  testAggregationAndLookup();
  testBuilderAndSnapshot();
  testValidation();
}

main();
