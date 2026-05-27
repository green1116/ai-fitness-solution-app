/**
 * V3.4-E27-E evolution feedback closure compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

const FEEDBACK_VERSION = "3.4-e27-e";

type EcologyInput = {
  civilizationId?: string;
  signals?: Record<string, number | undefined>;
};

export type EvolutionFeedbackPending = {
  generation: number;
};

export type EvolutionFeedbackClosureResult = {
  version: typeof FEEDBACK_VERSION;
  civilizationId: string;
  summary: string;
  generation: number | null;
  signalCount: number;
};

/** Pass-through pending feedback hook (compat: no pending queue consumed). */
export function applyEvolutionFeedbackToInput<T extends EcologyInput>(input: T): {
  input: T;
  consumedPending: EvolutionFeedbackPending | null;
} {
  return { input, consumedPending: null };
}

/** Minimal feedback closure compat: summarize transmission + base signals. */
export function runEvolutionFeedbackClosure(input: {
  civilizationId: string;
  transmission: { summary?: string };
  baseSignals: Record<string, number | undefined>;
  consumedPendingGeneration: number | null;
}): EvolutionFeedbackClosureResult {
  const signalCount = Object.keys(input.baseSignals).length;

  const summary = [
    `feedback=${FEEDBACK_VERSION}`,
    `civilizationId=${input.civilizationId}`,
    `signals=${signalCount}`,
    input.consumedPendingGeneration != null
      ? `consumedGen=${input.consumedPendingGeneration}`
      : null,
    input.transmission.summary ? `transmission=${input.transmission.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: FEEDBACK_VERSION,
    civilizationId: input.civilizationId,
    summary,
    generation: input.consumedPendingGeneration,
    signalCount,
  };
}

export function formatEvolutionFeedbackSummary(
  feedback: EvolutionFeedbackClosureResult,
): string {
  return feedback.summary;
}
