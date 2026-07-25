/**
 * Product Compliance — Control types
 */

import type { COMPLIANCE_CONTROL_STATUSES } from "../governance/governance.constants";

export type ComplianceControlStatus =
  (typeof COMPLIANCE_CONTROL_STATUSES)[number];
export type ControlMetadata = Record<string, unknown>;

export type ComplianceControl = {
  id: string;
  frameworkId: string;
  code: string;
  title: string;
  status: ComplianceControlStatus;
  detail: string;
  metadata: ControlMetadata;
  createdAt: string;
  updatedAt: string;
};

export type DefineComplianceControlInput = {
  id?: string;
  frameworkId: string;
  code: string;
  title: string;
  metadata?: ControlMetadata;
};

export type UpdateComplianceControlStatusInput = {
  controlId: string;
  status: ComplianceControlStatus;
};
