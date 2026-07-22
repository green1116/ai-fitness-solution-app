/**
 * Post-Launch P1 — Production Operations Release Gate
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
  OPERATION_CHECKLIST_IDS,
  OPERATIONS_MANAGER_STATUSES,
  OPERATIONS_P1_PRODUCTION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_BASE,
  OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_ID,
  OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
  OPERATIONS_READINESS_VERDICTS,
  OPERATIONAL_STATUS_LEVELS,
  PRODUCTION_OPERATION_STATUSES,
} from "../production.constants";
import {
  assertOperationsReadinessReady,
  clearOperationsProductionLayer,
  createProductionOperationsManager,
  getOperationsRegistryManifest,
} from "../production.manager";

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

export const OPERATIONS_P1_SIGNOFF_VERSION = "operations-p1-signoff-1" as const;

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

export function checkOperationsP1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-P1-CONSTANTS",
      "operations",
      "Production operations version constants",
      OPERATIONS_PRODUCTION_FOUNDATION_ID ===
        "enterprise-post-launch-p1-production-operations-foundation-v1" &&
        OPERATIONS_PRODUCTION_FOUNDATION_VERSION === "operations-p1-1" &&
        OPERATIONS_PRODUCTION_FOUNDATION_BASE ===
          "enterprise-launch-complete-v1" &&
        OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION ===
          "operations-production-foundation-freeze-1" &&
        OPERATIONS_P1_PRODUCTION_FREEZE_VERSION ===
          "operations-p1-production-operations-foundation-freeze-1" &&
        PRODUCTION_OPERATION_STATUSES.length === 5 &&
        OPERATIONAL_STATUS_LEVELS.length === 5 &&
        OPERATION_CHECKLIST_IDS.length === 6 &&
        OPERATIONS_READINESS_VERDICTS.length === 3 &&
        OPERATIONS_MANAGER_STATUSES.length === 4,
      `id=${OPERATIONS_PRODUCTION_FOUNDATION_ID} base=${OPERATIONS_PRODUCTION_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-P1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-P1-E12",
      "e12",
      "E12 productization complete freeze preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "OPS-P1-LAUNCH",
      "launch",
      "Launch complete alias + commercial freeze preserved",
      ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
          "enterprise-launch-commercial-release-complete-v1" &&
        OPERATIONS_PRODUCTION_FOUNDATION_BASE ===
          ENTERPRISE_LAUNCH_COMPLETE_ID,
      `alias=${ENTERPRISE_LAUNCH_COMPLETE_ID} commercial=${LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "ops.p1.gate.product",
      name: "Enterprise Fitness Operations",
      sku: "EFS-OPS-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "ops.p1.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "ops.p1.gate.package",
      productId: product.id,
      name: "Ops Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "ops.p1.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "ops-p1-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();
    const pkg = deplMgr.createPackage({
      id: "ops.p1.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Ops Deploy Package",
      version: "1.0.0",
    });
    const env = deplMgr.createEnvironment({
      id: "ops.p1.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "ops.p1.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "ops-p1-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();
    const productionProfile = launchMgr.createProfile({
      id: "ops.p1.gate.prodprofile",
      name: "Ops Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "ops.p1.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "ops.p1.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const tenantMgr = createTenantProductManager({
      managerId: "ops-p1-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();
    const workspace = tenantMgr.createWorkspace({
      id: "ops.p1.gate.workspace",
      name: "Ops Workspace",
      slug: "ops-gate-ws",
    });
    const tenant = tenantMgr.registerTenant({
      id: "ops.p1.gate.tenant",
      name: "Ops Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    const commercialMgr = createCommercialControlManager({
      managerId: "ops-p1-gate-commercial",
    });
    commercialMgr.initialize();
    commercialMgr.start();
    const commercialSla = commercialMgr.createSla({
      id: "ops.p1.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      tier: "PREMIUM",
    });

    const supportMgr = createSlaSupportPackageManager({
      managerId: "ops-p1-gate-support",
    });
    supportMgr.initialize();
    supportMgr.start();
    const tier = supportMgr.createTier({
      id: "ops.p1.gate.tier",
      name: "Premium Support",
      tier: "PREMIUM",
    });
    const supportProfile = supportMgr.createProfile({
      id: "ops.p1.gate.supprofile",
      name: "Ops Support Package",
      productId: product.id,
      productionProfileId: productionProfile.id,
      productTenantId: tenant.id,
      commercialSlaId: commercialSla.id,
      supportTierId: tier.id,
    });
    supportMgr.activateProfile(supportProfile.id);

    const controlMgr = createLaunchControlPlaneManager({
      managerId: "ops-p1-gate-control",
    });
    controlMgr.initialize();
    controlMgr.start();
    const orch = controlMgr.createOrchestration({
      id: "ops.p1.gate.orch",
      name: "Ops Launch Orchestration",
      productId: product.id,
      productionProfileId: productionProfile.id,
      supportSlaProfileId: supportProfile.id,
      deploymentPackageId: pkg.id,
    });

    const cloudMgr = createCloudRuntimeManager({
      managerId: "ops-p1-gate-cloud",
    });
    cloudMgr.initialize();
    cloudMgr.start();
    const runtime = cloudMgr.createRuntime({
      id: "ops.p1.gate.runtime",
      name: "Ops Production Runtime",
      kind: "CORE",
      version: "1.0.0",
    });
    cloudMgr.registerRuntime(runtime);
    cloudMgr.startRuntime(runtime.id);

    const opsMgr = createProductionOperationsManager({
      managerId: "ops-p1-gate",
    });
    opsMgr.initialize();
    opsMgr.start();

    const operation = opsMgr.createOperation({
      id: "ops.p1.gate.operation",
      name: "Production Operations",
      productId: product.id,
      productionProfileId: productionProfile.id,
      orchestrationId: orch.id,
      supportSlaProfileId: supportProfile.id,
      cloudRuntimeId: runtime.id,
    });

    opsMgr.recordStatus({
      id: "ops.p1.gate.status",
      productionOperationId: operation.id,
      level: "NOMINAL",
      detail: "production nominal",
      source: "gate",
    });

    const checklist = opsMgr.createChecklist({
      id: "ops.p1.gate.checklist",
      productionOperationId: operation.id,
    });
    opsMgr.markChecklistPassed(checklist.id);

    const dashboard = opsMgr.buildHealthDashboard(operation.id);
    const metrics = opsMgr.computeMetrics(operation.id);
    const readiness = opsMgr.evaluateReadiness(operation.id);
    const registry = getOperationsRegistryManifest();

    const ok =
      dashboard.cloudOk === true &&
      dashboard.observabilityOk === true &&
      metrics.readinessScore >= 70 &&
      readiness.verdict === "READY" &&
      registry.operationsId === OPERATIONS_PRODUCTION_FOUNDATION_ID &&
      registry.base === OPERATIONS_PRODUCTION_FOUNDATION_BASE;

    try {
      assertOperationsReadinessReady(readiness);
      checks.push(
        check(
          "OPS-P1-STACK",
          "operations",
          "Operation / status / checklist / health / metrics / readiness",
          ok,
          `cloud=${dashboard.cloudLevel} readiness=${readiness.verdict} score=${metrics.readinessScore}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-P1-STACK",
          "operations",
          "Operation / status / checklist / health / metrics / readiness",
          false,
          error instanceof Error ? error.message : "operations not ready",
        ),
      );
    }

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
        "OPS-P1-STACK",
        "operations",
        "Operation / status / checklist / health / metrics / readiness",
        false,
        error instanceof Error ? error.message : "operations probe failed",
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
      `operations-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertOperationsP1ReleaseGatePass(
  gate: ReleaseGateResult = checkOperationsP1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Operations P1 release gate failed: ${gate.summary}`);
  }
}
