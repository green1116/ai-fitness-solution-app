/**
 * Launch P7 — Launch Control Plane Release Gate
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
import { LAUNCH_DOCUMENTATION_ID } from "../../documentation/documentation.constants";
import {
  clearDocumentationLayer,
  createDocumentationPackageManager,
} from "../../documentation/documentation.manager";
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
import {
  clearSupportLayer,
  createSlaSupportPackageManager,
} from "../../support/support.manager";
import {
  CONTROL_MANAGER_STATUSES,
  CONTROL_READINESS_VERDICTS,
  DEPLOYMENT_AGG_STATUSES,
  GONGO_VERDICTS,
  LAUNCH_CONTROL_PLANE_BASE,
  LAUNCH_CONTROL_PLANE_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_ID,
  LAUNCH_CONTROL_PLANE_VERSION,
  LAUNCH_P7_CONTROL_FREEZE_VERSION,
  ORCHESTRATION_STAGES,
  ORCHESTRATION_STATUSES,
  RELEASE_DECISION_VERDICTS,
} from "../control.constants";
import {
  assertControlReadinessReady,
  assertGoNoGo,
  clearControlLayer,
  createLaunchControlPlaneManager,
  getControlRegistryManifest,
} from "../control.manager";

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

export const LAUNCH_P7_SIGNOFF_VERSION = "launch-p7-signoff-1" as const;

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
  clearControlLayer();
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

export function checkLaunchP7ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P7-CONSTANTS",
      "control",
      "Launch control plane version constants",
      LAUNCH_CONTROL_PLANE_ID ===
        "enterprise-launch-p7-launch-control-plane-v1" &&
        LAUNCH_CONTROL_PLANE_VERSION === "launch-p7-1" &&
        LAUNCH_CONTROL_PLANE_BASE ===
          "enterprise-launch-p6-documentation-v1" &&
        LAUNCH_CONTROL_PLANE_FREEZE_VERSION ===
          "launch-control-plane-freeze-1" &&
        LAUNCH_P7_CONTROL_FREEZE_VERSION ===
          "launch-p7-launch-control-plane-freeze-1" &&
        ORCHESTRATION_STATUSES.length === 5 &&
        ORCHESTRATION_STAGES.length === 7 &&
        RELEASE_DECISION_VERDICTS.length === 4 &&
        GONGO_VERDICTS.length === 3 &&
        DEPLOYMENT_AGG_STATUSES.length === 6 &&
        CONTROL_READINESS_VERDICTS.length === 3 &&
        CONTROL_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_CONTROL_PLANE_ID} base=${LAUNCH_CONTROL_PLANE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P7-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P7-PRODUCTIZATION",
      "e12",
      "E12 productization complete freeze tag preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "LN-P7-BASE",
      "documentation",
      "P6 documentation base preserved",
      LAUNCH_CONTROL_PLANE_BASE === LAUNCH_DOCUMENTATION_ID,
      `base=${LAUNCH_CONTROL_PLANE_BASE}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "launch.p7.gate.product",
      name: "Enterprise Fitness Control",
      sku: "EFS-CTL-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "launch.p7.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "launch.p7.gate.package",
      productId: product.id,
      name: "Control Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "launch.p7.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "launch-p7-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "launch.p7.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Control Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "launch.p7.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "launch.p7.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "launch-p7-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "launch.p7.gate.prodprofile",
      name: "Control Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "launch.p7.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "launch.p7.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const onboardMgr = createCustomerOnboardingManager({
      managerId: "launch-p7-gate-onboard",
    });
    onboardMgr.initialize();
    onboardMgr.start();
    const onboardProfile = onboardMgr.createProfile({
      id: "launch.p7.gate.onboard",
      customerName: "Control Customer",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
    });
    onboardMgr.startProvisioning({
      id: "launch.p7.gate.prov",
      onboardingProfileId: onboardProfile.id,
      editionId: edition.id,
      packageId: "launch.p7.gate.package",
      workspaceSlug: "control-customer",
      organizationSlug: "control-customer-org",
    });
    onboardMgr.setConfig({
      onboardingProfileId: onboardProfile.id,
      key: "control",
      value: "enabled",
    });
    const onbChecklist = onboardMgr.createChecklist({
      id: "launch.p7.gate.onb.checklist",
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
      managerId: "launch-p7-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "launch.p7.gate.org",
      name: "Control Gate Org",
      slug: "control-gate-org",
      productId: product.id,
    });
    adminMgr.assignOrgAdmin({
      id: "launch.p7.gate.orgadmin",
      organizationId: org.id,
      userId: "control-reviewer",
      email: "control@example.com",
    });
    adminMgr.assignRole({
      id: "launch.p7.gate.role",
      userId: "control-reviewer",
      organizationId: org.id,
      role: "ORG_ADMIN",
      productTenantId,
    });
    adminMgr.linkTenant(productTenantId, org.id);

    const apiMgr = createApiProductManager({
      managerId: "launch-p7-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();
    const apiEntry = apiMgr.registerCatalogEntry({
      id: "launch.p7.gate.api",
      productId: product.id,
      name: "Control Fitness API",
      path: "/api/v1/control",
      version: "v1",
      requiredScope: "api:read",
    });
    const developer = apiMgr.registerDeveloper({
      id: "launch.p7.gate.dev",
      userId: "control-dev",
      productTenantId,
      scopes: ["api:read"],
    });
    const apiKey = apiMgr.createKey({
      id: "launch.p7.gate.key",
      productTenantId,
      developerId: developer.id,
      name: "Control Gate Key",
      scopes: ["api:read"],
    });

    const secMgr = createSecurityReadinessManager({
      managerId: "launch-p7-gate-security",
    });
    secMgr.initialize();
    secMgr.start();
    const secProfile = secMgr.createProfile({
      id: "launch.p7.gate.secprofile",
      name: "Control Security Profile",
      productId: product.id,
      productionProfileId: productionProfile.id,
      organizationId: org.id,
      productTenantId,
      reviewerUserId: "control-reviewer",
    });
    secMgr.startAccessReview({
      id: "launch.p7.gate.access",
      securityProfileId: secProfile.id,
      permission: "audit:read",
      apiKeyId: apiKey.id,
      apiCatalogEntryId: apiEntry.id,
    });
    const secChecklist = secMgr.createChecklist({
      id: "launch.p7.gate.compliance",
      securityProfileId: secProfile.id,
    });
    secMgr.markChecklistPassed(secChecklist.id);
    secMgr.validateAudit({
      id: "launch.p7.gate.audit",
      securityProfileId: secProfile.id,
    });
    secMgr.evaluateReadiness(secProfile.id);

    const commercialMgr = createCommercialControlManager({
      managerId: "launch-p7-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "launch.p7.gate.sla",
      productId: product.id,
      productTenantId,
      organizationId: org.id,
      tier: "PREMIUM",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "launch-p7-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "launch.p7.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "launch.p7.gate.supprofile",
      name: "Control Support Package",
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
      id: "launch.p7.gate.policy",
      supportSlaProfileId: supportProfile.id,
      kind: "RESPONSE_TIME",
      name: "Premium Response",
      valueMinutes: 120,
    });
    supportMgr.evaluateReadiness(supportProfile.id);

    const docMgr = createDocumentationPackageManager({
      managerId: "launch-p7-gate-docs",
    });
    docMgr.initialize();
    docMgr.start();
    const docPkg = docMgr.createPackage({
      id: "launch.p7.gate.docpkg",
      name: "Control Docs Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
      securityProfileId: secProfile.id,
      supportSlaProfileId: supportProfile.id,
    });
    const apiDoc = docMgr.createApiDoc({
      id: "launch.p7.gate.apidoc",
      documentationPackageId: docPkg.id,
      apiCatalogEntryIds: [apiEntry.id],
      title: "API Reference",
    });
    docMgr.publishApiDoc(apiDoc.id);
    const deployDoc = docMgr.createDeploymentDoc({
      id: "launch.p7.gate.deploydoc",
      documentationPackageId: docPkg.id,
      title: "Deployment Guide",
    });
    docMgr.publishDeploymentDoc(deployDoc.id);
    const guide = docMgr.createCustomerGuide({
      id: "launch.p7.gate.guide",
      documentationPackageId: docPkg.id,
      title: "Customer Guide",
    });
    docMgr.publishCustomerGuide(guide.id);
    const handbook = docMgr.createHandbook({
      id: "launch.p7.gate.handbook",
      documentationPackageId: docPkg.id,
      title: "Operations Handbook",
    });
    docMgr.publishHandbook(handbook.id);
    docMgr.evaluateReadiness(docPkg.id);

    const controlMgr = createLaunchControlPlaneManager({
      managerId: "launch-p7-gate",
    });
    controlMgr.initialize();
    controlMgr.start();

    const orch = controlMgr.createOrchestration({
      id: "launch.p7.gate.orch",
      name: "Enterprise Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      onboardingProfileId: onboardProfile.id,
      securityProfileId: secProfile.id,
      supportSlaProfileId: supportProfile.id,
      documentationPackageId: docPkg.id,
      deploymentPackageId: pkg.id,
    });

    const gonogo = controlMgr.evaluateGoNoGo(orch.id);
    const decision = controlMgr.createDecision({
      id: "launch.p7.gate.decision",
      orchestrationId: orch.id,
      verdict: "APPROVE",
      rationale: "All launch domains ready",
      decidedBy: "launch-executive",
    });
    const metrics = controlMgr.computeMetrics(orch.id);
    const deployment = controlMgr.aggregateDeployment(orch.id);
    const dashboard = controlMgr.buildDashboard(orch.id, {
      refreshGoNoGo: false,
    });
    const readiness = controlMgr.evaluateReadiness(orch.id);
    const registry = getControlRegistryManifest();

    const ok =
      gonogo.verdict === "GO" &&
      decision.verdict === "APPROVE" &&
      metrics.readinessScore >= 80 &&
      (deployment.aggregateStatus === "READY" ||
        deployment.aggregateStatus === "LIVE") &&
      dashboard.goNoGo === "GO" &&
      readiness.verdict === "READY" &&
      registry.controlPlaneId === LAUNCH_CONTROL_PLANE_ID &&
      registry.base === LAUNCH_CONTROL_PLANE_BASE;

    try {
      assertGoNoGo(gonogo);
      assertControlReadinessReady(readiness);
      checks.push(
        check(
          "LN-P7-STACK",
          "control",
          "Orchestration / go-no-go / decision / metrics / dashboard",
          ok,
          `gonogo=${gonogo.verdict} decision=${decision.verdict} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "LN-P7-STACK",
          "control",
          "Orchestration / go-no-go / decision / metrics / dashboard",
          false,
          error instanceof Error ? error.message : "control not ready",
        ),
      );
    }

    controlMgr.stop();
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
        "LN-P7-STACK",
        "control",
        "Orchestration / go-no-go / decision / metrics / dashboard",
        false,
        error instanceof Error ? error.message : "control probe failed",
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
      `launch-p7-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP7ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP7ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P7 release gate failed: ${gate.summary}`);
  }
}
