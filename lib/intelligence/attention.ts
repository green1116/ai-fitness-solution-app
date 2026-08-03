/**
 * WP-56 — Attention Engine
 * Deterministic attention items derived from Signals (read-only).
 */
import { getSignals, type Signal, type SignalIntensity } from "./signal";

export const FEAT_57_ID = "FEAT-57" as const;
export const ATTENTION_ENGINE_CAPABILITY = "AttentionEngine" as const;

export const ATTENTION_LEVELS = ["CRITICAL", "HIGH", "NORMAL"] as const;

export type AttentionLevel = (typeof ATTENTION_LEVELS)[number];

export type AttentionItem = Readonly<{
  id: string;
  signalId: string;
  level: AttentionLevel;
  title: string;
  reason: string;
}>;

export type BuildAttentionInput = Readonly<{
  signals?: readonly Signal[];
}>;

const LEVEL_RANK: Record<AttentionLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
};

let cachedAttention: AttentionItem[] | null = null;

function cloneItem(row: AttentionItem): AttentionItem {
  return { ...row };
}

function intensityToLevel(intensity: SignalIntensity): AttentionLevel {
  if (intensity === "HIGH") return "CRITICAL";
  if (intensity === "MEDIUM") return "HIGH";
  return "NORMAL";
}

/**
 * Build deterministic attention items from Signals.
 */
export function buildAttention(
  input: BuildAttentionInput = {},
): AttentionItem[] {
  const signals = input.signals ? [...input.signals] : getSignals();

  const out: AttentionItem[] = signals.map((signal) => {
    const level = intensityToLevel(signal.intensity);
    return {
      id: `att-${signal.id}`,
      signalId: signal.id,
      level,
      title: signal.title,
      reason: `signal=${signal.id}; intensity=${signal.intensity}; ${signal.reason}`,
    };
  });

  out.sort((a, b) => {
    const byLevel = LEVEL_RANK[a.level] - LEVEL_RANK[b.level];
    if (byLevel !== 0) return byLevel;
    return a.id.localeCompare(b.id);
  });

  cachedAttention = out.map(cloneItem);
  return cachedAttention.map(cloneItem);
}

/**
 * Get the last built attention items, or build if none cached.
 */
export function getAttention(): AttentionItem[] {
  if (!cachedAttention) {
    return buildAttention();
  }
  return cachedAttention.map(cloneItem);
}

/** Test helper — clears cached attention items. */
export function clearAttention(): void {
  cachedAttention = null;
}
