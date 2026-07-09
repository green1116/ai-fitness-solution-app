/**
 * V78 P7 — Execution compliance catalog builder (read-only)
 */
import { buildExecutionSimulationCatalog } from "./execution.simulation.builder";
import { V78_EXECUTION_SIMULATION_VERSION } from "./execution.simulation";
import {
  buildExecutionComplianceCatalogManifest,
  buildExecutionComplianceValidationManifest,
  isExecutionComplianceCatalogRefsAligned,
} from "./execution.compliance.catalog";
import type {
  ExecutionComplianceCatalogReport,
  ExecutionComplianceCatalogSignals,
} from "./execution.compliance";
import {
  V78_EXECUTION_COMPLIANCE_FREEZE_VERSION,
  V78_EXECUTION_COMPLIANCE_VERSION,
} from "./execution.compliance";

const DEFAULT_SIGNALS: ExecutionComplianceCatalogSignals = {
  executionSimulationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildExecutionComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionComplianceCatalogSignals;
}): ExecutionComplianceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v78-execution-compliance-catalog-default";

  const executionSimulationCatalog = buildExecutionSimulationCatalog({ deploymentId });
  const catalog = buildExecutionComplianceCatalogManifest();
  const validations = buildExecutionComplianceValidationManifest();
  const refsAligned = isExecutionComplianceCatalogRefsAligned();

  const signals: ExecutionComplianceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    executionSimulationCatalogReady: executionSimulationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V78_EXECUTION_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    executionSimulationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.executionSimulationCatalogReady !== false;

  return {
    version: V78_EXECUTION_COMPLIANCE_VERSION,
    freezeVersion: V78_EXECUTION_COMPLIANCE_FREEZE_VERSION,
    reportId: `execution-compliance-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    executionSimulationCatalogVersion: V78_EXECUTION_SIMULATION_VERSION,
    executionSimulationCatalogReady: executionSimulationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `execution-compliance-catalog ready=${catalogReady}`,
      `items=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `simulationCatalog=${executionSimulationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertExecutionComplianceCatalogPass(
  report: ExecutionComplianceCatalogReport,
): asserts report is ExecutionComplianceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V78 execution compliance catalog not ready: ${report.summary}`);
  }
}
