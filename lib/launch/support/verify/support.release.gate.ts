/**
 * Launch P5 — SLA Support Package Release Gate
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
import { LAUNCH_SECURITY_READINESS_ID } from "../../security/security.constants";
import {
  clearSecurityLayer,
  createSecurityReadinessManager,
} from "../../security/security.manager";
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
} from "../support.constants";
import {
  assertSupportReadinessReady,
  clearSupportLayer,
  createSlaSupportPackageManager,
  getSupportRegistryManifest,
} from "../support.manager";

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

export const LAUNCH_P5_SIGNOFF_VERSION = "launch-p5-signoff-1" as const;

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

export function checkLaunchP5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P5-CONSTANTS",
      "support",
      "SLA support version constants",
      LAUNCH_SLA_SUPPORT_ID === "enterprise-launch-p5-sla-support-v1" &&
        LAUNCH_SLA_SUPPORT_VERSION === "launch-p5-1" &&
        LAUNCH_SLA_SUPPORT_BASE ===
          "enterprise-launch-p4-security-readiness-v1" &&
        LAUNCH_SLA_SUPPORT_FREEZE_VERSION === "launch-sla-support-freeze-1" &&
        LAUNCH_P5_SUPPORT_FREEZE_VERSION ===
          "launch-p5-sla-support-freeze-1" &&
        SUPPORT_SLA_PROFILE_STATUSES.length === 5 &&
        SUPPORT_TIERS.length === 4 &&
        INCIDENT_SEVERITIES.length === 4 &&
        INCIDENT_WORKFLOW_STEPS.length === 5 &&
        SUPPORT_POLICY_KINDS.length === 4 &&
        SUPPORT_READINESS_VERDICTS.length === 3 &&
        SUPPORT_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_SLA_SUPPORT_ID} base=${LAUNCH_SLA_SUPPORT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P5-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P5-PRODUCTIZATION",
      "e12",
      "E12 productization complete freeze tag preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "LN-P5-BASE",
      "security",
      "P4 security readiness base preserved",
      LAUNCH_SLA_SUPPORT_BASE === LAUNCH_SECURITY_READINESS_ID,
      `base=${LAUNCH_SLA_SUPPORT_BASE}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "launch.p5.gate.product",
      name: "Enterprise Fitness Support",
      sku: "EFS-SUP-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "launch.p5.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "launch.p5.gate.package",
      productId: product.id,
      name: "Support Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "launch.p5.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "launch-p5-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();

    const pkg = deplMgr.createPackage({
      id: "launch.p5.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Support Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "launch.p5.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "launch.p5.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "launch-p5-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();

    const productionProfile = launchMgr.createProfile({
      id: "launch.p5.gate.prodprofile",
      name: "Support Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "launch.p5.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "launch.p5.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const onboardMgr = createCustomerOnboardingManager({
      managerId: "launch-p5-gate-onboard",
    });
    onboardMgr.initialize();
    onboardMgr.start();

    const onboardProfile = onboardMgr.createProfile({
      id: "launch.p5.gate.onboard",
      customerName: "Support Customer",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
    });
    onboardMgr.startProvisioning({
      id: "launch.p5.gate.prov",
      onboardingProfileId: onboardProfile.id,
      editionId: edition.id,
      packageId: "launch.p5.gate.package",
      workspaceSlug: "support-customer",
      organizationSlug: "support-customer-org",
    });
    onboardMgr.setConfig({
      onboardingProfileId: onboardProfile.id,
      key: "support",
      value: "enabled",
    });
    const onbChecklist = onboardMgr.createChecklist({
      id: "launch.p5.gate.onb.checklist",
      onboardingProfileId: onboardProfile.id,
    });
    onboardMgr.markChecklistPassed(onbChecklist.id);
    onboardMgr.prepareActivation(onboardProfile.id);
    onboardMgr.setActivation({
      onboardingProfileId: onboardProfile.id,
      state: "ACTIVE",
      detail: "go-live for support",
    });

    const refreshedOnboard = onboardMgr.getProfile(onboardProfile.id)!;
    const productTenantId = refreshedOnboard.productTenantId!;

    const adminMgr = createAdminConsoleManager({
      managerId: "launch-p5-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "launch.p5.gate.org",
      name: "Support Gate Org",
      slug: "support-gate-org",
      productId: product.id,
    });
    adminMgr.assignOrgAdmin({
      id: "launch.p5.gate.orgadmin",
      organizationId: org.id,
      userId: "support-reviewer",
      email: "support@example.com",
    });
    adminMgr.assignRole({
      id: "launch.p5.gate.role",
      userId: "support-reviewer",
      organizationId: org.id,
      role: "ORG_ADMIN",
      productTenantId,
    });
    adminMgr.linkTenant(productTenantId, org.id);
    const organizationId = org.id;

    const apiMgr = createApiProductManager({
      managerId: "launch-p5-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();
    const apiEntry = apiMgr.registerCatalogEntry({
      id: "launch.p5.gate.api",
      productId: product.id,
      name: "Support API",
      path: "/api/v1/support",
      version: "v1",
      requiredScope: "api:read",
    });
    const developer = apiMgr.registerDeveloper({
      id: "launch.p5.gate.dev",
      userId: "support-dev",
      productTenantId,
      scopes: ["api:read"],
    });
    const apiKey = apiMgr.createKey({
      id: "launch.p5.gate.key",
      productTenantId,
      developerId: developer.id,
      name: "Support Gate Key",
      scopes: ["api:read"],
    });

    const secMgr = createSecurityReadinessManager({
      managerId: "launch-p5-gate-security",
    });
    secMgr.initialize();
    secMgr.start();
    const secProfile = secMgr.createProfile({
      id: "launch.p5.gate.secprofile",
      name: "Support Security Profile",
      productId: product.id,
      productionProfileId: productionProfile.id,
      organizationId,
      productTenantId,
      reviewerUserId: "support-reviewer",
    });
    secMgr.startAccessReview({
      id: "launch.p5.gate.access",
      securityProfileId: secProfile.id,
      permission: "audit:read",
      apiKeyId: apiKey.id,
      apiCatalogEntryId: apiEntry.id,
    });
    const secChecklist = secMgr.createChecklist({
      id: "launch.p5.gate.compliance",
      securityProfileId: secProfile.id,
    });
    secMgr.markChecklistPassed(secChecklist.id);
    secMgr.validateAudit({
      id: "launch.p5.gate.audit",
      securityProfileId: secProfile.id,
    });
    const securityReady = secMgr.evaluateReadiness(secProfile.id);

    const commercialMgr = createCommercialControlManager({
      managerId: "launch-p5-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "launch.p5.gate.sla",
      productId: product.id,
      productTenantId,
      organizationId,
      tier: "PREMIUM",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "launch-p5-gate",
    });
    supportMgr.initialize();
    supportMgr.start();

    const tier = supportMgr.createTier({
      id: "launch.p5.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });

    const supportProfile = supportMgr.createProfile({
      id: "launch.p5.gate.supprofile",
      name: "Launch Support Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      productTenantId,
      organizationId,
      securityProfileId: secProfile.id,
      onboardingProfileId: onboardProfile.id,
      commercialSlaId: commercialSla.id,
      supportTierId: tier.id,
    });
    supportMgr.activateProfile(supportProfile.id);

    supportMgr.createPolicy({
      id: "launch.p5.gate.policy.response",
      supportSlaProfileId: supportProfile.id,
      kind: "RESPONSE_TIME",
      name: "Premium Response",
      valueMinutes: 120,
    });
    supportMgr.createPolicy({
      id: "launch.p5.gate.policy.resolution",
      supportSlaProfileId: supportProfile.id,
      kind: "RESOLUTION_TIME",
      name: "Premium Resolution",
      valueMinutes: 480,
    });

    const incident = supportMgr.openIncident({
      id: "launch.p5.gate.incident",
      supportSlaProfileId: supportProfile.id,
      title: "API latency spike",
      severity: "SEV2",
    });
    supportMgr.advanceIncident({
      incidentId: incident.id,
      detail: "acked by on-call",
    });
    const resolved = supportMgr.resolveIncident(
      incident.id,
      "mitigated and closed path",
    );
    const metrics = supportMgr.computeMetrics(supportProfile.id);
    const readiness = supportMgr.evaluateReadiness(supportProfile.id);
    const registry = getSupportRegistryManifest();

    const ok =
      securityReady.verdict === "READY" &&
      commercialSla.status === "ACTIVE" &&
      resolved.status === "RESOLVED" &&
      metrics.incidentCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.slaSupportId === LAUNCH_SLA_SUPPORT_ID &&
      registry.base === LAUNCH_SLA_SUPPORT_BASE;

    try {
      assertSupportReadinessReady(readiness);
      checks.push(
        check(
          "LN-P5-STACK",
          "support",
          "Tier / profile / policy / incident / metrics / readiness",
          ok,
          `security=${securityReady.verdict} readiness=${readiness.verdict} incident=${resolved.status}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "LN-P5-STACK",
          "support",
          "Tier / profile / policy / incident / metrics / readiness",
          false,
          error instanceof Error ? error.message : "support not ready",
        ),
      );
    }

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
        "LN-P5-STACK",
        "support",
        "Tier / profile / policy / incident / metrics / readiness",
        false,
        error instanceof Error ? error.message : "support probe failed",
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
      `launch-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP5ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P5 release gate failed: ${gate.summary}`);
  }
}
