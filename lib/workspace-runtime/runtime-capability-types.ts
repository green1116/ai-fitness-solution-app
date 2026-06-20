import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { WorkspaceRuntimeLifecycleContext } from "./runtime-lifecycle-types";

export type RuntimeCapabilityStatus = "enabled" | "disabled" | "experimental" | "deprecated";

export const RUNTIME_CAPABILITY_STATUSES: RuntimeCapabilityStatus[] = [
  "enabled",
  "disabled",
  "experimental",
  "deprecated",
];

export interface WorkspaceCapability {
  key: "workspace";
  surface: "workspace";
  status: RuntimeCapabilityStatus;
  available: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface QuoteCapability {
  key: "quote";
  surface: "quote";
  status: RuntimeCapabilityStatus;
  available: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ProjectCapability {
  key: "project";
  surface: "project";
  status: RuntimeCapabilityStatus;
  available: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ReportCapability {
  key: "report";
  surface: "report";
  status: RuntimeCapabilityStatus;
  available: boolean;
  version: string;
  layer: "runtime-foundation";
}

export type RuntimeSurfaceCapability =
  | WorkspaceCapability
  | QuoteCapability
  | ProjectCapability
  | ReportCapability;

export interface RuntimeCapabilityEntries {
  workspace: WorkspaceCapability;
  quote: QuoteCapability;
  project: ProjectCapability;
  report: ReportCapability;
}

export interface RuntimeCapabilitySnapshot {
  workspaceId: string;
  version: string;
  lifecycleStatus: RuntimeLifecycleStatus;
  available: boolean;
  entries: RuntimeCapabilityEntries;
}

export interface WorkspaceRuntimeCapabilityContext {
  workspaceId: string;
  version: string;
  lifecycleContext: WorkspaceRuntimeLifecycleContext;
  capability: RuntimeCapabilitySnapshot;
}

export interface RuntimeP4Validation {
  valid: boolean;
  summary: string;
}

export const RUNTIME_CAPABILITY_SURFACE_MAP: Record<RuntimeRegistryKey, RuntimeRegistryKey> = {
  workspace: "workspace",
  quote: "quote",
  project: "project",
  report: "report",
};

export function listRuntimeCapabilityKeys(): RuntimeRegistryKey[] {
  return [...RUNTIME_REGISTRY_KEYS];
}
