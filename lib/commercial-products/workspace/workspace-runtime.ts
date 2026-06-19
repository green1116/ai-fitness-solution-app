import type { WorkspaceRuntimeRequest, WorkspaceRuntimeResult } from "./workspace-types";
import { buildCustomerWorkspace, getWorkspaceRuntimeMeta } from "./workspace-service";

export function runWorkspaceRuntime(request: WorkspaceRuntimeRequest = {}): WorkspaceRuntimeResult {
  const workspace = buildCustomerWorkspace(request);
  return {
    ok: true,
    workspace,
  };
}

export { getWorkspaceRuntimeMeta };
