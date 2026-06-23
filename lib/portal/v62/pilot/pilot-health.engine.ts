/**
 * V62 P5 — Pilot health dashboard
 */

import { buildFeedbackLoopReport } from "../feedback/feedback-loop.engine";
import { buildIssueTriageReport } from "../issues/issue-triage.engine";
import { buildPilotProgramReport } from "../pilot/pilot-program.engine";
import { buildTelemetryReport } from "../telemetry/pilot-telemetry.engine";

export type PilotHealthDashboard = {
  pilotUsers: number;
  activeOrganizations: number;
  activeProjects: number;
  quoteSuccessRate: number;
  pdfDownloadSuccessRate: number;
  tenderPackSuccessRate: number;
  feedbackVolume: number;
  issueBacklog: number;
  overallHealth: number;
  generatedAt: string;
};

function rateFromCounts(counts: { total: number; success: number } | undefined): number {
  if (!counts || counts.total === 0) return 100;
  return Math.round((counts.success / counts.total) * 100);
}

export function buildPilotHealthDashboard(organizationId?: string): PilotHealthDashboard {
  const program = buildPilotProgramReport(organizationId);
  const telemetry = buildTelemetryReport(organizationId);
  const feedback = buildFeedbackLoopReport(organizationId);
  const issues = buildIssueTriageReport(organizationId);

  const quoteSuccessRate = rateFromCounts(telemetry.countsByName.quote_generated);
  const pdfDownloadSuccessRate = rateFromCounts(telemetry.countsByName.pdf_downloaded);
  const tenderPackSuccessRate = rateFromCounts(telemetry.countsByName.tender_pack_opened);

  const overallHealth = Math.round(
    quoteSuccessRate * 0.2 +
      pdfDownloadSuccessRate * 0.2 +
      tenderPackSuccessRate * 0.15 +
      telemetry.successRate * 0.15 +
      feedback.score * 0.15 +
      issues.score * 0.15,
  );

  return {
    pilotUsers: program.activeUsers,
    activeOrganizations: program.activeOrganizations,
    activeProjects: program.activeProjects,
    quoteSuccessRate,
    pdfDownloadSuccessRate,
    tenderPackSuccessRate,
    feedbackVolume: feedback.items.length,
    issueBacklog: issues.backlogCount,
    overallHealth,
    generatedAt: new Date().toISOString(),
  };
}
