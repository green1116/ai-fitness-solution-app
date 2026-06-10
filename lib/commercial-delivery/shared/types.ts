export const COMMERCIAL_DELIVERY_VERSION = "v14.0-commercial-delivery-1" as const;

export type CommercialDeliveryStatus = "success" | "failed";

export type CommercialDeliveryStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface CommercialDeliveryStageResult {
  stageId: string;
  label: string;
  status: CommercialDeliveryStageStatus;
  durationMs: number;
  message: string;
}

export interface CommercialDeliveryRuntimeResult<TPayload> {
  version: typeof COMMERCIAL_DELIVERY_VERSION;
  runtimeId: string;
  domain: string;
  status: CommercialDeliveryStatus;
  stages: CommercialDeliveryStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface CommercialDeliveryEvidence {
  evidenceId: string;
  version: typeof COMMERCIAL_DELIVERY_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: CommercialDeliveryStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
