/**
 * E01-P1 — Tender Intake Kernel types
 * TenderSource → TenderIntakeRecord → TenderWorkspace lifecycle
 */

export const V101_TENDER_INTAKE_VERSION = "v101-tender-intake-1" as const;
export const V101_TENDER_INTAKE_FREEZE_VERSION = "v101-tender-intake-freeze-1" as const;

export type TenderSourceKind = "upload" | "paste" | "url" | "api";

export type TenderIntakeStatus =
  | "received"
  | "validated"
  | "normalized"
  | "workspace_ready"
  | "failed";

export type TenderWorkspaceStatus = "draft" | "active" | "archived";

export type TenderIntakeLifecycleStage =
  | "source"
  | "intake"
  | "workspace";

export type TenderSource = {
  id: string;
  kind: TenderSourceKind;
  fileName?: string;
  mimeType?: string;
  contentHash?: string;
  rawText?: string;
  uri?: string;
  byteLength?: number;
  receivedAt: string;
  metadata?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type TenderIntakeRecord = {
  id: string;
  sourceId: string;
  status: TenderIntakeStatus;
  projectHint?: string;
  organizationHint?: string;
  normalizedTitle?: string;
  errors: string[];
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type TenderWorkspace = {
  id: string;
  intakeId: string;
  sourceId: string;
  status: TenderWorkspaceStatus;
  title: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type TenderIntakeLifecycleTransition = {
  from: TenderIntakeLifecycleStage;
  to: TenderIntakeLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type TenderIntakeLifecycle = {
  current: TenderIntakeLifecycleStage;
  stages: TenderIntakeLifecycleStage[];
  transitions: TenderIntakeLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type TenderIntakeKernelInput = {
  deploymentId?: string;
  source: Omit<TenderSource, "id" | "receivedAt" | "readOnly"> & {
    id?: string;
    receivedAt?: string;
  };
  projectHint?: string;
  organizationHint?: string;
};

export type TenderIntakeKernelResult = {
  version: typeof V101_TENDER_INTAKE_VERSION;
  freezeVersion: typeof V101_TENDER_INTAKE_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  source: TenderSource;
  intake: TenderIntakeRecord;
  workspace: TenderWorkspace | null;
  lifecycle: TenderIntakeLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
