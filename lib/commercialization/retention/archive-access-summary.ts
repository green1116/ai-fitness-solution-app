/**
 * V3.7-H23 Enterprise Retention — archive access summary (static aggregation)
 */

import { buildEnterpriseArchivalFoundation } from "../archival/index";
import { buildRetentionPolicyConfig } from "./retention-policy";

export const ARCHIVE_ACCESS_SUMMARY_VERSION = "3.7-h23-access-summary-1" as const;

export type ArchiveAccessSummary = {
  version: typeof ARCHIVE_ACCESS_SUMMARY_VERSION;
  summaryId: string;
  archiveAccessible: boolean;
  retentionReady: boolean;
  governanceRetentionReady: boolean;
  auditRetentionReady: boolean;
  preservationReady: boolean;
  lifecycleReady: boolean;
  confidenceScore: number;
  summary: string;
};

function computeConfidenceScore(flags: {
  archiveAccessible: boolean;
  retentionReady: boolean;
  governanceRetentionReady: boolean;
  auditRetentionReady: boolean;
  preservationReady: boolean;
  lifecycleReady: boolean;
}): number {
  const weights = [
    flags.archiveAccessible,
    flags.retentionReady,
    flags.governanceRetentionReady,
    flags.auditRetentionReady,
    flags.preservationReady,
    flags.lifecycleReady,
  ];
  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildArchiveAccessSummary(input?: {
  deploymentId?: string;
}): ArchiveAccessSummary {
  const deploymentId = input?.deploymentId ?? "archive-access-summary";
  const summaryId = `AAS-V37H23-${deploymentId.slice(0, 8)}`;

  const archival = buildEnterpriseArchivalFoundation({ deploymentId });
  const policies = buildRetentionPolicyConfig({ deploymentId });
  const p = archival.preservation;

  const archiveAccessible =
    archival.manifest.readyForArchive &&
    policies.readonlyPolicies.every((pol) => pol.readonly);

  const retentionReady =
    p.readyForArchive &&
    policies.retentionPolicies.every((pol) => pol.readonly);

  const governanceRetentionReady =
    p.governanceArchived &&
    policies.governancePolicies.length >= 3;

  const auditRetentionReady =
    p.auditArchived &&
    policies.reviewPolicies.some((pol) => pol.id === "rev-audit");

  const preservationReady = p.preservationCompleted && archival.manifest.readyForPreservation;
  const lifecycleReady =
    policies.lifecyclePolicies.length >= 3 &&
    archival.manifest.readyForEnterprise;

  const confidenceScore = computeConfidenceScore({
    archiveAccessible,
    retentionReady,
    governanceRetentionReady,
    auditRetentionReady,
    preservationReady,
    lifecycleReady,
  });

  return {
    version: ARCHIVE_ACCESS_SUMMARY_VERSION,
    summaryId,
    archiveAccessible,
    retentionReady,
    governanceRetentionReady,
    auditRetentionReady,
    preservationReady,
    lifecycleReady,
    confidenceScore,
    summary: `archive-access-summary id=${summaryId} accessible=${archiveAccessible} retention=${retentionReady} governance=${governanceRetentionReady} audit=${auditRetentionReady} preservation=${preservationReady} lifecycle=${lifecycleReady} confidence=${confidenceScore}`,
  };
}
