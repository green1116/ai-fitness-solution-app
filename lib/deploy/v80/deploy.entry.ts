/**
 * V80 DEPLOY P1 — Launch entry
 */
export {
  assertDeployLaunchPass,
  buildDeployLaunch,
  buildDeployLaunchManifest,
} from "./deploy.builder";
export { DEPLOY_STRUCTURE, isDeployStructureComplete } from "./deploy.structure.spec";
export {
  getForbiddenProductionEnvKeys,
  getRequiredEnvKeys,
  isEnvContractComplete,
  V80_ENV_CONTRACT,
} from "./deploy.env.contract";
export {
  getRuntimeEntryByKind,
  isRuntimeEntryComplete,
  RUNTIME_ENTRY_POINTS,
} from "./deploy.runtime.spec";
export { GO_LIVE_CHECKLIST, isGoLiveChecklistComplete } from "./deploy.checklist";
export { V80_DEPLOY_LAUNCH_FREEZE_VERSION, V80_DEPLOY_LAUNCH_VERSION } from "./deploy.types";
export type { DeployLaunchReport } from "./deploy.types";

import { buildDeployLaunch } from "./deploy.builder";
import type { DeployLaunchReport } from "./deploy.types";

export function runDeployLaunch(input?: { deploymentId?: string }): DeployLaunchReport {
  return buildDeployLaunch(input);
}

export function formatDeployLaunchSummary(report: DeployLaunchReport): string {
  return [
    "V80 DEPLOY Launch",
    `  ready: ${report.launchReady}`,
    `  score: ${report.readinessScore}/100`,
    `  scale: ${report.scaleReady}`,
    `  structure: ${report.manifest.structureNodes}`,
    `  env vars: ${report.manifest.envVars}`,
    `  runtime entries: ${report.manifest.runtimeEntries}`,
    `  go-live gates: ${report.manifest.goLiveGates}`,
  ].join("\n");
}
