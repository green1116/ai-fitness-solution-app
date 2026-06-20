import type { RuntimeContractRegistry } from "./runtime-contracts";
import {
  createFoundationProjectRuntime,
  createFoundationQuoteRuntime,
  createFoundationReportRuntime,
  createFoundationWorkspaceRuntime,
  validateProjectRuntime,
  validateQuoteRuntime,
  validateReportRuntime,
  validateWorkspaceRuntime,
} from "./runtime-validation";
import type {
  ProjectRuntime,
  QuoteRuntime,
  ReportRuntime,
  RuntimeCapability,
  RuntimeStatus,
  WorkspaceRuntime,
  WorkspaceSurfaceRuntime,
} from "./runtime-types";
import {
  RUNTIME_FOUNDATION_CAPABILITY,
  RUNTIME_FOUNDATION_VERSION,
  WORKSPACE_RUNTIME_P1_TAG,
} from "./shared/runtime-constants";

export interface WorkspaceRuntimeContext {
  workspaceId: string;
  version: string;
  tag: typeof WORKSPACE_RUNTIME_P1_TAG;
  status: RuntimeStatus;
  capability: RuntimeCapability;
  workspace: WorkspaceRuntime;
  quote: QuoteRuntime;
  project: ProjectRuntime;
  report: ReportRuntime;
}

export interface CreateWorkspaceRuntimeContextInput {
  workspaceId: string;
}

function resolveAggregateRuntimeStatus(runtimes: WorkspaceSurfaceRuntime[]): RuntimeStatus {
  if (runtimes.some((runtime) => runtime.status === "unavailable")) {
    return "unavailable";
  }
  if (runtimes.every((runtime) => runtime.status === "ready" || runtime.status === "mounted")) {
    return "ready";
  }
  if (runtimes.some((runtime) => runtime.status === "mounted")) {
    return "mounted";
  }
  return "idle";
}

export function createWorkspaceRuntimeContext(
  input: CreateWorkspaceRuntimeContextInput,
): WorkspaceRuntimeContext {
  const workspaceId = input.workspaceId.trim();
  const workspace = createFoundationWorkspaceRuntime(workspaceId);
  const quote = createFoundationQuoteRuntime(workspaceId);
  const project = createFoundationProjectRuntime(workspaceId);
  const report = createFoundationReportRuntime(workspaceId);
  const surfaces = [workspace, quote, project, report];

  return {
    workspaceId,
    version: RUNTIME_FOUNDATION_VERSION,
    tag: WORKSPACE_RUNTIME_P1_TAG,
    status: resolveAggregateRuntimeStatus(surfaces),
    capability: RUNTIME_FOUNDATION_CAPABILITY,
    workspace,
    quote,
    project,
    report,
  };
}

export function refreshWorkspaceRuntimeContext(context: WorkspaceRuntimeContext): WorkspaceRuntimeContext {
  return createWorkspaceRuntimeContext({ workspaceId: context.workspaceId });
}

export function assertWorkspaceRuntimeContextContract(context: WorkspaceRuntimeContext): boolean {
  return (
    context.workspaceId.trim().length > 0 &&
    context.tag === WORKSPACE_RUNTIME_P1_TAG &&
    context.capability === RUNTIME_FOUNDATION_CAPABILITY &&
    validateWorkspaceRuntime(context.workspace) &&
    validateQuoteRuntime(context.quote) &&
    validateProjectRuntime(context.project) &&
    validateReportRuntime(context.report) &&
    context.workspace.identity.workspaceId === context.workspaceId
  );
}

export function describeWorkspaceRuntimeContext(context: WorkspaceRuntimeContext): string {
  return [
    `workspaceId=${context.workspaceId}`,
    `status=${context.status}`,
    `capability=${context.capability}`,
    `version=${context.version}`,
  ].join(" ");
}

export type RuntimeContextRegistryHook = Pick<RuntimeContractRegistry, "workspace" | "quote" | "project" | "report">;
