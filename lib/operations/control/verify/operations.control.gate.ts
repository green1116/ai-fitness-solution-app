/**
 * Post-Launch P7 — Operations Control Plane Release Gate
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
import { createCloudRuntimeManager } from "../../../cloud-runtime/e11/runtime/cloud.runtime";
import {
  clearControlLayer,
  createLaunchControlPlaneManager,
} from "../../../launch/control/control.manager";
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
import {
  clearSupportLayer,
  createSlaSupportPackageManager,
} from "../../../launch/support/support.manager";
import {
  clearOperationsProductionLayer,
  createProductionOperationsManager,
} from "../../production/production.manager";
import {
  clearCustomerSuccessLayer,
  createCustomerSuccessOperationsManager,
} from "../../customer-success/success.manager";
import {
  clearGrowthAnalyticsLayer,
  createGrowthAnalyticsOperationsManager,
} from "../../growth/growth.manager";
import {
  clearIncidentResponseLayer,
  createIncidentResponseOperationsManager,
} from "../../incident/incident.manager";
import {
  clearReleaseManagementLayer,
  createReleaseManagementOperationsManager,
} from "../../release/release.manager";
import {
  clearEnterpriseSupportLayer,
  createEnterpriseSupportOperationsManager,
} from "../../support/support.manager";
import { OPERATIONS_ENTERPRISE_SUPPORT_ID } from "../../support/support.constants";
import {
  COMMAND_CENTER_MODES,
  DOMAIN_HEALTH_LEVELS,
  OPERATIONS_CONTROL_PLANE_BASE,
  OPERATIONS_CONTROL_PLANE_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_ID,
  OPERATIONS_CONTROL_PLANE_VERSION,
  OPERATIONS_P7_CONTROL_FREEZE_VERSION,
  OPS_CONTROL_MANAGER_STATUSES,
  OPS_CONTROL_READINESS_VERDICTS,
  OPS_DECISION_VERDICTS,
  OPS_ORCHESTRATION_DOMAINS,
  OPS_ORCHESTRATION_STATUSES,
} from "../control.constants";
import {
  assertOpsControlReadinessReady,
  clearOperationsControlLayer,
  createOperationsControlPlaneManager,
  getOpsControlRegistryManifest,
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

export const OPERATIONS_P7_SIGNOFF_VERSION = "operations-p7-signoff-1" as const;

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
  clearOperationsControlLayer();
  clearEnterpriseSupportLayer();
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

export function checkOperationsP7ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P7-CONSTANTS",
      "ops-control",
      "Operations control plane version constants",
      OPERATIONS_CONTROL_PLANE_ID ===
        "enterprise-post-launch-p7-operations-control-plane-v1" &&
        OPERATIONS_CONTROL_PLANE_VERSION === "operations-p7-1" &&
        OPERATIONS_CONTROL_PLANE_BASE === OPERATIONS_ENTERPRISE_SUPPORT_ID &&
        OPERATIONS_CONTROL_PLANE_BASE ===
          "enterprise-post-launch-p6-enterprise-support-operations-v1" &&
        OPERATIONS_CONTROL_PLANE_FREEZE_VERSION ===
          "operations-control-plane-freeze-1" &&
        OPERATIONS_P7_CONTROL_FREEZE_VERSION ===
          "operations-p7-operations-control-plane-freeze-1" &&
        OPS_ORCHESTRATION_STATUSES.length === 5 &&
        OPS_ORCHESTRATION_DOMAINS.length === 6 &&
        DOMAIN_HEALTH_LEVELS.length === 5 &&
        OPS_DECISION_VERDICTS.length === 4 &&
        COMMAND_CENTER_MODES.length === 4 &&
        OPS_CONTROL_READINESS_VERDICTS.length === 3 &&
        OPS_CONTROL_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_CONTROL_PLANE_ID} base=${OPERATIONS_CONTROL_PLANE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P7-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P7-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P7-LAUNCH",
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
      "OPS-P7-P6-BASE",
      "operations",
      "P6 enterprise support freeze preserved as BASE",
      OPERATIONS_ENTERPRISE_SUPPORT_ID ===
        "enterprise-post-launch-p6-enterprise-support-operations-v1" &&
        OPERATIONS_CONTROL_PLANE_BASE === OPERATIONS_ENTERPRISE_SUPPORT_ID,
      `p6=${OPERATIONS_ENTERPRISE_SUPPORT_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "ops.p7.gate.product",
      name: "Enterprise Fitness Ops Control",
      sku: "EFS-OC-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "ops.p7.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "ops.p7.gate.package",
      productId: product.id,
      name: "OC Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "ops.p7.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "ops-p7-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "ops.p7.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "OC Deploy Package",
      version: "2.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "ops.p7.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "ops.p7.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "ops-p7-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "ops.p7.gate.prodprofile",
      name: "OC Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "ops.p7.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "ops.p7.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "ops-p7-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "ops.p7.gate.workspace",
      name: "OC Workspace",
      slug: "oc-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "ops.p7.gate.tenant",
      name: "OC Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);
    const tenantSub = tenantMgr.bindSubscription({
      id: "ops.p7.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "ops.p7.gate.package",
    });

    const adminMgr = createAdminConsoleManager({
      managerId: "ops-p7-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "ops.p7.gate.org",
      name: "OC Gate Org",
      slug: "oc-gate-org",
      productId: product.id,
    });
    adminMgr.linkTenant(tenant.id, org.id);

    const billingMgr = createBillingCommercialManager({
      managerId: "ops-p7-gate-billing",
    });
    billingMgr.initialize();
    billingMgr.start();
    const billingPlan = billingMgr.createPlan({
      id: "ops.p7.gate.billing.plan",
      productId: product.id,
      editionId: edition.id,
      name: "OC Billing Monthly",
      basePrice: 99,
      billingCycle: "MONTHLY",
    });
    const billingSub = billingMgr.createSubscription({
      id: "ops.p7.gate.bsub",
      productTenantId: tenant.id,
      tenantSubscriptionId: tenantSub.id,
      pricingPlanId: billingPlan.id,
    });
    billingMgr.activateSubscription(billingSub.id);
    billingMgr.recordUsage({
      id: "ops.p7.gate.usage",
      productTenantId: tenant.id,
      billingSubscriptionId: billingSub.id,
      meter: "REQUEST",
      quantity: 200,
    });

    const apiMgr = createApiProductManager({
      managerId: "ops-p7-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();
    const apiEntry = apiMgr.registerCatalogEntry({
      id: "ops.p7.gate.api",
      productId: product.id,
      name: "OC API",
      path: "/api/v1/ops-control",
      version: "v1",
      requiredScope: "api:read",
    });
    const developer = apiMgr.registerDeveloper({
      id: "ops.p7.gate.dev",
      userId: "oc-dev",
      productTenantId: tenant.id,
      scopes: ["api:read"],
    });
    const apiKey = apiMgr.createKey({
      id: "ops.p7.gate.key",
      productTenantId: tenant.id,
      developerId: developer.id,
      name: "OC Key",
      scopes: ["api:read"],
    });
    for (let i = 0; i < 10; i++) {
      apiMgr.recordUsage({
        id: `ops.p7.gate.apiusage.${i}`,
        productTenantId: tenant.id,
        developerId: developer.id,
        apiKeyId: apiKey.id,
        apiCatalogEntryId: apiEntry.id,
        billingSubscriptionId: billingSub.id,
      });
    }

    const commercialMgr = createCommercialControlManager({
      managerId: "ops-p7-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "ops.p7.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });
    commercialMgr.transitionCustomer({
      id: "ops.p7.gate.lifecycle",
      organizationId: org.id,
      productId: product.id,
      productTenantId: tenant.id,
      stage: "ACTIVE",
      reason: "ops control seed",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "ops-p7-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "ops.p7.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "ops.p7.gate.supprofile",
      name: "OC Support Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      productTenantId: tenant.id,
      organizationId: org.id,
      commercialSlaId: commercialSla.id,
      supportTierId: tier.id,
    });
    supportMgr.activateProfile(supportProfile.id);

    const launchControlMgr = createLaunchControlPlaneManager({
      managerId: "ops-p7-gate-launch-control",
    });
    launchControlMgr.initialize();
    launchControlMgr.start();
    const orch = launchControlMgr.createOrchestration({
      id: "ops.p7.gate.launch.orch",
      name: "OC Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "ops-p7-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "ops.p7.gate.runtime",
      name: "OC Production Runtime",
      kind: "CORE",
      version: "1.0.0",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "ops-p7-gate-ops",
    });
    opsMgr.initialize();
    opsMgr.start();
    const operation = opsMgr.createOperation({
      id: "ops.p7.gate.operation",
      name: "OC Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });
    opsMgr.recordStatus({
      id: "ops.p7.gate.status",
      productionOperationId: operation.id,
      level: "NOMINAL",
      detail: "nominal",
      source: "gate",
    });
    const opsChecklist = opsMgr.createChecklist({
      id: "ops.p7.gate.checklist",
      productionOperationId: operation.id,
    });
    opsMgr.markChecklistPassed(opsChecklist.id);

    const csMgr = createCustomerSuccessOperationsManager({
      managerId: "ops-p7-gate-cs",
    });
    csMgr.initialize();
    csMgr.start();
    const health = csMgr.createHealthProfile({
      id: "ops.p7.gate.health",
      name: "OC Health",
      productId: product.id,
      organizationId: org.id,
      productTenantId: tenant.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
    });
    csMgr.recordAdoption({
      id: "ops.p7.gate.adoption",
      customerHealthProfileId: health.id,
      stage: "ADOPTED",
      featureCount: 6,
      activeUsers: 12,
    });

    const irMgr = createIncidentResponseOperationsManager({
      managerId: "ops-p7-gate-ir",
    });
    irMgr.initialize();
    irMgr.start();
    const incident = irMgr.openIncident({
      id: "ops.p7.gate.incident",
      title: "Transient latency",
      productId: product.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      impact: "MEDIUM",
      urgency: "NORMAL",
    });
    irMgr.startEscalation({
      id: "ops.p7.gate.escalation",
      operationsIncidentId: incident.id,
    });
    irMgr.recordResolution({
      id: "ops.p7.gate.resolution",
      operationsIncidentId: incident.id,
      outcome: "FIXED",
      detail: "resolved for control plane",
    });

    const rmMgr = createReleaseManagementOperationsManager({
      managerId: "ops-p7-gate-rm",
    });
    rmMgr.initialize();
    rmMgr.start();
    const release = rmMgr.createRelease({
      id: "ops.p7.gate.release",
      name: "2.0.0 Release",
      productId: product.id,
      productionOperationId: operation.id,
      orchestrationId: orch.id,
      deploymentPackageId: pkg.id,
    });
    rmMgr.trackVersion({
      id: "ops.p7.gate.version",
      operationsReleaseId: release.id,
      version: "2.0.0",
      kind: "MINOR",
      previousVersion: "1.9.0",
    });
    const approval = rmMgr.requestApproval({
      id: "ops.p7.gate.approval",
      operationsReleaseId: release.id,
      approver: "ops-control",
    });
    rmMgr.decideApproval({ approvalId: approval.id, approve: true });
    rmMgr.deploy(release.id, "control plane deploy");

    const gaMgr = createGrowthAnalyticsOperationsManager({
      managerId: "ops-p7-gate-ga",
    });
    gaMgr.initialize();
    gaMgr.start();
    const growthDash = gaMgr.buildDashboard({
      id: "ops.p7.gate.growth",
      productId: product.id,
      productTenantId: tenant.id,
      customerHealthProfileId: health.id,
    });

    const esMgr = createEnterpriseSupportOperationsManager({
      managerId: "ops-p7-gate-es",
    });
    esMgr.initialize();
    esMgr.start();
    const article = esMgr.createArticle({
      id: "ops.p7.gate.kb",
      title: "Ops control playbook",
      productId: product.id,
      category: "control",
      body: "Use control plane dashboards",
      tags: ["control"],
    });
    esMgr.publishArticle(article.id);
    const supportCase = esMgr.openCase({
      id: "ops.p7.gate.case",
      title: "Control plane inquiry",
      productId: product.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      operationsIncidentId: incident.id,
      priority: "P3",
    });
    esMgr.bindKnowledge(supportCase.id, article.id);
    esMgr.routeEscalation({
      id: "ops.p7.gate.route",
      supportCaseId: supportCase.id,
      toRoute: "L2_SUPPORT",
    });
    esMgr.startWorkflow({
      id: "ops.p7.gate.workflow",
      supportCaseId: supportCase.id,
    });

    const ocMgr = createOperationsControlPlaneManager({
      managerId: "ops-p7-gate",
    });
    ocMgr.initialize();
    ocMgr.start();

    const opsOrch = ocMgr.createOrchestration({
      id: "ops.p7.gate.opsorch",
      name: "Post-Launch Ops Control",
      productId: product.id,
      productionOperationId: operation.id,
      customerHealthProfileId: health.id,
      operationsIncidentId: incident.id,
      operationsReleaseId: release.id,
      growthDashboardId: growthDash.id,
      supportCaseId: supportCase.id,
    });
    ocMgr.activateOrchestration(opsOrch.id);

    const dashboard = ocMgr.buildDashboard({
      id: "ops.p7.gate.execdash",
      orchestrationId: opsOrch.id,
    });
    const readiness = ocMgr.evaluateReadiness(opsOrch.id);
    const registry = getOpsControlRegistryManifest();

    const ok =
      dashboard.health.domains.length === 6 &&
      dashboard.executiveScore >= 40 &&
      dashboard.commandCenter.mode.length > 0 &&
      !!dashboard.decision.verdict &&
      readiness.verdict === "READY" &&
      registry.controlPlaneId === OPERATIONS_CONTROL_PLANE_ID &&
      registry.base === OPERATIONS_CONTROL_PLANE_BASE;

    try {
      assertOpsControlReadinessReady(readiness);
      checks.push(
        check(
          "OPS-P7-STACK",
          "ops-control",
          "Orchestration / health / command / decision / dashboard / readiness",
          ok,
          `score=${dashboard.executiveScore} decision=${dashboard.decision.verdict} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-P7-STACK",
          "ops-control",
          "Orchestration / health / command / decision / dashboard / readiness",
          false,
          error instanceof Error
            ? error.message
            : "operations control not ready",
        ),
      );
    }

    ocMgr.stop();
    esMgr.stop();
    gaMgr.stop();
    rmMgr.stop();
    irMgr.stop();
    csMgr.stop();
    opsMgr.stop();
    cloudMgr.stop();
    launchControlMgr.stop();
    supportMgr.stop();
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
        "OPS-P7-STACK",
        "ops-control",
        "Orchestration / health / command / decision / dashboard / readiness",
        false,
        error instanceof Error
          ? error.message
          : "operations control probe failed",
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
      `operations-p7-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP7ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP7ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P7 release gate failed: ${gate.summary}`);
  }
}
