export const ENTERPRISE_SAAS_VERSION = "v10.5-enterprise-saas-1" as const;

export type EnterpriseSaasStatus = "success" | "failed";

export type EnterpriseSaasStageStatus = "completed" | "failed";

export interface EnterpriseSaasStageResult {
  stageId: string;
  label: string;
  status: EnterpriseSaasStageStatus;
  durationMs: number;
  message: string;
}

export interface EnterpriseSaasRuntimeResult<TPayload> {
  version: typeof ENTERPRISE_SAAS_VERSION;
  runtimeId: string;
  domain: string;
  status: EnterpriseSaasStatus;
  stages: EnterpriseSaasStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface EnterpriseSaasEvidence {
  evidenceId: string;
  version: typeof ENTERPRISE_SAAS_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: EnterpriseSaasStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
