/**
 * Launch P2 — Customer Onboarding Layer verification
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
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../lib/launch/launch.manager";
import { LAUNCH_PRODUCTION_FOUNDATION_ID } from "../lib/launch/launch.constants";
import {
  ACTIVATION_STATES,
  CUSTOMER_READINESS_VERDICTS,
  LAUNCH_CUSTOMER_ONBOARDING_BASE,
  LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_ID,
  LAUNCH_CUSTOMER_ONBOARDING_VERSION,
  LAUNCH_P2_ONBOARDING_FREEZE_VERSION,
  ONBOARDING_MANAGER_STATUSES,
  ONBOARDING_PROFILE_STATUSES,
  PROVISIONING_STEPS,
} from "../lib/launch/onboarding/onboarding.constants";
import {
  assertCustomerReadinessReady,
  clearOnboardingLayer,
  createCustomerOnboardingManager,
} from "../lib/launch/onboarding/onboarding.manager";
import {
  assertLaunchP2ReleaseGatePass,
  checkLaunchP2ReleaseGate,
} from "../lib/launch/onboarding/verify/onboarding.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearOnboardingLayer();
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
    "lib/launch/onboarding/onboarding.constants.ts",
    "lib/launch/onboarding/onboarding.types.ts",
    "lib/launch/onboarding/onboarding.profile.ts",
    "lib/launch/onboarding/onboarding.provisioning.ts",
    "lib/launch/onboarding/onboarding.config.ts",
    "lib/launch/onboarding/onboarding.checklist.ts",
    "lib/launch/onboarding/onboarding.activation.ts",
    "lib/launch/onboarding/onboarding.readiness.ts",
    "lib/launch/onboarding/onboarding.manager.ts",
    "lib/launch/onboarding/verify/onboarding.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_CUSTOMER_ONBOARDING_ID ===
      "enterprise-launch-p2-customer-onboarding-v1",
    "onboarding id",
  );
  check(
    LAUNCH_CUSTOMER_ONBOARDING_VERSION === "launch-p2-1",
    "onboarding version",
  );
  check(
    LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION ===
      "launch-customer-onboarding-freeze-1",
    "onboarding freeze",
  );
  check(
    LAUNCH_CUSTOMER_ONBOARDING_BASE === LAUNCH_PRODUCTION_FOUNDATION_ID,
    "onboarding base = p1 id",
  );
  check(
    LAUNCH_P2_ONBOARDING_FREEZE_VERSION ===
      "launch-p2-customer-onboarding-freeze-1",
    "p2 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(ONBOARDING_PROFILE_STATUSES.length === 6, "profile statuses");
  check(PROVISIONING_STEPS.length === 5, "provisioning steps");
  check(ACTIVATION_STATES.length === 4, "activation states");
  check(CUSTOMER_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ONBOARDING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupLaunchStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "launch.p2.verify.product",
    name: "AI Fitness Onboarding",
    sku: "AIFE-ONB-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "launch.p2.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "launch.p2.verify.package",
    productId: product.id,
    name: "Onboarding Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const plan = createPricingPlan({
    id: "launch.p2.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const deplMgr = createDeploymentPackageManager({
    managerId: "launch-p2-verify-depl",
  });
  deplMgr.initialize();
  deplMgr.start();

  const pkg = deplMgr.createPackage({
    id: "launch.p2.verify.deplpkg",
    productId: product.id,
    editionId: edition.id,
    pricingPlanId: plan.id,
    name: "Verify Deploy Package",
    version: "1.0.0",
  });

  const env = deplMgr.createEnvironment({
    id: "launch.p2.verify.env",
    deploymentPackageId: pkg.id,
    kind: "PRODUCTION",
    name: "Production",
  });
  deplMgr.validate(pkg.id, { environmentProfileId: env.id });
  const artifact = deplMgr.buildArtifact({
    id: "launch.p2.verify.artifact",
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
  });
  deplMgr.signArtifact(artifact.id);

  const launchMgr = createProductionLaunchManager({
    managerId: "launch-p2-verify-launch",
  });
  launchMgr.initialize();
  launchMgr.start();

  const productionProfile = launchMgr.createProfile({
    id: "launch.p2.verify.prodprofile",
    name: "Verify Production",
    productId: product.id,
    deploymentPackageId: pkg.id,
  });
  const releaseChecklist = launchMgr.createChecklist({
    id: "launch.p2.verify.release.checklist",
    productionProfileId: productionProfile.id,
  });
  launchMgr.markChecklistPassed(releaseChecklist.id);
  launchMgr.registerArtifact({
    id: "launch.p2.verify.prodartifact",
    productionProfileId: productionProfile.id,
    kind: "DEPLOYMENT_PACKAGE",
    refId: pkg.id,
  });
  launchMgr.setProfileStatus(productionProfile.id, "READY");

  return { product, edition, pkg, productionProfile, launchMgr, deplMgr };
}

function testOnboardingStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, edition, pkg, productionProfile } = setupLaunchStack();

  const mgr = createCustomerOnboardingManager({
    managerId: "launch-p2-verify",
  });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const profile = mgr.createProfile({
    id: "launch.p2.verify.onboard",
    customerName: "Verify Customer",
    productId: product.id,
    productionProfileId: productionProfile.id,
    deploymentPackageId: pkg.id,
  });
  check(profile.status === "DRAFT", "profile draft");

  const workflow = mgr.startProvisioning({
    id: "launch.p2.verify.prov",
    onboardingProfileId: profile.id,
    editionId: edition.id,
    packageId: "launch.p2.verify.package",
    workspaceSlug: "verify-customer",
    organizationSlug: "verify-customer-org",
  });
  check(workflow.complete === true, "provisioning complete");
  check(workflow.failed === false, "provisioning not failed");

  const updated = mgr.getProfile(profile.id);
  check(!!updated?.productTenantId, "tenant provisioned");
  check(!!updated?.organizationId, "organization linked");
  check(!!updated?.workspaceId, "workspace created");

  mgr.setConfig({
    onboardingProfileId: profile.id,
    key: "locale",
    value: "en-US",
  });
  check(
    mgr.getConfig({ onboardingProfileId: profile.id, key: "locale" })?.value ===
      "en-US",
    "config set",
  );

  const checklist = mgr.createChecklist({
    id: "launch.p2.verify.onb.checklist",
    onboardingProfileId: profile.id,
  });
  const completed = mgr.markChecklistPassed(checklist.id);
  check(completed.complete === true, "checklist complete");

  const prepared = mgr.prepareActivation(profile.id);
  check(prepared.state === "PENDING_ACTIVATION", "activation prepared");

  const active = mgr.setActivation({
    onboardingProfileId: profile.id,
    state: "ACTIVE",
  });
  check(active.state === "ACTIVE", "activation active");
  check(mgr.getProfile(profile.id)?.status === "ACTIVATED", "profile activated");

  const readiness = mgr.evaluateReadiness(profile.id);
  check(readiness.verdict === "READY", `readiness: ${readiness.summary}`);
  assertCustomerReadinessReady(readiness);

  const registry = mgr.manifest();
  check(registry.onboardingId === LAUNCH_CUSTOMER_ONBOARDING_ID, "manifest id");
  check(registry.base === LAUNCH_CUSTOMER_ONBOARDING_BASE, "manifest base");
  check(registry.profileCount >= 1, "manifest profiles");
  check(registry.workflowCount >= 1, "manifest workflows");

  mgr.stop();
  cleanup();
  console.log(
    "✓ profile / provision / config / checklist / activation / readiness / manager",
  );
}

function testSignoff() {
  const gate = checkLaunchP2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertLaunchP2ReleaseGatePass(gate);
  console.log("✓ customer onboarding release gate");
}

function main() {
  console.log("Launch P2 Customer Onboarding Layer verify");
  checkModules();
  checkConstants();
  testOnboardingStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
