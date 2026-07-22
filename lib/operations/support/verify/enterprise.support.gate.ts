/**
 * Post-Launch P6 — Enterprise Support Operations Release Gate
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
import { clearGrowthAnalyticsLayer } from "../../growth/growth.manager";
import { OPERATIONS_GROWTH_ANALYTICS_ID } from "../../growth/growth.constants";
import {
  clearIncidentResponseLayer,
  createIncidentResponseOperationsManager,
} from "../../incident/incident.manager";
import { clearReleaseManagementLayer } from "../../release/release.manager";
import {
  ENTERPRISE_SUPPORT_MANAGER_STATUSES,
  ENTERPRISE_SUPPORT_READINESS_VERDICTS,
  ESCALATION_ROUTES,
  KNOWLEDGE_ARTICLE_STATUSES,
  OPERATIONS_ENTERPRISE_SUPPORT_BASE,
  OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_ID,
  OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
  OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  SUPPORT_CASE_PRIORITIES,
  SUPPORT_CASE_STATUSES,
  SUPPORT_STEP_STATUSES,
  SUPPORT_WORKFLOW_STEPS,
} from "../support.constants";
import {
  assertEnterpriseSupportReadinessReady,
  clearEnterpriseSupportLayer,
  createEnterpriseSupportOperationsManager,
  getEnterpriseSupportRegistryManifest,
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

export const OPERATIONS_P6_SIGNOFF_VERSION = "operations-p6-signoff-1" as const;

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

export function checkOperationsP6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P6-CONSTANTS",
      "enterprise-support",
      "Enterprise support version constants",
      OPERATIONS_ENTERPRISE_SUPPORT_ID ===
        "enterprise-post-launch-p6-enterprise-support-operations-v1" &&
        OPERATIONS_ENTERPRISE_SUPPORT_VERSION === "operations-p6-1" &&
        OPERATIONS_ENTERPRISE_SUPPORT_BASE === OPERATIONS_GROWTH_ANALYTICS_ID &&
        OPERATIONS_ENTERPRISE_SUPPORT_BASE ===
          "enterprise-post-launch-p5-growth-analytics-operations-v1" &&
        OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION ===
          "operations-enterprise-support-freeze-1" &&
        OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION ===
          "operations-p6-enterprise-support-operations-freeze-1" &&
        SUPPORT_CASE_PRIORITIES.length === 4 &&
        SUPPORT_CASE_STATUSES.length === 6 &&
        SUPPORT_WORKFLOW_STEPS.length === 6 &&
        SUPPORT_STEP_STATUSES.length === 5 &&
        ESCALATION_ROUTES.length === 5 &&
        KNOWLEDGE_ARTICLE_STATUSES.length === 3 &&
        ENTERPRISE_SUPPORT_READINESS_VERDICTS.length === 3 &&
        ENTERPRISE_SUPPORT_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_ENTERPRISE_SUPPORT_ID} base=${OPERATIONS_ENTERPRISE_SUPPORT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P6-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P6-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P6-LAUNCH",
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
      "OPS-P6-P5-BASE",
      "operations",
      "P5 growth analytics freeze preserved as BASE",
      OPERATIONS_GROWTH_ANALYTICS_ID ===
        "enterprise-post-launch-p5-growth-analytics-operations-v1" &&
        OPERATIONS_ENTERPRISE_SUPPORT_BASE === OPERATIONS_GROWTH_ANALYTICS_ID,
      `p5=${OPERATIONS_GROWTH_ANALYTICS_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "ops.p6.gate.product",
      name: "Enterprise Fitness Support Ops",
      sku: "EFS-ES-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "ops.p6.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "ops.p6.gate.package",
      productId: product.id,
      name: "ES Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "ops.p6.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "ops-p6-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "ops.p6.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "ES Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "ops.p6.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "ops.p6.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "ops-p6-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "ops.p6.gate.prodprofile",
      name: "ES Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "ops.p6.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "ops.p6.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "ops-p6-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "ops.p6.gate.workspace",
      name: "ES Workspace",
      slug: "es-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "ops.p6.gate.tenant",
      name: "ES Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    const adminMgr = createAdminConsoleManager({
      managerId: "ops-p6-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "ops.p6.gate.org",
      name: "ES Gate Org",
      slug: "es-gate-org",
      productId: product.id,
    });
    adminMgr.linkTenant(tenant.id, org.id);

    const commercialMgr = createCommercialControlManager({
      managerId: "ops-p6-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "ops.p6.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "ops-p6-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "ops.p6.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "ops.p6.gate.supprofile",
      name: "ES Support Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      productTenantId: tenant.id,
      organizationId: org.id,
      commercialSlaId: commercialSla.id,
      supportTierId: tier.id,
    });
    supportMgr.activateProfile(supportProfile.id);

    const controlMgr = createLaunchControlPlaneManager({
      managerId: "ops-p6-gate-control",
    });
    controlMgr.initialize();
    controlMgr.start();
    const orch = controlMgr.createOrchestration({
      id: "ops.p6.gate.orch",
      name: "ES Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "ops-p6-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "ops.p6.gate.runtime",
      name: "ES Production Runtime",
      kind: "CORE",
      version: "1.0.0",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "ops-p6-gate-ops",
    });
    opsMgr.initialize();
    opsMgr.start();
    const operation = opsMgr.createOperation({
      id: "ops.p6.gate.operation",
      name: "ES Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });

    const csMgr = createCustomerSuccessOperationsManager({
      managerId: "ops-p6-gate-cs",
    });
    csMgr.initialize();
    csMgr.start();
    const health = csMgr.createHealthProfile({
      id: "ops.p6.gate.health",
      name: "ES Health",
      productId: product.id,
      organizationId: org.id,
      productTenantId: tenant.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
    });

    const irMgr = createIncidentResponseOperationsManager({
      managerId: "ops-p6-gate-ir",
    });
    irMgr.initialize();
    irMgr.start();
    const incident = irMgr.openIncident({
      id: "ops.p6.gate.incident",
      title: "Support-linked latency",
      productId: product.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      impact: "HIGH",
      urgency: "HIGH",
      detail: "gate incident for support link",
    });

    const esMgr = createEnterpriseSupportOperationsManager({
      managerId: "ops-p6-gate",
    });
    esMgr.initialize();
    esMgr.start();

    const article = esMgr.createArticle({
      id: "ops.p6.gate.kb",
      title: "Latency triage playbook",
      productId: product.id,
      category: "operations",
      body: "Check runtime health and escalate SEV2+",
      tags: ["latency", "triage"],
    });
    esMgr.publishArticle(article.id);

    const supportCase = esMgr.openCase({
      id: "ops.p6.gate.case",
      title: "Customer reports slow dashboards",
      productId: product.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      operationsIncidentId: incident.id,
      priority: "P2",
      assignee: "l1-agent",
      detail: "gate support case",
      metadata: { productionOperationId: operation.id },
    });
    esMgr.bindKnowledge(supportCase.id, article.id);

    const routing = esMgr.routeEscalation({
      id: "ops.p6.gate.route",
      supportCaseId: supportCase.id,
      toRoute: "L2_SUPPORT",
      reason: "needs specialist review",
    });

    const workflow = esMgr.startWorkflow({
      id: "ops.p6.gate.workflow",
      supportCaseId: supportCase.id,
    });

    const metrics = esMgr.computeMetrics({
      productId: product.id,
      supportSlaProfileId: supportProfile.id,
    });
    const readiness = esMgr.evaluateReadiness(supportCase.id);
    const registry = getEnterpriseSupportRegistryManifest();

    const ok =
      routing.toRoute === "L2_SUPPORT" &&
      workflow.complete === true &&
      workflow.failed === false &&
      metrics.caseCount >= 1 &&
      metrics.supportHealthScore >= 50 &&
      readiness.verdict === "READY" &&
      registry.enterpriseSupportId === OPERATIONS_ENTERPRISE_SUPPORT_ID &&
      registry.base === OPERATIONS_ENTERPRISE_SUPPORT_BASE;

    try {
      assertEnterpriseSupportReadinessReady(readiness);
      checks.push(
        check(
          "OPS-P6-STACK",
          "enterprise-support",
          "Case / workflow / routing / knowledge / metrics / readiness",
          ok,
          `status=${esMgr.getCase(supportCase.id)?.status} score=${metrics.supportHealthScore} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-P6-STACK",
          "enterprise-support",
          "Case / workflow / routing / knowledge / metrics / readiness",
          false,
          error instanceof Error
            ? error.message
            : "enterprise support not ready",
        ),
      );
    }

    esMgr.stop();
    irMgr.stop();
    csMgr.stop();
    opsMgr.stop();
    cloudMgr.stop();
    controlMgr.stop();
    supportMgr.stop();
    commercialMgr.stop();
    adminMgr.stop();
    tenantMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "OPS-P6-STACK",
        "enterprise-support",
        "Case / workflow / routing / knowledge / metrics / readiness",
        false,
        error instanceof Error
          ? error.message
          : "enterprise support probe failed",
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
      `operations-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP6ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P6 release gate failed: ${gate.summary}`);
  }
}
