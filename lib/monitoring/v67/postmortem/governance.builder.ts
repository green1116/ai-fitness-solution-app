/**
 * V67 P7 — Postmortem foundation report builder (read-only)
 */
import { buildObservabilityDashboardReport } from "../observability/governance.builder";
import { V67_OBSERVABILITY_DASHBOARD_VERSION } from "../observability/governance.types";

import { buildActionItemContractManifest } from "./action.item.contract";
import { isPostmortemRefsAligned } from "./alignment.catalog";
import { buildArchiveIndexManifest } from "./archive.index";
import type { PostmortemFoundationReport, PostmortemFoundationSignals } from "./governance.types";
import { V67_POSTMORTEM_FOUNDATION_VERSION } from "./governance.types";
import { buildIncidentReportTypeManifest } from "./report.types.catalog";
import { buildRcaCatalogManifest } from "./rca.catalog";

const DEFAULT_SIGNALS: PostmortemFoundationSignals = {
  observabilityReady: true,
  reportTypesComplete: true,
  rcaCatalogComplete: true,
  actionItemComplete: true,
  archiveIndexComplete: true,
  lifecycleAligned: true,
};

export function buildPostmortemFoundationReport(input?: {
  deploymentId?: string;
  signals?: PostmortemFoundationSignals;
}): PostmortemFoundationReport {
  const deploymentId = input?.deploymentId ?? "v67-postmortem-foundation-default";

  const observability = buildObservabilityDashboardReport({ deploymentId });
  const reportTypes = buildIncidentReportTypeManifest();
  const rcaCatalog = buildRcaCatalogManifest();
  const actionItemContract = buildActionItemContractManifest();
  const archiveIndex = buildArchiveIndexManifest();
  const refsAligned = isPostmortemRefsAligned();

  const signals: PostmortemFoundationSignals = {
    ...DEFAULT_SIGNALS,
    observabilityReady: observability.contractsReady,
    reportTypesComplete: reportTypes.catalogComplete,
    rcaCatalogComplete: rcaCatalog.catalogComplete,
    actionItemComplete: actionItemContract.contractComplete,
    archiveIndexComplete: archiveIndex.catalogComplete,
    lifecycleAligned: refsAligned,
    ...input?.signals,
  };

  const foundationReady =
    observability.contractsReady &&
    reportTypes.catalogComplete &&
    rcaCatalog.catalogComplete &&
    actionItemContract.contractComplete &&
    archiveIndex.catalogComplete &&
    refsAligned &&
    signals.observabilityReady !== false;

  return {
    version: V67_POSTMORTEM_FOUNDATION_VERSION,
    reportId: `postmortem-foundation-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    observabilityVersion: V67_OBSERVABILITY_DASHBOARD_VERSION,
    observabilityReady: observability.contractsReady,
    reportTypes,
    rcaCatalog,
    actionItemContract,
    archiveIndex,
    foundationReady,
    readinessScore: foundationReady ? 100 : 0,
    summary: [
      `postmortem-foundation ready=${foundationReady}`,
      `reportTypes=${reportTypes.typeCount}`,
      `rca=${rcaCatalog.entryCount}`,
      `actionItems=${actionItemContract.ruleCount}`,
      `archives=${archiveIndex.entryCount}`,
      `refsAligned=${refsAligned}`,
    ].join(" "),
  };
}

export function assertPostmortemFoundationPass(
  report: PostmortemFoundationReport,
): asserts report is PostmortemFoundationReport & { foundationReady: true } {
  if (!report.foundationReady) {
    throw new Error(`V67 postmortem foundation not ready: ${report.summary}`);
  }
}
