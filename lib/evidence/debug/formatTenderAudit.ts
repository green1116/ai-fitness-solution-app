import type { TenderAuditResult } from "../types";

export function formatTenderAuditTrail(result: TenderAuditResult): string {
  const { trail } = result;
  const lines = [
    `[${trail.version}] audit-run=${trail.runId} document=${trail.documentId}`,
    `governance=${result.governanceStatus} | entries=${trail.summary.totalEntries}`,
    `requirements=${trail.summary.requirementCount} evidence=${trail.summary.evidenceCount} links=${trail.summary.linkCount}`,
    "---",
  ];

  for (const e of trail.entries) {
    lines.push(
      `${e.at} [${e.type}] ${e.severity} ${e.title}: ${e.message}`,
    );
  }

  return lines.join("\n");
}

export function summarizeTenderAudit(result: TenderAuditResult): string {
  return [
    `Tender Audit ${result.version}`,
    `governance=${result.governanceStatus}`,
    result.title,
    `entries=${result.trail.summary.totalEntries}`,
    `validation=${result.trail.summary.validationOutcome ?? "n/a"}`,
  ].join(" | ");
}
