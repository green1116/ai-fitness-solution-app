import type {
  WorkspaceRegisterProjectInput,
  WorkspaceRuntimeRequest,
  WorkspaceRuntimeResult,
} from "./workspace-types";

export async function runWorkspaceRuntimeHeavy(
  request: WorkspaceRuntimeRequest = {},
): Promise<WorkspaceRuntimeResult> {
  const { runWorkspaceRuntime } = await import("./workspace-runtime");
  return runWorkspaceRuntime(request);
}

export async function syncWorkspaceFromQuoteHeavy(
  input: WorkspaceRegisterProjectInput,
) {
  const { syncWorkspaceFromQuote } = await import("./workspace-service");
  return syncWorkspaceFromQuote(input);
}
