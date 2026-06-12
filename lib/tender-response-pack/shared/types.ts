export const TENDER_RESPONSE_PACK_VERSION = "v19.6-tender-response-pack-1" as const;

export type ResponsePackStatus = "success" | "failed";

export type ResponsePackStageStatus = "completed" | "failed";

export const RESPONSE_PACK_BIDDER_BRANDS = [
  "Technogym",
  "Life Fitness",
  "Matrix",
  "Shuhua",
] as const;

export type ResponsePackBidderBrand = (typeof RESPONSE_PACK_BIDDER_BRANDS)[number];

export const RESPONSE_PACK_LABELS: Record<ResponsePackBidderBrand, string> = {
  Technogym: "Response Pack A",
  "Life Fitness": "Response Pack B",
  Matrix: "Response Pack C",
  Shuhua: "Response Pack D",
};

export interface ResponsePackStageResult {
  stageId: string;
  label: string;
  status: ResponsePackStageStatus;
  durationMs: number;
  message: string;
}

export interface ResponsePackRuntimeResult<TPayload> {
  version: typeof TENDER_RESPONSE_PACK_VERSION;
  runtimeId: string;
  domain: string;
  status: ResponsePackStatus;
  stages: ResponsePackStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface TenderResponsePackEvidence {
  evidenceId: string;
  version: typeof TENDER_RESPONSE_PACK_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: ResponsePackStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}

export interface TenderResponsePackReport {
  version: typeof TENDER_RESPONSE_PACK_VERSION;
  reportId: string;
  deploymentId: string;
  tenderId: string;
  proposalReadiness: number;
  complianceReadiness: number;
  attachmentReadiness: number;
  submissionReadiness: number;
  tenderResponseReadiness: number;
  responsePacks: Array<{
    packLabel: string;
    bidderBrand: string;
    packageLabel: string;
    submissionReadiness: number;
  }>;
  summary: string;
  generatedAt: string;
}
