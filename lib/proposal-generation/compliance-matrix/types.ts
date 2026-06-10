import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";

export const COMPLIANCE_MATRIX_RUNTIME_VERSION = "v11.0-compliance-matrix-runtime-1" as const;

export type ComplianceStatus = "compliant" | "partial" | "not-applicable" | "pending";

export interface RequirementMapping {
  mappingId: string;
  requirementId: string;
  requirementTitle: string;
  proposalSection: string;
  status: ComplianceStatus;
}

export interface ComplianceStatusEntry {
  entryId: string;
  category: string;
  totalRequirements: number;
  compliantCount: number;
  coverageRate: number;
}

export interface EvidenceMapping {
  evidenceId: string;
  requirementId: string;
  evidenceType: string;
  evidenceRef: string;
  description: string;
}

export interface ComplianceMatrixRuntimePayload {
  version: typeof COMPLIANCE_MATRIX_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  requirementMappings: RequirementMapping[];
  complianceStatus: ComplianceStatusEntry[];
  evidenceMappings: EvidenceMapping[];
  summary: string;
}
