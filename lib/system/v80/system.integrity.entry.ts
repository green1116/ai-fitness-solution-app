/**
 * V80 P4 — System meta integrity entry (read-only)
 */
export {
  SYSTEM_INTEGRITY_CATALOG,
  buildSystemIntegrityCatalogManifest,
  computeSystemDeclarativeIntegrityEnforced,
  getSystemIntegrityRuleById,
  getSystemIntegrityRulesByKind,
  isSystemIntegrityCatalogRefsAligned,
} from "./system.integrity.catalog";
export {
  SYSTEM_CONSISTENCY_CHECKS,
  buildSystemConsistencyManifest,
  getSystemConsistencyCheckById,
  isSystemConsistencyValidationComplete,
} from "./system.integrity.consistency";
export {
  SYSTEM_DRIFT_DETECTORS,
  buildSystemDriftDetectionManifest,
  getSystemDriftDetectorByLayer,
  isSystemDriftDetectionComplete,
} from "./system.integrity.drift";
export {
  SYSTEM_GLOBAL_FREEZE_SEMANTICS,
  SYSTEM_RECONCILIATION_RULES,
  buildSystemReconciliationManifest,
  getSystemGlobalFreezeSemanticById,
  getSystemReconciliationRuleById,
  isSystemReconciliationComplete,
} from "./system.integrity.reconciliation";
export {
  assertSystemIntegrityCatalogPass,
  buildSystemIntegrityCatalog,
} from "./system.integrity.builder";
export {
  V80_SYSTEM_INTEGRITY_FREEZE_VERSION,
  V80_SYSTEM_INTEGRITY_VERSION,
} from "./system.integrity";
export type {
  SystemConsistencyCheck,
  SystemDriftDetector,
  SystemGlobalFreezeSemantic,
  SystemIntegrityCatalogReport,
  SystemIntegrityCatalogSignals,
  SystemIntegrityKind,
  SystemIntegrityRule,
  SystemReconciliationRule,
} from "./system.integrity";

import { buildSystemIntegrityCatalog } from "./system.integrity.builder";
import type {
  SystemIntegrityCatalogReport,
  SystemIntegrityCatalogSignals,
} from "./system.integrity";

export function runSystemIntegrityCatalog(input?: {
  deploymentId?: string;
  signals?: SystemIntegrityCatalogSignals;
}): SystemIntegrityCatalogReport {
  return buildSystemIntegrityCatalog(input);
}

export function formatSystemIntegrityCatalogSummary(
  report: SystemIntegrityCatalogReport,
): string {
  return [
    "V80 System Meta Integrity",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  simulation-catalog: ${report.systemSimulationCatalogVersion} (ready=${report.systemSimulationCatalogReady})`,
    `  integrity-rules: ${report.catalog.entryCount}`,
    `  consistency-checks: ${report.consistency.checkCount}`,
    `  drift-detectors: ${report.drift.detectorCount}`,
    `  reconciliation-rules: ${report.reconciliation.ruleCount}`,
    `  freeze-semantics: ${report.reconciliation.freezeSemantics.length}`,
  ].join("\n");
}
