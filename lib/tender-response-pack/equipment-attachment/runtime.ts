import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildEquipmentAttachmentPackage } from "./builders";
import type { EquipmentAttachmentRuntimePayload } from "./types";
import { EQUIPMENT_ATTACHMENT_RUNTIME_VERSION } from "./types";

export function validateEquipmentAttachmentRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): { valid: boolean } {
  const pkg = buildEquipmentAttachmentPackage(input);
  return { valid: pkg.attachmentReadiness >= 80 && pkg.equipmentSchedule.length >= 2 };
}

export function runEquipmentAttachmentRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): ResponsePackRuntimeResult<EquipmentAttachmentRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-attachment-default";
  const stages: ResponsePackStageResult[] = [];

  const equipmentPackage = runStage("equipment-attachment-build", "Equipment Attachment", () => buildEquipmentAttachmentPackage(input), stages);
  const validation = runStage("equipment-attachment-validate", "Equipment Validation", () => validateEquipmentAttachmentRuntime(input), stages);
  if (!validation.valid) throw new Error("Equipment attachment validation failed");

  const payload: EquipmentAttachmentRuntimePayload = {
    version: EQUIPMENT_ATTACHMENT_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    equipmentPackage,
    attachmentReadiness: equipmentPackage.attachmentReadiness,
    summary: `equipment-attachment ${equipmentPackage.packLabel} models=${equipmentPackage.modelList.length} readiness=${equipmentPackage.attachmentReadiness}%`,
  };

  return finalizeRuntime({ domain: "equipment-attachment", deploymentId, stages, payload, summary: payload.summary });
}
