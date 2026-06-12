import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildCommercialPackage } from "./builders";
import type { CommercialAttachmentRuntimePayload } from "./types";
import { COMMERCIAL_ATTACHMENT_RUNTIME_VERSION } from "./types";

export function validateCommercialAttachmentRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): { valid: boolean } {
  const pkg = buildCommercialPackage(input);
  return { valid: pkg.commercialReadiness >= 80 && pkg.budgetPackage.totalMin > 0 };
}

export function runCommercialAttachmentRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): ResponsePackRuntimeResult<CommercialAttachmentRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "commercial-attachment-default";
  const stages: ResponsePackStageResult[] = [];

  const commercialPackage = runStage("commercial-attachment-build", "Commercial Attachment", () => buildCommercialPackage(input), stages);
  const validation = runStage("commercial-attachment-validate", "Commercial Validation", () => validateCommercialAttachmentRuntime(input), stages);
  if (!validation.valid) throw new Error("Commercial attachment validation failed");

  const payload: CommercialAttachmentRuntimePayload = {
    version: COMMERCIAL_ATTACHMENT_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    commercialPackage,
    commercialReadiness: commercialPackage.commercialReadiness,
    summary: `commercial-attachment ${commercialPackage.packLabel} budget=¥${commercialPackage.budgetPackage.totalMin.toLocaleString()} readiness=${commercialPackage.commercialReadiness}%`,
  };

  return finalizeRuntime({ domain: "commercial-attachment", deploymentId, stages, payload, summary: payload.summary });
}
