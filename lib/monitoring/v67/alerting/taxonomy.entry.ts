/**
 * V67 P3 — Alert taxonomy entry (read-only)
 */
import { buildAlertTaxonomyReport } from "./taxonomy.builder";
import type { AlertTaxonomyReport, AlertTaxonomySignals } from "./taxonomy.types";

export type { AlertTaxonomySignals };

export function runAlertTaxonomy(input?: {
  deploymentId?: string;
  signals?: AlertTaxonomySignals;
}): AlertTaxonomyReport {
  return buildAlertTaxonomyReport(input);
}

export function formatAlertTaxonomySummary(report: AlertTaxonomyReport): string {
  const lines = [
    "V67 Alert Taxonomy & Governance",
    `  ready: ${report.taxonomyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  lifecycle: ${report.lifecycleVersion} (ready=${report.lifecycleReady})`,
    `  alert types: ${report.alertTypes.typeCount}`,
    `  severity tiers: ${report.severityTiers.tierCount}`,
    `  governance rules: ${report.ruleCatalog.ruleCount}`,
    `  suppression rules: ${report.suppressionContract.ruleCount}`,
  ];
  return lines.join("\n");
}
