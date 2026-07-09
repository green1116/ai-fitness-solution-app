/**
 * V100 — Release manifest & rollback index (read-only from capability catalog)
 */

import { getCapabilityCatalog } from "./capability-catalog";
import { getSignoffState } from "./signoff-cache";
import type {
  FreezeManifest,
  ReleaseManifest,
  RollbackIndex,
} from "./signoff.types";
import { PILOT_BASELINE_VERSION } from "./signoff.types";

export function buildReleaseManifest(): ReleaseManifest {
  const catalog = getCapabilityCatalog();

  return {
    baselineVersion: PILOT_BASELINE_VERSION,
    generatedAt: new Date().toISOString(),
    capabilityInventory: catalog,
    moduleIndex: catalog.map((c) => c.modulePath),
    apiIndex: catalog.map((c) => c.apiRoute).filter((v): v is string => Boolean(v)),
    uiIndex: catalog.map((c) => c.route).filter((v): v is string => Boolean(v)),
    verifyIndex: catalog.map((c) => c.verifyScript),
    artifactIndex: catalog
      .filter((c) => c.route)
      .map((c) => ({
        label: c.capability,
        href: c.route as string,
        layer: c.version,
      })),
    readOnly: true,
  };
}

export function buildFreezeManifest(organizationId: string): FreezeManifest {
  const catalog = getCapabilityCatalog();
  const state = getSignoffState(organizationId);
  const frozen = state.releaseStatus === "frozen" || state.releaseStatus === "released";

  const versionLock: Record<string, string> = {};
  for (const entry of catalog) {
    versionLock[entry.version] = entry.versionConstant;
  }

  return {
    baselineVersion: PILOT_BASELINE_VERSION,
    frozen,
    frozenAt: state.frozenAt,
    frozenBy: state.frozenBy,
    versionLock,
    dependencyLock: catalog.map((c) => c.modulePath),
    releaseLock: state.releaseStatus === "released",
    readOnly: true,
  };
}

export function buildRollbackIndex(): RollbackIndex {
  const catalog = getCapabilityCatalog();

  return {
    baselineVersion: PILOT_BASELINE_VERSION,
    snapshotIndex: catalog.map((c) => ({
      version: c.version,
      capability: c.capability,
      modulePath: c.modulePath,
    })),
    dependencyGraph: catalog.map((c, idx) => ({
      version: c.version,
      dependsOn: idx === 0 ? [] : [catalog[idx - 1]!.version],
    })),
    restoreEntryPoints: catalog.map((c) => ({
      version: c.version,
      entryPoint: `${c.modulePath}/index.ts`,
    })),
    readOnly: true,
  };
}
