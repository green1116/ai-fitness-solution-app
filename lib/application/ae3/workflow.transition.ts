/**
 * AE-3 — Declarative application workflow transitions.
 * Transition catalogue only — no executors / side effects / UI.
 */
import type { Ae3WorkflowStageId } from "./workflow.stage";

export const AE3_TRANSITION_IDS = [
  "T-REGISTER-COMPOSE",
  "T-COMPOSE-BIND",
  "T-BIND-ACTIVATE",
  "T-ACTIVATE-IDLE",
  "T-ACTIVATE-HOLD",
  "T-HOLD-IDLE",
  "T-IDLE-CLOSE",
] as const;

export type Ae3TransitionId = (typeof AE3_TRANSITION_IDS)[number];

export type Ae3WorkflowTransition = Readonly<{
  transitionId: Ae3TransitionId;
  from: Ae3WorkflowStageId;
  to: Ae3WorkflowStageId;
  notes: string;
}>;

/**
 * Closed transitions — declarative edges between stages.
 */
export const AE3_WORKFLOW_TRANSITIONS = [
  {
    transitionId: "T-REGISTER-COMPOSE",
    from: "REGISTER",
    to: "COMPOSE",
    notes: "Registry → composition",
  },
  {
    transitionId: "T-COMPOSE-BIND",
    from: "COMPOSE",
    to: "BIND",
    notes: "Composition → runtime bind",
  },
  {
    transitionId: "T-BIND-ACTIVATE",
    from: "BIND",
    to: "ACTIVATE",
    notes: "Bind → activate",
  },
  {
    transitionId: "T-ACTIVATE-IDLE",
    from: "ACTIVATE",
    to: "IDLE",
    notes: "Activate → idle",
  },
  {
    transitionId: "T-ACTIVATE-HOLD",
    from: "ACTIVATE",
    to: "HOLD",
    notes: "Activate → policy hold",
  },
  {
    transitionId: "T-HOLD-IDLE",
    from: "HOLD",
    to: "IDLE",
    notes: "Hold → idle",
  },
  {
    transitionId: "T-IDLE-CLOSE",
    from: "IDLE",
    to: "CLOSE",
    notes: "Idle → close",
  },
] as const satisfies readonly Ae3WorkflowTransition[];

export function getAe3WorkflowTransition(
  transitionId: Ae3TransitionId,
): Ae3WorkflowTransition | undefined {
  return AE3_WORKFLOW_TRANSITIONS.find((t) => t.transitionId === transitionId);
}

export function transitionsFrom(
  stageId: Ae3WorkflowStageId,
): readonly Ae3WorkflowTransition[] {
  return AE3_WORKFLOW_TRANSITIONS.filter((t) => t.from === stageId);
}
