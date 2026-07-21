/**
 * Launch P2 — Customer Onboarding Release Gate
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
  ACTIVATION_STATES,
  CUSTOMER_READINESS_VERDICTS,
  LAUNCH_CUSTOMER_ONBOARDING_BASE,
  LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_ID,
  LAUNCH_CUSTOMER_ONBOARDING_VERSION,
  LAUNCH_P2_ONBOARDING_FREEZE_VERSION,
  ONBOARDING_MANAGER_STATUSES,
  ONBOARDING_PROFILE_STATUSES,
  PROVISIONING_STEPS,
} from "../onboarding.constants";
import {
  assertCustomerReadinessReady,
  clearOnboardingLayer,
  createCustomerOnboardingManager,
  getOnboardingRegistryManifest,
} from "../onboarding.manager";

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

export const LAUNCH_P2_SIGNOFF_VERSION = "launch-p2-signoff-1" as const;

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

export function checkLaunchP2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P2-CONSTANTS",
      "onboarding",
      "Customer onboarding version constants",
      LAUNCH_CUSTOMER_ONBOARDING_ID ===
        "enterprise-launch-p2-customer-onboarding-v1" &&
        LAUNCH_CUSTOMER_ONBOARDING_VERSION === "launch-p2-1" &&
        LAUNCH_CUSTOMER_ONBOARDING_BASE ===
          "enterprise-launch-p1-production-deployment-foundation-v1" &&
        LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION ===
          "launch-customer-onboarding-freeze-1" &&
        LAUNCH_P2_ONBOARDING_FREEZE_VERSION ===
          "launch-p2-customer-onboarding-freeze-1" &&
        ONBOARDING_PROFILE_STATUSES.length === 6 &&
        PROVISIONING_STEPS.length === 5 &&
        ACTIVATION_STATES.length === 4 &&
        CUSTOMER_READINESS_VERDICTS.length === 3 &&
        ONBOARDING_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_CUSTOMER_ONBOARDING_ID} base=${LAUNCH_CUSTOMER_ONBOARDING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P2-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P2-PRODUCTIZATION",
      "e12",
      "E12 productization complete freeze tag preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "launch.p2.gate.product",
      name: "Enterprise Fitness Onboarding",
      sku: "EFS-ONB-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "launch.p2.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "launch.p2.gate.package",
      productId: product.id,
      name: "Onboarding Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "launch.p2.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "launch-p2-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();

    const pkg = deplMgr.createPackage({
      id: "launch.p2.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Onboarding Deploy Package",
      version: "1.0.0",
    });

    const env = deplMgr.createEnvironment({
      id: "launch.p2.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "launch.p2.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "launch-p2-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();

    const productionProfile = launchMgr.createProfile({
      id: "launch.p2.gate.prodprofile",
      name: "Onboarding Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "launch.p2.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "launch.p2.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const onboardMgr = createCustomerOnboardingManager({
      managerId: "launch-p2-gate",
    });
    onboardMgr.initialize();
    onboardMgr.start();

    const onboardProfile = onboardMgr.createProfile({
      id: "launch.p2.gate.onboard",
      customerName: "Acme Fitness",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
    });

    const workflow = onboardMgr.startProvisioning({
      id: "launch.p2.gate.prov",
      onboardingProfileId: onboardProfile.id,
      editionId: edition.id,
      packageId: "launch.p2.gate.package",
      workspaceSlug: "acme-fitness",
      organizationSlug: "acme-fitness-org",
    });

    onboardMgr.setConfig({
      onboardingProfileId: onboardProfile.id,
      key: "timezone",
      value: "UTC",
    });

    const checklist = onboardMgr.createChecklist({
      id: "launch.p2.gate.onb.checklist",
      onboardingProfileId: onboardProfile.id,
    });
    onboardMgr.markChecklistPassed(checklist.id);

    const prepared = onboardMgr.prepareActivation(onboardProfile.id);
    const active = onboardMgr.setActivation({
      onboardingProfileId: onboardProfile.id,
      state: "ACTIVE",
      detail: "go-live",
    });

    const readiness = onboardMgr.evaluateReadiness(onboardProfile.id);
    const registry = getOnboardingRegistryManifest();

    const ok =
      workflow.complete === true &&
      prepared.state === "PENDING_ACTIVATION" &&
      active.state === "ACTIVE" &&
      readiness.verdict === "READY" &&
      registry.onboardingId === LAUNCH_CUSTOMER_ONBOARDING_ID &&
      registry.base === LAUNCH_CUSTOMER_ONBOARDING_BASE;

    try {
      assertCustomerReadinessReady(readiness);
      checks.push(
        check(
          "LN-P2-STACK",
          "onboarding",
          "Profile / provision / config / checklist / activation / readiness",
          ok,
          `workflow=${workflow.complete} readiness=${readiness.verdict} activation=${active.state}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "LN-P2-STACK",
          "onboarding",
          "Profile / provision / config / checklist / activation / readiness",
          false,
          error instanceof Error ? error.message : "onboarding not ready",
        ),
      );
    }

    onboardMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "LN-P2-STACK",
        "onboarding",
        "Profile / provision / config / checklist / activation / readiness",
        false,
        error instanceof Error ? error.message : "onboarding probe failed",
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
      `launch-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP2ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P2 release gate failed: ${gate.summary}`);
  }
}
