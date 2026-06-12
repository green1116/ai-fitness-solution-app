import type { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";

export const ROI_NARRATIVE_RUNTIME_VERSION = "v19.5-roi-narrative-1" as const;

export interface ROINarrative {
  narrativeId: string;
  proposalLabel: string;
  bidderBrand: string;
  investmentLogic: string;
  businessValue: string;
  operationalValue: string;
  employeeExperienceValue: string;
  roiReadiness: number;
}

export interface ROINarrativeRuntimePayload {
  version: typeof ROI_NARRATIVE_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  narrative: ROINarrative;
  roiReadiness: number;
  summary: string;
}
