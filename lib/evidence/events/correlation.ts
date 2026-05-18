/**
 * V3.4-E16 — 事件关联上下文
 */

export type RuntimeEventCorrelation = {
  traceId: string;
  correlationId: string;
  jobId?: string;
  planId?: string;
  tenderId?: string;
  documentId?: string;
};

export function createRuntimeEventCorrelation(input: {
  traceId: string;
  correlationId?: string;
  jobId?: string;
  planId?: string;
  tenderId?: string;
  documentId?: string;
}): RuntimeEventCorrelation {
  return {
    traceId: input.traceId,
    correlationId:
      input.correlationId ||
      `corr-${input.traceId}-${input.documentId || input.planId || "runtime"}`,
    jobId: input.jobId,
    planId: input.planId,
    tenderId: input.tenderId,
    documentId: input.documentId,
  };
}
