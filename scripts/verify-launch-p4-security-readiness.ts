/**
 * Launch P4 — Security Readiness Layer verification
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
  clearDemoLayer,
  createDemoEnvironmentManager,
} from "../lib/launch/demo/demo.manager";
import { LAUNCH_DEMO_ENVIRONMENT_ID } from "../lib/launch/demo/demo.constants";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../lib/launch/launch.manager";
import { clearOnboardingLayer } from "../lib/launch/onboarding/onboarding.manager";
import {
  ACCESS_REVIEW_TARGETS,
  AUDIT_VALIDATION_STATUSES,
  COMPLIANCE_CHECK_IDS,
  LAUNCH_P4_SECURITY_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_BASE,
  LAUNCH_SECURITY_READINESS_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_ID,
  LAUNCH_SECURITY_READINESS_VERSION,
  SECURITY_MANAGER_STATUSES,
  SECURITY_PROFILE_STATUSES,
  SECURITY_READINESS_VERDICTS,
} from "../lib/launch/security/security.constants";
import {
  assertSecurityReadinessReady,
  clearSecurityLayer,
  createSecurityReadinessManager,
} from "../lib/launch/security/security.manager";
import {
  assertLaunchP4ReleaseGatePass,
  checkLaunchP4ReleaseGate,
} from "../lib/launch/security/verify/security.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
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
    "lib/launch/security/security.constants.ts",
    "lib/launch/security/security.types.ts",
    "lib/launch/security/security.profile.ts",
    "lib/launch/security/security.access.ts",
    "lib/launch/security/security.compliance.ts",
    "lib/launch/security/security.audit.ts",
    "lib/launch/security/security.readiness.ts",
    "lib/launch/security/security.manager.ts",
    "lib/launch/security/verify/security.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_SECURITY_READINESS_ID ===
      "enterprise-launch-p4-security-readiness-v1",
    "security id",
  );
  check(
    LAUNCH_SECURITY_READINESS_VERSION === "launch-p4-1",
    "security version",
  );
  check(
    LAUNCH_SECURITY_READINESS_FREEZE_VERSION ===
      "launch-security-readiness-freeze-1",
    "security freeze",
  );
  check(
    LAUNCH_SECURITY_READINESS_BASE === LAUNCH_DEMO_ENVIRONMENT_ID,
    "security base = p3 id",
  );
  check(
    LAUNCH_P4_SECURITY_FREEZE_VERSION ===
      "launch-p4-security-readiness-freeze-1",
    "p4 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(SECURITY_PROFILE_STATUSES.length === 5, "profile statuses");
  check(ACCESS_REVIEW_TARGETS.length === 3, "access targets");
  check(COMPLIANCE_CHECK_IDS.length === 6, "compliance checks");
  check(AUDIT_VALIDATION_STATUSES.length === 4, "audit statuses");
  check(SECURITY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(SECURITY_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupLaunchStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "launch.p4.verify.product",
    name: "AI Fitness Security",
    sku: "AIFE-SEC-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "launch.p4.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "launch.p4.verify.package",
    productId: product.id,
    name: "Security Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const plan = createPricingPlan({
    id: "launch.p4.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const deplMgr = createDeploymentPackageManager({
    managerId: "launch-p4-verify-depl",
  });
  deplMgr.initialize();
  deplMgr.start();

  const pkg = deplMgr.createPackage({
    id: "launch.p4.verify.deplpkg",
    productId: product.id,
    editionId: edition.id,
    pricingPlanId: plan.id,
    name: "Verify Deploy Package",
    version: "1.0.0",
  });

  const env = deplMgr.createEnvironment({
    id: "launch.p4.verify.env",
    deploymentPackageId: pkg.id,
    kind: "PRODUCTION",
    name: "Production",
  });
  deplMgr.validate(pkg.id, { environmentProfileId: env.id });
  const artifact = deplMgr.buildArtifact({
    id: "launch.p4.verify.artifact",
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
  });
  deplMgr.signArtifact(artifact.id);

  const launchMgr = createProductionLaunchManager({
    managerId: "launch-p4-verify-launch",
  });
  launchMgr.initialize();
  launchMgr.start();

  const productionProfile = launchMgr.createProfile({
    id: "launch.p4.verify.prodprofile",
    name: "Verify Production",
    productId: product.id,
    deploymentPackageId: pkg.id,
  });
  const releaseChecklist = launchMgr.createChecklist({
    id: "launch.p4.verify.release.checklist",
    productionProfileId: productionProfile.id,
  });
  launchMgr.markChecklistPassed(releaseChecklist.id);
  launchMgr.registerArtifact({
    id: "launch.p4.verify.prodartifact",
    productionProfileId: productionProfile.id,
    kind: "DEPLOYMENT_PACKAGE",
    refId: pkg.id,
  });
  launchMgr.setProfileStatus(productionProfile.id, "READY");

  return { product, pkg, productionProfile, launchMgr, deplMgr };
}

function testSecurityStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, pkg, productionProfile } = setupLaunchStack();

  const demoMgr = createDemoEnvironmentManager({
    managerId: "launch-p4-verify-demo",
  });
  demoMgr.initialize();
  demoMgr.start();

  const demoTenant = demoMgr.createTenant({
    id: "launch.p4.verify.demotenant",
    name: "Verify Security Demo",
    productId: product.id,
    productionProfileId: productionProfile.id,
    deploymentPackageId: pkg.id,
  });
  demoMgr.createWorkspace({
    id: "launch.p4.verify.demows",
    demoTenantId: demoTenant.id,
    slug: "verify-security-demo",
  });
  const sample = demoMgr.createSampleProfile({
    id: "launch.p4.verify.sample",
    demoTenantId: demoTenant.id,
    name: "Verify Dataset",
  });
  demoMgr.startScenario({
    id: "launch.p4.verify.scenario",
    demoTenantId: demoTenant.id,
    sampleDataProfileId: sample.id,
  });
  const productTenantId = demoMgr.getTenant(demoTenant.id)!.productTenantId!;

  const adminMgr = createAdminConsoleManager({
    managerId: "launch-p4-verify-admin",
  });
  adminMgr.initialize();
  adminMgr.start();
  const org = adminMgr.registerOrganization({
    id: "launch.p4.verify.org",
    name: "Verify Security Org",
    slug: "verify-security-org",
    productId: product.id,
  });
  adminMgr.assignOrgAdmin({
    id: "launch.p4.verify.orgadmin",
    organizationId: org.id,
    userId: "verify-reviewer",
    email: "reviewer@verify.example",
  });
  adminMgr.assignRole({
    id: "launch.p4.verify.role",
    userId: "verify-reviewer",
    organizationId: org.id,
    role: "ORG_ADMIN",
    productTenantId,
  });
  adminMgr.linkTenant(productTenantId, org.id);

  const apiMgr = createApiProductManager({
    managerId: "launch-p4-verify-api",
  });
  apiMgr.initialize();
  apiMgr.start();
  const apiEntry = apiMgr.registerCatalogEntry({
    id: "launch.p4.verify.api",
    productId: product.id,
    name: "Verify API",
    path: "/api/v1/verify",
    version: "v1",
    requiredScope: "api:read",
  });
  const developer = apiMgr.registerDeveloper({
    id: "launch.p4.verify.dev",
    userId: "verify-dev",
    productTenantId,
    scopes: ["api:read"],
  });
  const apiKey = apiMgr.createKey({
    id: "launch.p4.verify.key",
    productTenantId,
    developerId: developer.id,
    name: "Verify Key",
    scopes: ["api:read"],
  });

  const mgr = createSecurityReadinessManager({
    managerId: "launch-p4-verify",
  });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const profile = mgr.createProfile({
    id: "launch.p4.verify.secprofile",
    name: "Verify Security Profile",
    productId: product.id,
    productionProfileId: productionProfile.id,
    organizationId: org.id,
    productTenantId,
    demoTenantId: demoTenant.id,
    reviewerUserId: "verify-reviewer",
  });
  check(profile.status === "DRAFT", "profile draft");

  const access = mgr.startAccessReview({
    id: "launch.p4.verify.access",
    securityProfileId: profile.id,
    permission: "audit:read",
    apiKeyId: apiKey.id,
    apiCatalogEntryId: apiEntry.id,
  });
  check(access.passed === true, `access: ${access.findings.map((f) => f.detail).join("; ")}`);
  check(access.status === "PASSED", "access passed");

  const checklist = mgr.createChecklist({
    id: "launch.p4.verify.compliance",
    securityProfileId: profile.id,
  });
  const completed = mgr.markChecklistPassed(checklist.id);
  check(completed.complete === true, "compliance complete");

  const audit = mgr.validateAudit({
    id: "launch.p4.verify.audit",
    securityProfileId: profile.id,
  });
  check(audit.status === "VALID", `audit: ${audit.detail}`);
  check(audit.adminAuditCount >= 1, "admin audits");
  check(audit.apiAuditCount >= 1, "api audits");

  const readiness = mgr.evaluateReadiness(profile.id);
  check(readiness.verdict === "READY", `readiness: ${readiness.summary}`);
  assertSecurityReadinessReady(readiness);
  check(mgr.getProfile(profile.id)?.status === "APPROVED", "profile approved");

  const registry = mgr.manifest();
  check(
    registry.securityReadinessId === LAUNCH_SECURITY_READINESS_ID,
    "manifest id",
  );
  check(registry.base === LAUNCH_SECURITY_READINESS_BASE, "manifest base");
  check(registry.profileCount >= 1, "manifest profiles");
  check(registry.accessReviewCount >= 1, "manifest reviews");

  mgr.stop();
  cleanup();
  console.log(
    "✓ profile / access / compliance / audit / readiness / manager",
  );
}

function testSignoff() {
  const gate = checkLaunchP4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertLaunchP4ReleaseGatePass(gate);
  console.log("✓ security readiness release gate");
}

function main() {
  console.log("Launch P4 Security Readiness Layer verify");
  checkModules();
  checkConstants();
  testSecurityStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
