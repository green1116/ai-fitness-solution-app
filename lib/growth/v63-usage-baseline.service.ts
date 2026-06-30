/**
 * V63 P1 — Usage & adoption light baseline (read-only aggregation)
 */

import { getGrowthEventsSnapshot } from "./growth.events.store";
import { getPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";

export type UsageMetrics = {
  dau: number;
  wau: number;
  mau: number;
};

export type FunnelStageMetric = {
  stage: string;
  count: number;
  rateFromRegister: number;
};

export type TrendPoint = {
  date: string;
  activeUsers: number;
  events: number;
};

export type GrowthBaseline = {
  usage: UsageMetrics;
  funnel: FunnelStageMetric[];
  trend: TrendPoint[];
  generatedAt: string;
};

type ActivityRow = { userId: string; ts: number };

const MS_DAY = 86_400_000;

function collectActivity(): ActivityRow[] {
  const rows: ActivityRow[] = [];
  for (const e of getGrowthEventsSnapshot()) {
    if (e.userId) rows.push({ userId: e.userId, ts: e.timestamp });
  }
  for (const e of getPilotTelemetry(10_000)) {
    if (e.userId) rows.push({ userId: e.userId, ts: Date.parse(e.timestamp) });
  }
  return rows;
}

function uniqueUsersInWindow(rows: ActivityRow[], sinceMs: number): number {
  const now = Date.now();
  const ids = new Set<string>();
  for (const r of rows) {
    if (now - r.ts <= sinceMs) ids.add(r.userId);
  }
  return ids.size;
}

function countFunnelStage(
  pilotName: string,
  growthEvents: string[],
): number {
  const pilot = getPilotTelemetry(10_000).filter((e) => e.name === pilotName).length;
  const growth = getGrowthEventsSnapshot().filter((e) =>
    growthEvents.includes(String(e.event)),
  ).length;
  return pilot + growth;
}

export function buildGrowthBaseline(): GrowthBaseline {
  const activity = collectActivity();
  const usage: UsageMetrics = {
    dau: uniqueUsersInWindow(activity, MS_DAY),
    wau: uniqueUsersInWindow(activity, MS_DAY * 7),
    mau: uniqueUsersInWindow(activity, MS_DAY * 30),
  };

  const register = countFunnelStage("pilot_registered", ["user.signup"]);
  const onboarding = countFunnelStage("onboarding_completed", ["user.activation"]);
  const project = countFunnelStage("project_created", ["project.created"]);
  const quote = countFunnelStage("quote_generated", ["quote.generated"]);
  const pdf = countFunnelStage("pdf_downloaded", []);
  const download = countFunnelStage("pdf_downloaded", []) + countFunnelStage("delivery_opened", []);

  const stages = [
    { stage: "register", count: register },
    { stage: "onboarding", count: onboarding },
    { stage: "project", count: project },
    { stage: "quote", count: quote },
    { stage: "pdf", count: pdf },
    { stage: "download", count: download },
  ];

  const funnel: FunnelStageMetric[] = stages.map((s) => ({
    ...s,
    rateFromRegister: register === 0 ? 0 : Math.round((s.count / register) * 100),
  }));

  const trend: TrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);
    const start = dayStart.getTime();
    const end = start + MS_DAY;
    const dayRows = activity.filter((r) => r.ts >= start && r.ts < end);
    trend.push({
      date: dayStart.toISOString().slice(0, 10),
      activeUsers: new Set(dayRows.map((r) => r.userId)).size,
      events: dayRows.length,
    });
  }

  return { usage, funnel, trend, generatedAt: new Date().toISOString() };
}

/** V63 P1 verify — run via npm run verify:v63-p1-growth */
export function runV63P1Verify(): void {
  const baseline = buildGrowthBaseline();
  const checks = [
    baseline.usage.dau >= 0,
    baseline.usage.wau >= baseline.usage.dau || baseline.usage.dau === 0,
    baseline.usage.mau >= baseline.usage.wau || baseline.usage.wau === 0,
    baseline.funnel.length === 6,
    baseline.trend.length === 7,
    baseline.funnel[0]?.stage === "register",
  ];
  if (!checks.every(Boolean)) {
    throw new Error("V63 P1 baseline verify failed");
  }
  console.log("✓ usage metrics", baseline.usage);
  console.log("✓ funnel stages", baseline.funnel.length);
  console.log("✓ trend points", baseline.trend.length);
  console.log("\n✅ V63 P1 Usage & Adoption Light Layer — verify PASS");
}

const invokedDirectly =
  typeof process !== "undefined" &&
  Boolean(process.argv[1]?.replace(/\\/g, "/").endsWith("v63-usage-baseline.service.ts"));

if (invokedDirectly) runV63P1Verify();
