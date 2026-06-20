import type { EntryStatus } from "./runtime-entry-types";
import type { RuntimeCapabilityStatus } from "./runtime-capability-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type { SurfaceStatus } from "./runtime-surface-types";
import type { RuntimeVerificationStatus } from "./runtime-verification-types";
import type { WorkspaceRuntimeSurfaceContext } from "./runtime-surface-types";

export type AssemblyKey = RuntimeRegistryKey;

export type AssemblyType = RuntimeRegistryKey;

export type AssemblyStatus = "assembled" | "partial" | "degraded" | "inactive" | "reserved";

export type WorkspaceRuntimeAssemblyStatus = AssemblyStatus;

export const ASSEMBLY_STATUSES: AssemblyStatus[] = [
  "assembled",
  "partial",
  "degraded",
  "inactive",
  "reserved",
];

export interface WorkspaceRuntimeAssembly {
  key: "workspace";
  type: "workspace";
  surface: "workspace";
  status: AssemblyStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface QuoteRuntimeAssembly {
  key: "quote";
  type: "quote";
  surface: "quote";
  status: AssemblyStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ProjectRuntimeAssembly {
  key: "project";
  type: "project";
  surface: "project";
  status: AssemblyStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ReportRuntimeAssembly {
  key: "report";
  type: "report";
  surface: "report";
  status: AssemblyStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export type RuntimeMappedAssembly =
  | WorkspaceRuntimeAssembly
  | QuoteRuntimeAssembly
  | ProjectRuntimeAssembly
  | ReportRuntimeAssembly;

export interface RuntimeAssemblyEntries {
  workspace: WorkspaceRuntimeAssembly;
  quote: QuoteRuntimeAssembly;
  project: ProjectRuntimeAssembly;
  report: ReportRuntimeAssembly;
}

export interface AssemblySnapshot {
  workspaceId: string;
  version: string;
  lifecycleStatus: RuntimeLifecycleStatus;
  verificationStatus: RuntimeVerificationStatus;
  entryStatus: EntryStatus;
  surfaceStatus: SurfaceStatus;
  eligible: boolean;
  assembled: boolean;
  aggregateStatus: AssemblyStatus;
  entries: RuntimeAssemblyEntries;
}

export type WorkspaceRuntimeAssemblySnapshot = AssemblySnapshot;

export interface AssemblyResult {
  key: AssemblyKey;
  type: AssemblyType;
  status: AssemblyStatus;
  eligible: boolean;
  assembled: boolean;
}

export type WorkspaceRuntimeAssemblyResult = AssemblyResult;

export interface WorkspaceRuntimeAssemblyContext {
  workspaceId: string;
  version: string;
  surfaceContext: WorkspaceRuntimeSurfaceContext;
  assembly: AssemblySnapshot;
}

export interface RuntimeP8Validation {
  valid: boolean;
  summary: string;
}

export const RUNTIME_ASSEMBLY_MAP: Record<AssemblyKey, AssemblyType> = {
  workspace: "workspace",
  quote: "quote",
  project: "project",
  report: "report",
};

export function listRuntimeAssemblyKeys(): AssemblyKey[] {
  return [...RUNTIME_REGISTRY_KEYS];
}
