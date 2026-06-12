import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";

export const EQUIPMENT_ATTACHMENT_RUNTIME_VERSION = "v19.6-equipment-attachment-1" as const;

export interface EquipmentAttachmentPackage {
  packageId: string;
  packLabel: string;
  bidderBrand: string;
  equipmentSchedule: Array<{ modelName: string; category: string; quantity: number; brandName: string }>;
  modelList: string[];
  datasheetReferences: string[];
  attachmentReadiness: number;
}

export interface EquipmentAttachmentRuntimePayload {
  version: typeof EQUIPMENT_ATTACHMENT_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  equipmentPackage: EquipmentAttachmentPackage;
  attachmentReadiness: number;
  summary: string;
}
