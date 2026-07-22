/**
 * Post-Launch P5 — Growth Analytics Operations Release Gate
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
import {
  clearBillingCommercialLayer,
  createBillingCommercialManager,
} from "../../../product/e12/billing/billing.manager";
import { createPricingPlan } from "../../../product/e12/billing/billing.plan";
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
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../../../product/e12/tenant/tenant.manager";
import { clearRuntimes } from "../../../cloud-runtime/e11/registry/cloud.registry";
import { clearControlLayer } from "../../../launch/control/control.manager";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../../../launch/launch.manager";
import { clearOnboardingLayer } from "../../../launch/onboarding/onboarding.manager";
import { clearDemoLayer } from "../../../launch/demo/demo.manager";
import { clearDocumentationLayer } from "../../../launch/documentation/documentation.manager";
import { clearSecurityLayer } from "../../../launch/security/security.manager";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../../../launch/signoff/governance.freeze.lock";
import { clearSupportLayer } from "../../../launch/support/support.manager";
import { clearOperationsProductionLayer } from "../../production/production.manager";
import {
  clearCustomerSuccessLayer,
  createCustomerSuccessOperationsManager,
} from "../../customer-success/success.manager";
import { clearIncidentResponseLayer } from "../../incident/incident.manager";
import { clearReleaseManagementLayer } from "../../release/release.manager";
import { OPERATIONS_RELEASE_MANAGEMENT_ID } from "../../release/release.constants";
import {
  EXPANSION_SIGNAL_KINDS,
  GROWTH_MANAGER_STATUSES,
  GROWTH_READINESS_VERDICTS,
  GROWTH_SIGNAL_STRENGTHS,
  GROWTH_TRENDS,
  OPERATIONS_GROWTH_ANALYTICS_BASE,
  OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_ID,
  OPERATIONS_GROWTH_ANALYTICS_VERSION,
  OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION,
} from "../growth.constants";
import {
  assertGrowthReadinessReady,
  clearGrowthAnalyticsLayer,
  createGrowthAnalyticsOperationsManager,
  getGrowthRegistryManifest,
} from "../growth.manager";

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

export const OPERATIONS_P5_SIGNOFF_VERSION = "operations-p5-signoff-1" as const;

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
  clearGrowthAnalyticsLayer();
  clearReleaseManagementLayer();
  clearIncidentResponseLayer();
  clearCustomerSuccessLayer();
  clearOperationsProductionLayer();
  clearControlLayer();
  clearDocumentationLayer();
  clearSupportLayer();
  clearSecurityLayer();
  clearDemoLayer();
  clearOnboardingLayer();
  clearLaunchLayer();
  clearCommercialControlLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearDeploymentLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
  clearRuntimes();
}

export function checkOperationsP5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P5-CONSTANTS",
      "growth",
      "Growth analytics version constants",
      OPERATIONS_GROWTH_ANALYTICS_ID ===
        "enterprise-post-launch-p5-growth-analytics-operations-v1" &&
        OPERATIONS_GROWTH_ANALYTICS_VERSION === "operations-p5-1" &&
        OPERATIONS_GROWTH_ANALYTICS_BASE === OPERATIONS_RELEASE_MANAGEMENT_ID &&
        OPERATIONS_GROWTH_ANALYTICS_BASE ===
          "enterprise-post-launch-p4-release-management-operations-v1" &&
        OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION ===
          "operations-growth-analytics-freeze-1" &&
        OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION ===
          "operations-p5-growth-analytics-operations-freeze-1" &&
        GROWTH_SIGNAL_STRENGTHS.length === 4 &&
        EXPANSION_SIGNAL_KINDS.length === 5 &&
        GROWTH_TRENDS.length === 4 &&
        GROWTH_READINESS_VERDICTS.length === 3 &&
        GROWTH_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_GROWTH_ANALYTICS_ID} base=${OPERATIONS_GROWTH_ANALYTICS_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P5-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P5-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P5-LAUNCH",
      "launch",
      "Launch complete alias + commercial freeze preserved",
      ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
          "enterprise-launch-commercial-release-complete-v1",
      `alias=${ENTERPRISE_LAUNCH_COMPLETE_ID} commercial=${LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P5-P4-BASE",
      "operations",
      "P4 release management freeze preserved as BASE",
      OPERATIONS_RELEASE_MANAGEMENT_ID ===
        "enterprise-post-launch-p4-release-management-operations-v1" &&
        OPERATIONS_GROWTH_ANALYTICS_BASE === OPERATIONS_RELEASE_MANAGEMENT_ID,
      `p4=${OPERATIONS_RELEASE_MANAGEMENT_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "ops.p5.gate.product",
      name: "Enterprise Fitness Growth Analytics",
      sku: "EFS-GA-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "ops.p5.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "ops.p5.gate.package",
      productId: product.id,
      name: "GA Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "ops.p5.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "ops-p5-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "ops.p5.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "GA Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "ops.p5.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "ops.p5.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "ops-p5-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "ops.p5.gate.prodprofile",
      name: "GA Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "ops.p5.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "ops.p5.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "ops-p5-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "ops.p5.gate.workspace",
      name: "GA Workspace",
      slug: "ga-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "ops.p5.gate.tenant",
      name: "GA Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);
    const tenantSub = tenantMgr.bindSubscription({
      id: "ops.p5.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "ops.p5.gate.package",
    });

    const adminMgr = createAdminConsoleManager({
      managerId: "ops-p5-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "ops.p5.gate.org",
      name: "GA Gate Org",
      slug: "ga-gate-org",
      productId: product.id,
    });
    adminMgr.linkTenant(tenant.id, org.id);

    const billingMgr = createBillingCommercialManager({
      managerId: "ops-p5-gate-billing",
    });
    billingMgr.initialize();
    billingMgr.start();
    const billingPlan = billingMgr.createPlan({
      id: "ops.p5.gate.billing.plan",
      productId: product.id,
      editionId: edition.id,
      name: "GA Billing Monthly",
      basePrice: 99,
      billingCycle: "MONTHLY",
    });
    const billingSub = billingMgr.createSubscription({
      id: "ops.p5.gate.bsub",
      productTenantId: tenant.id,
      tenantSubscriptionId: tenantSub.id,
      pricingPlanId: billingPlan.id,
    });
    billingMgr.activateSubscription(billingSub.id);
    billingMgr.recordUsage({
      id: "ops.p5.gate.usage",
      productTenantId: tenant.id,
      billingSubscriptionId: billingSub.id,
      meter: "REQUEST",
      quantity: 250,
    });

    const apiMgr = createApiProductManager({
      managerId: "ops-p5-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();
    const apiEntry = apiMgr.registerCatalogEntry({
      id: "ops.p5.gate.api",
      productId: product.id,
      name: "Growth API",
      path: "/api/v1/growth",
      version: "v1",
      requiredScope: "api:read",
    });
    const developer = apiMgr.registerDeveloper({
      id: "ops.p5.gate.dev",
      userId: "ga-dev",
      productTenantId: tenant.id,
      scopes: ["api:read"],
    });
    const apiKey = apiMgr.createKey({
      id: "ops.p5.gate.key",
      productTenantId: tenant.id,
      developerId: developer.id,
      name: "GA Key",
      scopes: ["api:read"],
    });
    for (let i = 0; i < 12; i++) {
      apiMgr.recordUsage({
        id: `ops.p5.gate.apiusage.${i}`,
        productTenantId: tenant.id,
        developerId: developer.id,
        apiKeyId: apiKey.id,
        apiCatalogEntryId: apiEntry.id,
        billingSubscriptionId: billingSub.id,
        statusCode: 200,
        latencyMs: 20 + i,
      });
    }

    const commercialMgr = createCommercialControlManager({
      managerId: "ops-p5-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    commercialMgr.transitionCustomer({
      id: "ops.p5.gate.lifecycle",
      organizationId: org.id,
      productId: product.id,
      productTenantId: tenant.id,
      stage: "ACTIVE",
      reason: "growth analytics seed",
    });

    const csMgr = createCustomerSuccessOperationsManager({
      managerId: "ops-p5-gate-cs",
    });
    csMgr.initialize();
    csMgr.start();
    const health = csMgr.createHealthProfile({
      id: "ops.p5.gate.health",
      name: "GA Health",
      productId: product.id,
      organizationId: org.id,
      productTenantId: tenant.id,
    });
    csMgr.recordAdoption({
      id: "ops.p5.gate.adoption",
      customerHealthProfileId: health.id,
      stage: "EXPANDING",
      featureCount: 8,
      activeUsers: 15,
      detail: "growth gate adoption",
    });

    const gaMgr = createGrowthAnalyticsOperationsManager({
      managerId: "ops-p5-gate",
    });
    gaMgr.initialize();
    gaMgr.start();

    const dashboard = gaMgr.buildDashboard({
      id: "ops.p5.gate.dashboard",
      productId: product.id,
      productTenantId: tenant.id,
      customerHealthProfileId: health.id,
    });

    const readiness = gaMgr.evaluateReadiness(dashboard.id);
    const registry = getGrowthRegistryManifest();

    const ok =
      dashboard.usage.apiCallCount >= 12 &&
      dashboard.usage.billingUsageQuantity >= 250 &&
      dashboard.expansionSignals.length >= 1 &&
      dashboard.revenue.activeSubscriptions >= 1 &&
      dashboard.growthScore >= 40 &&
      readiness.verdict === "READY" &&
      registry.growthAnalyticsId === OPERATIONS_GROWTH_ANALYTICS_ID &&
      registry.base === OPERATIONS_GROWTH_ANALYTICS_BASE;

    try {
      assertGrowthReadinessReady(readiness);
      checks.push(
        check(
          "OPS-P5-STACK",
          "growth",
          "Usage / adoption / expansion / revenue / dashboard / readiness",
          ok,
          `score=${dashboard.growthScore} signals=${dashboard.expansionSignals.length} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-P5-STACK",
          "growth",
          "Usage / adoption / expansion / revenue / dashboard / readiness",
          false,
          error instanceof Error
            ? error.message
            : "growth analytics not ready",
        ),
      );
    }

    gaMgr.stop();
    csMgr.stop();
    commercialMgr.stop();
    apiMgr.stop();
    billingMgr.stop();
    adminMgr.stop();
    tenantMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "OPS-P5-STACK",
        "growth",
        "Usage / adoption / expansion / revenue / dashboard / readiness",
        false,
        error instanceof Error
          ? error.message
          : "growth analytics probe failed",
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
      `operations-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP5ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P5 release gate failed: ${gate.summary}`);
  }
}
