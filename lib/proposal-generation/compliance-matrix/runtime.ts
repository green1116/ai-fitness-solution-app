import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import {
  buildComplianceStatus,
  buildEvidenceMappings,
  buildRequirementMappings,
} from "./builders";
import type { ComplianceMatrixRuntimePayload } from "./types";
import { COMPLIANCE_MATRIX_RUNTIME_VERSION } from "./types";

export function validateComplianceMatrixRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  const mappings = buildRequirementMappings({ deploymentId });
  const status = buildComplianceStatus({ deploymentId, mappings });
  const evidence = buildEvidenceMappings({ deploymentId });
  return {
    valid:
      mappings.length >= 4 &&
      status.length >= 3 &&
      evidence.length === mappings.length &&
      status.every((s) => s.coverageRate >= 0),
  };
}

export function runComplianceMatrixRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<ComplianceMatrixRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  const stages: ProposalStageResult[] = [];

  const requirementMappings = runStage("compliance-mapping", "Requirement Mapping", () => buildRequirementMappings({ deploymentId }), stages);
  const complianceStatus = runStage("compliance-status", "Compliance Status", () => buildComplianceStatus({ deploymentId, mappings: requirementMappings }), stages);
  const evidenceMappings = runStage("compliance-evidence", "Evidence Mapping", () => buildEvidenceMappings({ deploymentId }), stages);

  const validation = runStage("compliance-validate", "Compliance Matrix Validation", () => validateComplianceMatrixRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Compliance matrix validation failed");

  const payload: ComplianceMatrixRuntimePayload = {
    version: COMPLIANCE_MATRIX_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    requirementMappings,
    complianceStatus,
    evidenceMappings,
    summary: `compliance-matrix mappings=${requirementMappings.length} categories=${complianceStatus.length} evidence=${evidenceMappings.length}`,
  };

  return finalizeRuntime({ domain: "compliance-matrix", deploymentId, stages, payload, summary: payload.summary });
}
