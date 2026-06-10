import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildComplianceIntelligence } from "./builders";
import type { ComplianceIntelligenceRuntimePayload } from "./types";
import { COMPLIANCE_INTELLIGENCE_RUNTIME_VERSION } from "./types";

export function validateComplianceIntelligenceRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  const compliance = buildComplianceIntelligence({ deploymentId });
  return {
    valid:
      compliance.complianceCoverage >= 0 &&
      compliance.missingAreas.length >= 1 &&
      compliance.attentionAreas.length >= 1,
  };
}

export function runComplianceIntelligenceRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<ComplianceIntelligenceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const compliance = runStage(
    "compliance-intelligence",
    "Compliance Intelligence",
    () => buildComplianceIntelligence({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "compliance-validate",
    "Compliance Validation",
    () => validateComplianceIntelligenceRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Compliance intelligence validation failed");

  const payload: ComplianceIntelligenceRuntimePayload = {
    version: COMPLIANCE_INTELLIGENCE_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    compliance,
    summary: `compliance-intelligence coverage=${compliance.complianceCoverage}% missing=${compliance.missingAreas.length}`,
  };

  return finalizeRuntime({ domain: "compliance-intelligence", deploymentId, stages, payload, summary: payload.summary });
}
