/**
 * V60 P7 — Error intelligence aggregation
 */

import { getMetricSnapshot } from "@/lib/observability/metrics.service";
import { getRecentAuditEvents } from "@/lib/observability/audit.logger";
import { getPlatformEvents } from "./platform-events";

export type ErrorCategory =
  | "authentication"
  | "authorization"
  | "persistence"
  | "pdf"
  | "delivery"
  | "intelligence"
  | "portal"
  | "unknown";

export type ClassifiedError = {
  category: ErrorCategory;
  code: string;
  count: number;
  endpoint?: string;
  lastSeen: string;
};

export type ErrorIntelligenceReport = {
  topErrors: ClassifiedError[];
  recentErrors: ClassifiedError[];
  errorTrend: { date: string; count: number }[];
  totalErrors: number;
};

function categorize(code: string, endpoint: string): ErrorCategory {
  const c = code.toLowerCase();
  const ep = endpoint.toLowerCase();
  if (c.includes("auth") || ep.includes("/auth/")) return "authentication";
  if (c.includes("tenant") || c.includes("forbidden") || c.includes("rbac")) return "authorization";
  if (c.includes("prisma") || c.includes("persistence") || c.includes("db")) return "persistence";
  if (ep.includes("/pdf") || c.includes("pdf")) return "pdf";
  if (ep.includes("/documents") || ep.includes("/delivery") || c.includes("delivery")) return "delivery";
  if (ep.includes("/intelligence")) return "intelligence";
  if (ep.includes("/workspace") || ep.includes("/portal")) return "portal";
  return "unknown";
}

export function buildErrorIntelligenceReport(): ErrorIntelligenceReport {
  const metrics = getMetricSnapshot();
  const auditErrors = getRecentAuditEvents(200).filter((e) => e.resultStatus === "error");
  const platformErrors = getPlatformEvents(200, "error");

  const map = new Map<string, ClassifiedError>();

  for (const [key, count] of Object.entries(metrics.counters)) {
    if (!key.startsWith("api.errors")) continue;
    const codeMatch = key.match(/code=([^,}]+)/);
    const endpointMatch = key.match(/endpoint=([^,}]+)/);
    const code = codeMatch?.[1] ?? "API_ERROR";
    const endpoint = endpointMatch?.[1] ?? "unknown";
    const category = categorize(code, endpoint);
    const id = `${category}:${code}:${endpoint}`;
    const existing = map.get(id);
    if (existing) {
      existing.count += count;
    } else {
      map.set(id, {
        category,
        code,
        count,
        endpoint,
        lastSeen: new Date().toISOString(),
      });
    }
  }

  for (const e of auditErrors) {
    const code = "AUDIT_ERROR";
    const id = `portal:${code}:${e.endpoint}`;
    const existing = map.get(id);
    if (existing) existing.count += 1;
    else
      map.set(id, {
        category: categorize(code, e.endpoint),
        code,
        count: 1,
        endpoint: e.endpoint,
        lastSeen: e.timestamp,
      });
  }

  for (const e of platformErrors) {
    const code = String(e.meta?.code ?? e.name);
    const endpoint = String(e.meta?.endpoint ?? e.source);
    const id = `${e.severity}:${code}:${endpoint}`;
    map.set(id, {
      category: categorize(code, endpoint),
      code,
      count: 1,
      endpoint,
      lastSeen: e.timestamp,
    });
  }

  const all = [...map.values()].sort((a, b) => b.count - a.count);
  const byDay = new Map<string, number>();
  for (const e of all) {
    const day = e.lastSeen.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + e.count);
  }

  return {
    topErrors: all.slice(0, 10),
    recentErrors: all.slice(0, 20),
    errorTrend: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({ date, count })),
    totalErrors: all.reduce((n, e) => n + e.count, 0),
  };
}
