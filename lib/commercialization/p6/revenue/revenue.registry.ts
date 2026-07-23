/**
 * Commercialization P6 — Revenue stream registry
 */

import {
  REVENUE_PERIODS,
  REVENUE_STREAM_KINDS,
} from "../kpi/kpi.constants";
import type {
  RegisterRevenueStreamInput,
  RevenuePeriod,
  RevenueStream,
  RevenueStreamKind,
} from "./revenue.types";

const streams = new Map<string, RevenueStream>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStream(stream: RevenueStream): RevenueStream {
  return { ...stream, metadata: { ...stream.metadata } };
}

export function registerRevenueStream(
  input: RegisterRevenueStreamInput,
): RevenueStream {
  const name = input.name.trim();
  const accountRef = input.accountRef.trim();
  if (!name) throw new Error("revenueStream.name is required");
  if (!accountRef) throw new Error("revenueStream.accountRef is required");
  if (!(REVENUE_STREAM_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid revenue stream kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("revenueStream.amount must be a non-negative number");
  }

  const period: RevenuePeriod = input.period ?? "MONTHLY";
  if (!(REVENUE_PERIODS as readonly string[]).includes(period)) {
    throw new Error(`invalid revenue period: ${period}`);
  }

  const id = input.id?.trim() || createId("rev");
  if (streams.has(id)) {
    throw new Error(`revenue stream already exists: ${id}`);
  }

  const now = nowIso();
  const stream: RevenueStream = {
    id,
    name,
    accountRef,
    kind: input.kind,
    currency: (input.currency ?? "USD").trim().toUpperCase() || "USD",
    amount: Math.round(input.amount),
    period,
    detail: `kind=${input.kind} amount=${Math.round(input.amount)} period=${period}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  streams.set(id, stream);
  return cloneStream(stream);
}

export function getRevenueStream(id: string): RevenueStream | undefined {
  const stream = streams.get(id.trim());
  return stream ? cloneStream(stream) : undefined;
}

export function listRevenueStreams(filter?: {
  accountRef?: string;
  kind?: RevenueStreamKind;
  period?: RevenuePeriod;
}): RevenueStream[] {
  let result = [...streams.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((s) => s.accountRef === aref);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  if (filter?.period) result = result.filter((s) => s.period === filter.period);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStream);
}

export function clearRevenueStreams(): void {
  streams.clear();
}
