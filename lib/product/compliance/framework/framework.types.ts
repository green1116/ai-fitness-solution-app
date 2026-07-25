/**
 * Product Compliance — Framework types
 */

import type {
  COMPLIANCE_FRAMEWORK_KINDS,
  COMPLIANCE_FRAMEWORK_STATUSES,
} from "../governance/governance.constants";

export type ComplianceFrameworkKind =
  (typeof COMPLIANCE_FRAMEWORK_KINDS)[number];
export type ComplianceFrameworkStatus =
  (typeof COMPLIANCE_FRAMEWORK_STATUSES)[number];
export type FrameworkMetadata = Record<string, unknown>;

export type ComplianceFramework = {
  id: string;
  code: string;
  name: string;
  kind: ComplianceFrameworkKind;
  opsSurfaceId: string;
  status: ComplianceFrameworkStatus;
  detail: string;
  metadata: FrameworkMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterComplianceFrameworkInput = {
  id?: string;
  code: string;
  name: string;
  kind: ComplianceFrameworkKind;
  opsSurfaceId: string;
  metadata?: FrameworkMetadata;
};

export type UpdateComplianceFrameworkStatusInput = {
  frameworkId: string;
  status: ComplianceFrameworkStatus;
};
