import type { WorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-assembly-types";

export interface WorkspaceQuoteSurface {
  workspaceId: string;
  runtimeState: string;
  quoteReadiness: string;
  lifecycleStatus: string;
}

export interface WorkspaceQuoteRegistryEntry {
  workspaceId: string;
  surface: WorkspaceQuoteSurface;
}

export interface WorkspaceQuoteRegistry {
  register(surface: WorkspaceQuoteSurface): WorkspaceQuoteRegistryEntry;
  resolve(workspaceId: string): WorkspaceQuoteSurface | undefined;
  has(workspaceId: string): boolean;
  clear(): void;
}

export interface WorkspaceQuoteAlignmentValidation {
  valid: boolean;
  summary: string;
}

export function createWorkspaceQuoteSurface(
  snapshot: WorkspaceQuoteRuntimeSnapshot,
): WorkspaceQuoteSurface {
  return {
    workspaceId: snapshot.workspaceId,
    runtimeState: snapshot.runtimeState,
    quoteReadiness: snapshot.quoteReadiness,
    lifecycleStatus: snapshot.lifecycleStatus,
  };
}

export function describeWorkspaceQuoteSurface(surface: WorkspaceQuoteSurface): string {
  return [
    `workspaceId=${surface.workspaceId}`,
    `runtimeState=${surface.runtimeState}`,
    `quoteReadiness=${surface.quoteReadiness}`,
    `lifecycleStatus=${surface.lifecycleStatus}`,
  ].join(" ");
}

export function assertWorkspaceQuoteSurfaceShape(surface: WorkspaceQuoteSurface): boolean {
  return (
    surface.workspaceId.trim().length > 0 &&
    surface.runtimeState.trim().length > 0 &&
    surface.quoteReadiness.trim().length > 0 &&
    surface.lifecycleStatus.trim().length > 0
  );
}
