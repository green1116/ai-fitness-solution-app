/**
 * Post-Launch P3 — Incident Response Operations Release Gate
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
import {
  clearCustomerSuccessLayer,
  createCustomerSuccessOperationsManager,
} from "../../customer-success/success.manager";
import { OPERATIONS_CUSTOMER_SUCCESS_ID } from "../../customer-success/success.constants";
import {
  ESCALATION_STEP_STATUSES,
  ESCALATION_WORKFLOW_STEPS,
  INCIDENT_IMPACT_LEVELS,
  INCIDENT_MANAGER_STATUSES,
  INCIDENT_READINESS_VERDICTS,
  INCIDENT_URGENCY_LEVELS,
  OPERATIONS_INCIDENT_RESPONSE_BASE,
  OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_ID,
  OPERATIONS_INCIDENT_RESPONSE_VERSION,
  OPERATIONS_INCIDENT_SEVERITIES,
  OPERATIONS_INCIDENT_STATUSES,
  OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION,
  RESOLUTION_OUTCOMES,
} from "../incident.constants";
import {
  assertIncidentReadinessReady,
  clearIncidentResponseLayer,
  createIncidentResponseOperationsManager,
  getIncidentRegistryManifest,
} from "../incident.manager";

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

export const OPERATIONS_P3_SIGNOFF_VERSION = "operations-p3-signoff-1" as const;

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
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
  clearRuntimes();
}

export function checkOperationsP3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P3-CONSTANTS",
      "incident",
      "Incident response version constants",
      OPERATIONS_INCIDENT_RESPONSE_ID ===
        "enterprise-post-launch-p3-incident-response-operations-v1" &&
        OPERATIONS_INCIDENT_RESPONSE_VERSION === "operations-p3-1" &&
        OPERATIONS_INCIDENT_RESPONSE_BASE === OPERATIONS_CUSTOMER_SUCCESS_ID &&
        OPERATIONS_INCIDENT_RESPONSE_BASE ===
          "enterprise-post-launch-p2-customer-success-operations-v1" &&
        OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION ===
          "operations-incident-response-freeze-1" &&
        OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION ===
          "operations-p3-incident-response-operations-freeze-1" &&
        OPERATIONS_INCIDENT_SEVERITIES.length === 4 &&
        OPERATIONS_INCIDENT_STATUSES.length === 6 &&
        INCIDENT_IMPACT_LEVELS.length === 4 &&
        INCIDENT_URGENCY_LEVELS.length === 4 &&
        ESCALATION_WORKFLOW_STEPS.length === 7 &&
        ESCALATION_STEP_STATUSES.length === 5 &&
        RESOLUTION_OUTCOMES.length === 5 &&
        INCIDENT_READINESS_VERDICTS.length === 3 &&
        INCIDENT_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_INCIDENT_RESPONSE_ID} base=${OPERATIONS_INCIDENT_RESPONSE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P3-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P3-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P3-LAUNCH",
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
      "OPS-P3-P2-BASE",
      "operations",
      "P2 customer success freeze preserved as BASE",
      OPERATIONS_CUSTOMER_SUCCESS_ID ===
        "enterprise-post-launch-p2-customer-success-operations-v1" &&
        OPERATIONS_INCIDENT_RESPONSE_BASE === OPERATIONS_CUSTOMER_SUCCESS_ID,
      `p2=${OPERATIONS_CUSTOMER_SUCCESS_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "ops.p3.gate.product",
      name: "Enterprise Fitness Incident Response",
      sku: "EFS-IR-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "ops.p3.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "ops.p3.gate.package",
      productId: product.id,
      name: "IR Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "ops.p3.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "ops-p3-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "ops.p3.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "IR Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "ops.p3.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "ops.p3.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "ops-p3-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "ops.p3.gate.prodprofile",
      name: "IR Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "ops.p3.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "ops.p3.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "ops-p3-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "ops.p3.gate.workspace",
      name: "IR Workspace",
      slug: "ir-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "ops.p3.gate.tenant",
      name: "IR Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    const adminMgr = createAdminConsoleManager({
      managerId: "ops-p3-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();
    const org = adminMgr.registerOrganization({
      id: "ops.p3.gate.org",
      name: "IR Gate Org",
      slug: "ir-gate-org",
      productId: product.id,
    });
    adminMgr.linkTenant(tenant.id, org.id);

    const onboardMgr = createCustomerOnboardingManager({
      managerId: "ops-p3-gate-onboard",
    });
    onboardMgr.initialize();
    onboardMgr.start();
    const onboardProfile = onboardMgr.createProfile({
      id: "ops.p3.gate.onboard",
      customerName: "IR Customer",
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
      detail: "incident response go-live",
    });

    const commercialMgr = createCommercialControlManager({
      managerId: "ops-p3-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "ops.p3.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });
    commercialMgr.transitionCustomer({
      id: "ops.p3.gate.lifecycle.seed",
      organizationId: org.id,
      productId: product.id,
      productTenantId: tenant.id,
      stage: "ACTIVE",
      reason: "seed for incident response",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "ops-p3-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "ops.p3.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "ops.p3.gate.supprofile",
      name: "IR Support Package",
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
      managerId: "ops-p3-gate-control",
    });
    controlMgr.initialize();
    controlMgr.start();
    const orch = controlMgr.createOrchestration({
      id: "ops.p3.gate.orch",
      name: "IR Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "ops-p3-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "ops.p3.gate.runtime",
      name: "IR Production Runtime",
      kind: "CORE",
      version: "1.0.0",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "ops-p3-gate-ops",
    });
    opsMgr.initialize();
    opsMgr.start();
    const operation = opsMgr.createOperation({
      id: "ops.p3.gate.operation",
      name: "IR Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });

    const csMgr = createCustomerSuccessOperationsManager({
      managerId: "ops-p3-gate-cs",
    });
    csMgr.initialize();
    csMgr.start();
    const health = csMgr.createHealthProfile({
      id: "ops.p3.gate.health",
      name: "IR Health",
      productId: product.id,
      organizationId: org.id,
      productTenantId: tenant.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
      onboardingProfileId: onboardProfile.id,
    });

    const irMgr = createIncidentResponseOperationsManager({
      managerId: "ops-p3-gate",
    });
    irMgr.initialize();
    irMgr.start();

    const classification = irMgr.classifySeverity({
      impact: "HIGH",
      urgency: "HIGH",
    });

    const incident = irMgr.openIncident({
      id: "ops.p3.gate.incident",
      title: "Production latency spike",
      productId: product.id,
      productionOperationId: operation.id,
      supportSlaProfileId: supportProfile.id,
      customerHealthProfileId: health.id,
      impact: "HIGH",
      urgency: "HIGH",
      severity: classification.severity,
      detail: "gate incident probe",
    });

    const escalation = irMgr.startEscalation({
      id: "ops.p3.gate.escalation",
      operationsIncidentId: incident.id,
    });

    const resolution = irMgr.recordResolution({
      id: "ops.p3.gate.resolution",
      operationsIncidentId: incident.id,
      outcome: "FIXED",
      detail: "mitigated latency",
      resolvedBy: "ir-oncall",
    });

    const metrics = irMgr.computeMetrics({
      productionOperationId: operation.id,
    });
    const readiness = irMgr.evaluateReadiness(incident.id);
    const registry = getIncidentRegistryManifest();

    const ok =
      classification.severity === "SEV2" &&
      escalation.complete === true &&
      escalation.failed === false &&
      resolution.outcome === "FIXED" &&
      metrics.incidentCount >= 1 &&
      metrics.resolvedCount >= 1 &&
      metrics.mttrScore >= 50 &&
      readiness.verdict === "READY" &&
      registry.incidentResponseId === OPERATIONS_INCIDENT_RESPONSE_ID &&
      registry.base === OPERATIONS_INCIDENT_RESPONSE_BASE;

    try {
      assertIncidentReadinessReady(readiness);
      checks.push(
        check(
          "OPS-P3-STACK",
          "incident",
          "Model / severity / escalation / resolution / metrics / readiness",
          ok,
          `severity=${incident.severity} mttr=${metrics.mttrScore} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-P3-STACK",
          "incident",
          "Model / severity / escalation / resolution / metrics / readiness",
          false,
          error instanceof Error ? error.message : "incident response not ready",
        ),
      );
    }

    irMgr.stop();
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
        "OPS-P3-STACK",
        "incident",
        "Model / severity / escalation / resolution / metrics / readiness",
        false,
        error instanceof Error
          ? error.message
          : "incident response probe failed",
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
      `operations-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP3ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P3 release gate failed: ${gate.summary}`);
  }
}
