/**
 * V80 DEPLOY P1 — Launch builder (read-only CODE + PRODUCT consumer)
 */
import { buildCodeRelease } from "@/lib/code/v80/release.entry";
import { V80_CODE_RELEASE_VERSION } from "@/lib/code/v80/release.types";
import { buildScale } from "@/lib/product/v80/scale.builder";
import { isDeployStructureComplete, DEPLOY_STRUCTURE } from "./deploy.structure.spec";
import { isEnvContractComplete, V80_ENV_CONTRACT } from "./deploy.env.contract";
import { isRuntimeEntryComplete, RUNTIME_ENTRY_POINTS } from "./deploy.runtime.spec";
import { GO_LIVE_CHECKLIST, isGoLiveChecklistComplete } from "./deploy.checklist";
import type { DeployLaunchManifest, DeployLaunchReport } from "./deploy.types";
import { V80_DEPLOY_LAUNCH_FREEZE_VERSION, V80_DEPLOY_LAUNCH_VERSION } from "./deploy.types";

export function buildDeployLaunchManifest(input: { scaleReady: boolean }): DeployLaunchManifest {
  const structureComplete = isDeployStructureComplete();
  const envComplete = isEnvContractComplete();
  const runtimeComplete = isRuntimeEntryComplete();
  const checklistComplete = isGoLiveChecklistComplete();

  const launchComplete =
    input.scaleReady && structureComplete && envComplete && runtimeComplete && checklistComplete;

  return {
    version: V80_DEPLOY_LAUNCH_VERSION,
    codeReleaseVersion: V80_CODE_RELEASE_VERSION,
    structureNodes: DEPLOY_STRUCTURE.length,
    envVars: V80_ENV_CONTRACT.length,
    runtimeEntries: RUNTIME_ENTRY_POINTS.length,
    goLiveGates: GO_LIVE_CHECKLIST.length,
    launchComplete,
    summary: `deploy-launch complete=${launchComplete} gates=${GO_LIVE_CHECKLIST.length}`,
  };
}

export function buildDeployLaunch(input?: { deploymentId?: string }): DeployLaunchReport {
  const deploymentId = input?.deploymentId ?? "v80-production";
  const release = buildCodeRelease({ deploymentId });
  const scale = buildScale({ deploymentId });
  const manifest = buildDeployLaunchManifest({ scaleReady: scale.scaleReady && release.releaseReady });

  const launchReady = release.releaseReady && scale.scaleReady && manifest.launchComplete;

  return {
    version: V80_DEPLOY_LAUNCH_VERSION,
    freezeVersion: V80_DEPLOY_LAUNCH_FREEZE_VERSION,
    reportId: `deploy-launch-${deploymentId}`,
    scaleReady: scale.scaleReady,
    manifest,
    structure: DEPLOY_STRUCTURE,
    envContract: V80_ENV_CONTRACT,
    runtimeEntries: RUNTIME_ENTRY_POINTS,
    goLiveChecklist: GO_LIVE_CHECKLIST,
    launchReady,
    readinessScore: launchReady ? 100 : 0,
    summary: `deploy-launch ready=${launchReady} code=${release.releaseReady}`,
  };
}

export function assertDeployLaunchPass(
  report: DeployLaunchReport,
): asserts report is DeployLaunchReport & { launchReady: true } {
  if (!report.launchReady) {
    throw new Error(`V80 DEPLOY launch not ready: ${report.summary}`);
  }
}
