import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { WorkspaceRuntimeCapabilityContext } from "./runtime-capability-types";

export type RuntimeVerificationStatus = "passed" | "warning" | "failed" | "skipped";

export const RUNTIME_VERIFICATION_STATUSES: RuntimeVerificationStatus[] = [
  "passed",
  "warning",
  "failed",
  "skipped",
];

export type RuntimeVerificationKey =
  | "type-integrity"
  | "registry-consistency"
  | "lifecycle-consistency"
  | "capability-consistency"
  | "context-composition";

export const RUNTIME_VERIFICATION_KEYS: RuntimeVerificationKey[] = [
  "type-integrity",
  "registry-consistency",
  "lifecycle-consistency",
  "capability-consistency",
  "context-composition",
];

export const RUNTIME_VERIFICATION_CONCERNS: Record<RuntimeVerificationKey, string> = {
  "type-integrity": "type-integrity",
  "registry-consistency": "registry-consistency",
  "lifecycle-consistency": "lifecycle-consistency",
  "capability-consistency": "capability-consistency",
  "context-composition": "context-composition",
};

export interface RuntimeVerification {
  key: RuntimeVerificationKey;
  concern: string;
  status: RuntimeVerificationStatus;
  eligible: boolean;
  version: string;
  layer: "runtime-foundation";
}

export interface RuntimeVerificationResult {
  key: RuntimeVerificationKey;
  status: RuntimeVerificationStatus;
  eligible: boolean;
  passed: boolean;
}

export interface RuntimeVerificationEntries {
  "type-integrity": RuntimeVerification;
  "registry-consistency": RuntimeVerification;
  "lifecycle-consistency": RuntimeVerification;
  "capability-consistency": RuntimeVerification;
  "context-composition": RuntimeVerification;
}

export interface RuntimeVerificationSnapshot {
  workspaceId: string;
  version: string;
  lifecycleStatus: RuntimeLifecycleStatus;
  eligible: boolean;
  aggregateStatus: RuntimeVerificationStatus;
  entries: RuntimeVerificationEntries;
}

export interface WorkspaceRuntimeVerificationContext {
  workspaceId: string;
  version: string;
  capabilityContext: WorkspaceRuntimeCapabilityContext;
  verification: RuntimeVerificationSnapshot;
}

export interface RuntimeP5Validation {
  valid: boolean;
  summary: string;
}

export function listRuntimeVerificationKeys(): RuntimeVerificationKey[] {
  return [...RUNTIME_VERIFICATION_KEYS];
}
