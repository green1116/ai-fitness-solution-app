export const PAYMENT_READINESS_VERSION = "v10.1-payment-readiness-1" as const;

export type PaymentReadinessStatus = "success" | "failed";

export type PaymentReadinessStageStatus = "completed" | "failed";

export interface PaymentReadinessStageResult {
  stageId: string;
  label: string;
  status: PaymentReadinessStageStatus;
  durationMs: number;
  message: string;
}

export interface PaymentReadinessRuntimeResult<TPayload> {
  version: typeof PAYMENT_READINESS_VERSION;
  runtimeId: string;
  domain: string;
  status: PaymentReadinessStatus;
  stages: PaymentReadinessStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface PaymentReadinessEvidence {
  evidenceId: string;
  version: typeof PAYMENT_READINESS_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: PaymentReadinessStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
