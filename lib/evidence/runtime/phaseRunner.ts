import type {
  EvidenceRuntimePhaseId,
  EvidenceRuntimePhaseResult,
  EvidenceRuntimePhaseStatus,
  EvidenceRuntimeTrace,
} from "../types";
import { appendAuditEvent } from "./trace";

export async function runTracedPhase<T>(
  trace: EvidenceRuntimeTrace,
  phaseId: EvidenceRuntimePhaseId,
  message: string,
  fn: () => Promise<T> | T,
  metrics?: EvidenceRuntimePhaseResult["metrics"],
): Promise<{ result: T; phase: EvidenceRuntimePhaseResult; trace: EvidenceRuntimeTrace }> {
  const started = Date.now();
  let currentTrace = appendAuditEvent(trace, {
    phaseId,
    kind: "phase_start",
    message,
  });

  try {
    const result = await fn();
    const finished = Date.now();
    const phase: EvidenceRuntimePhaseResult = {
      phaseId,
      status: "completed",
      startedAt: new Date(started).toISOString(),
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      message,
      metrics,
    };
    currentTrace = appendAuditEvent(currentTrace, {
      phaseId,
      kind: "phase_end",
      message: `${message} — 完成`,
      payload: metrics,
    });
    return { result, phase, trace: currentTrace };
  } catch (err: unknown) {
    const finished = Date.now();
    const errorMessage = err instanceof Error ? err.message : String(err);
    const phase: EvidenceRuntimePhaseResult = {
      phaseId,
      status: "failed",
      startedAt: new Date(started).toISOString(),
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      message: errorMessage,
      error: errorMessage,
    };
    currentTrace = appendAuditEvent(currentTrace, {
      phaseId,
      kind: "error",
      message: errorMessage,
    });
    throw Object.assign(new Error(errorMessage), { phase, trace: currentTrace });
  }
}

export function skippedPhase(
  phaseId: EvidenceRuntimePhaseId,
  message: string,
): EvidenceRuntimePhaseResult {
  const now = new Date().toISOString();
  return {
    phaseId,
    status: "skipped",
    startedAt: now,
    finishedAt: now,
    durationMs: 0,
    message,
  };
}

export function failedPhase(
  phaseId: EvidenceRuntimePhaseId,
  message: string,
  started: number,
): EvidenceRuntimePhaseResult {
  const finished = Date.now();
  return {
    phaseId,
    status: "failed",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    message,
    error: message,
  };
}

export function completedPhase(
  phaseId: EvidenceRuntimePhaseId,
  message: string,
  started: number,
  metrics?: EvidenceRuntimePhaseResult["metrics"],
  status: EvidenceRuntimePhaseStatus = "completed",
): EvidenceRuntimePhaseResult {
  const finished = Date.now();
  return {
    phaseId,
    status,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    message,
    metrics,
  };
}
