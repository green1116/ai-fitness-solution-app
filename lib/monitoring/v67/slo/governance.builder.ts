/**
 * V67 P4 — SLO governance report builder (read-only)
 */
import { SLI_CATALOG, SLO_CATALOG } from "../slo.contract";
import { buildAlertTaxonomyReport } from "../alerting/taxonomy.builder";
import { V67_ALERT_TAXONOMY_VERSION } from "../alerting/taxonomy.types";

import { buildBudgetContractManifest } from "./budget.contract";
import type { SloGovernanceReport, SloGovernanceSignals } from "./governance.types";
import { V67_SLO_GOVERNANCE_VERSION } from "./governance.types";
import { buildObjectiveCatalogManifest } from "./objective.catalog";
import { buildSliTypeManifest } from "./sli.types.catalog";
import { buildSloTypeManifest } from "./slo.types.catalog";

const DEFAULT_SIGNALS: SloGovernanceSignals = {
  taxonomyReady: true,
  sliCatalogComplete: true,
  sloCatalogComplete: true,
  objectiveCatalogComplete: true,
  budgetContractComplete: true,
  foundationSloAligned: true,
};

function isFoundationSloAligned(): boolean {
  const foundationSliIds = new Set(SLI_CATALOG.map((s) => s.id));
  const foundationSloRefs = SLO_CATALOG.map((s) => s.sliRef);
  return foundationSloRefs.every((ref) => foundationSliIds.has(ref));
}

export function buildSloGovernanceReport(input?: {
  deploymentId?: string;
  signals?: SloGovernanceSignals;
}): SloGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v67-slo-governance-default";

  const taxonomy = buildAlertTaxonomyReport({ deploymentId });
  const sliTypes = buildSliTypeManifest();
  const sloTypes = buildSloTypeManifest();
  const objectiveCatalog = buildObjectiveCatalogManifest();
  const budgetContract = buildBudgetContractManifest();
  const foundationAligned = isFoundationSloAligned();

  const signals: SloGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    taxonomyReady: taxonomy.taxonomyReady,
    sliCatalogComplete: sliTypes.catalogComplete,
    sloCatalogComplete: sloTypes.catalogComplete,
    objectiveCatalogComplete: objectiveCatalog.catalogComplete,
    budgetContractComplete: budgetContract.contractComplete,
    foundationSloAligned: foundationAligned,
    ...input?.signals,
  };

  const governanceReady =
    taxonomy.taxonomyReady &&
    sliTypes.catalogComplete &&
    sloTypes.catalogComplete &&
    objectiveCatalog.catalogComplete &&
    budgetContract.contractComplete &&
    foundationAligned &&
    signals.taxonomyReady !== false;

  return {
    version: V67_SLO_GOVERNANCE_VERSION,
    reportId: `slo-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    taxonomyVersion: V67_ALERT_TAXONOMY_VERSION,
    taxonomyReady: taxonomy.taxonomyReady,
    sliTypes,
    sloTypes,
    objectiveCatalog,
    budgetContract,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `slo-governance ready=${governanceReady}`,
      `slis=${sliTypes.typeCount}`,
      `slos=${sloTypes.typeCount}`,
      `objectives=${objectiveCatalog.entryCount}`,
      `budgets=${budgetContract.ruleCount}`,
      `foundationAligned=${foundationAligned}`,
    ].join(" "),
  };
}

export function assertSloGovernancePass(
  report: SloGovernanceReport,
): asserts report is SloGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V67 SLO governance not ready: ${report.summary}`);
  }
}
