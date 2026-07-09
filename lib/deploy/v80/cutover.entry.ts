/**
 * V80 DEPLOY P2 — Cutover entry
 */
export { assertCutoverPass, buildCutover, buildCutoverManifest } from "./cutover.builder";
export { CUTOVER_PLAN, isCutoverPlanComplete } from "./deploy.cutover.spec";
export { FIRST_TENANT_LIVE_FLOW, isFirstTenantFlowComplete } from "./deploy.first-tenant.spec";
export {
  getCriticalSmokeTests,
  isSmokeSuiteComplete,
  SMOKE_TEST_SUITE,
} from "./deploy.smoke.spec";
export {
  isRollbackPlanComplete,
  KILL_SWITCH_ENV_KEYS,
  ROLLBACK_PLAN,
} from "./deploy.rollback.spec";
export { V80_DEPLOY_CUTOVER_FREEZE_VERSION, V80_DEPLOY_CUTOVER_VERSION } from "./cutover.types";
export type { CutoverReport } from "./cutover.types";

import { buildCutover } from "./cutover.builder";
import type { CutoverReport } from "./cutover.types";

export function runCutover(input?: { deploymentId?: string }): CutoverReport {
  return buildCutover(input);
}

export function formatCutoverSummary(report: CutoverReport): string {
  return [
    "V80 DEPLOY Cutover",
    `  ready: ${report.cutoverReady}`,
    `  score: ${report.readinessScore}/100`,
    `  launch: ${report.launchReady}`,
    `  cutover steps: ${report.manifest.cutoverSteps}`,
    `  first tenant: ${report.manifest.firstTenantSteps}`,
    `  smoke tests: ${report.manifest.smokeTests}`,
    `  rollback actions: ${report.manifest.rollbackActions}`,
  ].join("\n");
}
