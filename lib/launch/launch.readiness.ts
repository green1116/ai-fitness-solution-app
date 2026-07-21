/**
 * Launch P1 — Deployment Readiness Model
 * Integrates platform baseline, product manifest, E12 deployment package
 */

import { buildPlatformV1Manifest } from "../platform/v1/platform.manifest";
import { getDeploymentPackage } from "../product/e12/deployment/deployment.package";
import { buildProductFoundation } from "../product/e12/manifest/product.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../product/e12/signoff/governance.freeze.lock";
import { listReleaseChecklists } from "./launch.checklist";
import { getProductionProfile } from "./launch.profile";
import { listProductionArtifacts } from "./launch.artifact";
import type {
  DeploymentReadinessCheck,
  DeploymentReadinessResult,
} from "./launch.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DeploymentReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateDeploymentReadiness(
  productionProfileId: string,
): DeploymentReadinessResult {
  const profile = getProductionProfile(productionProfileId.trim());
  if (!profile) {
    return {
      productionProfileId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "LR-PROFILE",
          "profile",
          "Production profile exists",
          false,
          `profile not found: ${productionProfileId}`,
        ),
      ],
      summary: "deployment readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: DeploymentReadinessCheck[] = [];

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "LR-PLATFORM",
      "platform-v1",
      "Platform baseline aligned",
      platform.aligned === true &&
        profile.platformBaseline === "enterprise-platform-v1-complete",
      platform.summary,
    ),
  );

  const foundation = buildProductFoundation();
  checks.push(
    check(
      "LR-PRODUCT",
      "product",
      "Product foundation ready",
      foundation.ready === true,
      foundation.summary,
    ),
  );

  checks.push(
    check(
      "LR-PRODUCTIZATION",
      "e12",
      "Productization complete freeze tag",
      profile.productizationCompleteId === E12_PRODUCTIZATION_COMPLETE_ID,
      `complete=${profile.productizationCompleteId}`,
    ),
  );

  if (profile.deploymentPackageId) {
    const pkg = getDeploymentPackage(profile.deploymentPackageId);
    checks.push(
      check(
        "LR-DEPLOYMENT",
        "deployment",
        "Deployment package validated/released",
        pkg !== undefined &&
          (pkg.status === "VALIDATED" || pkg.status === "RELEASED") &&
          pkg.productId === profile.productId,
        pkg
          ? `package=${pkg.id} status=${pkg.status}`
          : `package not found: ${profile.deploymentPackageId}`,
      ),
    );
  } else {
    checks.push(
      check(
        "LR-DEPLOYMENT",
        "deployment",
        "Deployment package bound",
        false,
        "deployment package not bound",
      ),
    );
  }

  const checklists = listReleaseChecklists({
    productionProfileId: profile.id,
  });
  const checklistOk =
    checklists.length >= 1 && checklists.every((c) => c.complete);
  checks.push(
    check(
      "LR-CHECKLIST",
      "checklist",
      "Release checklist complete",
      checklistOk,
      `checklists=${checklists.length} complete=${checklistOk}`,
    ),
  );

  const artifacts = listProductionArtifacts({
    productionProfileId: profile.id,
  });
  checks.push(
    check(
      "LR-ARTIFACTS",
      "artifact",
      "Production artifacts registered",
      artifacts.length >= 1,
      `artifacts=${artifacts.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    productionProfileId: profile.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `deployment-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertDeploymentReadinessReady(
  result: DeploymentReadinessResult,
): asserts result is DeploymentReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`deployment not ready: ${result.summary}`);
  }
}
