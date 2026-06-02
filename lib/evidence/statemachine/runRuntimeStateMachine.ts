import { buildRuntimeStateMachine } from "./buildRuntimeStateMachine";
import type {
  RuntimeStateMachineRuntimeInput,
  RuntimeStateMachineRuntimeResult,
} from "../types";
import { appendStateMachineEvent, createStateMachineTrace } from "./stateMachineTrace";

/**
 * V3.4-E15 Runtime State Machine
 */
export function runRuntimeStateMachine(
  input: RuntimeStateMachineRuntimeInput,
): RuntimeStateMachineRuntimeResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createStateMachineTrace(input.runId);

  trace = appendStateMachineEvent(trace, "initialize_draft", "初始化 draft 状态");
  trace = appendStateMachineEvent(trace, "progress_evidence", "推进证据与 OCR 阶段");
  trace = appendStateMachineEvent(trace, "progress_governance", "推进治理与高管阶段");
  const pkg = buildRuntimeStateMachine({ ...input, ranAt: input.ranAt ?? ranAt });
  trace = appendStateMachineEvent(
    trace,
    "resolve_terminal_state",
    `terminal=${pkg.currentState}`,
    { releasable: pkg.releasable },
  );
  trace = appendStateMachineEvent(trace, "debug", "生成 state machine debug");

  return {
    ...pkg,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    trace,
  };
}
