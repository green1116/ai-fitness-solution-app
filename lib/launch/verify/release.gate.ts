/**
 * Launch P1 — Production Deployment Foundation Release Gate
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../../product/e12/catalog/product.feature.catalog";
import { E12_PRODUCT_BASE } from "../../product/e12/core/product.constants";
import { createPricingPlan } from "../../product/e12/billing/billing.plan";
import { clearBillingCommercialLayer } from "../../product/e12/billing/billing.manager";
import { clearAdminConsoleLayer } from "../../product/e12/admin/admin.manager";
import { clearApiProductLayer } from "../../product/e12/api/api.manager";
import { clearCommercialControlLayer } from "../../product/e12/commercial/commercial.manager";
import {
  clearDeploymentLayer,
  createDeploymentPackageManager,
} from "../../product/e12/deployment/deployment.manager";
import { createProductEdition } from "../../product/e12/edition/product.edition";
import { registerProductIdentity } from "../../product/e12/identity/product.identity";
import { createCapabilityPackage } from "../../product/e12/packaging/product.capability.package";
import { clearProductRegistry } from "../../product/e12/registry/product.registry";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import { clearTenantProductLayer } from "../../product/e12/tenant/tenant.manager";
import {
  DEPLOYMENT_READINESS_VERDICTS,
  LAUNCH_MANAGER_STATUSES,
  LAUNCH_P1_PRODUCTION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_BASE,
  LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_ID,
  LAUNCH_PRODUCTION_FOUNDATION_VERSION,
  PRODUCTION_ARTIFACT_KINDS,
  PRODUCTION_PROFILE_STATUSES,
  RELEASE_CHECKLIST_ITEM_STATUSES,
} from "../launch.constants";
import {
  assertLaunchManifestReady,
  clearLaunchLayer,
  createProductionLaunchManager,
  getLaunchRegistryManifest,
} from "../launch.manager";

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

export const LAUNCH_P1_SIGNOFF_VERSION = "launch-p1-signoff-1" as const;

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
  clearLaunchLayer();
  clearCommercialControlLayer();
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

export function checkLaunchP1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P1-CONSTANTS",
      "launch",
      "Launch production foundation version constants",
      LAUNCH_PRODUCTION_FOUNDATION_ID ===
        "enterprise-launch-p1-production-deployment-foundation-v1" &&
        LAUNCH_PRODUCTION_FOUNDATION_VERSION === "launch-p1-1" &&
        LAUNCH_PRODUCTION_FOUNDATION_BASE ===
          "enterprise-e12-productization-complete-v1" &&
        LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION ===
          "launch-production-foundation-freeze-1" &&
        LAUNCH_P1_PRODUCTION_FREEZE_VERSION ===
          "launch-p1-production-deployment-foundation-freeze-1" &&
        PRODUCTION_PROFILE_STATUSES.length === 4 &&
        RELEASE_CHECKLIST_ITEM_STATUSES.length === 4 &&
        DEPLOYMENT_READINESS_VERDICTS.length === 3 &&
        PRODUCTION_ARTIFACT_KINDS.length === 4 &&
        LAUNCH_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_PRODUCTION_FOUNDATION_ID} base=${LAUNCH_PRODUCTION_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P1-PRODUCTIZATION",
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
      id: "launch.p1.gate.product",
      name: "Enterprise Fitness Launch",
      sku: "EFS-LNCH-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "launch.p1.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "launch.p1.gate.package",
      productId: product.id,
      name: "Launch Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "launch.p1.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "launch-p1-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();

    const pkg = deplMgr.createPackage({
      id: "launch.p1.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Launch Deploy Package",
      version: "1.0.0",
    });

    const env = deplMgr.createEnvironment({
      id: "launch.p1.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });

    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "launch.p1.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "launch-p1-gate",
    });
    launchMgr.initialize();
    launchMgr.start();

    const profile = launchMgr.createProfile({
      id: "launch.p1.gate.profile",
      name: "Production Profile",
      productId: product.id,
      deploymentPackageId: pkg.id,
      region: "us-east-1",
    });

    const checklist = launchMgr.createChecklist({
      id: "launch.p1.gate.checklist",
      productionProfileId: profile.id,
    });
    launchMgr.markChecklistPassed(checklist.id);

    launchMgr.registerArtifact({
      id: "launch.p1.gate.prodartifact",
      productionProfileId: profile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.registerArtifact({
      id: "launch.p1.gate.releaseartifact",
      productionProfileId: profile.id,
      kind: "RELEASE_ARTIFACT",
      refId: artifact.id,
      checksum: artifact.checksum,
    });

    launchMgr.setProfileStatus(profile.id, "READY");

    const readiness = launchMgr.evaluateReadiness(profile.id);
    const launchManifest = launchMgr.launchManifest({
      productionProfileId: profile.id,
    });
    const registry = getLaunchRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      launchManifest.ready === true &&
      launchManifest.platformAligned === true &&
      launchManifest.productFoundationReady === true &&
      launchManifest.productizationCompleteId ===
        E12_PRODUCTIZATION_COMPLETE_ID &&
      launchManifest.checklistComplete === true &&
      registry.launchId === LAUNCH_PRODUCTION_FOUNDATION_ID &&
      registry.base === LAUNCH_PRODUCTION_FOUNDATION_BASE;

    try {
      assertLaunchManifestReady(launchManifest);
      checks.push(
        check(
          "LN-P1-STACK",
          "launch",
          "Profile / checklist / readiness / artifact / manifest",
          ok,
          `ready=${launchManifest.ready} verdict=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "LN-P1-STACK",
          "launch",
          "Profile / checklist / readiness / artifact / manifest",
          false,
          error instanceof Error ? error.message : "launch not ready",
        ),
      );
    }

    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "LN-P1-STACK",
        "launch",
        "Profile / checklist / readiness / artifact / manifest",
        false,
        error instanceof Error ? error.message : "launch probe failed",
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
      `launch-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP1ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P1 release gate failed: ${gate.summary}`);
  }
}
