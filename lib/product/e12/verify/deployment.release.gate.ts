/**
 * E12-P6 — Deployment Package Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../catalog/product.feature.catalog";
import { E12_PRODUCT_BASE } from "../core/product.constants";
import { createProductEdition } from "../edition/product.edition";
import { registerProductIdentity } from "../identity/product.identity";
import { createCapabilityPackage } from "../packaging/product.capability.package";
import { clearProductRegistry, getProductRegistryManifest } from "../registry/product.registry";
import { clearAdminConsoleLayer } from "../admin/admin.manager";
import { clearApiProductLayer } from "../api/api.manager";
import { clearBillingCommercialLayer } from "../billing/billing.manager";
import { createPricingPlan } from "../billing/billing.plan";
import {
  DEPLOYMENT_MANAGER_STATUSES,
  DEPLOYMENT_PACKAGE_STATUSES,
  E12_DEPLOYMENT_PACKAGE_BASE,
  E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  E12_DEPLOYMENT_PACKAGE_ID,
  E12_DEPLOYMENT_PACKAGE_VERSION,
  E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  ENVIRONMENT_PROFILE_KINDS,
  RELEASE_ARTIFACT_STATUSES,
  VALIDATION_VERDICTS,
} from "../deployment/deployment.constants";
import {
  assertInstallationManifestReady,
  clearDeploymentLayer,
  createDeploymentPackageManager,
  getDeploymentRegistryManifest,
} from "../deployment/deployment.manager";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../tenant/tenant.manager";
import type { GateCheckItem, GateVerdict, ReleaseGateResult } from "./release.gate";

export const E12_P6_SIGNOFF_VERSION = "e12-p6-signoff-1" as const;

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
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

export function checkE12P6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PR-P6-CONSTANTS",
      "deployment",
      "Deployment package layer version constants",
      E12_DEPLOYMENT_PACKAGE_ID === "enterprise-e12-deployment-package-v1" &&
        E12_DEPLOYMENT_PACKAGE_VERSION === "e12-deployment-1" &&
        E12_DEPLOYMENT_PACKAGE_BASE ===
          "enterprise-e12-p5-api-productization-v1" &&
        E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION ===
          "e12-deployment-package-freeze-1" &&
        E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION ===
          "e12-p6-deployment-package-freeze-1" &&
        DEPLOYMENT_PACKAGE_STATUSES.length === 4 &&
        ENVIRONMENT_PROFILE_KINDS.length === 3 &&
        VALIDATION_VERDICTS.length === 2 &&
        RELEASE_ARTIFACT_STATUSES.length === 3 &&
        DEPLOYMENT_MANAGER_STATUSES.length === 4,
      `id=${E12_DEPLOYMENT_PACKAGE_ID} base=${E12_DEPLOYMENT_PACKAGE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PR-P6-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "e12.p6.gate.product",
      name: "Enterprise Fitness Deploy",
      sku: "EFS-DEP-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "e12.p6.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "e12.p6.gate.package",
      productId: product.id,
      name: "Deploy Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "e12.p6.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const registry = getProductRegistryManifest();

    const tenantMgr = createTenantProductManager({ managerId: "e12-p6-gate-tenant" });
    tenantMgr.initialize();
    tenantMgr.start();

    const workspace = tenantMgr.createWorkspace({
      id: "e12.p6.gate.workspace",
      name: "Deploy Workspace",
      slug: "deploy-gate-ws",
    });

    const tenant = tenantMgr.registerTenant({
      id: "e12.p6.gate.tenant",
      name: "Deploy Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    tenantMgr.bindSubscription({
      id: "e12.p6.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "e12.p6.gate.package",
    });

    const deplMgr = createDeploymentPackageManager({ managerId: "e12-p6-gate" });
    deplMgr.initialize();
    deplMgr.start();

    const pkg = deplMgr.createPackage({
      id: "e12.p6.gate.pkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Enterprise Deploy Package",
      version: "1.0.0",
    });

    const env = deplMgr.createEnvironment({
      id: "e12.p6.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
      region: "us-east-1",
    });

    deplMgr.setConfig({
      id: "e12.p6.gate.cfg",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
      scope: "ENVIRONMENT",
      key: "replicas",
      value: 3,
    });

    const validation = deplMgr.validate(pkg.id, {
      environmentProfileId: env.id,
    });

    const artifact = deplMgr.buildArtifact({
      id: "e12.p6.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    const signed = deplMgr.signArtifact(artifact.id);

    const releasedPkg = deplMgr.getPackage(pkg.id);
    const install = deplMgr.installationManifest({
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
      artifactId: signed.id,
    });

    const manifest = getDeploymentRegistryManifest();

    const ok =
      registry.identityCount >= 1 &&
      releasedPkg?.status === "RELEASED" &&
      validation.verdict === "PASS" &&
      signed.status === "SIGNED" &&
      install.ready === true &&
      install.productFoundationReady === true &&
      install.editionId === edition.id &&
      install.pricingPlanId === plan.id &&
      manifest.deploymentPackageId === E12_DEPLOYMENT_PACKAGE_ID &&
      manifest.base === E12_DEPLOYMENT_PACKAGE_BASE;

    try {
      assertInstallationManifestReady(install);
      checks.push(
        check(
          "PR-P6-STACK",
          "deployment",
          "Package / env / config / validate / artifact / manifest",
          ok,
          `valid=${validation.verdict} artifact=${signed.status} ready=${install.ready}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PR-P6-STACK",
          "deployment",
          "Package / env / config / validate / artifact / manifest",
          false,
          error instanceof Error ? error.message : "install not ready",
        ),
      );
    }

    deplMgr.stop();
    tenantMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PR-P6-STACK",
        "deployment",
        "Package / env / config / validate / artifact / manifest",
        false,
        error instanceof Error ? error.message : "deployment probe failed",
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
      `e12-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE12P6ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P6 release gate failed: ${gate.summary}`);
  }
}
