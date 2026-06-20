import type { WorkspaceRuntimeSurface } from "./shared/runtime-constants";
import type {
  ProjectRuntime,
  QuoteRuntime,
  ReportRuntime,
  WorkspaceRuntime,
  WorkspaceSurfaceRuntime,
} from "./runtime-types";

export type RuntimeRegistryKey = WorkspaceRuntimeSurface;

export const RUNTIME_REGISTRY_KEYS: RuntimeRegistryKey[] = ["workspace", "quote", "project", "report"];

export interface RuntimeRegistryEntry<T extends WorkspaceSurfaceRuntime = WorkspaceSurfaceRuntime> {
  key: RuntimeRegistryKey;
  surface: WorkspaceRuntimeSurface;
  runtime: T;
  layer: "runtime-foundation";
}

export interface RuntimeRegistrySnapshot {
  workspaceId: string;
  version: string;
  entries: Record<RuntimeRegistryKey, RuntimeRegistryEntry>;
}

export type RuntimeRegistryEntryMap = RuntimeRegistrySnapshot["entries"];

export interface WorkspaceRuntimeRegistryContext {
  workspaceId: string;
  version: string;
  contextVersion: string;
  registry: RuntimeRegistrySnapshot;
}

export interface RuntimeP2Validation {
  valid: boolean;
  summary: string;
}

export type WorkspaceRuntimeRegistryEntry = RuntimeRegistryEntry<WorkspaceRuntime>;
export type QuoteRuntimeRegistryEntry = RuntimeRegistryEntry<QuoteRuntime>;
export type ProjectRuntimeRegistryEntry = RuntimeRegistryEntry<ProjectRuntime>;
export type ReportRuntimeRegistryEntry = RuntimeRegistryEntry<ReportRuntime>;
