/**
 * Launch P2 — Customer Readiness Model
 * Integrates launch readiness, provisioning, checklist, activation
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getProductTenant } from "../../product/e12/tenant/tenant.product";
import { evaluateDeploymentReadiness } from "../launch.readiness";
import { getCustomerActivation } from "./onboarding.activation";
import { listCustomerConfigurations } from "./onboarding.config";
import { listOnboardingChecklists } from "./onboarding.checklist";
import { getOnboardingProfile } from "./onboarding.profile";
import { listTenantProvisioningWorkflows } from "./onboarding.provisioning";
import type {
  CustomerReadinessCheck,
  CustomerReadinessResult,
} from "./onboarding.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): CustomerReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCustomerReadiness(
  onboardingProfileId: string,
): CustomerReadinessResult {
  const profile = getOnboardingProfile(onboardingProfileId.trim());
  if (!profile) {
    return {
      onboardingProfileId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "CR-PROFILE",
          "profile",
          "Onboarding profile exists",
          false,
          `profile not found: ${onboardingProfileId}`,
        ),
      ],
      summary: "customer readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: CustomerReadinessCheck[] = [];

  const launchReadiness = evaluateDeploymentReadiness(
    profile.productionProfileId,
  );
  checks.push(
    check(
      "CR-LAUNCH",
      "launch",
      "Production launch readiness READY",
      launchReadiness.verdict === "READY",
      launchReadiness.summary,
    ),
  );

  if (profile.deploymentPackageId) {
    const pkg = getDeploymentPackage(profile.deploymentPackageId);
    checks.push(
      check(
        "CR-DEPLOYMENT",
        "deployment",
        "Deployment package available",
        pkg !== undefined &&
          (pkg.status === "VALIDATED" || pkg.status === "RELEASED"),
        pkg
          ? `package=${pkg.id} status=${pkg.status}`
          : `package not found: ${profile.deploymentPackageId}`,
      ),
    );
  } else {
    checks.push(
      check(
        "CR-DEPLOYMENT",
        "deployment",
        "Deployment package bound",
        false,
        "deployment package not bound",
      ),
    );
  }

  const workflows = listTenantProvisioningWorkflows({
    onboardingProfileId: profile.id,
  });
  const provisioningOk =
    workflows.length >= 1 && workflows.some((w) => w.complete);
  checks.push(
    check(
      "CR-PROVISION",
      "tenant",
      "Tenant provisioning complete",
      provisioningOk,
      `workflows=${workflows.length} complete=${provisioningOk}`,
    ),
  );

  const tenantOk =
    !!profile.productTenantId &&
    getProductTenant(profile.productTenantId)?.status === "ACTIVE";
  checks.push(
    check(
      "CR-TENANT",
      "tenant",
      "Product tenant ACTIVE",
      tenantOk,
      profile.productTenantId
        ? `tenant=${profile.productTenantId}`
        : "tenant missing",
    ),
  );

  checks.push(
    check(
      "CR-ORG",
      "admin",
      "Organization linked",
      !!profile.organizationId,
      profile.organizationId
        ? `organization=${profile.organizationId}`
        : "organization missing",
    ),
  );

  const configs = listCustomerConfigurations({
    onboardingProfileId: profile.id,
  });
  checks.push(
    check(
      "CR-CONFIG",
      "config",
      "Customer configuration present",
      configs.length >= 1,
      `configs=${configs.length}`,
    ),
  );

  const checklists = listOnboardingChecklists({
    onboardingProfileId: profile.id,
  });
  const checklistOk =
    checklists.length >= 1 && checklists.every((c) => c.complete);
  checks.push(
    check(
      "CR-CHECKLIST",
      "checklist",
      "Onboarding checklist complete",
      checklistOk,
      `checklists=${checklists.length} complete=${checklistOk}`,
    ),
  );

  const activation = getCustomerActivation(profile.id);
  checks.push(
    check(
      "CR-ACTIVATION",
      "activation",
      "Activation prepared or active",
      activation !== undefined &&
        (activation.state === "PENDING_ACTIVATION" ||
          activation.state === "ACTIVE"),
      activation
        ? `state=${activation.state}`
        : "activation missing",
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    onboardingProfileId: profile.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `customer-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertCustomerReadinessReady(
  result: CustomerReadinessResult,
): asserts result is CustomerReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`customer not ready: ${result.summary}`);
  }
}
