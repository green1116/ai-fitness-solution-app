/**
 * V80 Pilot P9 — Intake summary & pre-V80 handoff package schema (session-local)
 */

import type { ClarificationState } from "./clarification.schema";
import type { ComplianceValidationReport } from "./compliance.schema";
import type { MultiDocConsolidationState } from "./multidoc.schema";
import type { TenderRequirements } from "./requirements.schema";

export const INTAKE_HANDOFF_PACKAGE_VERSION = "v80-pilot-p9-handoff-1";

export type HandoffAudience = "internal" | "customer";

export type HandoffApprovalStatus = {
  sessionStatus: string;
  qaPassed: boolean;
  qaPassedAt?: string;
  compliancePassed: boolean;
  clarificationsBlockingOpen: number;
  frozen: boolean;
  signedOff: boolean;
  readyForV80: boolean;
  workflowStatus?: string;
};

export type HandoffRequirementSummary = {
  projectName: string;
  organization: string;
  location: string;
  industry: string;
  scope: string;
  mustCount: number;
  confirmedMustCount: number;
  lowConfidenceCount: number;
  withEvidenceCount: number;
  itemCount: number;
};

export type HandoffEvidenceTraceItem = {
  itemId: string;
  listKey: string;
  text: string;
  pageRef?: string;
  confidence?: number;
  confidenceBand?: string;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  evidenceExcerpts: Array<{
    page: number;
    excerpt: string;
    documentName?: string;
  }>;
};

export type HandoffDocumentSummary = {
  id: string;
  fileName: string;
  docType: string;
  order: number;
  priority: number;
  status: string;
};

export type HandoffTraceability = {
  sessionId: string;
  tenderIntakeId: string;
  packageId: string;
  contentHash: string;
  documents: HandoffDocumentSummary[];
  auditSteps: Array<{
    id: string;
    step: string;
    timestamp: string;
    message?: string;
  }>;
  linkage: {
    productionProjectId?: string;
    productionQuoteId?: string;
    productionTenderId?: string;
    v80WorkflowJobId?: string;
  };
  evidenceSample: HandoffEvidenceTraceItem[];
};

export type IntakeHandoffPackage = {
  version: typeof INTAKE_HANDOFF_PACKAGE_VERSION;
  packageId: string;
  audience: HandoffAudience;
  builtAt: string;
  organizationId: string;
  sessionId: string;
  tenderIntakeId: string;
  fileName: string;
  revision: number;
  approval: HandoffApprovalStatus;
  requirementSummary: HandoffRequirementSummary;
  /** Full requirements for internal; redacted-safe subset for customer */
  requirements: TenderRequirements;
  clarifications?: Pick<ClarificationState, "round" | "gaps" | "questions" | "updatedAt">;
  consolidation?: MultiDocConsolidationState;
  compliance?: ComplianceValidationReport;
  documents: HandoffDocumentSummary[];
  traceability: HandoffTraceability;
  customerBrief: {
    title: string;
    headline: string;
    bullets: string[];
    openQuestions: string[];
    riskNote?: string;
  };
  internalNotes: {
    blockers: string[];
    warnings: string[];
    nextActions: string[];
  };
};

export type IntakeHandoffState = {
  packageId: string;
  builtAt: string;
  contentHash: string;
  lastAudience: HandoffAudience;
  package: IntakeHandoffPackage;
};
