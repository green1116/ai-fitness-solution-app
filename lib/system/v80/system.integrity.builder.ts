/**
 * V80 P4 — System meta integrity builder (read-only)
 */
import { buildSystemSimulationCatalog } from "./system.simulation.builder";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";
import {
  buildSystemIntegrityCatalogManifest,
  isSystemIntegrityCatalogRefsAligned,
} from "./system.integrity.catalog";
import { buildSystemConsistencyManifest } from "./system.integrity.consistency";
import { buildSystemDriftDetectionManifest } from "./system.integrity.drift";
import { buildSystemReconciliationManifest } from "./system.integrity.reconciliation";
import type {
  SystemIntegrityCatalogReport,
  SystemIntegrityCatalogSignals,
} from "./system.integrity";
import {
  V80_SYSTEM_INTEGRITY_FREEZE_VERSION,
  V80_SYSTEM_INTEGRITY_VERSION,
} from "./system.integrity";

const DEFAULT_SIGNALS: SystemIntegrityCatalogSignals = {
  systemSimulationCatalogReady: true,
  catalogComplete: true,
  consistencyComplete: true,
  driftComplete: true,
  reconciliationComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildSystemIntegrityCatalog(input?: {
  deploymentId?: string;
  signals?: SystemIntegrityCatalogSignals;
}): SystemIntegrityCatalogReport {
  const deploymentId = input?.deploymentId ?? "v80-system-meta-integrity-default";

  const systemSimulationCatalog = buildSystemSimulationCatalog({ deploymentId });
  const catalog = buildSystemIntegrityCatalogManifest();
  const consistency = buildSystemConsistencyManifest();
  const drift = buildSystemDriftDetectionManifest();
  const reconciliation = buildSystemReconciliationManifest();
  const refsAligned = isSystemIntegrityCatalogRefsAligned();

  const signals: SystemIntegrityCatalogSignals = {
    ...DEFAULT_SIGNALS,
    systemSimulationCatalogReady: systemSimulationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    consistencyComplete: consistency.consistencyComplete,
    driftComplete: drift.driftDetectionComplete,
    reconciliationComplete: reconciliation.reconciliationComplete,
    refsAligned,
    freezeVersionDeclared: V80_SYSTEM_INTEGRITY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    systemSimulationCatalog.catalogReady &&
    catalog.catalogComplete &&
    consistency.consistencyComplete &&
    drift.driftDetectionComplete &&
    reconciliation.reconciliationComplete &&
    refsAligned &&
    signals.systemSimulationCatalogReady !== false &&
    signals.refsAligned !== false;

  return {
    version: V80_SYSTEM_INTEGRITY_VERSION,
    freezeVersion: V80_SYSTEM_INTEGRITY_FREEZE_VERSION,
    reportId: `system-meta-integrity-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    systemSimulationCatalogVersion: V80_SYSTEM_SIMULATION_VERSION,
    systemSimulationCatalogReady: systemSimulationCatalog.catalogReady,
    catalog,
    consistency,
    drift,
    reconciliation,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `system-meta-integrity ready=${catalogReady}`,
      `rules=${catalog.entryCount}`,
      `consistency=${consistency.checkCount}`,
      `drift=${drift.detectorCount}`,
      `reconciliation=${reconciliation.ruleCount}`,
      `simulationCatalog=${systemSimulationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertSystemIntegrityCatalogPass(
  report: SystemIntegrityCatalogReport,
): asserts report is SystemIntegrityCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V80 system meta integrity not ready: ${report.summary}`);
  }
}
