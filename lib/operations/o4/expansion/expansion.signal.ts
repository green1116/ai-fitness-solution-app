/**
 * Operations O4 — Expansion signal
 */

import { EXPANSION_SIGNAL_KINDS } from "../growth/growth.constants";
import type {
  DetectExpansionSignalInput,
  ExpansionSignal,
  ExpansionSignalKind,
} from "./expansion.types";

const signals = new Map<string, ExpansionSignal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cloneSignal(signal: ExpansionSignal): ExpansionSignal {
  return { ...signal, metadata: { ...signal.metadata } };
}

export function detectExpansionSignal(
  input: DetectExpansionSignalInput,
): ExpansionSignal {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("expansion.accountRef is required");
  if (
    !(EXPANSION_SIGNAL_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid expansion signal kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.strength)) {
    throw new Error("expansion.strength must be a number");
  }

  const id = input.id?.trim() || createId("o4sig");
  if (signals.has(id)) {
    throw new Error(`expansion signal already exists: ${id}`);
  }

  const strength = clamp(input.strength);
  const note = (input.note ?? "").trim() || `kind=${input.kind}`;
  const signal: ExpansionSignal = {
    id,
    accountRef,
    kind: input.kind,
    strength,
    note,
    detail: `kind=${input.kind} strength=${strength}`,
    metadata: { ...(input.metadata ?? {}) },
    detectedAt: nowIso(),
  };
  signals.set(id, signal);
  return cloneSignal(signal);
}

export function getExpansionSignal(
  id: string,
): ExpansionSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function listExpansionSignals(filter?: {
  accountRef?: string;
  kind?: ExpansionSignalKind;
}): ExpansionSignal[] {
  let result = [...signals.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((s) => s.accountRef === aref);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSignal);
}

export function clearExpansionSignals(): void {
  signals.clear();
}
