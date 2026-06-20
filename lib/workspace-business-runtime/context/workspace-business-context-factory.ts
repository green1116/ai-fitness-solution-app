import type { WorkspaceBusinessBridgeView } from "../bridge/workspace-runtime-bridge-types";
import type { WorkspaceBusinessContext } from "./workspace-business-context-types";

export function createWorkspaceBusinessContext(
  bridgeView: WorkspaceBusinessBridgeView,
): WorkspaceBusinessContext {
  return {
    scope: {
      workspaceId: bridgeView.workspaceId,
      version: bridgeView.version,
    },
    readiness: { ...bridgeView.readiness },
    surfaces: bridgeView.surfaces.map((surface) => ({ ...surface })),
    entries: bridgeView.entries.map((entry) => ({ ...entry })),
  };
}
