import type { RuntimeOrchestrationContext } from "./context";
import type { RuntimeEventBus } from "./bus";
import type { RuntimeEventType } from "./types";
import type { RuntimeLifecycleState } from "../types/runtimeStateMachine";

export function buildEventPayloadBase(ctx: RuntimeOrchestrationContext) {
  return {
    traceId: ctx.correlation.traceId,
    correlationId: ctx.correlation.correlationId,
    jobId: ctx.correlation.jobId,
    planId: ctx.correlation.planId,
    tenderId: ctx.correlation.tenderId,
    documentId: ctx.correlation.documentId ?? ctx.runId,
    source: "evidence-runtime",
  };
}

export async function emitRuntimeEvent(
  bus: RuntimeEventBus,
  ctx: RuntimeOrchestrationContext,
  type: RuntimeEventType,
  extra?: {
    parentEventId?: string;
    reason?: string;
    currentState?: RuntimeLifecycleState;
    previousState?: RuntimeLifecycleState;
    evidenceIds?: string[];
    riskLevel?: string;
    validationSummary?: Record<string, unknown>;
    auditSummary?: Record<string, unknown>;
    policyDecision?: Record<string, unknown>;
    releaseDecision?: string;
    meta?: Record<string, unknown>;
    source?: string;
  },
  parentEventId?: string,
) {
  const { parentEventId: _ignored, ...payloadExtra } = extra ?? {};
  return bus.emit(
    type,
    ctx,
    {
      ...buildEventPayloadBase(ctx),
      source: payloadExtra.source ?? `evidence-runtime/${type}`,
      ...payloadExtra,
    },
    parentEventId ?? extra?.parentEventId,
  );
}
