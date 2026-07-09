/**
 * V69 P8 — Technical governance sign-off entry (read-only)
 */
import { buildTechnicalSignoffReport } from "./signoff.builder";
import type { TechnicalSignoffReport, TechnicalSignoffSignals } from "./signoff.types";

export type { TechnicalSignoffSignals };

export function runTechnicalSignoff(input?: {
  deploymentId?: string;
  signals?: TechnicalSignoffSignals;
}): TechnicalSignoffReport {
  return buildTechnicalSignoffReport(input);
}

export function closeV69TechnicalGovernance(input?: {
  deploymentId?: string;
  signals?: TechnicalSignoffSignals;
}): TechnicalSignoffReport {
  return buildTechnicalSignoffReport(input);
}

export function formatTechnicalSignoffSummary(report: TechnicalSignoffReport): string {
  return report.closingSummary;
}
