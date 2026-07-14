/**
 * E03-P2 — Agent Execution state machine
 * Lifecycle: READY -> RUNNING -> COMPLETED -> RESULT
 */

export type AgentExecutionPhase =
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "RESULT";

export const AGENT_EXECUTION_PHASES: readonly AgentExecutionPhase[] = [
  "READY",
  "RUNNING",
  "COMPLETED",
  "RESULT",
] as const;

export const AGENT_EXECUTION_TRANSITIONS: ReadonlyArray<
  readonly [AgentExecutionPhase, AgentExecutionPhase]
> = [
  ["READY", "RUNNING"],
  ["RUNNING", "COMPLETED"],
  ["COMPLETED", "RESULT"],
] as const;

export type AgentExecutionState = {
  phase: AgentExecutionPhase;
  phases: AgentExecutionPhase[];
  transitions: Array<{
    from: AgentExecutionPhase;
    to: AgentExecutionPhase;
    at: string;
    note?: string;
    readOnly: true;
  }>;
  complete: boolean;
  readOnly: true;
};

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceExecutionPhase(
  from: AgentExecutionPhase,
  to: AgentExecutionPhase,
): boolean {
  return AGENT_EXECUTION_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createReadyExecutionState(): AgentExecutionState {
  return {
    phase: "READY",
    phases: [...AGENT_EXECUTION_PHASES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function advanceExecutionPhase(
  state: AgentExecutionState,
  to: AgentExecutionPhase,
  note?: string,
): AgentExecutionState {
  if (!canAdvanceExecutionPhase(state.phase, to)) {
    throw new Error(
      `Invalid execution phase transition: ${state.phase} → ${to}`,
    );
  }

  const transitions = [
    ...state.transitions,
    {
      from: state.phase,
      to,
      at: nowIso(),
      note,
      readOnly: true as const,
    },
  ];

  return {
    phase: to,
    phases: [...AGENT_EXECUTION_PHASES],
    transitions,
    complete: to === "RESULT",
    readOnly: true,
  };
}
