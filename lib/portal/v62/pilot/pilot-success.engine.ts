/**
 * V62 P8 — Pilot success criteria scoring
 */

import { buildFeedbackLoopReport } from "../feedback/feedback-loop.engine";
import { buildIssueTriageReport } from "../issues/issue-triage.engine";
import { buildPilotHealthDashboard } from "../pilot/pilot-health.engine";
import { buildTelemetryReport } from "../telemetry/pilot-telemetry.engine";

export type PilotSuccessCriteria = {
  registerSuccessRate: number;
  quoteSuccessRate: number;
  pdfDownloadSuccessRate: number;
  tenderPackCompletionRate: number;
  feedbackResponseScore: number;
  criticalIssueCount: number;
  repeatedUsageRate: number;
  overallScore: number;
  metThreshold: boolean;
  generatedAt: string;
};

function eventRate(event: string, organizationId?: string): number {
  const telemetry = buildTelemetryReport(organizationId);
  const counts = telemetry.countsByName[event];
  if (!counts || counts.total === 0) return 100;
  return Math.round((counts.success / counts.total) * 100);
}

export function computePilotSuccessScore(organizationId?: string): PilotSuccessCriteria {
  const health = buildPilotHealthDashboard(organizationId);
  const feedback = buildFeedbackLoopReport(organizationId);
  const issues = buildIssueTriageReport(organizationId);
  const telemetry = buildTelemetryReport(organizationId);

  const registerSuccessRate = eventRate("pilot_registered", organizationId);
  const repeatedEvents = telemetry.events.filter((e) => e.name === "repeated_usage").length;
  const registerEvents = telemetry.countsByName.pilot_registered?.total ?? 0;
  const repeatedUsageRate =
    registerEvents === 0 ? 0 : Math.round((repeatedEvents / registerEvents) * 100);

  const criticalIssueCount = issues.blockerCount + issues.bySeverity.high;

  const overallScore = Math.round(
    registerSuccessRate * 0.1 +
      health.quoteSuccessRate * 0.2 +
      health.pdfDownloadSuccessRate * 0.2 +
      health.tenderPackSuccessRate * 0.15 +
      feedback.score * 0.15 +
      (100 - Math.min(100, criticalIssueCount * 20)) * 0.1 +
      repeatedUsageRate * 0.1,
  );

  const metThreshold =
    overallScore >= 75 &&
    criticalIssueCount <= 2 &&
    health.quoteSuccessRate >= 70 &&
    health.pdfDownloadSuccessRate >= 70;

  return {
    registerSuccessRate,
    quoteSuccessRate: health.quoteSuccessRate,
    pdfDownloadSuccessRate: health.pdfDownloadSuccessRate,
    tenderPackCompletionRate: health.tenderPackSuccessRate,
    feedbackResponseScore: feedback.score,
    criticalIssueCount,
    repeatedUsageRate,
    overallScore,
    metThreshold,
    generatedAt: new Date().toISOString(),
  };
}
