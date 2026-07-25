/**
 * Product Compliance — Evidence types
 */

import type { COMPLIANCE_EVIDENCE_KINDS } from "../governance/governance.constants";

export type ComplianceEvidenceKind =
  (typeof COMPLIANCE_EVIDENCE_KINDS)[number];
export type EvidenceMetadata = Record<string, unknown>;

export type ComplianceEvidence = {
  id: string;
  controlId: string;
  kind: ComplianceEvidenceKind;
  reference: string;
  detail: string;
  metadata: EvidenceMetadata;
  collectedAt: string;
};

export type CollectComplianceEvidenceInput = {
  id?: string;
  controlId: string;
  kind: ComplianceEvidenceKind;
  reference: string;
  metadata?: EvidenceMetadata;
};
