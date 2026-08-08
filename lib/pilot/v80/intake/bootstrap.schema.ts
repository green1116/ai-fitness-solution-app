/**
 * V80 Pilot P10 — Project bootstrap / execution seed schema
 * Persisted into existing Project notes + Tender metadata (no Prisma model changes)
 */

export const PROJECT_BOOTSTRAP_VERSION = "v80-pilot-p10-bootstrap-1";

export type BootstrapOwnerRole =
  | "project_manager"
  | "technical_lead"
  | "commercial_owner"
  | "compliance_owner"
  | "delivery_owner";

export type BootstrapOwner = {
  role: BootstrapOwnerRole;
  label: string;
  userId?: string;
  email?: string;
  displayName: string;
};

export type BootstrapTaskStatus = "todo" | "in_progress" | "blocked" | "done";

export type BootstrapTask = {
  id: string;
  milestoneId: string;
  title: string;
  description: string;
  ownerRole: BootstrapOwnerRole;
  status: BootstrapTaskStatus;
  source: "intake_requirement" | "compliance" | "clarification" | "handoff" | "system";
  relatedItemIds?: string[];
  dueOffsetDays: number;
};

export type BootstrapMilestoneStatus = "planned" | "in_progress" | "completed" | "blocked";

export type BootstrapMilestone = {
  id: string;
  title: string;
  description: string;
  status: BootstrapMilestoneStatus;
  ownerRole: BootstrapOwnerRole;
  dueOffsetDays: number;
  order: number;
};

export type BootstrapKickoffSummary = {
  projectName: string;
  clientName: string;
  location: string;
  milestoneCount: number;
  taskCount: number;
  ownerCount: number;
  ready: boolean;
  headline: string;
  bullets: string[];
  risks: string[];
  nextActions: string[];
};

export type ProjectBootstrapPackage = {
  version: typeof PROJECT_BOOTSTRAP_VERSION;
  bootstrapId: string;
  contentHash: string;
  builtAt: string;
  organizationId: string;
  sessionId: string;
  tenderIntakeId: string;
  projectId: string;
  quoteId?: string;
  tenderId?: string;
  handoffPackageId?: string;
  handoffContentHash?: string;
  v80WorkflowJobId?: string;
  owners: BootstrapOwner[];
  milestones: BootstrapMilestone[];
  tasks: BootstrapTask[];
  kickoff: BootstrapKickoffSummary;
  traceability: {
    intakeRevision: number;
    sourceDocuments: Array<{ id: string; fileName: string; docType: string }>;
    requirementItemCount: number;
    compliancePassed?: boolean;
  };
};

export type IntakeBootstrapState = {
  bootstrapId: string;
  contentHash: string;
  builtAt: string;
  projectId: string;
  package: ProjectBootstrapPackage;
  idempotent?: boolean;
};
