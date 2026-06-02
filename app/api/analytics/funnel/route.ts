import { NextResponse } from "next/server";
import { getAnalyticsEventsSnapshot } from "@/lib/analytics/inMemoryEvents";

const FUNNEL_EVENTS = [
  "click_download_pdf",
  "open_upgrade_modal",
  "click_upgrade_pro",
  "click_upgrade_enterprise",
  "upgrade_success",
  "download_success",
] as const;

export type AnalyticsFunnelCounts = Record<(typeof FUNNEL_EVENTS)[number], number>;

export async function GET() {
  const events = getAnalyticsEventsSnapshot();
  const counts = Object.fromEntries(
    FUNNEL_EVENTS.map((name) => [name, 0])
  ) as AnalyticsFunnelCounts;

  for (const row of events) {
    const name = row.event;
    if (typeof name !== "string") continue;
    if (name in counts) {
      counts[name as keyof AnalyticsFunnelCounts] += 1;
    }
  }

  return NextResponse.json(counts);
}
