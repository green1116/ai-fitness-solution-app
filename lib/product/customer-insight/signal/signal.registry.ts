/**
 * Product Customer Insight — Signal registry
 */

import { INSIGHT_SIGNAL_KINDS } from "../insight/insight.constants";
import type {
  CustomerInsightSignal,
  DetectSignalInput,
  InsightSignalKind,
} from "./signal.types";

const signals = new Map<string, CustomerInsightSignal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSignal(signal: CustomerInsightSignal): CustomerInsightSignal {
  return { ...signal, metadata: { ...signal.metadata } };
}

export function detectSignal(input: DetectSignalInput): CustomerInsightSignal {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("signal.customerId is required");
  if (!(INSIGHT_SIGNAL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid insight signal kind: ${input.kind}`);
  }
  if (
    !Number.isFinite(input.strength) ||
    input.strength < 0 ||
    input.strength > 1
  ) {
    throw new Error("signal.strength must be between 0 and 1");
  }

  const id = input.id?.trim() || createId("cinsig");
  if (signals.has(id)) throw new Error(`insight signal already exists: ${id}`);

  const signal: CustomerInsightSignal = {
    id,
    customerId,
    kind: input.kind,
    strength: input.strength,
    detail: `kind=${input.kind} strength=${input.strength}`,
    metadata: { ...(input.metadata ?? {}) },
    detectedAt: nowIso(),
  };
  signals.set(id, signal);
  return cloneSignal(signal);
}

export function getSignal(id: string): CustomerInsightSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function listSignals(filter?: {
  customerId?: string;
  kind?: InsightSignalKind;
}): CustomerInsightSignal[] {
  let result = [...signals.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((s) => s.customerId === customerId);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSignal);
}

export function clearSignals(): void {
  signals.clear();
}
