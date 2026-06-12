import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";

export const COMMERCIAL_ATTACHMENT_RUNTIME_VERSION = "v19.6-commercial-attachment-1" as const;

export interface CommercialPackage {
  packageId: string;
  packLabel: string;
  bidderBrand: string;
  budgetPackage: { totalMin: number; totalMax: number; perUnit: number; equipmentCount: number };
  roiNarrative: string;
  tcoNarrative: string;
  lifecycleCostProfile: { acquisition: number; maintenance: number; replacement: number; total: number };
  commercialReadiness: number;
}

export interface CommercialAttachmentRuntimePayload {
  version: typeof COMMERCIAL_ATTACHMENT_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  commercialPackage: CommercialPackage;
  commercialReadiness: number;
  summary: string;
}
