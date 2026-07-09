/**
 * V67 P7 — Postmortem foundation entry (read-only)
 */
import { buildPostmortemFoundationReport } from "./governance.builder";
import type { PostmortemFoundationReport, PostmortemFoundationSignals } from "./governance.types";

export type { PostmortemFoundationSignals };

export function runPostmortemFoundation(input?: {
  deploymentId?: string;
  signals?: PostmortemFoundationSignals;
}): PostmortemFoundationReport {
  return buildPostmortemFoundationReport(input);
}

export function formatPostmortemFoundationSummary(report: PostmortemFoundationReport): string {
  const lines = [
    "V67 Incident Report & Postmortem Foundation",
    `  ready: ${report.foundationReady}`,
    `  score: ${report.readinessScore}/100`,
    `  observability: ${report.observabilityVersion} (ready=${report.observabilityReady})`,
    `  report types: ${report.reportTypes.typeCount}`,
    `  RCA entries: ${report.rcaCatalog.entryCount}`,
    `  action items: ${report.actionItemContract.ruleCount}`,
    `  archive index: ${report.archiveIndex.entryCount}`,
  ];
  return lines.join("\n");
}
