/**
 * V59.5 — Structured application logger
 */

import { safeLog } from "@/lib/log";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  level: LogLevel;
  event: string;
  traceId?: string;
  userId?: string;
  organizationId?: string;
  endpoint?: string;
  durationMs?: number;
  status?: number;
  message?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
};

function emit(entry: LogEntry) {
  const payload: Record<string, unknown> = {
    level: entry.level,
    traceId: entry.traceId,
    userId: entry.userId,
    organizationId: entry.organizationId,
    endpoint: entry.endpoint,
    durationMs: entry.durationMs,
    status: entry.status,
    message: entry.message,
    timestamp: entry.timestamp,
    ...entry.meta,
  };

  safeLog(entry.event, payload);
}

export function createTraceId(): string {
  return `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function logInfo(event: string, fields: Omit<LogEntry, "level" | "event" | "timestamp"> = {}) {
  emit({ level: "info", event, timestamp: new Date().toISOString(), ...fields });
}

export function logWarn(event: string, fields: Omit<LogEntry, "level" | "event" | "timestamp"> = {}) {
  emit({ level: "warn", event, timestamp: new Date().toISOString(), ...fields });
}

export function logError(event: string, fields: Omit<LogEntry, "level" | "event" | "timestamp"> = {}) {
  emit({ level: "error", event, timestamp: new Date().toISOString(), ...fields });
}

export function resolveTraceId(req: { headers: { get(name: string): string | null } }): string {
  const incoming =
    req.headers.get("x-trace-id")?.trim() ||
    req.headers.get("x-request-id")?.trim() ||
    req.headers.get("x-correlation-id")?.trim();
  return incoming || createTraceId();
}
