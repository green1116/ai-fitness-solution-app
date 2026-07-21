/**
 * Launch P5 — SLA Support Package Layer verification
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
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../lib/launch/launch.manager";
import {
  clearOnboardingLayer,
  createCustomerOnboardingManager,
} from "../lib/launch/onboarding/onboarding.manager";
import { LAUNCH_SECURITY_READINESS_ID } from "../lib/launch/security/security.constants";
import {
  clearSecurityLayer,
  createSecurityReadinessManager,
} from "../lib/launch/security/security.manager";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_WORKFLOW_STEPS,
  LAUNCH_P5_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_BASE,
  LAUNCH_SLA_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_ID,
  LAUNCH_SLA_SUPPORT_VERSION,
  SUPPORT_MANAGER_STATUSES,
  SUPPORT_POLICY_KINDS,
  SUPPORT_READINESS_VERDICTS,
  SUPPORT_SLA_PROFILE_STATUSES,
  SUPPORT_TIERS,
} from "../lib/launch/support/support.constants";
import {
  assertSupportReadinessReady,
  clearSupportLayer,
  createSlaSupportPackageManager,
} from "../lib/launch/support/support.manager";
import {
  assertLaunchP5ReleaseGatePass,
  checkLaunchP5ReleaseGate,
} from "../lib/launch/support/verify/support.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
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
    "lib/launch/support/support.constants.ts",
    "lib/launch/support/support.types.ts",
    "lib/launch/support/support.profile.ts",
    "lib/launch/support/support.tier.ts",
    "lib/launch/support/support.incident.ts",
    "lib/launch/support/support.policy.ts",
    "lib/launch/support/support.metrics.ts",
    "lib/launch/support/support.readiness.ts",
    "lib/launch/support/support.manager.ts",
    "lib/launch/support/verify/support.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_SLA_SUPPORT_ID === "enterprise-launch-p5-sla-support-v1",
    "support id",
  );
  check(LAUNCH_SLA_SUPPORT_VERSION === "launch-p5-1", "support version");
  check(
    LAUNCH_SLA_SUPPORT_FREEZE_VERSION === "launch-sla-support-freeze-1",
    "support freeze",
  );
  check(
    LAUNCH_SLA_SUPPORT_BASE === LAUNCH_SECURITY_READINESS_ID,
    "support base = p4 id",
  );
  check(
    LAUNCH_P5_SUPPORT_FREEZE_VERSION === "launch-p5-sla-support-freeze-1",
    "p5 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(SUPPORT_SLA_PROFILE_STATUSES.length === 5, "profile statuses");
  check(SUPPORT_TIERS.length === 4, "support tiers");
  check(INCIDENT_SEVERITIES.length === 4, "severities");
  check(INCIDENT_WORKFLOW_STEPS.length === 5, "workflow steps");
  check(SUPPORT_POLICY_KINDS.length === 4, "policy kinds");
  check(SUPPORT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(SUPPORT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupLaunchStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "launch.p5.verify.product",
    name: "AI Fitness Support",
    sku: "AIFE-SUP-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "launch.p5.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "launch.p5.verify.package",
    productId: product.id,
    name: "Support Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const plan = createPricingPlan({
    id: "launch.p5.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const deplMgr = createDeploymentPackageManager({
    managerId: "launch-p5-verify-depl",
  });
  deplMgr.initialize();
  deplMgr.start();

  const pkg = deplMgr.createPackage({
    id: "launch.p5.verify.deplpkg",
    productId: product.id,
    editionId: edition.id,
    pricingPlanId: plan.id,
    name: "Verify Deploy Package",
    version: "1.0.0",
  });
  const env = deplMgr.createEnvironment({
    id: "launch.p5.verify.env",
    deploymentPackageId: pkg.id,
    kind: "PRODUCTION",
    name: "Production",
  });
  deplMgr.validate(pkg.id, { environmentProfileId: env.id });
  const artifact = deplMgr.buildArtifact({
    id: "launch.p5.verify.artifact",
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
  });
  deplMgr.signArtifact(artifact.id);

  const launchMgr = createProductionLaunchManager({
    managerId: "launch-p5-verify-launch",
  });
  launchMgr.initialize();
  launchMgr.start();

  const productionProfile = launchMgr.createProfile({
    id: "launch.p5.verify.prodprofile",
    name: "Verify Production",
    productId: product.id,
    deploymentPackageId: pkg.id,
  });
  const releaseChecklist = launchMgr.createChecklist({
    id: "launch.p5.verify.release.checklist",
    productionProfileId: productionProfile.id,
  });
  launchMgr.markChecklistPassed(releaseChecklist.id);
  launchMgr.registerArtifact({
    id: "launch.p5.verify.prodartifact",
    productionProfileId: productionProfile.id,
    kind: "DEPLOYMENT_PACKAGE",
    refId: pkg.id,
  });
  launchMgr.setProfileStatus(productionProfile.id, "READY");

  return { product, edition, pkg, productionProfile, launchMgr, deplMgr };
}

function testSupportStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, edition, pkg, productionProfile } = setupLaunchStack();

  const onboardMgr = createCustomerOnboardingManager({
    managerId: "launch-p5-verify-onboard",
  });
  onboardMgr.initialize();
  onboardMgr.start();
  const onboardProfile = onboardMgr.createProfile({
    id: "launch.p5.verify.onboard",
    customerName: "Verify Support Customer",
    productId: product.id,
    productionProfileId: productionProfile.id,
    deploymentPackageId: pkg.id,
  });
  onboardMgr.startProvisioning({
    id: "launch.p5.verify.prov",
    onboardingProfileId: onboardProfile.id,
    editionId: edition.id,
    packageId: "launch.p5.verify.package",
    workspaceSlug: "verify-support",
    organizationSlug: "verify-support-org",
  });
  onboardMgr.setConfig({
    onboardingProfileId: onboardProfile.id,
    key: "locale",
    value: "en-US",
  });
  const onbChecklist = onboardMgr.createChecklist({
    id: "launch.p5.verify.onb.checklist",
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
    managerId: "launch-p5-verify-admin",
  });
  adminMgr.initialize();
  adminMgr.start();
  const org = adminMgr.registerOrganization({
    id: "launch.p5.verify.org",
    name: "Verify Support Org",
    slug: "verify-support-org-2",
    productId: product.id,
  });
  adminMgr.assignOrgAdmin({
    id: "launch.p5.verify.orgadmin",
    organizationId: org.id,
    userId: "verify-reviewer",
    email: "reviewer@verify.example",
  });
  adminMgr.assignRole({
    id: "launch.p5.verify.role",
    userId: "verify-reviewer",
    organizationId: org.id,
    role: "ORG_ADMIN",
    productTenantId,
  });
  adminMgr.linkTenant(productTenantId, org.id);

  const apiMgr = createApiProductManager({
    managerId: "launch-p5-verify-api",
  });
  apiMgr.initialize();
  apiMgr.start();
  const apiEntry = apiMgr.registerCatalogEntry({
    id: "launch.p5.verify.api",
    productId: product.id,
    name: "Verify Support API",
    path: "/api/v1/verify-support",
    version: "v1",
    requiredScope: "api:read",
  });
  const developer = apiMgr.registerDeveloper({
    id: "launch.p5.verify.dev",
    userId: "verify-dev",
    productTenantId,
    scopes: ["api:read"],
  });
  const apiKey = apiMgr.createKey({
    id: "launch.p5.verify.key",
    productTenantId,
    developerId: developer.id,
    name: "Verify Key",
    scopes: ["api:read"],
  });

  const secMgr = createSecurityReadinessManager({
    managerId: "launch-p5-verify-security",
  });
  secMgr.initialize();
  secMgr.start();
  const secProfile = secMgr.createProfile({
    id: "launch.p5.verify.secprofile",
    name: "Verify Security Profile",
    productId: product.id,
    productionProfileId: productionProfile.id,
    organizationId: org.id,
    productTenantId,
    reviewerUserId: "verify-reviewer",
  });
  secMgr.startAccessReview({
    id: "launch.p5.verify.access",
    securityProfileId: secProfile.id,
    permission: "audit:read",
    apiKeyId: apiKey.id,
    apiCatalogEntryId: apiEntry.id,
  });
  const secChecklist = secMgr.createChecklist({
    id: "launch.p5.verify.compliance",
    securityProfileId: secProfile.id,
  });
  secMgr.markChecklistPassed(secChecklist.id);
  secMgr.validateAudit({
    id: "launch.p5.verify.audit",
    securityProfileId: secProfile.id,
  });
  const securityReady = secMgr.evaluateReadiness(secProfile.id);
  check(securityReady.verdict === "READY", `security: ${securityReady.summary}`);

  const commercialMgr = createCommercialControlManager({
    managerId: "launch-p5-verify-commercial",
  });
  commercialMgr.initialize();
  commercialMgr.start();
  const commercialSla = commercialMgr.createSla({
    id: "launch.p5.verify.sla",
    productId: product.id,
    productTenantId,
    organizationId: org.id,
    tier: "ENTERPRISE",
  });
  check(commercialSla.status === "ACTIVE", "commercial sla active");

  const mgr = createSlaSupportPackageManager({
    managerId: "launch-p5-verify",
  });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const tier = mgr.createTier({
    id: "launch.p5.verify.tier",
    name: "Enterprise Support",
    tier: "ENTERPRISE",
  });
  check(tier.responseMinutes === 30, "tier response minutes");

  const profile = mgr.createProfile({
    id: "launch.p5.verify.supprofile",
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
  check(profile.status === "DRAFT", "profile draft");

  const active = mgr.activateProfile(profile.id);
  check(active.status === "ACTIVE", "profile active");

  mgr.createPolicy({
    id: "launch.p5.verify.policy",
    supportSlaProfileId: profile.id,
    kind: "RESPONSE_TIME",
    name: "Enterprise Response",
    valueMinutes: 30,
  });

  const incident = mgr.openIncident({
    id: "launch.p5.verify.incident",
    supportSlaProfileId: profile.id,
    title: "Dashboard unavailable",
    severity: "SEV1",
  });
  check(incident.status === "OPEN", "incident open");
  mgr.advanceIncident({ incidentId: incident.id, detail: "acked" });
  const resolved = mgr.resolveIncident(incident.id, "fixed");
  check(resolved.status === "RESOLVED", "incident resolved");
  check(typeof resolved.responseMinutes === "number", "response measured");

  const metrics = mgr.computeMetrics(profile.id);
  check(metrics.incidentCount >= 1, "metrics incidents");
  check(metrics.withinSlaCount >= 1, "within sla");

  const readiness = mgr.evaluateReadiness(profile.id);
  check(readiness.verdict === "READY", `readiness: ${readiness.summary}`);
  assertSupportReadinessReady(readiness);

  const registry = mgr.manifest();
  check(registry.slaSupportId === LAUNCH_SLA_SUPPORT_ID, "manifest id");
  check(registry.base === LAUNCH_SLA_SUPPORT_BASE, "manifest base");
  check(registry.profileCount >= 1, "manifest profiles");
  check(registry.incidentCount >= 1, "manifest incidents");

  mgr.stop();
  cleanup();
  console.log(
    "✓ tier / profile / policy / incident / metrics / readiness / manager",
  );
}

function testSignoff() {
  const gate = checkLaunchP5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertLaunchP5ReleaseGatePass(gate);
  console.log("✓ sla support package release gate");
}

function main() {
  console.log("Launch P5 SLA Support Package Layer verify");
  checkModules();
  checkConstants();
  testSupportStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
