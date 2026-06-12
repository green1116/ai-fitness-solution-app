import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";

export const COMPLIANCE_ATTACHMENT_RUNTIME_VERSION = "v19.6-compliance-attachment-1" as const;

export interface CompliancePackage {
  packageId: string;
  packLabel: string;
  bidderBrand: string;
  complianceMatrix: string;
  certifications: string[];
  qualifications: string[];
  licenses: string[];
  complianceReadiness: number;
}

export interface ComplianceAttachmentRuntimePayload {
  version: typeof COMPLIANCE_ATTACHMENT_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  compliancePackage: CompliancePackage;
  complianceReadiness: number;
  summary: string;
}
