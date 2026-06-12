import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import type { CommercialPackage } from "../commercial-attachment/types";
import type { CompliancePackage } from "../compliance-attachment/types";
import type { EquipmentAttachmentPackage } from "../equipment-attachment/types";

export const RESPONSE_PACK_ASSEMBLY_RUNTIME_VERSION = "v19.6-response-pack-assembly-1" as const;

export interface TenderResponsePack {
  packId: string;
  packLabel: string;
  bidderBrand: string;
  tenderId: string;
  executiveSummary: string;
  technicalProposal: string;
  equipmentPlan: string;
  budgetPackage: CommercialPackage["budgetPackage"];
  commercialPackage: CommercialPackage;
  compliancePackage: CompliancePackage;
  equipmentPackage: EquipmentAttachmentPackage;
  assemblyReadiness: number;
}

export interface ResponsePackAssemblyRuntimePayload {
  version: typeof RESPONSE_PACK_ASSEMBLY_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  responsePack: TenderResponsePack;
  assemblyReadiness: number;
  summary: string;
}
