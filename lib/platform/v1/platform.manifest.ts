/**
 * Enterprise Platform v1 — Platform Manifest
 * Aligns E09 / E10 / E11 enterprise layers into unified baseline
 */

import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
  PLATFORM_V1_BASE,
  PLATFORM_V1_FREEZE_VERSION,
  PLATFORM_V1_ID,
  PLATFORM_V1_SIGNOFF_VERSION,
  PLATFORM_V1_VERSION,
} from "./platform.v1.constants";
import { buildCapabilityIndex, isCapabilityIndexComplete } from "./capability.index";
import {
  buildEnterpriseDependencyMap,
  isEnterpriseDependencyMapAligned,
} from "./dependency.map";
import {
  ENTERPRISE_LAYER_REGISTRY,
  isEnterpriseLayerRegistryComplete,
  listEnterpriseLayers,
} from "./layer.registry";
import { buildReleaseBaseline, isReleaseBaselineAligned } from "./release.baseline";
import type { PlatformV1Manifest } from "./platform.v1.types";

export function buildPlatformV1Manifest(): PlatformV1Manifest {
  const dependency = buildEnterpriseDependencyMap();
  const capabilities = buildCapabilityIndex();
  const baseline = buildReleaseBaseline();

  const aligned =
    isEnterpriseLayerRegistryComplete() &&
    isEnterpriseDependencyMapAligned() &&
    isCapabilityIndexComplete() &&
    isReleaseBaselineAligned() &&
    dependency.chainOk &&
    baseline.aligned;

  return {
    platformId: PLATFORM_V1_ID,
    version: PLATFORM_V1_VERSION,
    freezeVersion: PLATFORM_V1_FREEZE_VERSION,
    signoff: PLATFORM_V1_SIGNOFF_VERSION,
    base: PLATFORM_V1_BASE,
    e09CompleteId: E09_ENTERPRISE_COMPLETE_ID,
    e10CompleteId: E10_ENTERPRISE_COMPLETE_ID,
    e11CompleteId: E11_ENTERPRISE_COMPLETE_ID,
    layers: listEnterpriseLayers(),
    dependency,
    capabilities,
    baseline,
    aligned,
    builtAt: new Date().toISOString(),
    summary: [
      `platform-v1 aligned=${aligned}`,
      `layers=${ENTERPRISE_LAYER_REGISTRY.length}`,
      `capabilities=${capabilities.count}`,
      `chain=${dependency.chainOk}`,
      `baseline=${baseline.aligned}`,
    ].join(" "),
  };
}

export function assertPlatformV1Aligned(
  manifest: PlatformV1Manifest = buildPlatformV1Manifest(),
): asserts manifest is PlatformV1Manifest & { aligned: true } {
  if (!manifest.aligned) {
    throw new Error(`Platform v1 alignment failed: ${manifest.summary}`);
  }
}
