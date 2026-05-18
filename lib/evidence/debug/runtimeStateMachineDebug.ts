import type { RuntimeStateMachineResult } from "../types";

export function formatRuntimeStateMachineDebug(
  result: RuntimeStateMachineResult,
): {
  summary: string;
  transitionLog: string;
  lifecycleStatus: string;
} {
  const summary = [
    "[RuntimeStateMachine]",
    `Current: ${result.currentState}`,
    `Previous: ${result.previousState ?? "—"}`,
    `Transitions: ${result.transitions.length}`,
    `Releasable: ${result.releasable}`,
    `Escalation: ${result.escalationRequired}`,
  ].join("\n");

  const transitionLog = [
    "Transition Log:",
    ...(result.transitions.length
      ? result.transitions.map(
          (t) =>
            `  ${t.from} → ${t.to} (${t.reason}) @ ${t.timestamp}`,
        )
      : ["  (none)"]),
  ].join("\n");

  const lifecycleStatus = [
    "Lifecycle Status:",
    `  state=${result.currentState}`,
    `  releasable=${result.releasable}`,
    `  escalationRequired=${result.escalationRequired}`,
  ].join("\n");

  return { summary, transitionLog, lifecycleStatus };
}
