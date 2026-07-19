/**
 * E09-P3 — Market Signal Store
 * Records market signals for intelligence analysis (reuse market.types)
 */

import type { GlobalNodeMetadata } from "../core/global.types";
import { getMarket } from "./market.registry";
import type { Market } from "./market.types";

export const MARKET_SIGNAL_KINDS = [
  "DEMAND",
  "SUPPLY",
  "PRICE",
  "RISK",
  "OPPORTUNITY",
  "SENTIMENT",
] as const;

export type MarketSignalKind = (typeof MARKET_SIGNAL_KINDS)[number];

export type MarketSignal = {
  id: string;
  marketId: Market["id"];
  kind: MarketSignalKind;
  /** Normalized strength 0–100 */
  strength: number;
  label: string;
  payload: GlobalNodeMetadata;
  recordedAt: string;
};

export type RecordMarketSignalInput = {
  id?: string;
  marketId: Market["id"];
  kind: MarketSignalKind;
  strength: number;
  label: string;
  payload?: GlobalNodeMetadata;
};

const signals = new Map<string, MarketSignal>();
/** marketId → signal ids (insertion order) */
const marketIndex = new Map<string, string[]>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSignal(signal: MarketSignal): MarketSignal {
  return {
    ...signal,
    payload: { ...signal.payload },
  };
}

function assertSignalKind(kind: string): asserts kind is MarketSignalKind {
  if (!(MARKET_SIGNAL_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid market signal kind: ${kind}`);
  }
}

function assertStrength(strength: number): void {
  if (!Number.isFinite(strength) || strength < 0 || strength > 100) {
    throw new Error("signal.strength must be a finite number between 0 and 100");
  }
}

function indexSignal(signal: MarketSignal): void {
  const list = marketIndex.get(signal.marketId) ?? [];
  if (!list.includes(signal.id)) {
    marketIndex.set(signal.marketId, [...list, signal.id]);
  }
}

function unindexSignal(signal: MarketSignal): void {
  const list = marketIndex.get(signal.marketId) ?? [];
  const next = list.filter((id) => id !== signal.id);
  if (next.length === 0) marketIndex.delete(signal.marketId);
  else marketIndex.set(signal.marketId, next);
}

/** Record a signal against a registered market. */
export function recordSignal(input: RecordMarketSignalInput): MarketSignal {
  const marketId = input.marketId.trim();
  const label = input.label.trim();
  if (!marketId) throw new Error("signal.marketId is required");
  if (!label) throw new Error("signal.label is required");
  assertSignalKind(input.kind);
  assertStrength(input.strength);

  if (!getMarket(marketId)) {
    throw new Error(`market not found: ${marketId}`);
  }

  const id = (input.id?.trim() || createId("mkt-signal"));
  if (signals.has(id)) {
    throw new Error(`signal already exists: ${id}`);
  }

  const signal: MarketSignal = {
    id,
    marketId,
    kind: input.kind,
    strength: input.strength,
    label,
    payload: { ...(input.payload ?? {}) },
    recordedAt: nowIso(),
  };

  signals.set(id, signal);
  indexSignal(signal);
  return cloneSignal(signal);
}

export function getSignals(filter?: {
  marketId?: Market["id"];
  kind?: MarketSignalKind;
}): MarketSignal[] {
  let result: MarketSignal[];

  if (filter?.marketId) {
    const marketId = filter.marketId.trim();
    const ids = marketIndex.get(marketId) ?? [];
    result = ids
      .map((id) => signals.get(id))
      .filter((s): s is MarketSignal => Boolean(s));
  } else {
    result = [...signals.values()];
  }

  if (filter?.kind) {
    result = result.filter((s) => s.kind === filter.kind);
  }

  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt) || a.id.localeCompare(b.id))
    .map(cloneSignal);
}

export function clearSignals(marketId?: Market["id"]): void {
  if (!marketId) {
    signals.clear();
    marketIndex.clear();
    return;
  }

  const id = marketId.trim();
  const ids = marketIndex.get(id) ?? [];
  for (const signalId of ids) {
    signals.delete(signalId);
  }
  marketIndex.delete(id);
}

export function getSignal(id: string): MarketSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function removeSignal(id: string): boolean {
  const signal = signals.get(id.trim());
  if (!signal) return false;
  unindexSignal(signal);
  signals.delete(signal.id);
  return true;
}
