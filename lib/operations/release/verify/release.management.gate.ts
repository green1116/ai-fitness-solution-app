/**
 * Post-Launch P4 — Release Management Operations Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { clearAdminConsoleLayer } from "../../../product/e12/admin/admin.manager";
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
import { clearCustomerSuccessLayer } from "../../customer-success/success.manager";
import {
  clearIncidentResponseLayer,
  createIncidentResponseOperationsManager,
} from "../../incident/incident.manager";
import { OPERATIONS_INCIDENT_RESPONSE_ID } from "../../incident/incident.constants";
import {
  DEPLOYMENT_APPROVAL_STATUSES,
  OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_BASE,
  OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_ID,
  OPERATIONS_RELEASE_MANAGEMENT_VERSION,
  RELEASE_LIFECYCLE_STATUSES,
  RELEASE_MANAGER_STATUSES,
  RELEASE_READINESS_VERDICTS,
  RELEASE_VERSION_KINDS,
  ROLLBACK_STEP_STATUSES,
  ROLLBACK_WORKFLOW_STEPS,
} from "../release.constants";
import {
  assertReleaseReadinessReady,
  clearReleaseManagementLayer,
  createReleaseManagementOperationsManager,
  getReleaseRegistryManifest,
} from "../release.manager";

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

export const OPERATIONS_P4_SIGNOFF_VERSION = "operations-p4-signoff-1" as const;

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
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
  clearRuntimes();
}

export function checkOperationsP4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P4-CONSTANTS",
      "release",
      "Release management version constants",
      OPERATIONS_RELEASE_MANAGEMENT_ID ===
        "enterprise-post-launch-p4-release-management-operations-v1" &&
        OPERATIONS_RELEASE_MANAGEMENT_VERSION === "operations-p4-1" &&
        OPERATIONS_RELEASE_MANAGEMENT_BASE === OPERATIONS_INCIDENT_RESPONSE_ID &&
        OPERATIONS_RELEASE_MANAGEMENT_BASE ===
          "enterprise-post-launch-p3-incident-response-operations-v1" &&
        OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION ===
          "operations-release-management-freeze-1" &&
        OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION ===
          "operations-p4-release-management-operations-freeze-1" &&
        RELEASE_LIFECYCLE_STATUSES.length === 7 &&
        RELEASE_VERSION_KINDS.length === 4 &&
        DEPLOYMENT_APPROVAL_STATUSES.length === 4 &&
        ROLLBACK_WORKFLOW_STEPS.length === 5 &&
        ROLLBACK_STEP_STATUSES.length === 5 &&
        RELEASE_READINESS_VERDICTS.length === 3 &&
        RELEASE_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_RELEASE_MANAGEMENT_ID} base=${OPERATIONS_RELEASE_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P4-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P4-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P4-LAUNCH",
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
      "OPS-P4-P3-BASE",
      "operations",
      "P3 incident response freeze preserved as BASE",
      OPERATIONS_INCIDENT_RESPONSE_ID ===
        "enterprise-post-launch-p3-incident-response-operations-v1" &&
        OPERATIONS_RELEASE_MANAGEMENT_BASE === OPERATIONS_INCIDENT_RESPONSE_ID,
      `p3=${OPERATIONS_INCIDENT_RESPONSE_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "ops.p4.gate.product",
      name: "Enterprise Fitness Release Management",
      sku: "EFS-RM-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "ops.p4.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "ops.p4.gate.package",
      productId: product.id,
      name: "RM Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "ops.p4.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "ops-p4-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "ops.p4.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "RM Deploy Package",
      version: "1.2.0",
    });
    const env = deplMgr.createEnvironment({
      id: "ops.p4.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "ops.p4.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "ops-p4-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "ops.p4.gate.prodprofile",
      name: "RM Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "ops.p4.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "ops.p4.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "ops-p4-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "ops.p4.gate.workspace",
      name: "RM Workspace",
      slug: "rm-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "ops.p4.gate.tenant",
      name: "RM Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    const commercialMgr = createCommercialControlManager({
      managerId: "ops-p4-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "ops.p4.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "ops-p4-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "ops.p4.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "ops.p4.gate.supprofile",
      name: "RM Support Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      productTenantId: tenant.id,
      commercialSlaId: commercialSla.id,
      supportTierId: tier.id,
    });
    supportMgr.activateProfile(supportProfile.id);

    const controlMgr = createLaunchControlPlaneManager({
      managerId: "ops-p4-gate-control",
    });
    controlMgr.initialize();
    controlMgr.start();
    const orch = controlMgr.createOrchestration({
      id: "ops.p4.gate.orch",
      name: "RM Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "ops-p4-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "ops.p4.gate.runtime",
      name: "RM Production Runtime",
      kind: "CORE",
      version: "1.0.0",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "ops-p4-gate-ops",
    });
    opsMgr.initialize();
    opsMgr.start();
    const operation = opsMgr.createOperation({
      id: "ops.p4.gate.operation",
      name: "RM Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });

    // Incident response layer present for integration (no open blockers)
    const irMgr = createIncidentResponseOperationsManager({
      managerId: "ops-p4-gate-ir",
    });
    irMgr.initialize();
    irMgr.start();

    const rmMgr = createReleaseManagementOperationsManager({
      managerId: "ops-p4-gate",
    });
    rmMgr.initialize();
    rmMgr.start();

    const release = rmMgr.createRelease({
      id: "ops.p4.gate.release",
      name: "1.2.0 Production Release",
      productId: product.id,
      productionOperationId: operation.id,
      orchestrationId: orch.id,
      deploymentPackageId: pkg.id,
    });

    const version = rmMgr.trackVersion({
      id: "ops.p4.gate.version",
      operationsReleaseId: release.id,
      version: "1.2.0",
      kind: "MINOR",
      previousVersion: "1.1.0",
      detail: "gate version track",
    });

    const approval = rmMgr.requestApproval({
      id: "ops.p4.gate.approval",
      operationsReleaseId: release.id,
      approver: "release-manager",
      detail: "gate approval request",
    });
    rmMgr.decideApproval({
      approvalId: approval.id,
      approve: true,
      detail: "approved for deploy",
    });

    const deployed = rmMgr.deploy(release.id, "gate deploy");
    const rollback = rmMgr.startRollback({
      id: "ops.p4.gate.rollback",
      operationsReleaseId: release.id,
      targetVersion: version.previousVersion,
      reason: "gate rollback probe",
    });

    const metrics = rmMgr.computeMetrics({
      productionOperationId: operation.id,
    });
    const readiness = rmMgr.evaluateReadiness(release.id);
    const registry = getReleaseRegistryManifest();

    const ok =
      deployed.status === "RELEASED" &&
      rollback.complete === true &&
      rollback.failed === false &&
      rmMgr.getRelease(release.id)?.status === "ROLLED_BACK" &&
      metrics.releaseCount >= 1 &&
      metrics.releaseSuccessScore >= 50 &&
      readiness.verdict === "READY" &&
      registry.releaseManagementId === OPERATIONS_RELEASE_MANAGEMENT_ID &&
      registry.base === OPERATIONS_RELEASE_MANAGEMENT_BASE;

    try {
      assertReleaseReadinessReady(readiness);
      checks.push(
        check(
          "OPS-P4-STACK",
          "release",
          "Lifecycle / version / approval / rollback / metrics / readiness",
          ok,
          `status=${rmMgr.getRelease(release.id)?.status} score=${metrics.releaseSuccessScore} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-P4-STACK",
          "release",
          "Lifecycle / version / approval / rollback / metrics / readiness",
          false,
          error instanceof Error
            ? error.message
            : "release management not ready",
        ),
      );
    }

    rmMgr.stop();
    irMgr.stop();
    opsMgr.stop();
    cloudMgr.stop();
    controlMgr.stop();
    supportMgr.stop();
    commercialMgr.stop();
    tenantMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "OPS-P4-STACK",
        "release",
        "Lifecycle / version / approval / rollback / metrics / readiness",
        false,
        error instanceof Error
          ? error.message
          : "release management probe failed",
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
      `operations-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP4ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P4 release gate failed: ${gate.summary}`);
  }
}
