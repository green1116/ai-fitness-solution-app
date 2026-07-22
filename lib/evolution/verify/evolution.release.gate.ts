/**
 * Evolution P1 — AI Operations Optimization Release Gate
 * BASE: enterprise-post-launch-operations-complete-v1
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import {
  clearAdminConsoleLayer,
  createAdminConsoleManager,
} from "../../product/e12/admin/admin.manager";
import {
  clearApiProductLayer,
  createApiProductManager,
} from "../../product/e12/api/api.manager";
import {
  clearBillingCommercialLayer,
  createBillingCommercialManager,
} from "../../product/e12/billing/billing.manager";
import { createPricingPlan } from "../../product/e12/billing/billing.plan";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../../product/e12/catalog/product.feature.catalog";
import {
  clearCommercialControlLayer,
  createCommercialControlManager,
} from "../../product/e12/commercial/commercial.manager";
import { E12_PRODUCT_BASE } from "../../product/e12/core/product.constants";
import {
  clearDeploymentLayer,
  createDeploymentPackageManager,
} from "../../product/e12/deployment/deployment.manager";
import { createProductEdition } from "../../product/e12/edition/product.edition";
import { registerProductIdentity } from "../../product/e12/identity/product.identity";
import { createCapabilityPackage } from "../../product/e12/packaging/product.capability.package";
import { clearProductRegistry } from "../../product/e12/registry/product.registry";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../../product/e12/tenant/tenant.manager";
import { clearRuntimes } from "../../cloud-runtime/e11/registry/cloud.registry";
import { createCloudRuntimeManager } from "../../cloud-runtime/e11/runtime/cloud.runtime";
import {
  clearControlLayer,
  createLaunchControlPlaneManager,
} from "../../launch/control/control.manager";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../../launch/launch.manager";
import { clearOnboardingLayer } from "../../launch/onboarding/onboarding.manager";
import { clearDemoLayer } from "../../launch/demo/demo.manager";
import { clearDocumentationLayer } from "../../launch/documentation/documentation.manager";
import { clearSecurityLayer } from "../../launch/security/security.manager";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../../launch/signoff/governance.freeze.lock";
import {
  clearSupportLayer,
  createSlaSupportPackageManager,
} from "../../launch/support/support.manager";
import {
  clearOperationsProductionLayer,
  createProductionOperationsManager,
} from "../../operations/production/production.manager";
import {
  clearCustomerSuccessLayer,
  createCustomerSuccessOperationsManager,
} from "../../operations/customer-success/success.manager";
import {
  clearGrowthAnalyticsLayer,
  createGrowthAnalyticsOperationsManager,
} from "../../operations/growth/growth.manager";
import {
  clearIncidentResponseLayer,
  createIncidentResponseOperationsManager,
} from "../../operations/incident/incident.manager";
import {
  clearReleaseManagementLayer,
  createReleaseManagementOperationsManager,
} from "../../operations/release/release.manager";
import {
  clearEnterpriseSupportLayer,
  createEnterpriseSupportOperationsManager,
} from "../../operations/support/support.manager";
import {
  clearOperationsControlLayer,
  createOperationsControlPlaneManager,
} from "../../operations/control/control.manager";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
} from "../../operations/signoff/governance.freeze.lock";
import {
  EFFICIENCY_BANDS,
  EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
  EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
  EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
  EVOLUTION_MANAGER_STATUSES,
  EVOLUTION_P1_AI_OPS_FREEZE_VERSION,
  EVOLUTION_READINESS_VERDICTS,
  IMPROVEMENT_STATUSES,
  INTELLIGENCE_SIGNAL_KINDS,
  OPTIMIZATION_PRIORITIES,
} from "../evolution.constants";
import {
  assertEvolutionReadinessReady,
  clearEvolutionLayer,
  createAiOperationsOptimizationManager,
  getEvolutionRegistryManifest,
} from "../evolution.manager";

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

export const EVOLUTION_P1_SIGNOFF_VERSION = "evolution-p1-signoff-1" as const;

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

export function checkEvolutionP1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "EVO-P1-CONSTANTS",
      "evolution",
      "AI operations optimization version constants",
      EVOLUTION_AI_OPS_OPTIMIZATION_ID ===
        "enterprise-evolution-p1-ai-operations-optimization-v1" &&
        EVOLUTION_AI_OPS_OPTIMIZATION_VERSION === "evolution-p1-1" &&
        EVOLUTION_AI_OPS_OPTIMIZATION_BASE ===
          OPERATIONS_GOVERNANCE_COMPLETE_ID &&
        EVOLUTION_AI_OPS_OPTIMIZATION_BASE ===
          "enterprise-post-launch-operations-complete-v1" &&
        EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION ===
          "evolution-ai-ops-optimization-freeze-1" &&
        EVOLUTION_P1_AI_OPS_FREEZE_VERSION ===
          "evolution-p1-ai-operations-optimization-freeze-1" &&
        INTELLIGENCE_SIGNAL_KINDS.length === 5 &&
        EFFICIENCY_BANDS.length === 5 &&
        OPTIMIZATION_PRIORITIES.length === 4 &&
        IMPROVEMENT_STATUSES.length === 5 &&
        EVOLUTION_READINESS_VERDICTS.length === 3 &&
        EVOLUTION_MANAGER_STATUSES.length === 4,
      `id=${EVOLUTION_AI_OPS_OPTIMIZATION_ID} base=${EVOLUTION_AI_OPS_OPTIMIZATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVO-P1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVO-P1-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "EVO-P1-LAUNCH",
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
      "EVO-P1-OPS-COMPLETE",
      "operations",
      "Post-launch operations complete BASE preserved",
      OPERATIONS_GOVERNANCE_COMPLETE_ID ===
        "enterprise-post-launch-operations-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        EVOLUTION_AI_OPS_OPTIMIZATION_BASE === OPERATIONS_GOVERNANCE_COMPLETE_ID,
      `complete=${OPERATIONS_GOVERNANCE_COMPLETE_ID} alias=${ENTERPRISE_OPERATIONS_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "evo.p1.gate.product",
      name: "Enterprise Fitness Evolution AI Ops",
      sku: "EFS-EVO-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "evo.p1.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "evo.p1.gate.package",
      productId: product.id,
      name: "EVO Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "evo.p1.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "evo-p1-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "evo.p1.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "EVO Deploy Package",
      version: "2.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "evo.p1.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "evo.p1.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "evo-p1-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "evo.p1.gate.prodprofile",
      name: "EVO Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "evo.p1.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "evo.p1.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "evo-p1-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "evo.p1.gate.workspace",
      name: "EVO Workspace",
      slug: "evo-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "evo.p1.gate.tenant",
      name: "EVO Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);
    const tenantSub = tenantMgr.bindSubscription({
      id: "evo.p1.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "evo.p1.gate.package",
    });

    const adminMgr = createAdminConsoleManager({
      managerId: "evo-p1-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "evo.p1.gate.org",
      name: "EVO Gate Org",
      slug: "evo-gate-org",
      productId: product.id,
    });
    adminMgr.linkTenant(tenant.id, org.id);

    const billingMgr = createBillingCommercialManager({
      managerId: "evo-p1-gate-billing",
    });
    billingMgr.initialize();
    billingMgr.start();
    const billingPlan = billingMgr.createPlan({
      id: "evo.p1.gate.billing.plan",
      productId: product.id,
      editionId: edition.id,
      name: "EVO Billing Monthly",
      basePrice: 99,
      billingCycle: "MONTHLY",
    });
    const billingSub = billingMgr.createSubscription({
      id: "evo.p1.gate.bsub",
      productTenantId: tenant.id,
      tenantSubscriptionId: tenantSub.id,
      pricingPlanId: billingPlan.id,
    });
    billingMgr.activateSubscription(billingSub.id);
    billingMgr.recordUsage({
      id: "evo.p1.gate.usage",
      productTenantId: tenant.id,
      billingSubscriptionId: billingSub.id,
      meter: "REQUEST",
      quantity: 200,
    });

    const apiMgr = createApiProductManager({
      managerId: "evo-p1-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();
    const apiEntry = apiMgr.registerCatalogEntry({
      id: "evo.p1.gate.api",
      productId: product.id,
      name: "EVO API",
      path: "/api/v1/evolution",
      version: "v1",
      requiredScope: "api:read",
    });
    const developer = apiMgr.registerDeveloper({
      id: "evo.p1.gate.dev",
      userId: "evo-dev",
      productTenantId: tenant.id,
      scopes: ["api:read"],
    });
    const apiKey = apiMgr.createKey({
      id: "evo.p1.gate.key",
      productTenantId: tenant.id,
      developerId: developer.id,
      name: "EVO Key",
      scopes: ["api:read"],
    });
    for (let i = 0; i < 10; i++) {
      apiMgr.recordUsage({
        id: `evo.p1.gate.apiusage.${i}`,
        productTenantId: tenant.id,
        developerId: developer.id,
        apiKeyId: apiKey.id,
        apiCatalogEntryId: apiEntry.id,
        billingSubscriptionId: billingSub.id,
      });
    }

    const commercialMgr = createCommercialControlManager({
      managerId: "evo-p1-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "evo.p1.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });
    commercialMgr.transitionCustomer({
      id: "evo.p1.gate.lifecycle",
      organizationId: org.id,
      productId: product.id,
      productTenantId: tenant.id,
      stage: "ACTIVE",
      reason: "evolution ai ops seed",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "evo-p1-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "evo.p1.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "evo.p1.gate.supprofile",
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
      managerId: "evo-p1-gate-launch-control",
    });
    launchControlMgr.initialize();
    launchControlMgr.start();
    const orch = launchControlMgr.createOrchestration({
      id: "evo.p1.gate.launch.orch",
      name: "EVO Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "evo-p1-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "evo.p1.gate.runtime",
      name: "EVO Production Runtime",
      kind: "CORE",
      version: "1.0.0",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "evo-p1-gate-ops",
    });
    opsMgr.initialize();
    opsMgr.start();
    const operation = opsMgr.createOperation({
      id: "evo.p1.gate.operation",
      name: "EVO Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });
    opsMgr.recordStatus({
      id: "evo.p1.gate.status",
      productionOperationId: operation.id,
      level: "NOMINAL",
      detail: "nominal",
      source: "gate",
    });
    const opsChecklist = opsMgr.createChecklist({
      id: "evo.p1.gate.checklist",
      productionOperationId: operation.id,
    });
    opsMgr.markChecklistPassed(opsChecklist.id);

    const csMgr = createCustomerSuccessOperationsManager({
      managerId: "evo-p1-gate-cs",
    });
    csMgr.initialize();
    csMgr.start();
    const health = csMgr.createHealthProfile({
      id: "evo.p1.gate.health",
      name: "EVO Health",
      productId: product.id,
      organizationId: org.id,
      productTenantId: tenant.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
    });
    csMgr.recordAdoption({
      id: "evo.p1.gate.adoption",
      customerHealthProfileId: health.id,
      stage: "ADOPTED",
      featureCount: 6,
      activeUsers: 12,
    });

    const irMgr = createIncidentResponseOperationsManager({
      managerId: "evo-p1-gate-ir",
    });
    irMgr.initialize();
    irMgr.start();
    const incident = irMgr.openIncident({
      id: "evo.p1.gate.incident",
      title: "Transient latency",
      productId: product.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      impact: "MEDIUM",
      urgency: "NORMAL",
    });
    irMgr.startEscalation({
      id: "evo.p1.gate.escalation",
      operationsIncidentId: incident.id,
    });
    irMgr.recordResolution({
      id: "evo.p1.gate.resolution",
      operationsIncidentId: incident.id,
      outcome: "FIXED",
      detail: "resolved for evolution",
    });

    const rmMgr = createReleaseManagementOperationsManager({
      managerId: "evo-p1-gate-rm",
    });
    rmMgr.initialize();
    rmMgr.start();
    const release = rmMgr.createRelease({
      id: "evo.p1.gate.release",
      name: "2.0.0 Release",
      productId: product.id,
      productionOperationId: operation.id,
      orchestrationId: orch.id,
      deploymentPackageId: pkg.id,
    });
    rmMgr.trackVersion({
      id: "evo.p1.gate.version",
      operationsReleaseId: release.id,
      version: "2.0.0",
      kind: "MINOR",
      previousVersion: "1.9.0",
    });
    const approval = rmMgr.requestApproval({
      id: "evo.p1.gate.approval",
      operationsReleaseId: release.id,
      approver: "evolution",
    });
    rmMgr.decideApproval({ approvalId: approval.id, approve: true });
    rmMgr.deploy(release.id, "evolution gate deploy");

    const gaMgr = createGrowthAnalyticsOperationsManager({
      managerId: "evo-p1-gate-ga",
    });
    gaMgr.initialize();
    gaMgr.start();
    const growthDash = gaMgr.buildDashboard({
      id: "evo.p1.gate.growth",
      productId: product.id,
      productTenantId: tenant.id,
      customerHealthProfileId: health.id,
    });

    const esMgr = createEnterpriseSupportOperationsManager({
      managerId: "evo-p1-gate-es",
    });
    esMgr.initialize();
    esMgr.start();
    const article = esMgr.createArticle({
      id: "evo.p1.gate.kb",
      title: "Evolution AI ops playbook",
      productId: product.id,
      category: "evolution",
      body: "Use AI operations optimization",
      tags: ["evolution"],
    });
    esMgr.publishArticle(article.id);
    const supportCase = esMgr.openCase({
      id: "evo.p1.gate.case",
      title: "Evolution inquiry",
      productId: product.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      operationsIncidentId: incident.id,
      priority: "P3",
    });
    esMgr.bindKnowledge(supportCase.id, article.id);
    esMgr.routeEscalation({
      id: "evo.p1.gate.route",
      supportCaseId: supportCase.id,
      toRoute: "L2_SUPPORT",
    });
    esMgr.startWorkflow({
      id: "evo.p1.gate.workflow",
      supportCaseId: supportCase.id,
    });

    const ocMgr = createOperationsControlPlaneManager({
      managerId: "evo-p1-gate-oc",
    });
    ocMgr.initialize();
    ocMgr.start();
    const opsOrch = ocMgr.createOrchestration({
      id: "evo.p1.gate.opsorch",
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
      managerId: "evo-p1-gate",
    });
    evoMgr.initialize();
    evoMgr.start();

    const intel = evoMgr.createIntelligence({
      id: "evo.p1.gate.intel",
      name: "AI Ops Intelligence",
      productId: product.id,
      orchestrationId: opsOrch.id,
      growthDashboardId: growthDash.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });
    const analysis = evoMgr.analyzeEfficiency({
      id: "evo.p1.gate.efficiency",
      intelligenceProfileId: intel.id,
    });
    const recommendations = evoMgr.generateRecommendations({
      idPrefix: "evo.p1.gate.rec",
      intelligenceProfileId: intel.id,
      efficiencyAnalysisId: analysis.id,
    });
    const resource = evoMgr.computeResource({
      id: "evo.p1.gate.resource",
      intelligenceProfileId: intel.id,
    });
    const improvement = evoMgr.trackImprovement({
      id: "evo.p1.gate.improve",
      intelligenceProfileId: intel.id,
      recommendationId: recommendations[0]!.id,
      status: "IN_PROGRESS",
      progress: 25,
    });
    const readiness = evoMgr.evaluateReadiness(intel.id);
    const registry = getEvolutionRegistryManifest();

    const ok =
      intel.signals.length === 5 &&
      intel.intelligenceScore >= 40 &&
      !!analysis.band &&
      recommendations.length >= 1 &&
      resource.runtimeHealthy === true &&
      improvement.status === "IN_PROGRESS" &&
      readiness.verdict === "READY" &&
      registry.evolutionId === EVOLUTION_AI_OPS_OPTIMIZATION_ID &&
      registry.base === EVOLUTION_AI_OPS_OPTIMIZATION_BASE &&
      registry.intelligenceCount >= 1 &&
      registry.efficiencyCount >= 1 &&
      registry.recommendationCount >= 1 &&
      registry.resourceInsightCount >= 1 &&
      registry.improvementCount >= 1;

    try {
      assertEvolutionReadinessReady(readiness);
      checks.push(
        check(
          "EVO-P1-STACK",
          "evolution",
          "Intelligence / efficiency / recommendation / resource / improvement / readiness",
          ok,
          `intel=${intel.intelligenceScore} band=${analysis.band} recs=${recommendations.length} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVO-P1-STACK",
          "evolution",
          "Intelligence / efficiency / recommendation / resource / improvement / readiness",
          false,
          error instanceof Error
            ? error.message
            : "evolution AI ops not ready",
        ),
      );
    }

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
        "EVO-P1-STACK",
        "evolution",
        "Intelligence / efficiency / recommendation / resource / improvement / readiness",
        false,
        error instanceof Error
          ? error.message
          : "evolution AI ops probe failed",
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
      `evolution-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertEvolutionP1ReleaseGatePass(
  gate: ReleaseGateResult = checkEvolutionP1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Evolution P1 release gate failed: ${gate.summary}`);
  }
}
