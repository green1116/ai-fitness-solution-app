/**
 * V80 DEPLOY P2 — Cutover builder (read-only P1 consumer)
 */
import { buildDeployLaunch } from "./deploy.builder";
import { V80_DEPLOY_LAUNCH_VERSION } from "./deploy.types";
import { isCutoverPlanComplete, CUTOVER_PLAN } from "./deploy.cutover.spec";
import { FIRST_TENANT_LIVE_FLOW, isFirstTenantFlowComplete } from "./deploy.first-tenant.spec";
import { isSmokeSuiteComplete, SMOKE_TEST_SUITE } from "./deploy.smoke.spec";
import { isRollbackPlanComplete, ROLLBACK_PLAN } from "./deploy.rollback.spec";
import type { CutoverManifest, CutoverReport } from "./cutover.types";
import { V80_DEPLOY_CUTOVER_FREEZE_VERSION, V80_DEPLOY_CUTOVER_VERSION } from "./cutover.types";

export function buildCutoverManifest(input: { launchReady: boolean }): CutoverManifest {
  const cutoverComplete =
    input.launchReady &&
    isCutoverPlanComplete() &&
    isFirstTenantFlowComplete() &&
    isSmokeSuiteComplete() &&
    isRollbackPlanComplete();

  return {
    version: V80_DEPLOY_CUTOVER_VERSION,
    launchVersion: V80_DEPLOY_LAUNCH_VERSION,
    cutoverSteps: CUTOVER_PLAN.length,
    firstTenantSteps: FIRST_TENANT_LIVE_FLOW.length,
    smokeTests: SMOKE_TEST_SUITE.length,
    rollbackActions: ROLLBACK_PLAN.length,
    cutoverComplete,
    summary: `cutover complete=${cutoverComplete} smoke=${SMOKE_TEST_SUITE.length}`,
  };
}

export function buildCutover(input?: { deploymentId?: string }): CutoverReport {
  const deploymentId = input?.deploymentId ?? "v80-production";
  const launch = buildDeployLaunch({ deploymentId });
  const manifest = buildCutoverManifest({ launchReady: launch.launchReady });

  const cutoverReady = launch.launchReady && manifest.cutoverComplete;

  return {
    version: V80_DEPLOY_CUTOVER_VERSION,
    freezeVersion: V80_DEPLOY_CUTOVER_FREEZE_VERSION,
    reportId: `cutover-${deploymentId}`,
    launchReady: launch.launchReady,
    manifest,
    cutoverPlan: CUTOVER_PLAN,
    firstTenantFlow: FIRST_TENANT_LIVE_FLOW,
    smokeSuite: SMOKE_TEST_SUITE,
    rollbackPlan: ROLLBACK_PLAN,
    cutoverReady,
    readinessScore: cutoverReady ? 100 : 0,
    summary: `cutover ready=${cutoverReady} launch=${launch.launchReady}`,
  };
}

export function assertCutoverPass(
  report: CutoverReport,
): asserts report is CutoverReport & { cutoverReady: true } {
  if (!report.cutoverReady) {
    throw new Error(`V80 DEPLOY cutover not ready: ${report.summary}`);
  }
}
