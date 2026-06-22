/**
 * V58 P7 — Quote Orchestration Flow Resolution
 */

import {
  QUOTE_ORCHESTRATION_FLOW_ORDER,
  type QuoteOrchestrationFlowResolution,
  type QuoteOrchestrationFlowStep,
  type QuoteOrchestrationInput,
} from "./quote-orchestrator.types";

export function resolveLifecycleFlow(
  _input?: QuoteOrchestrationInput,
): QuoteOrchestrationFlowResolution {
  return {
    steps: QUOTE_ORCHESTRATION_FLOW_ORDER,
    entryPoint: "orchestrator",
    bypassAllowed: false,
  };
}

export function isValidFlowStep(step: string): step is QuoteOrchestrationFlowStep {
  return (QUOTE_ORCHESTRATION_FLOW_ORDER as readonly string[]).includes(step);
}

export function getNextFlowStep(
  current: QuoteOrchestrationFlowStep,
): QuoteOrchestrationFlowStep | null {
  const index = QUOTE_ORCHESTRATION_FLOW_ORDER.indexOf(current);
  if (index < 0 || index >= QUOTE_ORCHESTRATION_FLOW_ORDER.length - 1) {
    return null;
  }
  return QUOTE_ORCHESTRATION_FLOW_ORDER[index + 1];
}

export function assertNoBypass(
  attemptedStep: QuoteOrchestrationFlowStep,
  resolvedSteps: readonly QuoteOrchestrationFlowStep[],
): void {
  const index = resolvedSteps.indexOf(attemptedStep);
  if (index < 0) {
    throw new Error(`Flow bypass denied: step "${attemptedStep}" is not in orchestration chain`);
  }
}
