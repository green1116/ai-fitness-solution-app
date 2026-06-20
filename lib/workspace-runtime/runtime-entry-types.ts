import type { RuntimeCapabilityStatus } from "./runtime-capability-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type { RuntimeVerificationStatus } from "./runtime-verification-types";
import type { WorkspaceRuntimeVerificationContext } from "./runtime-verification-types";

export type EntryKey = RuntimeRegistryKey;

export type EntryType = RuntimeRegistryKey;

export type EntryStatus = "active" | "inactive" | "hidden" | "reserved";

export const ENTRY_STATUSES: EntryStatus[] = ["active", "inactive", "hidden", "reserved"];

export interface WorkspaceEntry {
  key: "workspace";
  type: "workspace";
  surface: "workspace";
  status: EntryStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface QuoteEntry {
  key: "quote";
  type: "quote";
  surface: "quote";
  status: EntryStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ProjectEntry {
  key: "project";
  type: "project";
  surface: "project";
  status: EntryStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface ReportEntry {
  key: "report";
  type: "report";
  surface: "report";
  status: EntryStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export type RuntimeSurfaceEntry = WorkspaceEntry | QuoteEntry | ProjectEntry | ReportEntry;

export interface RuntimeEntryEntries {
  workspace: WorkspaceEntry;
  quote: QuoteEntry;
  project: ProjectEntry;
  report: ReportEntry;
}

export interface EntrySnapshot {
  workspaceId: string;
  version: string;
  lifecycleStatus: RuntimeLifecycleStatus;
  verificationStatus: RuntimeVerificationStatus;
  eligible: boolean;
  active: boolean;
  aggregateStatus: EntryStatus;
  entries: RuntimeEntryEntries;
}

export interface EntryResult {
  key: EntryKey;
  type: EntryType;
  status: EntryStatus;
  eligible: boolean;
  active: boolean;
}

export interface WorkspaceRuntimeEntryContext {
  workspaceId: string;
  version: string;
  verificationContext: WorkspaceRuntimeVerificationContext;
  entry: EntrySnapshot;
}

export interface RuntimeP6Validation {
  valid: boolean;
  summary: string;
}

export const RUNTIME_ENTRY_SURFACE_MAP: Record<EntryKey, EntryType> = {
  workspace: "workspace",
  quote: "quote",
  project: "project",
  report: "report",
};

export function listRuntimeEntryKeys(): EntryKey[] {
  return [...RUNTIME_REGISTRY_KEYS];
}
