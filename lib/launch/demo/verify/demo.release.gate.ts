/**
 * Launch P3 — Demo Environment Release Gate
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
import { clearCommercialControlLayer } from "../../../product/e12/commercial/commercial.manager";
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
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../../launch.manager";
import {
  clearOnboardingLayer,
  createCustomerOnboardingManager,
} from "../../onboarding/onboarding.manager";
import { LAUNCH_CUSTOMER_ONBOARDING_ID } from "../../onboarding/onboarding.constants";
import {
  DEMO_MANAGER_STATUSES,
  DEMO_READINESS_VERDICTS,
  DEMO_SCENARIO_STEPS,
  DEMO_TENANT_STATUSES,
  DEMO_WORKSPACE_STATUSES,
  LAUNCH_DEMO_ENVIRONMENT_BASE,
  LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_ID,
  LAUNCH_DEMO_ENVIRONMENT_VERSION,
  LAUNCH_P3_DEMO_FREEZE_VERSION,
  SAMPLE_DATA_KINDS,
  SNAPSHOT_STATUSES,
} from "../demo.constants";
import {
  assertDemoReadinessReady,
  clearDemoLayer,
  createDemoEnvironmentManager,
  getDemoRegistryManifest,
} from "../demo.manager";

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

export const LAUNCH_P3_SIGNOFF_VERSION = "launch-p3-signoff-1" as const;

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

export function checkLaunchP3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P3-CONSTANTS",
      "demo",
      "Demo environment version constants",
      LAUNCH_DEMO_ENVIRONMENT_ID ===
        "enterprise-launch-p3-demo-environment-v1" &&
        LAUNCH_DEMO_ENVIRONMENT_VERSION === "launch-p3-1" &&
        LAUNCH_DEMO_ENVIRONMENT_BASE ===
          "enterprise-launch-p2-customer-onboarding-v1" &&
        LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION ===
          "launch-demo-environment-freeze-1" &&
        LAUNCH_P3_DEMO_FREEZE_VERSION ===
          "launch-p3-demo-environment-freeze-1" &&
        DEMO_TENANT_STATUSES.length === 5 &&
        DEMO_WORKSPACE_STATUSES.length === 3 &&
        SAMPLE_DATA_KINDS.length === 5 &&
        DEMO_SCENARIO_STEPS.length === 4 &&
        SNAPSHOT_STATUSES.length === 3 &&
        DEMO_READINESS_VERDICTS.length === 3 &&
        DEMO_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_DEMO_ENVIRONMENT_ID} base=${LAUNCH_DEMO_ENVIRONMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P3-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P3-PRODUCTIZATION",
      "e12",
      "E12 productization complete freeze tag preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "LN-P3-BASE",
      "onboarding",
      "P2 onboarding base preserved",
      LAUNCH_DEMO_ENVIRONMENT_BASE === LAUNCH_CUSTOMER_ONBOARDING_ID,
      `base=${LAUNCH_DEMO_ENVIRONMENT_BASE}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "launch.p3.gate.product",
      name: "Enterprise Fitness Demo",
      sku: "EFS-DEMO-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "launch.p3.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "launch.p3.gate.package",
      productId: product.id,
      name: "Demo Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "launch.p3.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "launch-p3-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();

    const pkg = deplMgr.createPackage({
      id: "launch.p3.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Demo Deploy Package",
      version: "1.0.0",
    });

    const env = deplMgr.createEnvironment({
      id: "launch.p3.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "launch.p3.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "launch-p3-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();

    const productionProfile = launchMgr.createProfile({
      id: "launch.p3.gate.prodprofile",
      name: "Demo Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "launch.p3.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "launch.p3.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const onboardMgr = createCustomerOnboardingManager({
      managerId: "launch-p3-gate-onboard",
    });
    onboardMgr.initialize();
    onboardMgr.start();

    const onboardProfile = onboardMgr.createProfile({
      id: "launch.p3.gate.onboard",
      customerName: "Demo Customer",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
    });

    const demoMgr = createDemoEnvironmentManager({
      managerId: "launch-p3-gate",
    });
    demoMgr.initialize();
    demoMgr.start();

    const tenant = demoMgr.createTenant({
      id: "launch.p3.gate.demotenant",
      name: "Acme Demo",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
      onboardingProfileId: onboardProfile.id,
    });

    const workspace = demoMgr.createWorkspace({
      id: "launch.p3.gate.demows",
      demoTenantId: tenant.id,
      slug: "acme-demo",
    });

    const sample = demoMgr.createSampleProfile({
      id: "launch.p3.gate.sample",
      demoTenantId: tenant.id,
      name: "Standard Demo Dataset",
    });

    const scenario = demoMgr.startScenario({
      id: "launch.p3.gate.scenario",
      demoTenantId: tenant.id,
      sampleDataProfileId: sample.id,
    });

    const snapshots = demoMgr.listSnapshots({ demoTenantId: tenant.id });
    const readiness = demoMgr.evaluateReadiness(tenant.id);

    const reset = demoMgr.resetEnvironment(tenant.id);
    const restored = demoMgr.restoreSnapshot(snapshots[0]!.id);
    const readinessAfterRestore = demoMgr.evaluateReadiness(tenant.id);

    const registry = getDemoRegistryManifest();

    const ok =
      workspace.status === "ACTIVE" &&
      scenario.complete === true &&
      scenario.failed === false &&
      snapshots.length >= 1 &&
      readiness.verdict === "READY" &&
      reset.sampleReset >= 1 &&
      restored.status === "RESTORED" &&
      readinessAfterRestore.verdict === "READY" &&
      registry.demoEnvironmentId === LAUNCH_DEMO_ENVIRONMENT_ID &&
      registry.base === LAUNCH_DEMO_ENVIRONMENT_BASE;

    try {
      assertDemoReadinessReady(readinessAfterRestore);
      checks.push(
        check(
          "LN-P3-STACK",
          "demo",
          "Tenant / workspace / sample / scenario / snapshot / readiness",
          ok,
          `scenario=${scenario.complete} readiness=${readiness.verdict}->${readinessAfterRestore.verdict} snapshot=${restored.status}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "LN-P3-STACK",
          "demo",
          "Tenant / workspace / sample / scenario / snapshot / readiness",
          false,
          error instanceof Error ? error.message : "demo not ready",
        ),
      );
    }

    demoMgr.stop();
    onboardMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "LN-P3-STACK",
        "demo",
        "Tenant / workspace / sample / scenario / snapshot / readiness",
        false,
        error instanceof Error ? error.message : "demo probe failed",
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
      `launch-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP3ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P3 release gate failed: ${gate.summary}`);
  }
}
