/**
 * Launch P4 — Security Readiness Release Gate
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
  clearDemoLayer,
  createDemoEnvironmentManager,
} from "../../demo/demo.manager";
import { LAUNCH_DEMO_ENVIRONMENT_ID } from "../../demo/demo.constants";
import {
  clearLaunchLayer,
  createProductionLaunchManager,
} from "../../launch.manager";
import { clearOnboardingLayer } from "../../onboarding/onboarding.manager";
import {
  ACCESS_REVIEW_TARGETS,
  AUDIT_VALIDATION_STATUSES,
  COMPLIANCE_CHECK_IDS,
  LAUNCH_P4_SECURITY_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_BASE,
  LAUNCH_SECURITY_READINESS_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_ID,
  LAUNCH_SECURITY_READINESS_VERSION,
  SECURITY_MANAGER_STATUSES,
  SECURITY_PROFILE_STATUSES,
  SECURITY_READINESS_VERDICTS,
} from "../security.constants";
import {
  assertSecurityReadinessReady,
  clearSecurityLayer,
  createSecurityReadinessManager,
  getSecurityRegistryManifest,
} from "../security.manager";

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

export const LAUNCH_P4_SIGNOFF_VERSION = "launch-p4-signoff-1" as const;

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
}

export function checkLaunchP4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "LN-P4-CONSTANTS",
      "security",
      "Security readiness version constants",
      LAUNCH_SECURITY_READINESS_ID ===
        "enterprise-launch-p4-security-readiness-v1" &&
        LAUNCH_SECURITY_READINESS_VERSION === "launch-p4-1" &&
        LAUNCH_SECURITY_READINESS_BASE ===
          "enterprise-launch-p3-demo-environment-v1" &&
        LAUNCH_SECURITY_READINESS_FREEZE_VERSION ===
          "launch-security-readiness-freeze-1" &&
        LAUNCH_P4_SECURITY_FREEZE_VERSION ===
          "launch-p4-security-readiness-freeze-1" &&
        SECURITY_PROFILE_STATUSES.length === 5 &&
        ACCESS_REVIEW_TARGETS.length === 3 &&
        COMPLIANCE_CHECK_IDS.length === 6 &&
        AUDIT_VALIDATION_STATUSES.length === 4 &&
        SECURITY_READINESS_VERDICTS.length === 3 &&
        SECURITY_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_SECURITY_READINESS_ID} base=${LAUNCH_SECURITY_READINESS_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LN-P4-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "LN-P4-PRODUCTIZATION",
      "e12",
      "E12 productization complete freeze tag preserved",
      E12_PRODUCTIZATION_COMPLETE_ID ===
        "enterprise-e12-productization-complete-v1",
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "LN-P4-BASE",
      "demo",
      "P3 demo environment base preserved",
      LAUNCH_SECURITY_READINESS_BASE === LAUNCH_DEMO_ENVIRONMENT_ID,
      `base=${LAUNCH_SECURITY_READINESS_BASE}`,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "launch.p4.gate.product",
      name: "Enterprise Fitness Security",
      sku: "EFS-SEC-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "launch.p4.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "launch.p4.gate.package",
      productId: product.id,
      name: "Security Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const plan = createPricingPlan({
      id: "launch.p4.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const deplMgr = createDeploymentPackageManager({
      managerId: "launch-p4-gate-depl",
    });
    deplMgr.initialize();
    deplMgr.start();

    const pkg = deplMgr.createPackage({
      id: "launch.p4.gate.deplpkg",
      productId: product.id,
      editionId: edition.id,
      pricingPlanId: plan.id,
      name: "Security Deploy Package",
      version: "1.0.0",
    });

    const env = deplMgr.createEnvironment({
      id: "launch.p4.gate.env",
      deploymentPackageId: pkg.id,
      kind: "PRODUCTION",
      name: "Production",
    });
    deplMgr.validate(pkg.id, { environmentProfileId: env.id });
    const artifact = deplMgr.buildArtifact({
      id: "launch.p4.gate.artifact",
      deploymentPackageId: pkg.id,
      environmentProfileId: env.id,
    });
    deplMgr.signArtifact(artifact.id);

    const launchMgr = createProductionLaunchManager({
      managerId: "launch-p4-gate-launch",
    });
    launchMgr.initialize();
    launchMgr.start();

    const productionProfile = launchMgr.createProfile({
      id: "launch.p4.gate.prodprofile",
      name: "Security Production",
      productId: product.id,
      deploymentPackageId: pkg.id,
    });
    const releaseChecklist = launchMgr.createChecklist({
      id: "launch.p4.gate.release.checklist",
      productionProfileId: productionProfile.id,
    });
    launchMgr.markChecklistPassed(releaseChecklist.id);
    launchMgr.registerArtifact({
      id: "launch.p4.gate.prodartifact",
      productionProfileId: productionProfile.id,
      kind: "DEPLOYMENT_PACKAGE",
      refId: pkg.id,
    });
    launchMgr.setProfileStatus(productionProfile.id, "READY");

    const demoMgr = createDemoEnvironmentManager({
      managerId: "launch-p4-gate-demo",
    });
    demoMgr.initialize();
    demoMgr.start();

    const demoTenant = demoMgr.createTenant({
      id: "launch.p4.gate.demotenant",
      name: "Security Demo",
      productId: product.id,
      productionProfileId: productionProfile.id,
      deploymentPackageId: pkg.id,
    });
    demoMgr.createWorkspace({
      id: "launch.p4.gate.demows",
      demoTenantId: demoTenant.id,
      slug: "security-demo",
    });
    const sample = demoMgr.createSampleProfile({
      id: "launch.p4.gate.sample",
      demoTenantId: demoTenant.id,
      name: "Security Demo Dataset",
    });
    demoMgr.startScenario({
      id: "launch.p4.gate.scenario",
      demoTenantId: demoTenant.id,
      sampleDataProfileId: sample.id,
    });

    const refreshedDemo = demoMgr.getTenant(demoTenant.id)!;
    const productTenantId = refreshedDemo.productTenantId!;

    const adminMgr = createAdminConsoleManager({
      managerId: "launch-p4-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();

    const org = adminMgr.registerOrganization({
      id: "launch.p4.gate.org",
      name: "Security Org",
      slug: "security-org",
      productId: product.id,
    });
    adminMgr.assignOrgAdmin({
      id: "launch.p4.gate.orgadmin",
      organizationId: org.id,
      userId: "security-reviewer",
      email: "security@example.com",
    });
    adminMgr.assignRole({
      id: "launch.p4.gate.role",
      userId: "security-reviewer",
      organizationId: org.id,
      role: "ORG_ADMIN",
      productTenantId,
    });
    adminMgr.linkTenant(productTenantId, org.id);

    const apiMgr = createApiProductManager({
      managerId: "launch-p4-gate-api",
    });
    apiMgr.initialize();
    apiMgr.start();

    const apiEntry = apiMgr.registerCatalogEntry({
      id: "launch.p4.gate.api",
      productId: product.id,
      name: "Security Fitness API",
      path: "/api/v1/security",
      version: "v1",
      requiredScope: "api:read",
      rateLimit: 200,
    });
    const developer = apiMgr.registerDeveloper({
      id: "launch.p4.gate.dev",
      userId: "security-dev",
      productTenantId,
      scopes: ["api:read", "api:write"],
    });
    const apiKey = apiMgr.createKey({
      id: "launch.p4.gate.key",
      productTenantId,
      developerId: developer.id,
      name: "Security Gate Key",
      scopes: ["api:read"],
    });

    const secMgr = createSecurityReadinessManager({
      managerId: "launch-p4-gate",
    });
    secMgr.initialize();
    secMgr.start();

    const profile = secMgr.createProfile({
      id: "launch.p4.gate.secprofile",
      name: "Launch Security Profile",
      productId: product.id,
      productionProfileId: productionProfile.id,
      organizationId: org.id,
      productTenantId,
      demoTenantId: demoTenant.id,
      reviewerUserId: "security-reviewer",
    });

    const access = secMgr.startAccessReview({
      id: "launch.p4.gate.access",
      securityProfileId: profile.id,
      permission: "audit:read",
      apiKeyId: apiKey.id,
      apiCatalogEntryId: apiEntry.id,
    });

    const checklist = secMgr.createChecklist({
      id: "launch.p4.gate.compliance",
      securityProfileId: profile.id,
    });
    secMgr.markChecklistPassed(checklist.id);

    const audit = secMgr.validateAudit({
      id: "launch.p4.gate.audit",
      securityProfileId: profile.id,
      minAdminAudits: 1,
      minApiAudits: 1,
    });

    const readiness = secMgr.evaluateReadiness(profile.id);
    const registry = getSecurityRegistryManifest();

    const ok =
      access.passed === true &&
      audit.status === "VALID" &&
      readiness.verdict === "READY" &&
      registry.securityReadinessId === LAUNCH_SECURITY_READINESS_ID &&
      registry.base === LAUNCH_SECURITY_READINESS_BASE;

    try {
      assertSecurityReadinessReady(readiness);
      checks.push(
        check(
          "LN-P4-STACK",
          "security",
          "Profile / access / compliance / audit / readiness",
          ok,
          `access=${access.status} audit=${audit.status} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "LN-P4-STACK",
          "security",
          "Profile / access / compliance / audit / readiness",
          false,
          error instanceof Error ? error.message : "security not ready",
        ),
      );
    }

    secMgr.stop();
    apiMgr.stop();
    adminMgr.stop();
    demoMgr.stop();
    launchMgr.stop();
    deplMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "LN-P4-STACK",
        "security",
        "Profile / access / compliance / audit / readiness",
        false,
        error instanceof Error ? error.message : "security probe failed",
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
      `launch-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchP4ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchP4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch P4 release gate failed: ${gate.summary}`);
  }
}
