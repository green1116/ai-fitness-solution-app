/**
 * Launch P6 — Documentation Package Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  clearAdminConsoleLayer,
  createAdminConsoleManager,
} from "../lib/product/e12/admin/admin.manager";
import {
  clearApiProductLayer,
  createApiProductManager,
} from "../lib/product/e12/api/api.manager";
import { createPricingPlan } from "../lib/product/e12/billing/billing.plan";
import { clearBillingCommercialLayer } from "../lib/product/e12/billing/billing.manager";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../lib/product/e12/catalog/product.feature.catalog";
import {
  clearCommercialControlLayer,
  createCommercialControlManager,
} from "../lib/product/e12/commercial/commercial.manager";
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
import { clearDemoLayer } from "../lib/launch/demo/demo.manager";
import {
  API_DOC_SECTIONS,
  CUSTOMER_GUIDE_SECTIONS,
  DEPLOYMENT_DOC_SECTIONS,
  DOCUMENTATION_MANAGER_STATUSES,
  DOCUMENTATION_PACKAGE_STATUSES,
  DOCUMENTATION_READINESS_VERDICTS,
  HANDBOOK_SECTIONS,
  LAUNCH_DOCUMENTATION_BASE,
  LAUNCH_DOCUMENTATION_FREEZE_VERSION,
  LAUNCH_DOCUMENTATION_ID,
  LAUNCH_DOCUMENTATION_VERSION,
  LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION,
} from "../lib/launch/documentation/documentation.constants";
import {
  assertDocumentationReadinessReady,
  clearDocumentationLayer,
  createDocumentationPackageManager,
} from "../lib/launch/documentation/documentation.manager";
import {
  assertLaunchP6ReleaseGatePass,
  checkLaunchP6ReleaseGate,
} from "../lib/launch/documentation/verify/documentation.release.gate";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../lib/launch/launch.manager";
import {
  clearOnboardingLayer,
  createCustomerOnboardingManager,
} from "../lib/launch/onboarding/onboarding.manager";
import {
  clearSecurityLayer,
  createSecurityReadinessManager,
} from "../lib/launch/security/security.manager";
import { LAUNCH_SLA_SUPPORT_ID } from "../lib/launch/support/support.constants";
import {
  clearSupportLayer,
  createSlaSupportPackageManager,
} from "../lib/launch/support/support.manager";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearDocumentationLayer();
  clearSupportLayer();
  clearSecurityLayer();
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
    "lib/launch/documentation/documentation.constants.ts",
    "lib/launch/documentation/documentation.types.ts",
    "lib/launch/documentation/documentation.package.ts",
    "lib/launch/documentation/documentation.api.ts",
    "lib/launch/documentation/documentation.deployment.ts",
    "lib/launch/documentation/documentation.guide.ts",
    "lib/launch/documentation/documentation.handbook.ts",
    "lib/launch/documentation/documentation.manifest.ts",
    "lib/launch/documentation/documentation.readiness.ts",
    "lib/launch/documentation/documentation.manager.ts",
    "lib/launch/documentation/verify/documentation.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_DOCUMENTATION_ID === "enterprise-launch-p6-documentation-v1",
    "documentation id",
  );
  check(
    LAUNCH_DOCUMENTATION_VERSION === "launch-p6-1",
    "documentation version",
  );
  check(
    LAUNCH_DOCUMENTATION_FREEZE_VERSION === "launch-documentation-freeze-1",
    "documentation freeze",
  );
  check(
    LAUNCH_DOCUMENTATION_BASE === LAUNCH_SLA_SUPPORT_ID,
    "documentation base = p5 id",
  );
  check(
    LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION ===
      "launch-p6-documentation-freeze-1",
    "p6 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(DOCUMENTATION_PACKAGE_STATUSES.length === 4, "package statuses");
  check(API_DOC_SECTIONS.length === 5, "api sections");
  check(DEPLOYMENT_DOC_SECTIONS.length === 5, "deployment sections");
  check(CUSTOMER_GUIDE_SECTIONS.length === 5, "guide sections");
  check(HANDBOOK_SECTIONS.length === 5, "handbook sections");
  check(DOCUMENTATION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(DOCUMENTATION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "launch.p6.verify.product",
    name: "AI Fitness Docs",
    sku: "AIFE-DOC-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "launch.p6.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "launch.p6.verify.package",
    productId: product.id,
    name: "Docs Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const plan = createPricingPlan({
    id: "launch.p6.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const deplMgr = createDeploymentPackageManager({
    managerId: "launch-p6-verify-depl",
  });
  deplMgr.initialize();
  deplMgr.start();

  const pkg = deplMgr.createPackage({
    id: "launch.p6.verify.deplpkg",
    productId: product.id,
    editionId: edition.id,
    pricingPlanId: plan.id,
    name: "Verify Deploy Package",
    version: "1.0.0",
  });
  const env = deplMgr.createEnvironment({
    id: "launch.p6.verify.env",
    deploymentPackageId: pkg.id,
    kind: "PRODUCTION",
    name: "Production",
  });
  deplMgr.validate(pkg.id, { environmentProfileId: env.id });
  const artifact = deplMgr.buildArtifact({
    id: "launch.p6.verify.artifact",
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
  });
  deplMgr.signArtifact(artifact.id);

  const launchMgr = createProductionLaunchManager({
    managerId: "launch-p6-verify-launch",
  });
  launchMgr.initialize();
  launchMgr.start();

  const productionProfile = launchMgr.createProfile({
    id: "launch.p6.verify.prodprofile",
    name: "Verify Production",
    productId: product.id,
    deploymentPackageId: pkg.id,
  });
  const releaseChecklist = launchMgr.createChecklist({
    id: "launch.p6.verify.release.checklist",
    productionProfileId: productionProfile.id,
  });
  launchMgr.markChecklistPassed(releaseChecklist.id);
  launchMgr.registerArtifact({
    id: "launch.p6.verify.prodartifact",
    productionProfileId: productionProfile.id,
    kind: "DEPLOYMENT_PACKAGE",
    refId: pkg.id,
  });
  launchMgr.setProfileStatus(productionProfile.id, "READY");

  const onboardMgr = createCustomerOnboardingManager({
    managerId: "launch-p6-verify-onboard",
  });
  onboardMgr.initialize();
  onboardMgr.start();
  const onboardProfile = onboardMgr.createProfile({
    id: "launch.p6.verify.onboard",
    customerName: "Verify Docs Customer",
    productId: product.id,
    productionProfileId: productionProfile.id,
    deploymentPackageId: pkg.id,
  });
  onboardMgr.startProvisioning({
    id: "launch.p6.verify.prov",
    onboardingProfileId: onboardProfile.id,
    editionId: edition.id,
    packageId: "launch.p6.verify.package",
    workspaceSlug: "verify-docs",
    organizationSlug: "verify-docs-org",
  });
  onboardMgr.setConfig({
    onboardingProfileId: onboardProfile.id,
    key: "locale",
    value: "en-US",
  });
  const onbChecklist = onboardMgr.createChecklist({
    id: "launch.p6.verify.onb.checklist",
    onboardingProfileId: onboardProfile.id,
  });
  onboardMgr.markChecklistPassed(onbChecklist.id);
  onboardMgr.prepareActivation(onboardProfile.id);
  onboardMgr.setActivation({
    onboardingProfileId: onboardProfile.id,
    state: "ACTIVE",
  });
  const productTenantId = onboardMgr.getProfile(onboardProfile.id)!
    .productTenantId!;

  const adminMgr = createAdminConsoleManager({
    managerId: "launch-p6-verify-admin",
  });
  adminMgr.initialize();
  adminMgr.start();
  const org = adminMgr.registerOrganization({
    id: "launch.p6.verify.org",
    name: "Verify Docs Org",
    slug: "verify-docs-org-2",
    productId: product.id,
  });
  adminMgr.assignOrgAdmin({
    id: "launch.p6.verify.orgadmin",
    organizationId: org.id,
    userId: "verify-reviewer",
    email: "reviewer@verify.example",
  });
  adminMgr.assignRole({
    id: "launch.p6.verify.role",
    userId: "verify-reviewer",
    organizationId: org.id,
    role: "ORG_ADMIN",
    productTenantId,
  });
  adminMgr.linkTenant(productTenantId, org.id);

  const apiMgr = createApiProductManager({
    managerId: "launch-p6-verify-api",
  });
  apiMgr.initialize();
  apiMgr.start();
  const apiEntry = apiMgr.registerCatalogEntry({
    id: "launch.p6.verify.api",
    productId: product.id,
    name: "Verify Docs API",
    path: "/api/v1/verify-docs",
    version: "v1",
    requiredScope: "api:read",
  });
  const developer = apiMgr.registerDeveloper({
    id: "launch.p6.verify.dev",
    userId: "verify-dev",
    productTenantId,
    scopes: ["api:read"],
  });
  const apiKey = apiMgr.createKey({
    id: "launch.p6.verify.key",
    productTenantId,
    developerId: developer.id,
    name: "Verify Key",
    scopes: ["api:read"],
  });

  const secMgr = createSecurityReadinessManager({
    managerId: "launch-p6-verify-security",
  });
  secMgr.initialize();
  secMgr.start();
  const secProfile = secMgr.createProfile({
    id: "launch.p6.verify.secprofile",
    name: "Verify Security Profile",
    productId: product.id,
    productionProfileId: productionProfile.id,
    organizationId: org.id,
    productTenantId,
    reviewerUserId: "verify-reviewer",
  });
  secMgr.startAccessReview({
    id: "launch.p6.verify.access",
    securityProfileId: secProfile.id,
    permission: "audit:read",
    apiKeyId: apiKey.id,
    apiCatalogEntryId: apiEntry.id,
  });
  const secChecklist = secMgr.createChecklist({
    id: "launch.p6.verify.compliance",
    securityProfileId: secProfile.id,
  });
  secMgr.markChecklistPassed(secChecklist.id);
  secMgr.validateAudit({
    id: "launch.p6.verify.audit",
    securityProfileId: secProfile.id,
  });
  const securityReady = secMgr.evaluateReadiness(secProfile.id);
  check(securityReady.verdict === "READY", `security: ${securityReady.summary}`);

  const commercialMgr = createCommercialControlManager({
    managerId: "launch-p6-verify-commercial",
  });
  commercialMgr.initialize();
  commercialMgr.start();
  const commercialSla = commercialMgr.createSla({
    id: "launch.p6.verify.sla",
    productId: product.id,
    productTenantId,
    organizationId: org.id,
    tier: "ENTERPRISE",
  });

  const supportMgr = createSlaSupportPackageManager({
    managerId: "launch-p6-verify-support",
  });
  supportMgr.initialize();
  supportMgr.start();
  const tier = supportMgr.createTier({
    id: "launch.p6.verify.tier",
    name: "Enterprise Support",
    tier: "ENTERPRISE",
  });
  const supportProfile = supportMgr.createProfile({
    id: "launch.p6.verify.supprofile",
    name: "Verify Support Package",
    productId: product.id,
    productionProfileId: productionProfile.id,
    productTenantId,
    organizationId: org.id,
    securityProfileId: secProfile.id,
    onboardingProfileId: onboardProfile.id,
    commercialSlaId: commercialSla.id,
    supportTierId: tier.id,
  });
  supportMgr.activateProfile(supportProfile.id);
  supportMgr.createPolicy({
    id: "launch.p6.verify.policy",
    supportSlaProfileId: supportProfile.id,
    kind: "RESPONSE_TIME",
    name: "Enterprise Response",
    valueMinutes: 30,
  });
  const supportReady = supportMgr.evaluateReadiness(supportProfile.id);
  check(supportReady.verdict === "READY", `support: ${supportReady.summary}`);

  return {
    product,
    pkg,
    productionProfile,
    apiEntry,
    secProfile,
    supportProfile,
  };
}

function testDocumentationStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, pkg, productionProfile, apiEntry, secProfile, supportProfile } =
    setupStack();

  const mgr = createDocumentationPackageManager({
    managerId: "launch-p6-verify",
  });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const docPkg = mgr.createPackage({
    id: "launch.p6.verify.docpkg",
    name: "Verify Docs Package",
    productId: product.id,
    productionProfileId: productionProfile.id,
    deploymentPackageId: pkg.id,
    securityProfileId: secProfile.id,
    supportSlaProfileId: supportProfile.id,
  });
  check(docPkg.status === "DRAFT", "package draft");

  const apiDoc = mgr.createApiDoc({
    id: "launch.p6.verify.apidoc",
    documentationPackageId: docPkg.id,
    apiCatalogEntryIds: [apiEntry.id],
    title: "API Reference",
  });
  const publishedApi = mgr.publishApiDoc(apiDoc.id);
  check(publishedApi.status === "PUBLISHED", "api doc published");
  check(
    publishedApi.sections.every((s) => s.complete),
    "api sections complete",
  );

  const deployDoc = mgr.createDeploymentDoc({
    id: "launch.p6.verify.deploydoc",
    documentationPackageId: docPkg.id,
    title: "Deployment Guide",
  });
  check(
    mgr.publishDeploymentDoc(deployDoc.id).status === "PUBLISHED",
    "deploy doc published",
  );

  const guide = mgr.createCustomerGuide({
    id: "launch.p6.verify.guide",
    documentationPackageId: docPkg.id,
    title: "Customer Guide",
  });
  check(
    mgr.publishCustomerGuide(guide.id).status === "PUBLISHED",
    "guide published",
  );

  const handbook = mgr.createHandbook({
    id: "launch.p6.verify.handbook",
    documentationPackageId: docPkg.id,
    title: "Operations Handbook",
  });
  check(
    mgr.publishHandbook(handbook.id).status === "PUBLISHED",
    "handbook published",
  );

  const docManifest = mgr.buildManifest(docPkg.id);
  check(docManifest.complete === true, `manifest: ${docManifest.summary}`);
  check(docManifest.apiDocIds.length >= 1, "manifest api docs");
  check(docManifest.handbookIds.length >= 1, "manifest handbooks");

  const readiness = mgr.evaluateReadiness(docPkg.id);
  check(readiness.verdict === "READY", `readiness: ${readiness.summary}`);
  assertDocumentationReadinessReady(readiness);
  check(
    mgr.getPackage(docPkg.id)?.status === "PUBLISHED",
    "package published",
  );

  const registry = mgr.manifest();
  check(registry.documentationId === LAUNCH_DOCUMENTATION_ID, "manifest id");
  check(registry.base === LAUNCH_DOCUMENTATION_BASE, "manifest base");
  check(registry.packageCount >= 1, "registry packages");

  mgr.stop();
  cleanup();
  console.log(
    "✓ package / api / deployment / guide / handbook / manifest / readiness",
  );
}

function testSignoff() {
  const gate = checkLaunchP6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertLaunchP6ReleaseGatePass(gate);
  console.log("✓ documentation package release gate");
}

function main() {
  console.log("Launch P6 Documentation Package Layer verify");
  checkModules();
  checkConstants();
  testDocumentationStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
