/**
 * V65 P6 — Unified release-ready gate entry
 */
import { buildReleaseReadyManifest } from "./release.builder";
import type { ReleaseGateSignals, ReleaseReadyManifest } from "./release.types";

export type { ReleaseGateSignals };

export function runReleaseReadyGate(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ReleaseReadyManifest {
  return buildReleaseReadyManifest(input);
}

export function assertReleaseReadyPass(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ReleaseReadyManifest {
  const manifest = runReleaseReadyGate(input);
  if (!manifest.releaseReady) {
    throw new Error(
      `V65 release-ready gate failed: ready=${manifest.releaseReady} prisma=${manifest.prismaPreflightPass} tsc=${manifest.typeScriptClean} build=${manifest.buildPass} runtime=${manifest.runtimeRiskOk}`,
    );
  }
  return manifest;
}
