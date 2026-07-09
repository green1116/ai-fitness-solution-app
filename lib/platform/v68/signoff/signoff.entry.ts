/**
 * V68 P8 — Platform sign-off entry (read-only)
 */
import { buildPlatformSignoffReport } from "./signoff.builder";
import type { PlatformSignoffReport, PlatformSignoffSignals } from "./signoff.types";

export type { PlatformSignoffSignals };

export function runPlatformSignoff(input?: {
  deploymentId?: string;
  signals?: PlatformSignoffSignals;
}): PlatformSignoffReport {
  return buildPlatformSignoffReport(input);
}

export function closeV68Platform(input?: {
  deploymentId?: string;
  signals?: PlatformSignoffSignals;
}): PlatformSignoffReport {
  return buildPlatformSignoffReport(input);
}

export function formatPlatformSignoffSummary(report: PlatformSignoffReport): string {
  return report.closingSummary;
}
