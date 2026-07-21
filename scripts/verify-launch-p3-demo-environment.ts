/**
 * Launch P3 — Demo Environment Layer verification
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
  DEMO_MANAGER_STATUSES,
  DEMO_READINESS_VERDICTS,
  DEMO_SCENARIO_STEPS,
  DEMO_TENANT_STATUSES,
  DEMO_WORKSPACE_STATUSES,
  LAUNCH_DEMO_ENVIRONMENT_BASE,
  LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_ID,
  LAUNCH_DEMO_ENVIRONMENT_VERSION,
  LAUNCH_P3_DEMO_FREEZE_VERSION,
  SAMPLE_DATA_KINDS,
  SNAPSHOT_STATUSES,
} from "../lib/launch/demo/demo.constants";
import {
  assertDemoReadinessReady,
  clearDemoLayer,
  createDemoEnvironmentManager,
} from "../lib/launch/demo/demo.manager";
import {
  assertLaunchP3ReleaseGatePass,
  checkLaunchP3ReleaseGate,
} from "../lib/launch/demo/verify/demo.release.gate";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../lib/launch/launch.manager";
import { LAUNCH_CUSTOMER_ONBOARDING_ID } from "../lib/launch/onboarding/onboarding.constants";
import {
  clearOnboardingLayer,
  createCustomerOnboardingManager,
} from "../lib/launch/onboarding/onboarding.manager";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearDemoLayer();
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
    "lib/launch/demo/demo.constants.ts",
    "lib/launch/demo/demo.types.ts",
    "lib/launch/demo/demo.tenant.ts",
    "lib/launch/demo/demo.workspace.ts",
    "lib/launch/demo/demo.sample.ts",
    "lib/launch/demo/demo.scenario.ts",
    "lib/launch/demo/demo.snapshot.ts",
    "lib/launch/demo/demo.readiness.ts",
    "lib/launch/demo/demo.manager.ts",
    "lib/launch/demo/verify/demo.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_DEMO_ENVIRONMENT_ID ===
      "enterprise-launch-p3-demo-environment-v1",
    "demo id",
  );
  check(
    LAUNCH_DEMO_ENVIRONMENT_VERSION === "launch-p3-1",
    "demo version",
  );
  check(
    LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION ===
      "launch-demo-environment-freeze-1",
    "demo freeze",
  );
  check(
    LAUNCH_DEMO_ENVIRONMENT_BASE === LAUNCH_CUSTOMER_ONBOARDING_ID,
    "demo base = p2 id",
  );
  check(
    LAUNCH_P3_DEMO_FREEZE_VERSION ===
      "launch-p3-demo-environment-freeze-1",
    "p3 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(DEMO_TENANT_STATUSES.length === 5, "tenant statuses");
  check(DEMO_WORKSPACE_STATUSES.length === 3, "workspace statuses");
  check(SAMPLE_DATA_KINDS.length === 5, "sample kinds");
  check(DEMO_SCENARIO_STEPS.length === 4, "scenario steps");
  check(SNAPSHOT_STATUSES.length === 3, "snapshot statuses");
  check(DEMO_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(DEMO_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupLaunchStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "launch.p3.verify.product",
    name: "AI Fitness Demo",
    sku: "AIFE-DEMO-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "launch.p3.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "launch.p3.verify.package",
    productId: product.id,
    name: "Demo Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const plan = createPricingPlan({
    id: "launch.p3.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const deplMgr = createDeploymentPackageManager({
    managerId: "launch-p3-verify-depl",
  });
  deplMgr.initialize();
  deplMgr.start();

  const pkg = deplMgr.createPackage({
    id: "launch.p3.verify.deplpkg",
    productId: product.id,
    editionId: edition.id,
    pricingPlanId: plan.id,
    name: "Verify Deploy Package",
    version: "1.0.0",
  });

  const env = deplMgr.createEnvironment({
    id: "launch.p3.verify.env",
    deploymentPackageId: pkg.id,
    kind: "PRODUCTION",
    name: "Production",
  });
  deplMgr.validate(pkg.id, { environmentProfileId: env.id });
  const artifact = deplMgr.buildArtifact({
    id: "launch.p3.verify.artifact",
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
  });
  deplMgr.signArtifact(artifact.id);

  const launchMgr = createProductionLaunchManager({
    managerId: "launch-p3-verify-launch",
  });
  launchMgr.initialize();
  launchMgr.start();

  const productionProfile = launchMgr.createProfile({
    id: "launch.p3.verify.prodprofile",
    name: "Verify Production",
    productId: product.id,
    deploymentPackageId: pkg.id,
  });
  const releaseChecklist = launchMgr.createChecklist({
    id: "launch.p3.verify.release.checklist",
    productionProfileId: productionProfile.id,
  });
  launchMgr.markChecklistPassed(releaseChecklist.id);
  launchMgr.registerArtifact({
    id: "launch.p3.verify.prodartifact",
    productionProfileId: productionProfile.id,
    kind: "DEPLOYMENT_PACKAGE",
    refId: pkg.id,
  });
  launchMgr.setProfileStatus(productionProfile.id, "READY");

  const onboardMgr = createCustomerOnboardingManager({
    managerId: "launch-p3-verify-onboard",
  });
  onboardMgr.initialize();
  onboardMgr.start();

  const onboardProfile = onboardMgr.createProfile({
    id: "launch.p3.verify.onboard",
    customerName: "Verify Demo Customer",
    productId: product.id,
    productionProfileId: productionProfile.id,
    deploymentPackageId: pkg.id,
  });

  return {
    product,
    pkg,
    productionProfile,
    onboardProfile,
    launchMgr,
    deplMgr,
    onboardMgr,
  };
}

function testDemoStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, pkg, productionProfile, onboardProfile } =
    setupLaunchStack();

  const mgr = createDemoEnvironmentManager({
    managerId: "launch-p3-verify",
  });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const tenant = mgr.createTenant({
    id: "launch.p3.verify.demotenant",
    name: "Verify Demo",
    productId: product.id,
    productionProfileId: productionProfile.id,
    deploymentPackageId: pkg.id,
    onboardingProfileId: onboardProfile.id,
  });
  check(tenant.status === "PROVISIONING", "tenant provisioning");

  const workspace = mgr.createWorkspace({
    id: "launch.p3.verify.demows",
    demoTenantId: tenant.id,
    slug: "verify-demo",
  });
  check(workspace.status === "ACTIVE", "workspace active");
  check(mgr.getTenant(tenant.id)?.status === "READY", "tenant ready");

  const sample = mgr.createSampleProfile({
    id: "launch.p3.verify.sample",
    demoTenantId: tenant.id,
    name: "Verify Dataset",
  });

  const scenario = mgr.startScenario({
    id: "launch.p3.verify.scenario",
    demoTenantId: tenant.id,
    sampleDataProfileId: sample.id,
  });
  check(scenario.complete === true, "scenario complete");
  check(scenario.failed === false, "scenario not failed");
  check(mgr.getSampleProfile(sample.id)?.seeded === true, "sample seeded");

  const snapshots = mgr.listSnapshots({ demoTenantId: tenant.id });
  check(snapshots.length >= 1, "snapshot captured");

  const readiness = mgr.evaluateReadiness(tenant.id);
  check(readiness.verdict === "READY", `readiness: ${readiness.summary}`);
  assertDemoReadinessReady(readiness);

  const reset = mgr.resetEnvironment(tenant.id);
  check(reset.sampleReset >= 1, "sample reset");
  check(reset.snapshotCount >= 1, "snapshots retained");
  check(mgr.getTenant(tenant.id)?.status === "RESET", "tenant reset");

  const restored = mgr.restoreSnapshot(snapshots[0]!.id);
  check(restored.status === "RESTORED", "snapshot restored");
  check(mgr.getTenant(tenant.id)?.status === "ACTIVE", "tenant active again");

  const readinessAfter = mgr.evaluateReadiness(tenant.id);
  check(
    readinessAfter.verdict === "READY",
    `readiness after restore: ${readinessAfter.summary}`,
  );

  const registry = mgr.manifest();
  check(registry.demoEnvironmentId === LAUNCH_DEMO_ENVIRONMENT_ID, "manifest id");
  check(registry.base === LAUNCH_DEMO_ENVIRONMENT_BASE, "manifest base");
  check(registry.tenantCount >= 1, "manifest tenants");
  check(registry.scenarioCount >= 1, "manifest scenarios");

  mgr.stop();
  cleanup();
  console.log(
    "✓ tenant / workspace / sample / scenario / snapshot / readiness / manager",
  );
}

function testSignoff() {
  const gate = checkLaunchP3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertLaunchP3ReleaseGatePass(gate);
  console.log("✓ demo environment release gate");
}

function main() {
  console.log("Launch P3 Demo Environment Layer verify");
  checkModules();
  checkConstants();
  testDemoStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
