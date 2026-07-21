/**
 * Launch P3 — Demo Readiness Model
 * Integrates launch readiness, deployment package, workspace, sample, scenario/snapshot
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getProductTenant } from "../../product/e12/tenant/tenant.product";
import { getOnboardingProfile } from "../onboarding/onboarding.profile";
import { evaluateDeploymentReadiness } from "../launch.readiness";
import { listDemoScenarioWorkflows } from "./demo.scenario";
import { listSampleDataProfiles } from "./demo.sample";
import { listDemoSnapshots } from "./demo.snapshot";
import { getDemoTenant } from "./demo.tenant";
import { getDemoWorkspace } from "./demo.workspace";
import type { DemoReadinessCheck, DemoReadinessResult } from "./demo.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DemoReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateDemoReadiness(
  demoTenantId: string,
): DemoReadinessResult {
  const tenant = getDemoTenant(demoTenantId.trim());
  if (!tenant) {
    return {
      demoTenantId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "DR-TENANT",
          "tenant",
          "Demo tenant exists",
          false,
          `tenant not found: ${demoTenantId}`,
        ),
      ],
      summary: "demo readiness not ready: tenant missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: DemoReadinessCheck[] = [];

  const launchReadiness = evaluateDeploymentReadiness(
    tenant.productionProfileId,
  );
  checks.push(
    check(
      "DR-LAUNCH",
      "launch",
      "Production launch readiness READY",
      launchReadiness.verdict === "READY",
      launchReadiness.summary,
    ),
  );

  if (tenant.deploymentPackageId) {
    const pkg = getDeploymentPackage(tenant.deploymentPackageId);
    checks.push(
      check(
        "DR-DEPLOYMENT",
        "deployment",
        "Deployment package available",
        pkg !== undefined &&
          (pkg.status === "VALIDATED" || pkg.status === "RELEASED"),
        pkg
          ? `package=${pkg.id} status=${pkg.status}`
          : `package not found: ${tenant.deploymentPackageId}`,
      ),
    );
  } else {
    checks.push(
      check(
        "DR-DEPLOYMENT",
        "deployment",
        "Deployment package bound",
        false,
        "deployment package not bound",
      ),
    );
  }

  if (tenant.onboardingProfileId) {
    const onboarding = getOnboardingProfile(tenant.onboardingProfileId);
    checks.push(
      check(
        "DR-ONBOARDING",
        "onboarding",
        "Onboarding profile linked",
        onboarding !== undefined &&
          onboarding.productId === tenant.productId,
        onboarding
          ? `onboarding=${onboarding.id}`
          : `onboarding not found: ${tenant.onboardingProfileId}`,
      ),
    );
  } else {
    checks.push(
      check(
        "DR-ONBOARDING",
        "onboarding",
        "Onboarding profile optional",
        true,
        "onboarding not bound (optional)",
      ),
    );
  }

  const workspaceOk =
    !!tenant.demoWorkspaceId &&
    getDemoWorkspace(tenant.demoWorkspaceId)?.status === "ACTIVE";
  checks.push(
    check(
      "DR-WORKSPACE",
      "workspace",
      "Demo workspace ACTIVE",
      workspaceOk,
      tenant.demoWorkspaceId
        ? `workspace=${tenant.demoWorkspaceId}`
        : "workspace missing",
    ),
  );

  const tenantOk =
    !!tenant.productTenantId &&
    getProductTenant(tenant.productTenantId)?.status === "ACTIVE";
  checks.push(
    check(
      "DR-PRODUCT-TENANT",
      "tenant",
      "Product tenant ACTIVE",
      tenantOk,
      tenant.productTenantId
        ? `tenant=${tenant.productTenantId}`
        : "product tenant missing",
    ),
  );

  const samples = listSampleDataProfiles({ demoTenantId: tenant.id });
  const sampleOk = samples.length >= 1 && samples.some((s) => s.seeded);
  checks.push(
    check(
      "DR-SAMPLE",
      "sample",
      "Sample data seeded",
      sampleOk,
      `profiles=${samples.length} seeded=${samples.filter((s) => s.seeded).length}`,
    ),
  );

  const scenarios = listDemoScenarioWorkflows({ demoTenantId: tenant.id });
  const scenarioOk =
    scenarios.length >= 1 && scenarios.some((s) => s.complete && !s.failed);
  checks.push(
    check(
      "DR-SCENARIO",
      "scenario",
      "Demo scenario complete",
      scenarioOk,
      `scenarios=${scenarios.length} complete=${scenarioOk}`,
    ),
  );

  const snapshots = listDemoSnapshots({ demoTenantId: tenant.id });
  const snapshotOk = snapshots.some(
    (s) => s.status === "CAPTURED" || s.status === "RESTORED",
  );
  checks.push(
    check(
      "DR-SNAPSHOT",
      "snapshot",
      "Demo snapshot available",
      snapshotOk,
      `snapshots=${snapshots.length}`,
    ),
  );

  checks.push(
    check(
      "DR-STATUS",
      "tenant",
      "Demo tenant ACTIVE",
      tenant.status === "ACTIVE",
      `status=${tenant.status}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    demoTenantId: tenant.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `demo-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertDemoReadinessReady(
  result: DemoReadinessResult,
): asserts result is DemoReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`demo not ready: ${result.summary}`);
  }
}
