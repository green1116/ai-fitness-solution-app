import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildCompliancePackage } from "./builders";
import type { ComplianceAttachmentRuntimePayload } from "./types";
import { COMPLIANCE_ATTACHMENT_RUNTIME_VERSION } from "./types";

export function validateComplianceAttachmentRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): { valid: boolean } {
  const pkg = buildCompliancePackage(input);
  return { valid: pkg.complianceReadiness >= 80 && pkg.certifications.length >= 3 };
}

export function runComplianceAttachmentRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): ResponsePackRuntimeResult<ComplianceAttachmentRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "compliance-attachment-default";
  const stages: ResponsePackStageResult[] = [];

  const compliancePackage = runStage("compliance-attachment-build", "Compliance Attachment", () => buildCompliancePackage(input), stages);
  const validation = runStage("compliance-attachment-validate", "Compliance Validation", () => validateComplianceAttachmentRuntime(input), stages);
  if (!validation.valid) throw new Error("Compliance attachment validation failed");

  const payload: ComplianceAttachmentRuntimePayload = {
    version: COMPLIANCE_ATTACHMENT_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    compliancePackage,
    complianceReadiness: compliancePackage.complianceReadiness,
    summary: `compliance-attachment ${compliancePackage.packLabel} readiness=${compliancePackage.complianceReadiness}%`,
  };

  return finalizeRuntime({ domain: "compliance-attachment", deploymentId, stages, payload, summary: payload.summary });
}
