/**
 * E12-P6 — Deployment Package Layer verification
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
import { E12_PRODUCT_BASE } from "../lib/product/e12/core/product.constants";
import {
  DEPLOYMENT_MANAGER_STATUSES,
  DEPLOYMENT_PACKAGE_STATUSES,
  E12_DEPLOYMENT_PACKAGE_BASE,
  E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  E12_DEPLOYMENT_PACKAGE_ID,
  E12_DEPLOYMENT_PACKAGE_VERSION,
  E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  ENVIRONMENT_PROFILE_KINDS,
  RELEASE_ARTIFACT_STATUSES,
  VALIDATION_VERDICTS,
} from "../lib/product/e12/deployment/deployment.constants";
import {
  assertInstallationManifestReady,
  clearDeploymentLayer,
  createDeploymentPackageManager,
} from "../lib/product/e12/deployment/deployment.manager";
import { createProductEdition } from "../lib/product/e12/edition/product.edition";
import { registerProductIdentity } from "../lib/product/e12/identity/product.identity";
import { createCapabilityPackage } from "../lib/product/e12/packaging/product.capability.package";
import {
  clearProductRegistry,
  getProductRegistryManifest,
} from "../lib/product/e12/registry/product.registry";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../lib/product/e12/tenant/tenant.manager";
import {
  assertE12P6ReleaseGatePass,
  checkE12P6ReleaseGate,
} from "../lib/product/e12/verify/deployment.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/product/e12/deployment/deployment.constants.ts",
    "lib/product/e12/deployment/deployment.types.ts",
    "lib/product/e12/deployment/deployment.package.ts",
    "lib/product/e12/deployment/deployment.environment.ts",
    "lib/product/e12/deployment/deployment.config.ts",
    "lib/product/e12/deployment/deployment.validator.ts",
    "lib/product/e12/deployment/deployment.artifact.ts",
    "lib/product/e12/deployment/deployment.manifest.ts",
    "lib/product/e12/deployment/deployment.manager.ts",
    "lib/product/e12/verify/deployment.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_DEPLOYMENT_PACKAGE_ID === "enterprise-e12-deployment-package-v1",
    "deployment id",
  );
  check(
    E12_DEPLOYMENT_PACKAGE_VERSION === "e12-deployment-1",
    "deployment version",
  );
  check(
    E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION ===
      "e12-deployment-package-freeze-1",
    "deployment freeze",
  );
  check(
    E12_DEPLOYMENT_PACKAGE_BASE === "enterprise-e12-p5-api-productization-v1",
    "deployment base",
  );
  check(
    E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION ===
      "e12-p6-deployment-package-freeze-1",
    "p6 freeze",
  );
  check(DEPLOYMENT_PACKAGE_STATUSES.length === 4, "package statuses");
  check(ENVIRONMENT_PROFILE_KINDS.length === 3, "env kinds");
  check(VALIDATION_VERDICTS.length === 2, "validation verdicts");
  check(RELEASE_ARTIFACT_STATUSES.length === 3, "artifact statuses");
  check(DEPLOYMENT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "e12.p6.verify.product",
    name: "AI Fitness Deploy",
    sku: "AIFE-DEP-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "e12.p6.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "e12.p6.verify.package",
    productId: product.id,
    name: "Deploy Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const plan = createPricingPlan({
    id: "e12.p6.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const registry = getProductRegistryManifest();
  check(registry.identityCount >= 1, "registry identities");

  const tenantMgr = createTenantProductManager({
    managerId: "e12-p6-verify-tenant",
  });
  tenantMgr.initialize();
  tenantMgr.start();

  const workspace = tenantMgr.createWorkspace({
    id: "e12.p6.verify.workspace",
    name: "Verify Workspace",
    slug: "verify-deploy-ws",
  });

  const tenant = tenantMgr.registerTenant({
    id: "e12.p6.verify.tenant",
    name: "Verify Tenant",
    productId: product.id,
    workspaceId: workspace.id,
  });
  tenantMgr.activateTenant(tenant.id);

  tenantMgr.bindSubscription({
    id: "e12.p6.verify.tenant.sub",
    productTenantId: tenant.id,
    productId: product.id,
    editionId: edition.id,
    packageId: "e12.p6.verify.package",
  });

  return { product, edition, plan, tenantMgr };
}

function testDeploymentPackageStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, edition, plan } = setupStack();

  const mgr = createDeploymentPackageManager({ managerId: "e12-p6-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const pkg = mgr.createPackage({
    id: "e12.p6.verify.pkg",
    productId: product.id,
    editionId: edition.id,
    pricingPlanId: plan.id,
    name: "Verify Deploy Package",
    version: "1.0.0",
  });
  check(pkg.status === "DRAFT", "package draft");

  const env = mgr.createEnvironment({
    id: "e12.p6.verify.env",
    deploymentPackageId: pkg.id,
    kind: "STAGING",
    name: "Staging",
    region: "eu-west-1",
    variables: { LOG_LEVEL: "info" },
  });
  check(env.status === "ACTIVE", "env active");

  mgr.setConfig({
    id: "e12.p6.verify.cfg",
    deploymentPackageId: pkg.id,
    scope: "PACKAGE",
    key: "healthCheckPath",
    value: "/health",
  });

  const validation = mgr.validate(pkg.id, { environmentProfileId: env.id });
  check(validation.verdict === "PASS", `validation: ${validation.summary}`);
  check(validation.failCount === 0, "validation failCount 0");

  const updatedPkg = mgr.getPackage(pkg.id);
  check(updatedPkg?.status === "VALIDATED", "package validated");

  const artifact = mgr.buildArtifact({
    id: "e12.p6.verify.artifact",
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
  });
  check(artifact.status === "BUILT", "artifact built");

  const signed = mgr.signArtifact(artifact.id);
  check(signed.status === "SIGNED", "artifact signed");

  const distributed = mgr.distributeArtifact(signed.id);
  check(distributed.status === "DISTRIBUTED", "artifact distributed");

  const install = mgr.installationManifest({
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
    artifactId: distributed.id,
  });
  check(install.ready === true, `install: ${install.summary}`);
  assertInstallationManifestReady(install);
  check(install.editionId === edition.id, "install edition");
  check(install.pricingPlanId === plan.id, "install plan");

  const manifest = mgr.manifest();
  check(manifest.deploymentPackageId === E12_DEPLOYMENT_PACKAGE_ID, "manifest id");
  check(manifest.base === E12_DEPLOYMENT_PACKAGE_BASE, "manifest base");
  check(manifest.packageCount >= 1, "manifest packages");
  check(manifest.artifactCount >= 1, "manifest artifacts");

  mgr.stop();
  cleanup();
  console.log(
    "✓ package / environment / config / validate / artifact / manifest / manager",
  );
}

function testSignoff() {
  const gate = checkE12P6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P6ReleaseGatePass(gate);
  console.log("✓ deployment package release gate");
}

function main() {
  console.log("E12-P6 Deployment Package Layer verify");
  checkModules();
  checkConstants();
  testDeploymentPackageStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
