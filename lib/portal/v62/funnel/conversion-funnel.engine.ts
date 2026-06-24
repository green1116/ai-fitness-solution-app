/**
 * V62 P6 — Conversion funnel analytics
 */

import { getPilotTelemetry } from "../store/pilot-telemetry.store";

export type FunnelStage = {
  stage: string;
  event: string;
  count: number;
  dropOffFromPrevious?: number;
};

export type FunnelAnalyticsReport = {
  stages: FunnelStage[];
  conversionRate: number;
  biggestDropOff: string | null;
  repeatedUsageCount: number;
  generatedAt: string;
};

const FUNNEL_STAGES: { stage: string; event: string }[] = [
  { stage: "Register", event: "pilot_registered" },
  { stage: "Onboarding", event: "onboarding_completed" },
  { stage: "Workspace", event: "workspace_entered" },
  { stage: "Project", event: "project_created" },
  { stage: "Quote", event: "quote_generated" },
  { stage: "PDF", event: "pdf_downloaded" },
  { stage: "Delivery", event: "delivery_opened" },
  { stage: "Download", event: "pdf_downloaded" },
  { stage: "Repeated Usage", event: "repeated_usage" },
];

export function buildFunnelAnalyticsReport(organizationId?: string): FunnelAnalyticsReport {
  const events = getPilotTelemetry(10000, organizationId);
  const stages: FunnelStage[] = [];
  let prevCount = 0;

  for (const { stage, event } of FUNNEL_STAGES) {
    const count = events.filter((e) => e.name === event).length;
    const dropOffFromPrevious =
      prevCount > 0 && stages.length > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : undefined;
    stages.push({ stage, event, count, dropOffFromPrevious });
    if (count > 0) prevCount = count;
  }

  const registerCount = stages[0]?.count ?? 0;
  const lastWithActivity = [...stages].reverse().find((s) => s.count > 0);
  const conversionRate =
    registerCount === 0
      ? 0
      : Math.round(((lastWithActivity?.count ?? 0) / registerCount) * 100);

  let biggestDropOff: string | null = null;
  let maxDrop = 0;
  for (const s of stages) {
    if (s.dropOffFromPrevious !== undefined && s.dropOffFromPrevious > maxDrop) {
      maxDrop = s.dropOffFromPrevious;
      biggestDropOff = s.stage;
    }
  }

  const repeatedUsageCount = events.filter((e) => e.name === "repeated_usage").length;

  return {
    stages,
    conversionRate,
    biggestDropOff,
    repeatedUsageCount,
    generatedAt: new Date().toISOString(),
  };
}
