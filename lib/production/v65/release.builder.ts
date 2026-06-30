/**
 * V65 P6 — Release-ready manifest builder (read-only)
 */
import { assertCommercialFreezePass } from "@/lib/commercial/v64";
import { runPrismaPreflight } from "@/lib/prisma-stability/ci/prisma.preflight";

import { buildProductionReadinessReport } from "./audit.builder";
import { countActiveBuildBlockers } from "./audit.blockers";
import { countOpenLegacyBlockers } from "./audit.inventory";
import { buildRuntimeRiskReport } from "./runtime.builder";
import { isRuntimeRiskGatePass } from "./runtime.guards";
import type { ReleaseGateSignals, ReleaseReadyManifest } from "./release.types";
import { V65_RELEASE_READY_VERSION } from "./release.types";

function probeCommercialFrozen(): boolean {
  try {
    assertCommercialFreezePass({ deploymentId: "v65-release-ready" });
    return true;
  } catch {
    return false;
  }
}

export function buildReleaseReadyManifest(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ReleaseReadyManifest {
  const deploymentId = input?.deploymentId ?? "v65-release-ready-default";
  const signals = input?.signals ?? {};

  const commercialFrozen = probeCommercialFrozen();
  const runtimeRiskOk = isRuntimeRiskGatePass();
  const prismaPreflightPass =
    signals.prismaPreflightPass ?? runPrismaPreflight().ok;
  const typeScriptClean = signals.typeScriptClean ?? false;
  const buildPass = signals.buildPass ?? false;
  const verifyChainPass = signals.verifyChainPass ?? true;

  const productionReadiness = buildProductionReadinessReport({
    deploymentId,
    signals: {
      verifyChainPass,
      typeScriptClean,
      buildPass,
      prismaPreflightPass,
    },
  });

  const runtimeRisk = buildRuntimeRiskReport({ deploymentId });
  const openBlockerCount =
    countOpenLegacyBlockers() + countActiveBuildBlockers();

  const releaseReady =
    commercialFrozen &&
    runtimeRiskOk &&
    prismaPreflightPass &&
    typeScriptClean &&
    buildPass &&
    verifyChainPass &&
    openBlockerCount === 0 &&
    productionReadiness.productionReady &&
    runtimeRisk.runtimeRiskOk;

  return {
    version: V65_RELEASE_READY_VERSION,
    manifestId: `release-ready-${deploymentId}`,
    releasedAt: new Date().toISOString(),
    deploymentId,
    commercialFrozen,
    runtimeRiskOk,
    prismaPreflightPass,
    typeScriptClean,
    buildPass,
    verifyChainPass,
    openBlockerCount,
    readinessScore: productionReadiness.readinessScore,
    productionReadiness,
    runtimeRisk,
    releaseReady,
    summary: [
      `release-ready ok=${releaseReady}`,
      `score=${productionReadiness.readinessScore}`,
      `openBlockers=${openBlockerCount}`,
    ].join(" "),
  };
}
