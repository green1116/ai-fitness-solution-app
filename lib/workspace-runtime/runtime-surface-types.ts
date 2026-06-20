import type { EntryStatus } from "./runtime-entry-types";
import type { RuntimeCapabilityStatus } from "./runtime-capability-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type { RuntimeVerificationStatus } from "./runtime-verification-types";
import type { WorkspaceRuntimeEntryContext } from "./runtime-entry-types";

export type SurfaceKey = RuntimeRegistryKey;

export type SurfaceType = RuntimeRegistryKey;

export type SurfaceStatus = "visible" | "hidden" | "active" | "inactive" | "reserved";

export const SURFACE_STATUSES: SurfaceStatus[] = [
  "visible",
  "hidden",
  "active",
  "inactive",
  "reserved",
];

export interface WorkspaceSurface {
  key: "workspace";
  type: "workspace";
  surface: "workspace";
  status: SurfaceStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface QuoteSurface {
  key: "quote";
  type: "quote";
  surface: "quote";
  status: SurfaceStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ProjectSurface {
  key: "project";
  type: "project";
  surface: "project";
  status: SurfaceStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ReportSurface {
  key: "report";
  type: "report";
  surface: "report";
  status: SurfaceStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export type RuntimeMappedSurface = WorkspaceSurface | QuoteSurface | ProjectSurface | ReportSurface;

export interface RuntimeSurfaceEntries {
  workspace: WorkspaceSurface;
  quote: QuoteSurface;
  project: ProjectSurface;
  report: ReportSurface;
}

export interface SurfaceSnapshot {
  workspaceId: string;
  version: string;
  lifecycleStatus: RuntimeLifecycleStatus;
  verificationStatus: RuntimeVerificationStatus;
  entryStatus: EntryStatus;
  eligible: boolean;
  visible: boolean;
  active: boolean;
  aggregateStatus: SurfaceStatus;
  entries: RuntimeSurfaceEntries;
}

export interface SurfaceResult {
  key: SurfaceKey;
  type: SurfaceType;
  status: SurfaceStatus;
  eligible: boolean;
  visible: boolean;
  active: boolean;
}

export interface WorkspaceRuntimeSurfaceContext {
  workspaceId: string;
  version: string;
  entryContext: WorkspaceRuntimeEntryContext;
  surface: SurfaceSnapshot;
}

export interface RuntimeP7Validation {
  valid: boolean;
  summary: string;
}

export const RUNTIME_SURFACE_MAP: Record<SurfaceKey, SurfaceType> = {
  workspace: "workspace",
  quote: "quote",
  project: "project",
  report: "report",
};

export function listRuntimeSurfaceKeys(): SurfaceKey[] {
  return [...RUNTIME_REGISTRY_KEYS];
}
