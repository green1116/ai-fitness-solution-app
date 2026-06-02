/**
 * V3.7 workspace registry compat entry.
 * Minimal pass-through for product-surface-summary.ts module resolution.
 */

export const WORKSPACE_REGISTRY_VERSION = "3.7-workspace-1" as const;

export type WorkspaceRegistrySummary = {
  version: typeof WORKSPACE_REGISTRY_VERSION;
  workspaces: Array<{ id: string; deploymentId: string }>;
  summary: string;
};

export function buildSampleWorkspaceRegistry(
  deploymentId: string,
): WorkspaceRegistrySummary {
  return {
    version: WORKSPACE_REGISTRY_VERSION,
    workspaces: [{ id: `ws-${deploymentId}`, deploymentId }],
    summary: `workspace=${WORKSPACE_REGISTRY_VERSION} deploymentId=${deploymentId} count=1`,
  };
}
