import type {
  Workspace,
  WorkspaceLifecycleEvent,
  WorkspaceSettings,
  WorkspaceSummary,
} from "./types";

export function buildWorkspace(input?: { deploymentId?: string }): Workspace {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  return {
    workspaceId: `workspace-${deploymentId}`,
    tenantId: `tenant-${deploymentId}`,
    name: `主工作区 ${deploymentId}`,
    status: "active",
    createdAt: new Date().toISOString(),
  };
}

export function buildWorkspaceSettings(input?: {
  deploymentId?: string;
  workspace?: Workspace;
}): WorkspaceSettings {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  const workspace = input?.workspace ?? buildWorkspace({ deploymentId });
  return {
    settingsId: `workspace-settings-${deploymentId}`,
    workspaceId: workspace.workspaceId,
    defaultLocale: "zh-CN",
    timezone: "Asia/Shanghai",
    planExportWatermark: false,
    budgetRoundingMode: "standard",
    tenderAutoAnalyze: true,
  };
}

export function buildWorkspaceSummary(input?: {
  deploymentId?: string;
  workspace?: Workspace;
}): WorkspaceSummary {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  const workspace = input?.workspace ?? buildWorkspace({ deploymentId });
  return {
    summaryId: `workspace-summary-${deploymentId}`,
    workspaceId: workspace.workspaceId,
    projectCount: 12,
    activeMembers: 8,
    lastActivityAt: new Date().toISOString(),
    summary: `workspace-summary id=${workspace.workspaceId} projects=12 members=8`,
  };
}

export function buildWorkspaceLifecycle(input?: {
  deploymentId?: string;
  workspace?: Workspace;
}): WorkspaceLifecycleEvent[] {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  const workspace = input?.workspace ?? buildWorkspace({ deploymentId });
  const base = new Date(workspace.createdAt).getTime();

  return (["created", "configured", "active", "archived"] as const).map(
    (stage, index) => ({
      eventId: `workspace-lifecycle-${deploymentId}-${index}`,
      workspaceId: workspace.workspaceId,
      stage,
      occurredAt: new Date(base + index * 60_000).toISOString(),
    }),
  );
}
