import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const COMPLIANCE_INTELLIGENCE_RUNTIME_VERSION =
  "v12.0-compliance-intelligence-runtime-1" as const;

export interface ComplianceIntelligence {
  intelligenceId: string;
  complianceCoverage: number;
  missingAreas: string[];
  attentionAreas: string[];
  summary: string;
}

export interface ComplianceIntelligenceRuntimePayload {
  version: typeof COMPLIANCE_INTELLIGENCE_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  compliance: ComplianceIntelligence;
  summary: string;
}
