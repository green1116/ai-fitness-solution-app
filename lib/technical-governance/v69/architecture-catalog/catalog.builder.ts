/**
 * V69 P1 — Architecture catalog report builder (read-only)
 */
import { closeV68Platform } from "@/lib/platform/v68/signoff/signoff.entry";
import {
  V68_PLATFORM_FREEZE_VERSION,
  V68_PLATFORM_SIGNOFF_VERSION,
} from "@/lib/platform/v68/signoff/signoff.types";

import { isArchitectureCatalogCrossRefsAligned } from "./alignment.catalog";
import { buildArchitectureDefinitionManifest } from "./architecture.definition.catalog";
import { buildArchitectureLayerManifest } from "./architecture.layer.catalog";
import { buildArchitectureOwnerManifest } from "./architecture.owner.catalog";
import {
  isUpstreamFrozenTechnicalGovernanceLockIntact,
  V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK,
} from "./catalog.constants";
import { buildArchitectureCatalogRegistry } from "./catalog.registry";
import type { ArchitectureCatalogReport, ArchitectureCatalogSignals } from "./catalog.types";
import { V69_ARCHITECTURE_CATALOG_VERSION } from "./catalog.types";
import { buildDependencyEntryManifest } from "./dependency.entry.catalog";
import {
  architectureCatalogFreezeLockMatchesExpected,
  isArchitectureCatalogFreezeLockIntact,
} from "./freeze.lock";

const DEFAULT_SIGNALS: ArchitectureCatalogSignals = {
  upstreamPlatformClosed: true,
  definitionsComplete: true,
  layersComplete: true,
  ownersComplete: true,
  dependencyEntriesComplete: true,
  refsAligned: true,
  freezeLockIntact: true,
};

export function buildArchitectureCatalogReport(input?: {
  deploymentId?: string;
  signals?: ArchitectureCatalogSignals;
}): ArchitectureCatalogReport {
  const deploymentId = input?.deploymentId ?? "v69-architecture-catalog-default";

  const platformSignoff = closeV68Platform({ deploymentId });
  const definitions = buildArchitectureDefinitionManifest();
  const layers = buildArchitectureLayerManifest();
  const owners = buildArchitectureOwnerManifest();
  const dependencyEntries = buildDependencyEntryManifest();
  const registry = buildArchitectureCatalogRegistry();
  const refsAligned = isArchitectureCatalogCrossRefsAligned();
  const upstreamIntact = isUpstreamFrozenTechnicalGovernanceLockIntact();
  const freezeLockIntact =
    isArchitectureCatalogFreezeLockIntact() && architectureCatalogFreezeLockMatchesExpected();

  const signals: ArchitectureCatalogSignals = {
    ...DEFAULT_SIGNALS,
    upstreamPlatformClosed: platformSignoff.signedOff && upstreamIntact,
    definitionsComplete: definitions.catalogComplete,
    layersComplete: layers.catalogComplete,
    ownersComplete: owners.catalogComplete,
    dependencyEntriesComplete: dependencyEntries.catalogComplete,
    refsAligned,
    freezeLockIntact,
    ...input?.signals,
  };

  const catalogReady =
    platformSignoff.signedOff &&
    upstreamIntact &&
    definitions.catalogComplete &&
    layers.catalogComplete &&
    owners.catalogComplete &&
    dependencyEntries.catalogComplete &&
    registry.registryComplete &&
    refsAligned &&
    freezeLockIntact &&
    signals.upstreamPlatformClosed !== false;

  return {
    version: V69_ARCHITECTURE_CATALOG_VERSION,
    reportId: `architecture-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamPlatformSignoff: V68_PLATFORM_SIGNOFF_VERSION,
    upstreamPlatformFreeze: V68_PLATFORM_FREEZE_VERSION,
    upstreamPlatformClosed: platformSignoff.signedOff && upstreamIntact,
    definitions,
    layers,
    owners,
    dependencyEntries,
    registry,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `architecture-catalog ready=${catalogReady}`,
      `definitions=${definitions.entryCount}`,
      `layers=${layers.entryCount}`,
      `owners=${owners.entryCount}`,
      `dependencyEntries=${dependencyEntries.entryCount}`,
      `registry=${registry.totalEntries}`,
      `refsAligned=${refsAligned}`,
      `upstream=${V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK.v68PlatformSignoff}`,
    ].join(" "),
  };
}

export function assertArchitectureCatalogPass(
  report: ArchitectureCatalogReport,
): asserts report is ArchitectureCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V69 architecture catalog not ready: ${report.summary}`);
  }
}
