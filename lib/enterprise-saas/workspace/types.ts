import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";

export const WORKSPACE_RUNTIME_VERSION = "v10.5-workspace-runtime-1" as const;

export type WorkspaceStatus = "active" | "archived" | "suspended";

export type WorkspaceLifecycleStage = "created" | "configured" | "active" | "archived";

export interface Workspace {
  workspaceId: string;
  tenantId: string;
  name: string;
  status: WorkspaceStatus;
  createdAt: string;
}

export interface WorkspaceSettings {
  settingsId: string;
  workspaceId: string;
  defaultLocale: string;
  timezone: string;
  planExportWatermark: boolean;
  budgetRoundingMode: "standard" | "conservative";
  tenderAutoAnalyze: boolean;
}

export interface WorkspaceSummary {
  summaryId: string;
  workspaceId: string;
  projectCount: number;
  activeMembers: number;
  lastActivityAt: string;
  summary: string;
}

export interface WorkspaceLifecycleEvent {
  eventId: string;
  workspaceId: string;
  stage: WorkspaceLifecycleStage;
  occurredAt: string;
}

export interface WorkspaceRuntimePayload {
  version: typeof WORKSPACE_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  workspace: Workspace;
  settings: WorkspaceSettings;
  summary: WorkspaceSummary;
  lifecycle: WorkspaceLifecycleEvent[];
}
