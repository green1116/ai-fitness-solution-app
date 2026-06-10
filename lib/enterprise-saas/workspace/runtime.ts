import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import {
  buildWorkspace,
  buildWorkspaceLifecycle,
  buildWorkspaceSettings,
  buildWorkspaceSummary,
} from "./builders";
import type { WorkspaceRuntimePayload } from "./types";
import { WORKSPACE_RUNTIME_VERSION } from "./types";

export function validateWorkspaceRuntime(input?: { deploymentId?: string }): {
  workspaceValid: boolean;
  settingsValid: boolean;
  summaryValid: boolean;
  lifecycleValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  const workspace = buildWorkspace({ deploymentId });
  const settings = buildWorkspaceSettings({ deploymentId, workspace });
  const summary = buildWorkspaceSummary({ deploymentId, workspace });
  const lifecycle = buildWorkspaceLifecycle({ deploymentId, workspace });

  return {
    workspaceValid: workspace.workspaceId.length > 0 && workspace.tenantId.length > 0,
    settingsValid:
      settings.workspaceId === workspace.workspaceId &&
      settings.defaultLocale.length > 0,
    summaryValid:
      summary.workspaceId === workspace.workspaceId && summary.projectCount >= 0,
    lifecycleValid:
      lifecycle.length >= 3 &&
      lifecycle.every((event) => event.workspaceId === workspace.workspaceId),
  };
}

export function runWorkspaceRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<WorkspaceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const workspace = runStage(
    "workspace-model",
    "Workspace Model",
    () => buildWorkspace({ deploymentId }),
    stages,
  );
  const settings = runStage(
    "workspace-settings",
    "Workspace Settings",
    () => buildWorkspaceSettings({ deploymentId, workspace }),
    stages,
  );
  const summary = runStage(
    "workspace-summary",
    "Workspace Summary",
    () => buildWorkspaceSummary({ deploymentId, workspace }),
    stages,
  );
  const lifecycle = runStage(
    "workspace-lifecycle",
    "Workspace Lifecycle",
    () => buildWorkspaceLifecycle({ deploymentId, workspace }),
    stages,
  );

  const validation = runStage(
    "workspace-validate",
    "Workspace Validation",
    () => validateWorkspaceRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("Workspace runtime validation failed");
  }

  const payload: WorkspaceRuntimePayload = {
    version: WORKSPACE_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    workspace,
    settings,
    summary,
    lifecycle,
  };

  return finalizeRuntime({
    domain: "workspace",
    deploymentId,
    stages,
    payload,
    summary: summary.summary,
  });
}
