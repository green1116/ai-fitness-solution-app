/**
 * V80 Pilot P15 — Continuous improvement state store (knowledge layer)
 */

import type { ContinuousImprovementState } from "./continuous-improvement.schema";

declare global {
  // eslint-disable-next-line no-var
  var __v80PilotContinuousImprovement:
    | Map<string, ContinuousImprovementState>
    | undefined;
}

function states(): Map<string, ContinuousImprovementState> {
  globalThis.__v80PilotContinuousImprovement ||= new Map();
  return globalThis.__v80PilotContinuousImprovement;
}

export function getContinuousImprovementState(
  organizationId: string,
): ContinuousImprovementState | null {
  return states().get(organizationId) ?? null;
}

export function saveContinuousImprovementState(
  state: ContinuousImprovementState,
): ContinuousImprovementState {
  states().set(state.organizationId, state);
  return state;
}

export function clearContinuousImprovementStoreForTests(): void {
  globalThis.__v80PilotContinuousImprovement = new Map();
}
