/**
 * Launch L5 — Final release verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { buildPlatformV1Manifest } from "../../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import { validateLaunchL5DependencyChain } from "../freeze/freeze.dependency";
import {
  LAUNCH_L5_COMPONENT_LOCK,
  isLaunchL5FreezeLockIntact,
  launchL5FreezeLockMatchesExpected,
} from "../freeze/freeze.lock";
import {
  assertLaunchReadinessImmutableManifestFrozen,
  buildLaunchReadinessImmutableManifest,
  type LaunchReadinessImmutableManifest,
} from "../freeze/freeze.manifest";
import { buildLaunchReadinessRollbackSnapshotIndex } from "../rollback/rollback.index";
import {
  assertLaunchL5ReleaseGatePass,
  checkLaunchL5ReleaseGate,
  type ReleaseGateResult,
} from "./release.gate";

export type LaunchL5FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  commercializationOk: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  gate: ReleaseGateResult;
  manifest: LaunchReadinessImmutableManifest;
  summary: string;
};

export function runLaunchL5FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): LaunchL5FinalVerificationResult {
  const lockIntact = isLaunchL5FreezeLockIntact();
  const lockMatches = launchL5FreezeLockMatchesExpected();
  const chain = validateLaunchL5DependencyChain();
  const platform = buildPlatformV1Manifest();
  const commercializationOk =
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
    "enterprise-commercialization-complete-v1";
  const evolutionOk =
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1";
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1";
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
    "enterprise-e12-productization-complete-v1";
  const platformOk = platform.aligned === true;

  if (input?.pathExists) {
    for (const component of LAUNCH_L5_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          commercializationOk,
          evolutionOk,
          launchOk,
          e12Ok,
          platformOk,
          gate: checkLaunchL5ReleaseGate(),
          manifest: buildLaunchReadinessImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkLaunchL5ReleaseGate();
  const manifest = buildLaunchReadinessImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildLaunchReadinessRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
    commercializationOk &&
    evolutionOk &&
    launchOk &&
    e12Ok &&
    platformOk &&
    gate.result === "PASS" &&
    manifest.freezeState.frozen &&
    manifest.readOnly === true &&
    rollback.indexComplete;

  return {
    ok,
    lockIntact,
    lockMatches,
    chainOk: chain.ok,
    commercializationOk,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    gate,
    manifest,
    summary: [
      `launch-l5-final ok=${ok}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
      `rollback=${rollback.indexComplete}`,
    ].join(" "),
  };
}

export function assertLaunchL5FinalVerificationPass(
  result: LaunchL5FinalVerificationResult = runLaunchL5FinalVerification(),
): asserts result is LaunchL5FinalVerificationResult & { ok: true } {
  assertLaunchL5ReleaseGatePass(result.gate);
  assertLaunchReadinessImmutableManifestFrozen(result.manifest);
  if (!result.ok) {
    throw new Error(
      `Launch L5 final verification failed: ${result.summary}`,
    );
  }
}
