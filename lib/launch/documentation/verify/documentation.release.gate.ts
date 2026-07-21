/**
 * Launch P6 — Documentation Package Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  clearAdminConsoleLayer,
  createAdminConsoleManager,
} from "../../../product/e12/admin/admin.manager";
import {
  clearApiProductLayer,
  createApiProductManager,
} from "../../../product/e12/api/api.manager";
import { createPricingPlan } from "../../../product/e12/billing/billing.plan";
import { clearBillingCommercialLayer } from "../../../product/e12/billing/billing.manager";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../../../product/e12/catalog/product.feature.catalog";
import {
  clearCommercialControlLayer,
  createCommercialControlManager,
} from "../../../product/e12/commercial/commercial.manager";
import { E12_PRODUCT_BASE } from "../../../product/e12/core/product.constants";
import {
  clearDeploymentLayer,
  createDeploymentPackageManager,
} from "../../../product/e12/deployment/deployment.manager";
import { createProductEdition } from "../../../product/e12/edition/product.edition";
import { registerProductIdentity } from "../../../product/e12/identity/product.identity";
import { createCapabilityPackage } from "../../../product/e12/packaging/product.capability.package";
import { clearProductRegistry } from "../../../product/e12/registry/product.registry";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { clearTenantProductLayer } from "../../../product/e12/tenant/tenant.manager";
import { clearDemoLayer } from "../../demo/demo.manager";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../../launch.manager";
import {
  clearOnboardingLayer,
  createCustomerOnboardingManager,
} from "../../onboarding/onboarding.manager";
import {
  clearSecurityLayer,
  createSecurityReadinessManager,
} from "../../security/security.manager";
import { LAUNCH_SLA_SUPPORT_ID } from "../../support/support.constants";
import {
  clearSupportLayer,
  createSlaSupportPackageManager,
} from "../../support/support.manager";
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
} from "../documentation.constants";
import {
  assertDocumentationReadinessReady,
  clearDocumentationLayer,
  createDocumentationPackageManager,
  getDocumentationRegistryManifest,
} from "../documentation.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const LAUNCH_P6_SIGNOFF_VERSION = "launch-p6-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
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

export function checkLaunchP6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P6-CONSTANTS",
      "documentation",
      "Documentation version constants",
      LAUNCH_DOCUMENTATION_ID ===
        "enterprise-launch-p6-documentation-v1" &&
        LAUNCH_DOCUMENTATION_VERSION === "launch-p6-1" &&
        LAUNCH_DOCUMENTATION_BASE ===
          "enterprise-launch-p5-sla-support-v1" &&
        LAUNCH_DOCUMENTATION_FREEZE_VERSION ===
          "launch-documentation-freeze-1" &&
        LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION ===
          "launch-p6-documentation-freeze-1" &&
        DOCUMENTATION_PACKAGE_STATUSES.length === 4 &&
        API_DOC_SECTIONS.length === 5 &&
        DEPLOYMENT_DOC_SECTIONS.length === 5 &&
        CUSTOMER_GUIDE_SECTIONS.length === 5 &&
        HANDBOOK_SECTIONS.length === 5 &&
        DOCUMENTATION_READINESS_VERDICTS.length === 3 &&
        DOCUMENTATION_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_DOCUMENTATION_ID} base=${LAUNCH_DOCUMENTATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P6-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P6-PRODUCTIZATION",
      "e12",
      "E12 productization complete freeze tag preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "LN-P6-BASE",
      "support",
      "P5 SLA support base preserved",
      LAUNCH_DOCUMENTATION_BASE === LAUNCH_SLA_SUPPORT_ID,
      `base=${LAUNCH_DOCUMENTATION_BASE}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "launch.p6.gate.product",
      name: "Enterprise Fitness Docs",
      sku: "EFS-DOC-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "launch.p6.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "launch.p6.gate.package",
      productId: product.id,
      name: "Docs Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "launch.p6.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "launch-p6-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();

    const pkg = deplMgr.createPackage({
      id: "launch.p6.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Docs Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "launch.p6.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "launch.p6.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "launch-p6-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();

    const productionProfile = launchMgr.createProfile({
      id: "launch.p6.gate.prodprofile",
      name: "Docs Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "launch.p6.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "launch.p6.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const onboardMgr = createCustomerOnboardingManager({
      managerId: "launch-p6-gate-onboard",
    });
    onboardMgr.initialize();
    onboardMgr.start();
    const onboardProfile = onboardMgr.createProfile({
      id: "launch.p6.gate.onboard",
      customerName: "Docs Customer",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
    });
    onboardMgr.startProvisioning({
      id: "launch.p6.gate.prov",
      onboardingProfileId: onboardProfile.id,
      editionId: edition.id,
      packageId: "launch.p6.gate.package",
      workspaceSlug: "docs-customer",
      organizationSlug: "docs-customer-org",
    });
    onboardMgr.setConfig({
      onboardingProfileId: onboardProfile.id,
      key: "docs",
      value: "enabled",
    });
    const onbChecklist = onboardMgr.createChecklist({
      id: "launch.p6.gate.onb.checklist",
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
      managerId: "launch-p6-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "launch.p6.gate.org",
      name: "Docs Gate Org",
      slug: "docs-gate-org",
      productId: product.id,
    });
    adminMgr.assignOrgAdmin({
      id: "launch.p6.gate.orgadmin",
      organizationId: org.id,
      userId: "docs-reviewer",
      email: "docs@example.com",
    });
    adminMgr.assignRole({
      id: "launch.p6.gate.role",
      userId: "docs-reviewer",
      organizationId: org.id,
      role: "ORG_ADMIN",
      productTenantId,
    });
    adminMgr.linkTenant(productTenantId, org.id);

    const apiMgr = createApiProductManager({
      managerId: "launch-p6-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();
    const apiEntry = apiMgr.registerCatalogEntry({
      id: "launch.p6.gate.api",
      productId: product.id,
      name: "Docs Fitness API",
      path: "/api/v1/docs",
      version: "v1",
      requiredScope: "api:read",
    });
    const developer = apiMgr.registerDeveloper({
      id: "launch.p6.gate.dev",
      userId: "docs-dev",
      productTenantId,
      scopes: ["api:read"],
    });
    const apiKey = apiMgr.createKey({
      id: "launch.p6.gate.key",
      productTenantId,
      developerId: developer.id,
      name: "Docs Gate Key",
      scopes: ["api:read"],
    });

    const secMgr = createSecurityReadinessManager({
      managerId: "launch-p6-gate-security",
    });
    secMgr.initialize();
    secMgr.start();
    const secProfile = secMgr.createProfile({
      id: "launch.p6.gate.secprofile",
      name: "Docs Security Profile",
      productId: product.id,
      productionProfileId: productionProfile.id,
      organizationId: org.id,
      productTenantId,
      reviewerUserId: "docs-reviewer",
    });
    secMgr.startAccessReview({
      id: "launch.p6.gate.access",
      securityProfileId: secProfile.id,
      permission: "audit:read",
      apiKeyId: apiKey.id,
      apiCatalogEntryId: apiEntry.id,
    });
    const secChecklist = secMgr.createChecklist({
      id: "launch.p6.gate.compliance",
      securityProfileId: secProfile.id,
    });
    secMgr.markChecklistPassed(secChecklist.id);
    secMgr.validateAudit({
      id: "launch.p6.gate.audit",
      securityProfileId: secProfile.id,
    });
    secMgr.evaluateReadiness(secProfile.id);

    const commercialMgr = createCommercialControlManager({
      managerId: "launch-p6-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "launch.p6.gate.sla",
      productId: product.id,
      productTenantId,
      organizationId: org.id,
      tier: "PREMIUM",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "launch-p6-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "launch.p6.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "launch.p6.gate.supprofile",
      name: "Docs Support Package",
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
      id: "launch.p6.gate.policy",
      supportSlaProfileId: supportProfile.id,
      kind: "RESPONSE_TIME",
      name: "Premium Response",
      valueMinutes: 120,
    });
    supportMgr.evaluateReadiness(supportProfile.id);

    const docMgr = createDocumentationPackageManager({
      managerId: "launch-p6-gate",
    });
    docMgr.initialize();
    docMgr.start();

    const docPkg = docMgr.createPackage({
      id: "launch.p6.gate.docpkg",
      name: "Enterprise Docs Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
      securityProfileId: secProfile.id,
      supportSlaProfileId: supportProfile.id,
      version: "1.0.0",
    });

    const apiDoc = docMgr.createApiDoc({
      id: "launch.p6.gate.apidoc",
      documentationPackageId: docPkg.id,
      apiCatalogEntryIds: [apiEntry.id],
      title: "Fitness API Reference",
    });
    docMgr.publishApiDoc(apiDoc.id);

    const deployDoc = docMgr.createDeploymentDoc({
      id: "launch.p6.gate.deploydoc",
      documentationPackageId: docPkg.id,
      title: "Deployment Guide",
    });
    docMgr.publishDeploymentDoc(deployDoc.id);

    const guide = docMgr.createCustomerGuide({
      id: "launch.p6.gate.guide",
      documentationPackageId: docPkg.id,
      title: "Customer Guide",
    });
    docMgr.publishCustomerGuide(guide.id);

    const handbook = docMgr.createHandbook({
      id: "launch.p6.gate.handbook",
      documentationPackageId: docPkg.id,
      title: "Operations Handbook",
    });
    docMgr.publishHandbook(handbook.id);

    const docManifest = docMgr.buildManifest(docPkg.id);
    const readiness = docMgr.evaluateReadiness(docPkg.id);
    const registry = getDocumentationRegistryManifest();

    const ok =
      docManifest.complete === true &&
      readiness.verdict === "READY" &&
      registry.documentationId === LAUNCH_DOCUMENTATION_ID &&
      registry.base === LAUNCH_DOCUMENTATION_BASE;

    try {
      assertDocumentationReadinessReady(readiness);
      checks.push(
        check(
          "LN-P6-STACK",
          "documentation",
          "API / deployment / guide / handbook / manifest / readiness",
          ok,
          `manifest=${docManifest.complete} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "LN-P6-STACK",
          "documentation",
          "API / deployment / guide / handbook / manifest / readiness",
          false,
          error instanceof Error ? error.message : "documentation not ready",
        ),
      );
    }

    docMgr.stop();
    supportMgr.stop();
    commercialMgr.stop();
    secMgr.stop();
    apiMgr.stop();
    adminMgr.stop();
    onboardMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "LN-P6-STACK",
        "documentation",
        "API / deployment / guide / handbook / manifest / readiness",
        false,
        error instanceof Error ? error.message : "documentation probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `launch-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP6ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P6 release gate failed: ${gate.summary}`);
  }
}
