/**
 * E09-P3 — Cross-Market Signal Store
 * Records directed signals between markets (reuse market.types)
 */

import type { GlobalNodeMetadata } from "../core/global.types";
import { getMarket } from "./market.registry";
import type { Market } from "./market.types";

export const CROSS_MARKET_RELATIONS = [
  "CORRELATED",
  "COMPETITIVE",
  "COMPLEMENTARY",
  "SUPPLY_CHAIN",
  "SUBSTITUTE",
  "SPILLOVER",
] as const;

export type CrossMarketRelation = (typeof CROSS_MARKET_RELATIONS)[number];

export type CrossMarketSignal = {
  id: string;
  sourceMarketId: Market["id"];
  targetMarketId: Market["id"];
  relation: CrossMarketRelation;
  /** Normalized strength 0–100 */
  strength: number;
  label: string;
  payload: GlobalNodeMetadata;
  recordedAt: string;
};

export type RecordCrossSignalInput = {
  id?: string;
  sourceMarketId: Market["id"];
  targetMarketId: Market["id"];
  relation: CrossMarketRelation;
  strength: number;
  label: string;
  payload?: GlobalNodeMetadata;
};

const signals = new Map<string, CrossMarketSignal>();
/** pairKey → signal ids */
const pairIndex = new Map<string, string[]>();
/** marketId → signal ids (as source or target) */
const marketIndex = new Map<string, string[]>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

function cloneSignal(signal: CrossMarketSignal): CrossMarketSignal {
  return {
    ...signal,
    payload: { ...signal.payload },
  };
}

function assertRelation(
  relation: string,
): asserts relation is CrossMarketRelation {
  if (!(CROSS_MARKET_RELATIONS as readonly string[]).includes(relation)) {
    throw new Error(`invalid cross-market relation: ${relation}`);
  }
}

function assertStrength(strength: number): void {
  if (!Number.isFinite(strength) || strength < 0 || strength > 100) {
    throw new Error(
      "cross signal.strength must be a finite number between 0 and 100",
    );
  }
}

function assertMarketPair(sourceId: string, targetId: string): void {
  if (!sourceId) throw new Error("cross signal.sourceMarketId is required");
  if (!targetId) throw new Error("cross signal.targetMarketId is required");
  if (sourceId === targetId) {
    throw new Error("cross signal source and target must differ");
  }
  if (!getMarket(sourceId)) {
    throw new Error(`source market not found: ${sourceId}`);
  }
  if (!getMarket(targetId)) {
    throw new Error(`target market not found: ${targetId}`);
  }
}

function pushIndex(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key) ?? [];
  if (!list.includes(id)) map.set(key, [...list, id]);
}

function dropIndex(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key) ?? [];
  const next = list.filter((x) => x !== id);
  if (next.length === 0) map.delete(key);
  else map.set(key, next);
}

function indexSignal(signal: CrossMarketSignal): void {
  pushIndex(
    pairIndex,
    pairKey(signal.sourceMarketId, signal.targetMarketId),
    signal.id,
  );
  pushIndex(marketIndex, signal.sourceMarketId, signal.id);
  pushIndex(marketIndex, signal.targetMarketId, signal.id);
}

function unindexSignal(signal: CrossMarketSignal): void {
  dropIndex(
    pairIndex,
    pairKey(signal.sourceMarketId, signal.targetMarketId),
    signal.id,
  );
  dropIndex(marketIndex, signal.sourceMarketId, signal.id);
  dropIndex(marketIndex, signal.targetMarketId, signal.id);
}

/** Record a directed cross-market signal between two registered markets. */
export function recordCrossSignal(
  input: RecordCrossSignalInput,
): CrossMarketSignal {
  const sourceMarketId = input.sourceMarketId.trim();
  const targetMarketId = input.targetMarketId.trim();
  const label = input.label.trim();

  if (!label) throw new Error("cross signal.label is required");
  assertMarketPair(sourceMarketId, targetMarketId);
  assertRelation(input.relation);
  assertStrength(input.strength);

  const id = input.id?.trim() || createId("xmk-signal");
  if (signals.has(id)) {
    throw new Error(`cross signal already exists: ${id}`);
  }

  const signal: CrossMarketSignal = {
    id,
    sourceMarketId,
    targetMarketId,
    relation: input.relation,
    strength: input.strength,
    label,
    payload: { ...(input.payload ?? {}) },
    recordedAt: nowIso(),
  };

  signals.set(id, signal);
  indexSignal(signal);
  return cloneSignal(signal);
}

export function getCrossSignals(filter?: {
  marketId?: Market["id"];
  sourceMarketId?: Market["id"];
  targetMarketId?: Market["id"];
  relation?: CrossMarketRelation;
  pair?: { a: Market["id"]; b: Market["id"] };
}): CrossMarketSignal[] {
  let result: CrossMarketSignal[];

  if (filter?.pair) {
    const a = filter.pair.a.trim();
    const b = filter.pair.b.trim();
    const ids = pairIndex.get(pairKey(a, b)) ?? [];
    result = ids
      .map((id) => signals.get(id))
      .filter((s): s is CrossMarketSignal => Boolean(s));
  } else if (filter?.marketId) {
    const marketId = filter.marketId.trim();
    const ids = marketIndex.get(marketId) ?? [];
    result = ids
      .map((id) => signals.get(id))
      .filter((s): s is CrossMarketSignal => Boolean(s));
  } else {
    result = [...signals.values()];
  }

  if (filter?.sourceMarketId) {
    const source = filter.sourceMarketId.trim();
    result = result.filter((s) => s.sourceMarketId === source);
  }
  if (filter?.targetMarketId) {
    const target = filter.targetMarketId.trim();
    result = result.filter((s) => s.targetMarketId === target);
  }
  if (filter?.relation) {
    result = result.filter((s) => s.relation === filter.relation);
  }

  return result
    .slice()
    .sort(
      (a, b) =>
        a.recordedAt.localeCompare(b.recordedAt) || a.id.localeCompare(b.id),
    )
    .map(cloneSignal);
}

export function clearCrossSignals(marketId?: Market["id"]): void {
  if (!marketId) {
    signals.clear();
    pairIndex.clear();
    marketIndex.clear();
    return;
  }

  const id = marketId.trim();
  const ids = [...(marketIndex.get(id) ?? [])];
  for (const signalId of ids) {
    const signal = signals.get(signalId);
    if (!signal) continue;
    unindexSignal(signal);
    signals.delete(signal.id);
  }
}

export function getCrossSignal(id: string): CrossMarketSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function removeCrossSignal(id: string): boolean {
  const signal = signals.get(id.trim());
  if (!signal) return false;
  unindexSignal(signal);
  signals.delete(signal.id);
  return true;
}
