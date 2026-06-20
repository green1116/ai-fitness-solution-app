import type { RuntimeRegistryKey, WorkspaceRuntimeRegistryContext } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";

export type RuntimeLifecycleStatus = "idle" | "ready" | "mounted" | "refreshing" | "unmounted";

export const RUNTIME_LIFECYCLE_STATUSES: RuntimeLifecycleStatus[] = [
  "idle",
  "ready",
  "mounted",
  "refreshing",
  "unmounted",
];

export interface RuntimeLifecycleEntry {
  key: RuntimeRegistryKey;
  status: RuntimeLifecycleStatus;
  version: string;
}

export interface RuntimeLifecycleSnapshot {
  workspaceId: string;
  version: string;
  status: RuntimeLifecycleStatus;
  entries: Record<RuntimeRegistryKey, RuntimeLifecycleEntry>;
}

export interface WorkspaceRuntimeLifecycleContext {
  workspaceId: string;
  version: string;
  registryContext: WorkspaceRuntimeRegistryContext;
  lifecycle: RuntimeLifecycleSnapshot;
}

export interface RuntimeP3Validation {
  valid: boolean;
  summary: string;
}

export type RuntimeLifecycleTransitionMap = Record<RuntimeLifecycleStatus, RuntimeLifecycleStatus[]>;

export const RUNTIME_LIFECYCLE_TRANSITIONS: RuntimeLifecycleTransitionMap = {
  idle: ["ready"],
  ready: ["mounted"],
  mounted: ["refreshing", "unmounted"],
  refreshing: ["mounted"],
  unmounted: [],
};

export function listRuntimeLifecycleKeys(): RuntimeRegistryKey[] {
  return [...RUNTIME_REGISTRY_KEYS];
}
