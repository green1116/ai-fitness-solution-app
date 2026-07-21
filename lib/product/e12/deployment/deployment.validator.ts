/**
 * E12-P6 — Deployment Validator
 * Validates package against product manifest, tenant, api, billing edition
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { getApiProductRegistryManifest } from "../api/api.manager";
import { getPricingPlan } from "../billing/billing.plan";
import { getProductEdition } from "../edition/product.edition";
import { buildProductFoundation } from "../manifest/product.manifest";
import { getTenantProductRegistryManifest } from "../tenant/tenant.manager";
import { getDeploymentPackage, setDeploymentPackageStatus } from "./deployment.package";
import { getEnvironmentProfile } from "./deployment.environment";
import type {
  DeploymentValidationCheck,
  DeploymentValidationResult,
} from "./deployment.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DeploymentValidationCheck {
  return { id, component, label, ok, detail };
}

export function validateDeploymentPackage(
  deploymentPackageId: string,
  options?: { environmentProfileId?: string },
): DeploymentValidationResult {
  const pkg = getDeploymentPackage(deploymentPackageId.trim());
  if (!pkg) {
    return {
      deploymentPackageId,
      verdict: "FAIL",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "DP-VALIDATE-PKG",
          "deployment",
          "Package exists",
          false,
          `package not found: ${deploymentPackageId}`,
        ),
      ],
      summary: "deployment validation failed: package not found",
      validatedAt: nowIso(),
    };
  }

  const checks: DeploymentValidationCheck[] = [];

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "DP-VALIDATE-PLATFORM",
      "platform-v1",
      "Platform v1 aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  const foundation = buildProductFoundation();
  checks.push(
    check(
      "DP-VALIDATE-FOUNDATION",
      "product",
      "Product foundation ready",
      foundation.ready === true,
      foundation.summary,
    ),
  );

  const edition = getProductEdition(pkg.editionId);
  checks.push(
    check(
      "DP-VALIDATE-EDITION",
      "edition",
      "Edition bound to product",
      edition !== undefined && edition.productId === pkg.productId,
      edition
        ? `edition=${edition.id} features=${edition.featureIds.length}`
        : `edition not found: ${pkg.editionId}`,
    ),
  );

  if (pkg.pricingPlanId) {
    const plan = getPricingPlan(pkg.pricingPlanId);
    checks.push(
      check(
        "DP-VALIDATE-BILLING",
        "billing",
        "Pricing plan matches edition",
        plan !== undefined &&
          plan.productId === pkg.productId &&
          plan.editionId === pkg.editionId,
        plan
          ? `plan=${plan.id} price=${plan.basePrice}`
          : `plan not found: ${pkg.pricingPlanId}`,
      ),
    );
  }

  const tenantReg = getTenantProductRegistryManifest();
  checks.push(
    check(
      "DP-VALIDATE-TENANT",
      "tenant",
      "Tenant product layer referenced",
      pkg.tenantProductLayerId === tenantReg.tenantProductId,
      `tenant=${pkg.tenantProductLayerId}`,
    ),
  );

  const apiReg = getApiProductRegistryManifest();
  checks.push(
    check(
      "DP-VALIDATE-API",
      "api",
      "API product layer referenced",
      pkg.apiProductLayerId === apiReg.apiProductId,
      `api=${pkg.apiProductLayerId}`,
    ),
  );

  if (options?.environmentProfileId) {
    const env = getEnvironmentProfile(options.environmentProfileId);
    checks.push(
      check(
        "DP-VALIDATE-ENV",
        "environment",
        "Environment profile bound",
        env !== undefined && env.deploymentPackageId === pkg.id,
        env ? `env=${env.id} kind=${env.kind}` : "environment not found",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict = failCount === 0 ? "PASS" : "FAIL";

  if (verdict === "PASS" && pkg.status === "DRAFT") {
    setDeploymentPackageStatus(pkg.id, "VALIDATED");
  }

  return {
    deploymentPackageId: pkg.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `deployment-validation result=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    validatedAt: nowIso(),
  };
}

export function assertDeploymentValidationPass(
  result: DeploymentValidationResult,
): asserts result is DeploymentValidationResult & { verdict: "PASS" } {
  if (result.verdict !== "PASS") {
    throw new Error(`deployment validation failed: ${result.summary}`);
  }
}
