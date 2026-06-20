import type { WorkspaceRuntimeSurface } from "./shared/runtime-constants";

export type RuntimeStatus = "idle" | "ready" | "mounted" | "unavailable";

export type RuntimeCapability = "foundation-only" | "entry-only" | "runtime-shell";

export interface RuntimeIdentity {
  runtimeId: string;
  workspaceId: string;
  surface: WorkspaceRuntimeSurface;
}

export interface RuntimeMetadataView {
  phase: string;
  layer: "runtime-foundation";
  note: string;
}

export interface WorkspaceRuntime {
  identity: RuntimeIdentity;
  status: RuntimeStatus;
  capability: RuntimeCapability;
  version: string;
  metadata: RuntimeMetadataView;
}

export interface QuoteRuntime {
  identity: RuntimeIdentity;
  status: RuntimeStatus;
  capability: RuntimeCapability;
  version: string;
  metadata: RuntimeMetadataView;
}

export interface ProjectRuntime {
  identity: RuntimeIdentity;
  status: RuntimeStatus;
  capability: RuntimeCapability;
  version: string;
  metadata: RuntimeMetadataView;
}

export interface ReportRuntime {
  identity: RuntimeIdentity;
  status: RuntimeStatus;
  capability: RuntimeCapability;
  version: string;
  metadata: RuntimeMetadataView;
}

export type WorkspaceSurfaceRuntime = WorkspaceRuntime | QuoteRuntime | ProjectRuntime | ReportRuntime;

export interface RuntimeP1Validation {
  valid: boolean;
  summary: string;
}
