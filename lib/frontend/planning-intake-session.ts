/**
 * FEAT-12 presentation cue — planning inputs accepted (ACT-02-02 post-condition).
 * In-memory session cue only — not Domain / persistence / governance.
 */

let planningInputsAccepted = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function arePlanningInputsAccepted(): boolean {
  return planningInputsAccepted;
}

export function markPlanningInputsAccepted(): void {
  if (planningInputsAccepted) return;
  planningInputsAccepted = true;
  notify();
}

export function clearPlanningInputsAccepted(): void {
  if (!planningInputsAccepted) return;
  planningInputsAccepted = false;
  notify();
}

/** useSyncExternalStore subscribe — FEAT-12 gate. */
export function subscribePlanningInputsAccepted(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPlanningInputsAcceptedSnapshot(): boolean {
  return planningInputsAccepted;
}
