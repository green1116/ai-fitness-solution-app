/**
 * V63 P2 — Retention light layer (read-only, no new storage)
 */

import { getGrowthEventsSnapshot } from "./growth.events.store";
import { getPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";

export type RetentionMetrics = {
  d1Retention: number;
  d7Retention: number;
  repeatUsageRate: number;
};

const MS_DAY = 86_400_000;
const REPEAT_EVENTS = new Set(["workspace_entered", "delivery_opened", "pdf_downloaded"]);

function registrationTimes(): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of getPilotTelemetry(10_000)) {
    if (e.name === "pilot_registered" && e.userId) {
      const ts = Date.parse(e.timestamp);
      const prev = map.get(e.userId);
      if (prev === undefined || ts < prev) map.set(e.userId, ts);
    }
  }
  for (const e of getGrowthEventsSnapshot()) {
    if (e.event === "user.signup" && e.userId) {
      const prev = map.get(e.userId);
      if (prev === undefined || e.timestamp < prev) map.set(e.userId, e.timestamp);
    }
  }
  return map;
}

function activityTimestampsByUser(): Map<string, number[]> {
  const map = new Map<string, number[]>();
  const push = (userId: string, ts: number) => {
    const list = map.get(userId) ?? [];
    list.push(ts);
    map.set(userId, list);
  };
  for (const e of getGrowthEventsSnapshot()) {
    if (e.userId) push(e.userId, e.timestamp);
  }
  for (const e of getPilotTelemetry(10_000)) {
    if (e.userId) push(e.userId, Date.parse(e.timestamp));
  }
  return map;
}

function retentionRate(
  registrations: Map<string, number>,
  activity: Map<string, number[]>,
  windowMs: number,
): number {
  if (registrations.size === 0) return 0;
  let retained = 0;
  for (const [userId, regTs] of registrations) {
    const acts = activity.get(userId) ?? [];
    const returned = acts.some((ts) => ts > regTs && ts <= regTs + windowMs);
    if (returned) retained++;
  }
  return Math.round((retained / registrations.size) * 100);
}

function computeRepeatUsageRate(): number {
  const counts = new Map<string, number>();
  for (const e of getPilotTelemetry(10_000)) {
    if (!e.userId || !REPEAT_EVENTS.has(e.name)) continue;
    counts.set(e.userId, (counts.get(e.userId) ?? 0) + 1);
  }
  const usersWithAction = counts.size;
  if (usersWithAction === 0) return 0;
  const repeatUsers = [...counts.values()].filter((c) => c > 1).length;
  return Math.round((repeatUsers / usersWithAction) * 100);
}

export function buildRetentionMetrics(): RetentionMetrics {
  const registrations = registrationTimes();
  const activity = activityTimestampsByUser();
  return {
    d1Retention: retentionRate(registrations, activity, MS_DAY),
    d7Retention: retentionRate(registrations, activity, MS_DAY * 7),
    repeatUsageRate: computeRepeatUsageRate(),
  };
}

export function runV63P2Verify(): void {
  const m = buildRetentionMetrics();
  const checks = [
    m.d1Retention >= 0 && m.d1Retention <= 100,
    m.d7Retention >= 0 && m.d7Retention <= 100,
    m.repeatUsageRate >= 0 && m.repeatUsageRate <= 100,
    m.d7Retention >= m.d1Retention || m.d1Retention === 0,
  ];
  if (!checks.every(Boolean)) throw new Error("V63 P2 retention verify failed");
  console.log("✓ retention metrics", m);
  console.log("\n✅ V63 P2 Retention Light Layer — verify PASS");
}

const invokedDirectly =
  typeof process !== "undefined" &&
  Boolean(process.argv[1]?.replace(/\\/g, "/").endsWith("v63-retention-light.service.ts"));

if (invokedDirectly) runV63P2Verify();
