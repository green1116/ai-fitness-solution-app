/**
 * Post-Launch P2 — Customer Success Operations Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  clearAdminConsoleLayer,
  createAdminConsoleManager,
} from "../../../product/e12/admin/admin.manager";
import { clearApiProductLayer } from "../../../product/e12/api/api.manager";
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
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../../../product/e12/tenant/tenant.manager";
import { clearRuntimes } from "../../../cloud-runtime/e11/registry/cloud.registry";
import { createCloudRuntimeManager } from "../../../cloud-runtime/e11/runtime/cloud.runtime";
import {
  clearControlLayer,
  createLaunchControlPlaneManager,
} from "../../../launch/control/control.manager";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../../../launch/launch.manager";
import {
  clearOnboardingLayer,
  createCustomerOnboardingManager,
} from "../../../launch/onboarding/onboarding.manager";
import { updateOnboardingProfile } from "../../../launch/onboarding/onboarding.profile";
import { clearDemoLayer } from "../../../launch/demo/demo.manager";
import { clearDocumentationLayer } from "../../../launch/documentation/documentation.manager";
import { clearSecurityLayer } from "../../../launch/security/security.manager";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../../../launch/signoff/governance.freeze.lock";
import {
  clearSupportLayer,
  createSlaSupportPackageManager,
} from "../../../launch/support/support.manager";
import {
  clearOperationsProductionLayer,
  createProductionOperationsManager,
} from "../../production/production.manager";
import { OPERATIONS_PRODUCTION_FOUNDATION_ID } from "../../production/production.constants";
import {
  ADOPTION_STAGES,
  CUSTOMER_HEALTH_LEVELS,
  CUSTOMER_SUCCESS_MANAGER_STATUSES,
  CUSTOMER_SUCCESS_READINESS_VERDICTS,
  OPERATIONS_CUSTOMER_SUCCESS_BASE,
  OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_ID,
  OPERATIONS_CUSTOMER_SUCCESS_VERSION,
  OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION,
  SUCCESS_STEP_STATUSES,
  SUCCESS_WORKFLOW_STEPS,
} from "../success.constants";
import {
  assertCustomerSuccessReadinessReady,
  clearCustomerSuccessLayer,
  createCustomerSuccessOperationsManager,
  getCustomerSuccessRegistryManifest,
} from "../success.manager";

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

export const OPERATIONS_P2_SIGNOFF_VERSION = "operations-p2-signoff-1" as const;

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
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
  clearRuntimes();
}

export function checkOperationsP2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P2-CONSTANTS",
      "customer-success",
      "Customer success version constants",
      OPERATIONS_CUSTOMER_SUCCESS_ID ===
        "enterprise-post-launch-p2-customer-success-operations-v1" &&
        OPERATIONS_CUSTOMER_SUCCESS_VERSION === "operations-p2-1" &&
        OPERATIONS_CUSTOMER_SUCCESS_BASE ===
          OPERATIONS_PRODUCTION_FOUNDATION_ID &&
        OPERATIONS_CUSTOMER_SUCCESS_BASE ===
          "enterprise-post-launch-p1-production-operations-foundation-v1" &&
        OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION ===
          "operations-customer-success-freeze-1" &&
        OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION ===
          "operations-p2-customer-success-operations-freeze-1" &&
        CUSTOMER_HEALTH_LEVELS.length === 5 &&
        ADOPTION_STAGES.length === 5 &&
        SUCCESS_WORKFLOW_STEPS.length === 5 &&
        SUCCESS_STEP_STATUSES.length === 5 &&
        CUSTOMER_SUCCESS_READINESS_VERDICTS.length === 3 &&
        CUSTOMER_SUCCESS_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_CUSTOMER_SUCCESS_ID} base=${OPERATIONS_CUSTOMER_SUCCESS_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P2-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P2-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P2-LAUNCH",
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
      "OPS-P2-P1-BASE",
      "operations",
      "P1 production foundation freeze preserved as BASE",
      OPERATIONS_PRODUCTION_FOUNDATION_ID ===
        "enterprise-post-launch-p1-production-operations-foundation-v1" &&
        OPERATIONS_CUSTOMER_SUCCESS_BASE === OPERATIONS_PRODUCTION_FOUNDATION_ID,
      `p1=${OPERATIONS_PRODUCTION_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "ops.p2.gate.product",
      name: "Enterprise Fitness Customer Success",
      sku: "EFS-CS-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "ops.p2.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "ops.p2.gate.package",
      productId: product.id,
      name: "CS Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "ops.p2.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "ops-p2-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "ops.p2.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "CS Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "ops.p2.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "ops.p2.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "ops-p2-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "ops.p2.gate.prodprofile",
      name: "CS Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "ops.p2.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "ops.p2.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "ops-p2-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "ops.p2.gate.workspace",
      name: "CS Workspace",
      slug: "cs-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "ops.p2.gate.tenant",
      name: "CS Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    const adminMgr = createAdminConsoleManager({
      managerId: "ops-p2-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "ops.p2.gate.org",
      name: "CS Gate Org",
      slug: "cs-gate-org",
      productId: product.id,
    });
    adminMgr.linkTenant(tenant.id, org.id);

    const onboardMgr = createCustomerOnboardingManager({
      managerId: "ops-p2-gate-onboard",
    });
    onboardMgr.initialize();
    onboardMgr.start();
    const onboardProfile = onboardMgr.createProfile({
      id: "ops.p2.gate.onboard",
      customerName: "CS Customer",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
      organizationId: org.id,
    });
    updateOnboardingProfile(onboardProfile.id, {
      productTenantId: tenant.id,
    });
    onboardMgr.prepareActivation(onboardProfile.id);
    onboardMgr.setActivation({
      onboardingProfileId: onboardProfile.id,
      state: "ACTIVE",
      detail: "customer success go-live",
    });

    const commercialMgr = createCommercialControlManager({
      managerId: "ops-p2-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "ops.p2.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });
    commercialMgr.transitionCustomer({
      id: "ops.p2.gate.lifecycle.seed",
      organizationId: org.id,
      productId: product.id,
      productTenantId: tenant.id,
      stage: "ONBOARDING",
      reason: "seed for customer success",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "ops-p2-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "ops.p2.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "ops.p2.gate.supprofile",
      name: "CS Support Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      productTenantId: tenant.id,
      organizationId: org.id,
      onboardingProfileId: onboardProfile.id,
      commercialSlaId: commercialSla.id,
      supportTierId: tier.id,
    });
    supportMgr.activateProfile(supportProfile.id);

    const controlMgr = createLaunchControlPlaneManager({
      managerId: "ops-p2-gate-control",
    });
    controlMgr.initialize();
    controlMgr.start();
    const orch = controlMgr.createOrchestration({
      id: "ops.p2.gate.orch",
      name: "CS Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "ops-p2-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "ops.p2.gate.runtime",
      name: "CS Production Runtime",
      kind: "CORE",
      version: "1.0.0",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "ops-p2-gate-ops",
    });
    opsMgr.initialize();
    opsMgr.start();
    const operation = opsMgr.createOperation({
      id: "ops.p2.gate.operation",
      name: "CS Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });

    const csMgr = createCustomerSuccessOperationsManager({
      managerId: "ops-p2-gate",
    });
    csMgr.initialize();
    csMgr.start();

    const health = csMgr.createHealthProfile({
      id: "ops.p2.gate.health",
      name: "CS Health",
      productId: product.id,
      organizationId: org.id,
      productTenantId: tenant.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
      onboardingProfileId: onboardProfile.id,
    });

    const workflow = csMgr.startWorkflow({
      id: "ops.p2.gate.workflow",
      customerHealthProfileId: health.id,
      targetLifecycleStage: "ACTIVE",
    });

    const metrics = csMgr.computeMetrics(health.id);
    const readiness = csMgr.evaluateReadiness(health.id);
    const registry = getCustomerSuccessRegistryManifest();

    const ok =
      workflow.complete === true &&
      workflow.failed === false &&
      metrics.engagementScore >= 55 &&
      metrics.slaActive === true &&
      metrics.lifecycleStage === "ACTIVE" &&
      readiness.verdict === "READY" &&
      registry.customerSuccessId === OPERATIONS_CUSTOMER_SUCCESS_ID &&
      registry.base === OPERATIONS_CUSTOMER_SUCCESS_BASE;

    try {
      assertCustomerSuccessReadinessReady(readiness);
      checks.push(
        check(
          "OPS-P2-STACK",
          "customer-success",
          "Health / adoption / workflow / lifecycle / metrics / readiness",
          ok,
          `health=${health.health} engagement=${metrics.engagementScore} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-P2-STACK",
          "customer-success",
          "Health / adoption / workflow / lifecycle / metrics / readiness",
          false,
          error instanceof Error ? error.message : "customer success not ready",
        ),
      );
    }

    csMgr.stop();
    opsMgr.stop();
    cloudMgr.stop();
    controlMgr.stop();
    supportMgr.stop();
    commercialMgr.stop();
    onboardMgr.stop();
    adminMgr.stop();
    tenantMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "OPS-P2-STACK",
        "customer-success",
        "Health / adoption / workflow / lifecycle / metrics / readiness",
        false,
        error instanceof Error ? error.message : "customer success probe failed",
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
      `operations-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP2ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P2 release gate failed: ${gate.summary}`);
  }
}
