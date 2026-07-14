/**
 * E04-P3 — Business Process Instance Lifecycle
 * READY -> RUNNING -> COMPLETED -> RESULT
 */

import {
  PROCESS_INSTANCE_PHASES,
  PROCESS_INSTANCE_TRANSITIONS,
} from "./process.constants";
import type {
  ProcessDefinition,
  ProcessInstancePhase,
  ProcessInstanceState,
  ProcessInstanceTransition,
  ProcessNodeRuntimeState,
} from "./process.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceProcessPhase(
  from: ProcessInstancePhase,
  to: ProcessInstancePhase,
): boolean {
  return PROCESS_INSTANCE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createPendingNodeStates(
  process: ProcessDefinition,
): ProcessNodeRuntimeState[] {
  return process.nodes.map((node) => ({
    nodeId: node.id,
    workflowId: node.workflowId,
    status: "pending" as const,
    readOnly: true as const,
  }));
}

export function createReadyProcessState(
  process: ProcessDefinition,
): ProcessInstanceState {
  return {
    phase: "READY",
    phases: [...PROCESS_INSTANCE_PHASES],
    transitions: [],
    nodes: createPendingNodeStates(process),
    complete: false,
    readOnly: true,
  };
}

export function advanceProcessPhase(
  state: ProcessInstanceState,
  to: ProcessInstancePhase,
  note?: string,
): ProcessInstanceState {
  if (!canAdvanceProcessPhase(state.phase, to)) {
    throw new Error(
      `Invalid process phase transition: ${state.phase} → ${to}`,
    );
  }

  const transition: ProcessInstanceTransition = {
    from: state.phase,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  return {
    phase: to,
    phases: [...PROCESS_INSTANCE_PHASES],
    transitions: [...state.transitions, transition],
    nodes: state.nodes,
    complete: to === "RESULT",
    readOnly: true,
  };
}

export function updateNodeState(
  state: ProcessInstanceState,
  nodeId: string,
  patch: Omit<Partial<ProcessNodeRuntimeState>, "nodeId" | "readOnly">,
): ProcessInstanceState {
  const nodes = state.nodes.map((node) => {
    if (node.nodeId !== nodeId) return node;
    return {
      ...node,
      ...patch,
      nodeId: node.nodeId,
      readOnly: true as const,
    };
  });

  return {
    ...state,
    nodes,
    readOnly: true,
  };
}
