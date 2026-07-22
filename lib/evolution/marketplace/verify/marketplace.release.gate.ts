/**
 * Evolution P6 - Marketplace Ecosystem Release Gate
 * BASE: enterprise-evolution-p5-global-deployment-network-v1
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
} from "../../../operations/production/production.manager";
import {
  clearCustomerSuccessLayer,
  createCustomerSuccessOperationsManager,
} from "../../../operations/customer-success/success.manager";
import {
  clearGrowthAnalyticsLayer,
  createGrowthAnalyticsOperationsManager,
} from "../../../operations/growth/growth.manager";
import {
  clearIncidentResponseLayer,
  createIncidentResponseOperationsManager,
} from "../../../operations/incident/incident.manager";
import {
  clearReleaseManagementLayer,
  createReleaseManagementOperationsManager,
} from "../../../operations/release/release.manager";
import {
  clearEnterpriseSupportLayer,
  createEnterpriseSupportOperationsManager,
} from "../../../operations/support/support.manager";
import {
  clearOperationsControlLayer,
  createOperationsControlPlaneManager,
} from "../../../operations/control/control.manager";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
} from "../../../operations/signoff/governance.freeze.lock";
import {
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
} from "../../evolution.constants";
import {
  clearEvolutionLayer,
  createAiOperationsOptimizationManager,
} from "../../evolution.manager";
import {
  EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
} from "../../predictive/predictive.constants";
import {
  clearPredictiveLayer,
  createPredictiveIntelligenceManager,
} from "../../predictive/predictive.manager";
import {
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
} from "../../customer/customer.constants";
import {
  clearAutonomousCustomerSuccessLayer,
  createAutonomousCustomerSuccessManager,
} from "../../customer/customer.manager";
import {
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
} from "../../dashboard/dashboard.constants";
import {
  clearEnterpriseIntelligenceDashboardLayer,
  createEnterpriseIntelligenceDashboardManager,
} from "../../dashboard/dashboard.manager";
import {
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
  EVOLUTION_P5_GLOBAL_FREEZE_VERSION,
} from "../../global/global.constants";
import {
  clearGlobalDeploymentNetworkLayer,
  createGlobalDeploymentNetworkManager,
} from "../../global/global.manager";
import {
  EXTENSION_KINDS,
  EXTENSION_STATUSES,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
  EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION,
  INTEGRATION_CATEGORIES,
  MARKETPLACE_MANAGER_STATUSES,
  MARKETPLACE_READINESS_VERDICTS,
  MARKETPLACE_STATUSES,
  PARTNER_STATUSES,
  PARTNER_TIERS,
} from "../marketplace.constants";
import {
  assertMarketplaceReadinessReady,
  clearMarketplaceEcosystemLayer,
  createMarketplaceEcosystemManager,
  getMarketplaceRegistryManifest,
} from "../marketplace.manager";

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

export const EVOLUTION_P6_SIGNOFF_VERSION = "evolution-p6-signoff-1" as const;

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
  clearMarketplaceEcosystemLayer();
  clearGlobalDeploymentNetworkLayer();
  clearEnterpriseIntelligenceDashboardLayer();
  clearAutonomousCustomerSuccessLayer();
  clearPredictiveLayer();
  clearEvolutionLayer();
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

export function checkEvolutionP6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "EVO-P6-CONSTANTS",
      "marketplace",
      "Marketplace ecosystem version constants",
      EVOLUTION_MARKETPLACE_ECOSYSTEM_ID ===
        "enterprise-evolution-p6-marketplace-ecosystem-v1" &&
        EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION === "evolution-p6-1" &&
        EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE ===
          EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID &&
        EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE ===
          "enterprise-evolution-p5-global-deployment-network-v1" &&
        EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION ===
          "evolution-marketplace-ecosystem-freeze-1" &&
        EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION ===
          "evolution-p6-marketplace-ecosystem-freeze-1" &&
        EVOLUTION_P5_GLOBAL_FREEZE_VERSION ===
          "evolution-p5-global-deployment-network-freeze-1" &&
        MARKETPLACE_STATUSES.length === 4 &&
        PARTNER_TIERS.length === 4 &&
        PARTNER_STATUSES.length === 4 &&
        EXTENSION_KINDS.length === 4 &&
        EXTENSION_STATUSES.length === 3 &&
        INTEGRATION_CATEGORIES.length === 5 &&
        MARKETPLACE_READINESS_VERDICTS.length === 3 &&
        MARKETPLACE_MANAGER_STATUSES.length === 4,
      `id=${EVOLUTION_MARKETPLACE_ECOSYSTEM_ID} base=${EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVO-P6-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVO-P6-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "EVO-P6-LAUNCH",
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
      "EVO-P6-P5-BASE",
      "evolution",
      "P5 global deployment network freeze preserved as BASE",
      EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID ===
        "enterprise-evolution-p5-global-deployment-network-v1" &&
        EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE ===
          EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID &&
        EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID ===
          "enterprise-evolution-p4-enterprise-intelligence-dashboard-v1" &&
        EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID ===
          "enterprise-evolution-p3-autonomous-customer-success-v1" &&
        EVOLUTION_PREDICTIVE_INTELLIGENCE_ID ===
          "enterprise-evolution-p2-predictive-intelligence-v1" &&
        EVOLUTION_AI_OPS_OPTIMIZATION_ID ===
          "enterprise-evolution-p1-ai-operations-optimization-v1" &&
        OPERATIONS_GOVERNANCE_COMPLETE_ID ===
          "enterprise-post-launch-operations-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1",
      `p5=${EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID} p4=${EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "evo.p6.gate.product",
      name: "Enterprise Fitness Evolution Marketplace",
      sku: "EFS-MKT-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "evo.p6.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "evo.p6.gate.package",
      productId: product.id,
      name: "EVO Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "evo.p6.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "evo-p6-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "evo.p6.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "EVO Deploy Package",
      version: "2.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "evo.p6.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "evo.p6.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "evo-p6-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "evo.p6.gate.prodprofile",
      name: "EVO Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "evo.p6.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "evo.p6.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "evo-p6-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "evo.p6.gate.workspace",
      name: "EVO Workspace",
      slug: "evo-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "evo.p6.gate.tenant",
      name: "EVO Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);
    const tenantSub = tenantMgr.bindSubscription({
      id: "evo.p6.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "evo.p6.gate.package",
    });

    const adminMgr = createAdminConsoleManager({
      managerId: "evo-p6-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "evo.p6.gate.org",
      name: "EVO Gate Org",
      slug: "evo-gate-org",
      productId: product.id,
    });
    adminMgr.linkTenant(tenant.id, org.id);

    const billingMgr = createBillingCommercialManager({
      managerId: "evo-p6-gate-billing",
    });
    billingMgr.initialize();
    billingMgr.start();
    const billingPlan = billingMgr.createPlan({
      id: "evo.p6.gate.billing.plan",
      productId: product.id,
      editionId: edition.id,
      name: "EVO Billing Monthly",
      basePrice: 99,
      billingCycle: "MONTHLY",
    });
    const billingSub = billingMgr.createSubscription({
      id: "evo.p6.gate.bsub",
      productTenantId: tenant.id,
      tenantSubscriptionId: tenantSub.id,
      pricingPlanId: billingPlan.id,
    });
    billingMgr.activateSubscription(billingSub.id);
    billingMgr.recordUsage({
      id: "evo.p6.gate.usage",
      productTenantId: tenant.id,
      billingSubscriptionId: billingSub.id,
      meter: "REQUEST",
      quantity: 200,
    });

    const apiMgr = createApiProductManager({
      managerId: "evo-p6-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();
    const apiEntry = apiMgr.registerCatalogEntry({
      id: "evo.p6.gate.api",
      productId: product.id,
      name: "EVO API",
      path: "/api/v1/evolution",
      version: "v1",
      requiredScope: "api:read",
    });
    const developer = apiMgr.registerDeveloper({
      id: "evo.p6.gate.dev",
      userId: "evo-dev",
      productTenantId: tenant.id,
      scopes: ["api:read"],
    });
    const apiKey = apiMgr.createKey({
      id: "evo.p6.gate.key",
      productTenantId: tenant.id,
      developerId: developer.id,
      name: "EVO Key",
      scopes: ["api:read"],
    });
    for (let i = 0; i < 10; i++) {
      apiMgr.recordUsage({
        id: `evo.p6.gate.apiusage.${i}`,
        productTenantId: tenant.id,
        developerId: developer.id,
        apiKeyId: apiKey.id,
        apiCatalogEntryId: apiEntry.id,
        billingSubscriptionId: billingSub.id,
      });
    }

    const commercialMgr = createCommercialControlManager({
      managerId: "evo-p6-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "evo.p6.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });
    commercialMgr.transitionCustomer({
      id: "evo.p6.gate.lifecycle",
      organizationId: org.id,
      productId: product.id,
      productTenantId: tenant.id,
      stage: "ACTIVE",
      reason: "evolution ai ops seed",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "evo-p6-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "evo.p6.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "evo.p6.gate.supprofile",
      name: "EVO Support Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      productTenantId: tenant.id,
      organizationId: org.id,
      commercialSlaId: commercialSla.id,
      supportTierId: tier.id,
    });
    supportMgr.activateProfile(supportProfile.id);

    const launchControlMgr = createLaunchControlPlaneManager({
      managerId: "evo-p6-gate-launch-control",
    });
    launchControlMgr.initialize();
    launchControlMgr.start();
    const orch = launchControlMgr.createOrchestration({
      id: "evo.p6.gate.launch.orch",
      name: "EVO Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "evo-p6-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "evo.p6.gate.runtime",
      name: "EVO Production Runtime US East",
      kind: "CORE",
      version: "1.0.0",
      region: "us-east-1",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);
    const runtimeWest = cloudMgr.createRuntime({
      id: "evo.p6.gate.runtime.west",
      name: "EVO Production Runtime US West",
      kind: "CORE",
      version: "1.0.0",
      region: "us-west-2",
    });
    cloudMgr.registerRuntime(runtimeWest);
    cloudMgr.startRuntime(runtimeWest.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "evo-p6-gate-ops",
    });
    opsMgr.initialize();
    opsMgr.start();
    const operation = opsMgr.createOperation({
      id: "evo.p6.gate.operation",
      name: "EVO Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });
    opsMgr.recordStatus({
      id: "evo.p6.gate.status",
      productionOperationId: operation.id,
      level: "NOMINAL",
      detail: "nominal",
      source: "gate",
    });
    const opsChecklist = opsMgr.createChecklist({
      id: "evo.p6.gate.checklist",
      productionOperationId: operation.id,
    });
    opsMgr.markChecklistPassed(opsChecklist.id);

    const csMgr = createCustomerSuccessOperationsManager({
      managerId: "evo-p6-gate-cs",
    });
    csMgr.initialize();
    csMgr.start();
    const health = csMgr.createHealthProfile({
      id: "evo.p6.gate.health",
      name: "EVO Health",
      productId: product.id,
      organizationId: org.id,
      productTenantId: tenant.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
    });
    csMgr.recordAdoption({
      id: "evo.p6.gate.adoption",
      customerHealthProfileId: health.id,
      stage: "ADOPTED",
      featureCount: 6,
      activeUsers: 12,
    });

    const irMgr = createIncidentResponseOperationsManager({
      managerId: "evo-p6-gate-ir",
    });
    irMgr.initialize();
    irMgr.start();
    const incident = irMgr.openIncident({
      id: "evo.p6.gate.incident",
      title: "Transient latency",
      productId: product.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      impact: "MEDIUM",
      urgency: "NORMAL",
    });
    irMgr.startEscalation({
      id: "evo.p6.gate.escalation",
      operationsIncidentId: incident.id,
    });
    irMgr.recordResolution({
      id: "evo.p6.gate.resolution",
      operationsIncidentId: incident.id,
      outcome: "FIXED",
      detail: "resolved for evolution",
    });

    const rmMgr = createReleaseManagementOperationsManager({
      managerId: "evo-p6-gate-rm",
    });
    rmMgr.initialize();
    rmMgr.start();
    const release = rmMgr.createRelease({
      id: "evo.p6.gate.release",
      name: "2.0.0 Release",
      productId: product.id,
      productionOperationId: operation.id,
      orchestrationId: orch.id,
      deploymentPackageId: pkg.id,
    });
    rmMgr.trackVersion({
      id: "evo.p6.gate.version",
      operationsReleaseId: release.id,
      version: "2.0.0",
      kind: "MINOR",
      previousVersion: "1.9.0",
    });
    const approval = rmMgr.requestApproval({
      id: "evo.p6.gate.approval",
      operationsReleaseId: release.id,
      approver: "evolution",
    });
    rmMgr.decideApproval({ approvalId: approval.id, approve: true });
    rmMgr.deploy(release.id, "evolution gate deploy");

    const gaMgr = createGrowthAnalyticsOperationsManager({
      managerId: "evo-p6-gate-ga",
    });
    gaMgr.initialize();
    gaMgr.start();
    const growthDash = gaMgr.buildDashboard({
      id: "evo.p6.gate.growth",
      productId: product.id,
      productTenantId: tenant.id,
      customerHealthProfileId: health.id,
    });

    const esMgr = createEnterpriseSupportOperationsManager({
      managerId: "evo-p6-gate-es",
    });
    esMgr.initialize();
    esMgr.start();
    const article = esMgr.createArticle({
      id: "evo.p6.gate.kb",
      title: "Evolution AI ops playbook",
      productId: product.id,
      category: "evolution",
      body: "Use AI operations optimization",
      tags: ["evolution"],
    });
    esMgr.publishArticle(article.id);
    const supportCase = esMgr.openCase({
      id: "evo.p6.gate.case",
      title: "Evolution inquiry",
      productId: product.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      operationsIncidentId: incident.id,
      priority: "P3",
    });
    esMgr.bindKnowledge(supportCase.id, article.id);
    esMgr.routeEscalation({
      id: "evo.p6.gate.route",
      supportCaseId: supportCase.id,
      toRoute: "L2_SUPPORT",
    });
    esMgr.startWorkflow({
      id: "evo.p6.gate.workflow",
      supportCaseId: supportCase.id,
    });

    const ocMgr = createOperationsControlPlaneManager({
      managerId: "evo-p6-gate-oc",
    });
    ocMgr.initialize();
    ocMgr.start();
    const opsOrch = ocMgr.createOrchestration({
      id: "evo.p6.gate.opsorch",
      name: "Evolution Ops Control",
      productId: product.id,
      productionOperationId: operation.id,
      customerHealthProfileId: health.id,
      operationsIncidentId: incident.id,
      operationsReleaseId: release.id,
      growthDashboardId: growthDash.id,
      supportCaseId: supportCase.id,
    });
    ocMgr.activateOrchestration(opsOrch.id);

    const evoMgr = createAiOperationsOptimizationManager({
      managerId: "evo-p6-gate-evo",
    });
    evoMgr.initialize();
    evoMgr.start();

    const intel = evoMgr.createIntelligence({
      id: "evo.p6.gate.intel",
      name: "AI Ops Intelligence",
      productId: product.id,
      orchestrationId: opsOrch.id,
      growthDashboardId: growthDash.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });
    evoMgr.analyzeEfficiency({
      id: "evo.p6.gate.efficiency",
      intelligenceProfileId: intel.id,
    });

    const predMgr = createPredictiveIntelligenceManager({
      managerId: "evo-p6-gate-pred",
    });
    predMgr.initialize();
    predMgr.start();

    const model = predMgr.createModel({
      id: "evo.p6.gate.model",
      name: "Predictive Intelligence Model",
      productId: product.id,
      intelligenceProfileId: intel.id,
      growthDashboardId: growthDash.id,
      customerHealthProfileId: health.id,
      cloudRuntimeId: runtime.id,
      horizon: "SHORT_TERM",
    });
    const incidentPred = predMgr.predictIncident({
      id: "evo.p6.gate.incpred",
      predictionModelId: model.id,
    });
    const capacity = predMgr.forecastCapacity({
      id: "evo.p6.gate.capacity",
      predictionModelId: model.id,
    });
    const customerRisk = predMgr.detectCustomerRisk({
      id: "evo.p6.gate.custrisk",
      predictionModelId: model.id,
      customerHealthProfileId: health.id,
    });
    predMgr.scoreRisk({
      id: "evo.p6.gate.risk",
      predictionModelId: model.id,
      incidentPredictionId: incidentPred.id,
      capacityForecastId: capacity.id,
      customerRiskSignalId: customerRisk.id,
    });

    const acsMgr = createAutonomousCustomerSuccessManager({
      managerId: "evo-p6-gate-acs",
    });
    acsMgr.initialize();
    acsMgr.start();

    const csIntel = acsMgr.createIntelligence({
      id: "evo.p6.gate.csintel",
      name: "Autonomous CS Intelligence",
      productId: product.id,
      customerHealthProfileId: health.id,
      predictionModelId: model.id,
      customerRiskSignalId: customerRisk.id,
      growthDashboardId: growthDash.id,
      commercialSlaId: commercialSla.id,
      mode: "AUTONOMOUS",
    });
    acsMgr.automateEngagement({
      id: "evo.p6.gate.engage",
      customerIntelligenceId: csIntel.id,
    });
    acsMgr.generateRecommendations({
      idPrefix: "evo.p6.gate.succrec",
      customerIntelligenceId: csIntel.id,
    });
    acsMgr.planChurnPrevention({
      id: "evo.p6.gate.churn",
      customerIntelligenceId: csIntel.id,
    });
    acsMgr.detectExpansion({
      id: "evo.p6.gate.expand",
      customerIntelligenceId: csIntel.id,
    });

    const execDash = ocMgr.buildDashboard({
      id: "evo.p6.gate.execdash",
      orchestrationId: opsOrch.id,
    });

    const dashMgr = createEnterpriseIntelligenceDashboardManager({
      managerId: "evo-p6-gate-dash",
    });
    dashMgr.initialize();
    dashMgr.start();

    const eid = dashMgr.createDashboard({
      id: "evo.p6.gate.eid",
      name: "Enterprise Intelligence Dashboard",
      productId: product.id,
      orchestrationId: opsOrch.id,
      growthDashboardId: growthDash.id,
      predictionModelId: model.id,
      customerIntelligenceId: csIntel.id,
      executiveOpsDashboardId: execDash.id,
      scope: "ENTERPRISE",
    });

    const gdnMgr = createGlobalDeploymentNetworkManager({
      managerId: "evo-p6-gate-gdn",
    });
    gdnMgr.initialize();
    gdnMgr.start();

    const regionEast = gdnMgr.createRegion({
      id: "evo.p6.gate.region.east",
      name: "US East Primary",
      productId: product.id,
      deploymentPackageId: pkg.id,
      region: "US_EAST",
      role: "PRIMARY",
      cloudRuntimeId: runtime.id,
      environmentProfileId: env.id,
      weight: 100,
    });
    const regionWest = gdnMgr.createRegion({
      id: "evo.p6.gate.region.west",
      name: "US West Secondary",
      productId: product.id,
      deploymentPackageId: pkg.id,
      region: "US_WEST",
      role: "SECONDARY",
      cloudRuntimeId: runtimeWest.id,
      environmentProfileId: env.id,
      weight: 70,
    });
    const deplIntel = gdnMgr.createIntelligence({
      id: "evo.p6.gate.deplintel",
      name: "Global Deployment Intelligence",
      productId: product.id,
      deploymentPackageId: pkg.id,
      orchestrationId: opsOrch.id,
      intelligenceDashboardId: eid.id,
      regionProfileIds: [regionEast.id, regionWest.id],
      mode: "OPTIMIZE",
    });
    gdnMgr.assessHealth({
      id: "evo.p6.gate.health.east",
      deploymentIntelligenceId: deplIntel.id,
      regionProfileId: regionEast.id,
    });
    gdnMgr.assessHealth({
      id: "evo.p6.gate.health.west",
      deploymentIntelligenceId: deplIntel.id,
      regionProfileId: regionWest.id,
    });
    gdnMgr.computeRouting({
      id: "evo.p6.gate.routing",
      deploymentIntelligenceId: deplIntel.id,
      strategy: "LATENCY",
    });
    gdnMgr.optimize({
      id: "evo.p6.gate.opt",
      deploymentIntelligenceId: deplIntel.id,
    });

    const mktMgr = createMarketplaceEcosystemManager({
      managerId: "evo-p6-gate",
    });
    mktMgr.initialize();
    mktMgr.start();

    const marketplace = mktMgr.createMarketplace({
      id: "evo.p6.gate.marketplace",
      name: "Enterprise Marketplace",
      productId: product.id,
      deploymentIntelligenceId: deplIntel.id,
      intelligenceDashboardId: eid.id,
      commercialSlaId: commercialSla.id,
      status: "ACTIVE",
    });
    const partner = mktMgr.registerPartner({
      id: "evo.p6.gate.partner",
      marketplaceId: marketplace.id,
      name: "Fitness Partner Co",
      organizationId: org.id,
      tier: "PREFERRED",
      status: "ACTIVE",
    });
    const extension = mktMgr.registerExtension({
      id: "evo.p6.gate.extension",
      marketplaceId: marketplace.id,
      partnerId: partner.id,
      name: "Workout Connector",
      kind: "CONNECTOR",
      version: "1.0.0",
      status: "PUBLISHED",
    });
    const integration = mktMgr.catalogIntegration({
      id: "evo.p6.gate.integration",
      marketplaceId: marketplace.id,
      name: "Marketplace API Integration",
      category: "API",
      apiCatalogEntryId: apiEntry.id,
      extensionId: extension.id,
    });
    const analytics = mktMgr.computeAnalytics({
      id: "evo.p6.gate.analytics",
      marketplaceId: marketplace.id,
    });
    const readiness = mktMgr.evaluateReadiness(marketplace.id);
    const registry = getMarketplaceRegistryManifest();

    const ok =
      marketplace.ecosystemScore >= 40 &&
      partner.status === "ACTIVE" &&
      extension.status === "PUBLISHED" &&
      integration.readinessScore >= 40 &&
      analytics.ecosystemScore >= 40 &&
      readiness.verdict === "READY" &&
      registry.marketplaceId === EVOLUTION_MARKETPLACE_ECOSYSTEM_ID &&
      registry.base === EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE &&
      registry.marketplaceCount >= 1 &&
      registry.partnerCount >= 1 &&
      registry.extensionCount >= 1 &&
      registry.integrationCount >= 1 &&
      registry.analyticsCount >= 1;

    try {
      assertMarketplaceReadinessReady(readiness);
      checks.push(
        check(
          "EVO-P6-STACK",
          "marketplace",
          "Marketplace / partner / extension / integration / analytics / readiness",
          ok,
          `ecosystem=${marketplace.ecosystemScore} partners=${registry.partnerCount} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVO-P6-STACK",
          "marketplace",
          "Marketplace / partner / extension / integration / analytics / readiness",
          false,
          error instanceof Error
            ? error.message
            : "marketplace ecosystem not ready",
        ),
      );
    }

    mktMgr.stop();
    gdnMgr.stop();
    dashMgr.stop();
    acsMgr.stop();
    predMgr.stop();
    evoMgr.stop();
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
        "EVO-P6-STACK",
        "marketplace",
        "Marketplace / partner / extension / integration / analytics / readiness",
        false,
        error instanceof Error
          ? error.message
          : "marketplace ecosystem probe failed",
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
      `evolution-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertEvolutionP6ReleaseGatePass(
  gate: ReleaseGateResult = checkEvolutionP6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Evolution P6 release gate failed: ${gate.summary}`);
  }
}
