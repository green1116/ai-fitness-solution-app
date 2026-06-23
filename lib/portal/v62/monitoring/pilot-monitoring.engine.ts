/**
 * V62 P10 — Production monitoring extension for pilot
 */

import { getPlatformEvents } from "@/lib/portal/v60/observability/platform-events";
import { buildSystemHealthReport } from "@/lib/portal/v60/health/system-health.engine";
import { buildFeedbackLoopReport } from "../feedback/feedback-loop.engine";
import { buildTelemetryReport } from "../telemetry/pilot-telemetry.engine";

export type PilotMonitoringReport = {
  health: Awaited<ReturnType<typeof buildSystemHealthReport>>;
  platformEvents: ReturnType<typeof getPlatformEvents>;
  telemetry: ReturnType<typeof buildTelemetryReport>;
  feedback: ReturnType<typeof buildFeedbackLoopReport>;
  errorCount: number;
  warningCount: number;
  generatedAt: string;
};

export async function buildPilotMonitoringReport(
  organizationId?: string,
): Promise<PilotMonitoringReport> {
  const [health, platformEvents, telemetry, feedback] = await Promise.all([
    buildSystemHealthReport(),
    Promise.resolve(getPlatformEvents(50)),
    Promise.resolve(buildTelemetryReport(organizationId)),
    Promise.resolve(buildFeedbackLoopReport(organizationId)),
  ]);

  const errorCount =
    platformEvents.filter((e) => e.severity === "error" || e.severity === "critical").length +
    telemetry.events.filter((e) => e.success === false).length;
  const warningCount =
    platformEvents.filter((e) => e.severity === "warn").length + feedback.openCount;

  return {
    health,
    platformEvents,
    telemetry,
    feedback,
    errorCount,
    warningCount,
    generatedAt: new Date().toISOString(),
  };
}
