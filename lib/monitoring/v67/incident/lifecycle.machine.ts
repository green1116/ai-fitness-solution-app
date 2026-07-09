/**
 * V67 P2 — Incident lifecycle state machine (deterministic, read-only)
 */
import { isTerminalIncidentState } from "./lifecycle.states";
import { getTransitionsFrom, TRANSITION_RULE_CATALOG } from "./lifecycle.transitions";
import type {
  AlertLifecycleState,
  EscalationStage,
  IncidentLifecycleSnapshot,
  IncidentLifecycleState,
  LifecycleAction,
  PostmortemStatus,
} from "./lifecycle.types";

export function isValidIncidentTransition(
  from: IncidentLifecycleState,
  to: IncidentLifecycleState,
): boolean {
  return TRANSITION_RULE_CATALOG.some((r) => r.from === from && r.to === to);
}

export function getAllowedNextStates(
  from: IncidentLifecycleState,
): IncidentLifecycleState[] {
  return [...new Set(getTransitionsFrom(from).map((r) => r.to))];
}

export function applyLifecycleAction(input: {
  current: IncidentLifecycleState;
  action: LifecycleAction;
}): IncidentLifecycleState | null {
  const rule = TRANSITION_RULE_CATALOG.find(
    (r) => r.from === input.current && r.action === input.action,
  );
  return rule?.to ?? null;
}

export function deriveAlertState(incidentState: IncidentLifecycleState): AlertLifecycleState {
  if (incidentState === "closed" || incidentState === "resolved" || incidentState === "postmortem") {
    return "resolved";
  }
  if (incidentState === "acknowledged" || incidentState === "mitigating" || incidentState === "escalated") {
    return "acknowledged";
  }
  return "firing";
}

export function deriveEscalationStage(incidentState: IncidentLifecycleState): EscalationStage {
  if (incidentState === "escalated") return "l2";
  if (incidentState === "closed" || incidentState === "resolved") return "none";
  if (incidentState === "open" || incidentState === "triggered") return "none";
  return "l1";
}

export function derivePostmortemStatus(incidentState: IncidentLifecycleState): PostmortemStatus {
  if (incidentState === "postmortem") return "draft";
  if (incidentState === "closed") return "published";
  if (incidentState === "resolved") return "pending";
  return "na";
}

export function buildIncidentSnapshot(input: {
  incidentId: string;
  type: IncidentLifecycleSnapshot["type"];
  state: IncidentLifecycleState;
}): IncidentLifecycleSnapshot {
  return {
    incidentId: input.incidentId,
    type: input.type,
    state: input.state,
    escalation: deriveEscalationStage(input.state),
    alertState: deriveAlertState(input.state),
    postmortem: derivePostmortemStatus(input.state),
    acknowledged: ["acknowledged", "escalated", "mitigating", "resolved", "postmortem", "closed"].includes(
      input.state,
    ),
    resolved: isTerminalIncidentState(input.state) || input.state === "resolved" || input.state === "postmortem",
  };
}

export function simulateLifecyclePath(actions: LifecycleAction[]): {
  path: IncidentLifecycleState[];
  valid: boolean;
} {
  let current: IncidentLifecycleState = "triggered";
  const path: IncidentLifecycleState[] = [current];

  for (const action of actions) {
    const next = applyLifecycleAction({ current, action });
    if (!next) return { path, valid: false };
    current = next;
    path.push(current);
  }

  return { path, valid: true };
}

export const CANONICAL_RESOLUTION_PATH: LifecycleAction[] = [
  "trigger",
  "acknowledge",
  "mitigate",
  "resolve",
  "postmortem",
  "close",
];

export const CANONICAL_ESCALATION_PATH: LifecycleAction[] = [
  "trigger",
  "escalate",
  "mitigate",
  "resolve",
  "close",
];
