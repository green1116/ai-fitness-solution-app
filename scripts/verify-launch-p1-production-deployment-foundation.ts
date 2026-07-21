/**
 * Launch P1 — Production Deployment Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { clearAdminConsoleLayer } from "../lib/product/e12/admin/admin.manager";
import { clearApiProductLayer } from "../lib/product/e12/api/api.manager";
import { createPricingPlan } from "../lib/product/e12/billing/billing.plan";
import { clearBillingCommercialLayer } from "../lib/product/e12/billing/billing.manager";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../lib/product/e12/catalog/product.feature.catalog";
import { clearCommercialControlLayer } from "../lib/product/e12/commercial/commercial.manager";
import { E12_PRODUCT_BASE } from "../lib/product/e12/core/product.constants";
import {
  clearDeploymentLayer,
  createDeploymentPackageManager,
} from "../lib/product/e12/deployment/deployment.manager";
import { createProductEdition } from "../lib/product/e12/edition/product.edition";
import { registerProductIdentity } from "../lib/product/e12/identity/product.identity";
import { createCapabilityPackage } from "../lib/product/e12/packaging/product.capability.package";
import { clearProductRegistry } from "../lib/product/e12/registry/product.registry";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { clearTenantProductLayer } from "../lib/product/e12/tenant/tenant.manager";
import {
  DEPLOYMENT_READINESS_VERDICTS,
  LAUNCH_MANAGER_STATUSES,
  LAUNCH_P1_PRODUCTION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_BASE,
  LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_ID,
  LAUNCH_PRODUCTION_FOUNDATION_VERSION,
  PRODUCTION_ARTIFACT_KINDS,
  PRODUCTION_ARTIFACT_STATUSES,
  PRODUCTION_PROFILE_STATUSES,
  RELEASE_CHECKLIST_ITEM_STATUSES,
} from "../lib/launch/launch.constants";
import {
  assertLaunchManifestReady,
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../lib/launch/launch.manager";
import {
  assertLaunchP1ReleaseGatePass,
  checkLaunchP1ReleaseGate,
} from "../lib/launch/verify/release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearLaunchLayer();
  clearCommercialControlLayer();
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/launch/launch.constants.ts",
    "lib/launch/launch.types.ts",
    "lib/launch/launch.profile.ts",
    "lib/launch/launch.checklist.ts",
    "lib/launch/launch.readiness.ts",
    "lib/launch/launch.artifact.ts",
    "lib/launch/launch.manifest.ts",
    "lib/launch/launch.manager.ts",
    "lib/launch/verify/release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_PRODUCTION_FOUNDATION_ID ===
      "enterprise-launch-p1-production-deployment-foundation-v1",
    "launch id",
  );
  check(
    LAUNCH_PRODUCTION_FOUNDATION_VERSION === "launch-p1-1",
    "launch version",
  );
  check(
    LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION ===
      "launch-production-foundation-freeze-1",
    "launch freeze",
  );
  check(
    LAUNCH_PRODUCTION_FOUNDATION_BASE ===
      "enterprise-e12-productization-complete-v1",
    "launch base",
  );
  check(
    LAUNCH_P1_PRODUCTION_FREEZE_VERSION ===
      "launch-p1-production-deployment-foundation-freeze-1",
    "p1 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PRODUCTION_PROFILE_STATUSES.length === 4, "profile statuses");
  check(RELEASE_CHECKLIST_ITEM_STATUSES.length === 4, "checklist statuses");
  check(DEPLOYMENT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PRODUCTION_ARTIFACT_KINDS.length === 4, "artifact kinds");
  check(PRODUCTION_ARTIFACT_STATUSES.length === 3, "artifact statuses");
  check(LAUNCH_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupDeploymentStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "launch.p1.verify.product",
    name: "AI Fitness Launch",
    sku: "AIFE-LNCH-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "launch.p1.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "launch.p1.verify.package",
    productId: product.id,
    name: "Launch Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const plan = createPricingPlan({
    id: "launch.p1.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const deplMgr = createDeploymentPackageManager({
    managerId: "launch-p1-verify-depl",
  });
  deplMgr.initialize();
  deplMgr.start();

  const pkg = deplMgr.createPackage({
    id: "launch.p1.verify.deplpkg",
    productId: product.id,
    editionId: edition.id,
    pricingPlanId: plan.id,
    name: "Verify Deploy Package",
    version: "1.0.0",
  });

  const env = deplMgr.createEnvironment({
    id: "launch.p1.verify.env",
    deploymentPackageId: pkg.id,
    kind: "PRODUCTION",
    name: "Production",
  });

  const validation = deplMgr.validate(pkg.id, {
    environmentProfileId: env.id,
  });
  check(validation.verdict === "PASS", "deployment validated");

  const artifact = deplMgr.buildArtifact({
    id: "launch.p1.verify.artifact",
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
  });
  const signed = deplMgr.signArtifact(artifact.id);

  return { product, pkg, signed, deplMgr };
}

function testLaunchFoundationStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, pkg, signed } = setupDeploymentStack();

  const mgr = createProductionLaunchManager({ managerId: "launch-p1-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const profile = mgr.createProfile({
    id: "launch.p1.verify.profile",
    name: "Verify Production",
    productId: product.id,
    deploymentPackageId: pkg.id,
  });
  check(profile.status === "DRAFT", "profile draft");
  check(
    profile.productizationCompleteId === E12_PRODUCTIZATION_COMPLETE_ID,
    "profile complete tag",
  );

  const checklist = mgr.createChecklist({
    id: "launch.p1.verify.checklist",
    productionProfileId: profile.id,
  });
  check(checklist.items.length >= 5, "checklist items");
  check(checklist.complete === false, "checklist incomplete initially");

  const completed = mgr.markChecklistPassed(checklist.id);
  check(completed.complete === true, "checklist complete");

  const depArtifact = mgr.registerArtifact({
    id: "launch.p1.verify.prodartifact",
    productionProfileId: profile.id,
    kind: "DEPLOYMENT_PACKAGE",
    refId: pkg.id,
  });
  check(depArtifact.status === "REGISTERED", "artifact registered");

  mgr.registerArtifact({
    id: "launch.p1.verify.releaseartifact",
    productionProfileId: profile.id,
    kind: "RELEASE_ARTIFACT",
    refId: signed.id,
    checksum: signed.checksum,
  });

  mgr.setProfileStatus(profile.id, "READY");

  const readiness = mgr.evaluateReadiness(profile.id);
  check(readiness.verdict === "READY", `readiness: ${readiness.summary}`);

  const launchManifest = mgr.launchManifest({
    productionProfileId: profile.id,
  });
  check(launchManifest.ready === true, `manifest: ${launchManifest.summary}`);
  assertLaunchManifestReady(launchManifest);
  check(launchManifest.base === LAUNCH_PRODUCTION_FOUNDATION_BASE, "manifest base");
  check(launchManifest.platformAligned === true, "manifest platform");
  check(launchManifest.productFoundationReady === true, "manifest foundation");

  const registry = mgr.manifest();
  check(registry.launchId === LAUNCH_PRODUCTION_FOUNDATION_ID, "registry id");
  check(registry.profileCount >= 1, "registry profiles");
  check(registry.artifactCount >= 1, "registry artifacts");

  mgr.stop();
  cleanup();
  console.log(
    "✓ profile / checklist / readiness / artifact / launch manifest / manager",
  );
}

function testSignoff() {
  const gate = checkLaunchP1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertLaunchP1ReleaseGatePass(gate);
  console.log("✓ launch production foundation release gate");
}

function main() {
  console.log("Launch P1 Production Deployment Foundation verify");
  checkModules();
  checkConstants();
  testLaunchFoundationStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
