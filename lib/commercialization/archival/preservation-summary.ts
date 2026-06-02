/**
 * V3.7-H22 Enterprise Archival — preservation summary (static aggregation)
 */

import { buildArchivalChecklist } from "./archival-checklist";

export const PRESERVATION_SUMMARY_VERSION =
  "3.7-h22-preservation-summary-2" as const;

export type PreservationSummary = {
  version: typeof PRESERVATION_SUMMARY_VERSION;
  summaryId: string;
  readyForArchive: boolean;
  releaseArchived: boolean;
  governanceArchived: boolean;
  opsArchived: boolean;
  auditArchived: boolean;
  preservationCompleted: boolean;
  confidenceScore: number;
  summary: string;
};

function computeConfidenceScore(flags: {
  readyForArchive: boolean;
  releaseArchived: boolean;
  governanceArchived: boolean;
  opsArchived: boolean;
  auditArchived: boolean;
  preservationCompleted: boolean;
}): number {
  const weights = [
    flags.readyForArchive,
    flags.releaseArchived,
    flags.governanceArchived,
    flags.opsArchived,
    flags.auditArchived,
    flags.preservationCompleted,
  ];

  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildPreservationSummary(input?: {
  deploymentId?: string;
}): PreservationSummary {
  const deploymentId = input?.deploymentId ?? "preservation-summary";
  const summaryId = `PRS-V37H22-${deploymentId.slice(0, 8)}`;

  const checklist = buildArchivalChecklist({ deploymentId });

  const releaseArchived = checklist.releaseArchivals.every(
    (c) => c.status === "archived",
  );
  const governanceArchived = checklist.governanceArchivals.every(
    (c) => c.status === "archived",
  );
  const opsArchived = checklist.opsArchivals.every(
    (c) => c.status === "archived",
  );
  const auditArchived = checklist.archivalItems
    .filter((c) => c.group === "audit")
    .every((c) => c.status === "archived");

  const requiredArchived = checklist.requiredArchivals.every(
    (c) => c.status === "archived",
  );

  const readyForArchive =
    requiredArchived && releaseArchived && governanceArchived;

  const preservationCompleted =
    readyForArchive && opsArchived && auditArchived;

  const confidenceScore = computeConfidenceScore({
    readyForArchive,
    releaseArchived,
    governanceArchived,
    opsArchived,
    auditArchived,
    preservationCompleted,
  });

  return {
    version: PRESERVATION_SUMMARY_VERSION,
    summaryId,
    readyForArchive,
    releaseArchived,
    governanceArchived,
    opsArchived,
    auditArchived,
    preservationCompleted,
    confidenceScore,
    summary: `preservation-summary id=${summaryId} readyForArchive=${readyForArchive} release=${releaseArchived} governance=${governanceArchived} ops=${opsArchived} audit=${auditArchived} preservation=${preservationCompleted} confidence=${confidenceScore}`,
  };
}