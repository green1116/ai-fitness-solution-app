import type { GovernanceSelfOptimizationHookEvent } from "./optimization-types";

export function runGovernanceSelfOptimizationHooks(input: {
  feedbackCount: number;
  mechanismCount: number;
  loopClosed: boolean;
}): GovernanceSelfOptimizationHookEvent[] {
  return [
    { phase: "beforeFeedbackCollection", payload: "collecting-optimization-feedback" },
    { phase: "afterFeedbackCollection", payload: `entries=${input.feedbackCount}` },
    { phase: "beforeEffectivenessEvaluation", payload: "evaluating-mechanisms" },
    { phase: "afterEffectivenessEvaluation", payload: `mechanisms=${input.mechanismCount}` },
    { phase: "beforeOptimizationLoop", payload: "closing-optimization-loop" },
    { phase: "afterOptimizationLoop", payload: `closed=${input.loopClosed}` },
  ];
}
