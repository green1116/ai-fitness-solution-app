/**
 * V67 P3 — Alert taxonomy report builder (read-only)
 */
import { buildIncidentLifecycleReport } from "../incident/lifecycle.builder";
import { V67_INCIDENT_LIFECYCLE_VERSION } from "../incident/lifecycle.types";

import { buildAlertTypeManifest } from "./alert.types.catalog";
import { buildAlertRuleCatalogManifest } from "./rule.catalog";
import { buildSeverityTierManifest } from "./severity.tiers";
import { buildSuppressionContractManifest } from "./suppression.contract";
import type { AlertTaxonomyReport, AlertTaxonomySignals } from "./taxonomy.types";
import { V67_ALERT_TAXONOMY_VERSION } from "./taxonomy.types";

const DEFAULT_SIGNALS: AlertTaxonomySignals = {
  lifecycleReady: true,
  typeCatalogComplete: true,
  severityTiersComplete: true,
  ruleCatalogComplete: true,
  suppressionContractComplete: true,
};

export function buildAlertTaxonomyReport(input?: {
  deploymentId?: string;
  signals?: AlertTaxonomySignals;
}): AlertTaxonomyReport {
  const deploymentId = input?.deploymentId ?? "v67-alert-taxonomy-default";

  const lifecycle = buildIncidentLifecycleReport({ deploymentId });
  const alertTypes = buildAlertTypeManifest();
  const severityTiers = buildSeverityTierManifest();
  const ruleCatalog = buildAlertRuleCatalogManifest();
  const suppressionContract = buildSuppressionContractManifest();

  const signals: AlertTaxonomySignals = {
    ...DEFAULT_SIGNALS,
    lifecycleReady: lifecycle.lifecycleReady,
    typeCatalogComplete: alertTypes.catalogComplete,
    severityTiersComplete: severityTiers.manifestComplete,
    ruleCatalogComplete: ruleCatalog.catalogComplete,
    suppressionContractComplete: suppressionContract.contractComplete,
    ...input?.signals,
  };

  const taxonomyReady =
    lifecycle.lifecycleReady &&
    alertTypes.catalogComplete &&
    severityTiers.manifestComplete &&
    ruleCatalog.catalogComplete &&
    suppressionContract.contractComplete &&
    signals.lifecycleReady !== false;

  return {
    version: V67_ALERT_TAXONOMY_VERSION,
    reportId: `alert-taxonomy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    lifecycleVersion: V67_INCIDENT_LIFECYCLE_VERSION,
    lifecycleReady: lifecycle.lifecycleReady,
    alertTypes,
    severityTiers,
    ruleCatalog,
    suppressionContract,
    taxonomyReady,
    readinessScore: taxonomyReady ? 100 : 0,
    summary: [
      `alert-taxonomy ready=${taxonomyReady}`,
      `types=${alertTypes.typeCount}`,
      `tiers=${severityTiers.tierCount}`,
      `rules=${ruleCatalog.ruleCount}`,
      `suppression=${suppressionContract.ruleCount}`,
    ].join(" "),
  };
}

export function assertAlertTaxonomyPass(
  report: AlertTaxonomyReport,
): asserts report is AlertTaxonomyReport & { taxonomyReady: true } {
  if (!report.taxonomyReady) {
    throw new Error(`V67 alert taxonomy not ready: ${report.summary}`);
  }
}
