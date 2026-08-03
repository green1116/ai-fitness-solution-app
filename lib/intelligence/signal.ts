/**
 * WP-55 — Signal Engine
 * Deterministic signals from Insights + Recommendations + PriorityItems.
 */
import { getInsights, type Insight } from "./insight";
import {
  getRecommendations,
  type Recommendation,
} from "./recommendation";
import {
  getPriorityItems,
  type PriorityItem,
  type PriorityLevel,
} from "./priority";

export const FEAT_56_ID = "FEAT-56" as const;
export const SIGNAL_ENGINE_CAPABILITY = "SignalEngine" as const;

export const SIGNAL_SOURCE_TYPES = [
  "INSIGHT",
  "RECOMMENDATION",
  "PRIORITY",
] as const;

export type SignalSourceType = (typeof SIGNAL_SOURCE_TYPES)[number];

export const SIGNAL_TYPES = ["ALERT", "ACTION", "WATCH"] as const;

export type SignalType = (typeof SIGNAL_TYPES)[number];

export const SIGNAL_INTENSITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export type SignalIntensity = (typeof SIGNAL_INTENSITIES)[number];

export type Signal = Readonly<{
  id: string;
  sourceType: SignalSourceType;
  signalType: SignalType;
  intensity: SignalIntensity;
  title: string;
  reason: string;
}>;

export type BuildSignalsInput = Readonly<{
  insights?: readonly Insight[];
  recommendations?: readonly Recommendation[];
  priorityItems?: readonly PriorityItem[];
}>;

const INTENSITY_RANK: Record<SignalIntensity, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const SOURCE_RANK: Record<SignalSourceType, number> = {
  INSIGHT: 0,
  RECOMMENDATION: 1,
  PRIORITY: 2,
};

let cachedSignals: Signal[] | null = null;

function cloneSignal(row: Signal): Signal {
  return { ...row };
}

function levelToIntensity(level: PriorityLevel): SignalIntensity {
  return level;
}

/**
 * Build deterministic signals from Insights / Recommendations / PriorityItems.
 */
export function buildSignals(input: BuildSignalsInput = {}): Signal[] {
  const insights = input.insights ? [...input.insights] : getInsights();
  const recommendations = input.recommendations
    ? [...input.recommendations]
    : getRecommendations();
  const priorityItems = input.priorityItems
    ? [...input.priorityItems]
    : getPriorityItems();

  const out: Signal[] = [];

  for (const ins of insights) {
    const intensity: SignalIntensity =
      ins.severity === "CRITICAL"
        ? "HIGH"
        : ins.severity === "WARNING"
          ? "MEDIUM"
          : "LOW";
    const signalType: SignalType =
      ins.severity === "CRITICAL"
        ? "ALERT"
        : ins.severity === "WARNING"
          ? "WATCH"
          : "WATCH";
    out.push({
      id: `sig-insight-${ins.id}`,
      sourceType: "INSIGHT",
      signalType,
      intensity,
      title: ins.title,
      reason: `insight=${ins.id}; severity=${ins.severity}; ${ins.summary}`,
    });
  }

  for (const rec of recommendations) {
    out.push({
      id: `sig-rec-${rec.id}`,
      sourceType: "RECOMMENDATION",
      signalType: "ACTION",
      intensity: levelToIntensity(rec.priority),
      title: rec.title,
      reason: `recommendation=${rec.id}; priority=${rec.priority}; ${rec.reason}`,
    });
  }

  for (const pri of priorityItems) {
    const signalType: SignalType =
      pri.priority === "HIGH"
        ? "ALERT"
        : pri.priority === "MEDIUM"
          ? "ACTION"
          : "WATCH";
    out.push({
      id: `sig-pri-${pri.id}`,
      sourceType: "PRIORITY",
      signalType,
      intensity: levelToIntensity(pri.priority),
      title: pri.title,
      reason: `priorityItem=${pri.id}; source=${pri.sourceType}; ${pri.reason}`,
    });
  }

  out.sort((a, b) => {
    const byIntensity =
      INTENSITY_RANK[a.intensity] - INTENSITY_RANK[b.intensity];
    if (byIntensity !== 0) return byIntensity;
    const bySource = SOURCE_RANK[a.sourceType] - SOURCE_RANK[b.sourceType];
    if (bySource !== 0) return bySource;
    return a.id.localeCompare(b.id);
  });

  cachedSignals = out.map(cloneSignal);
  return cachedSignals.map(cloneSignal);
}

/**
 * Get the last built signals, or build if none cached.
 */
export function getSignals(): Signal[] {
  if (!cachedSignals) {
    return buildSignals();
  }
  return cachedSignals.map(cloneSignal);
}

/** Test helper — clears cached signals. */
export function clearSignals(): void {
  cachedSignals = null;
}
