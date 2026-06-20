import { validateCapability } from "./runtime-capability";
import type { WorkspaceRuntimeCapabilityContext } from "./runtime-capability-types";
import { validateRuntimeLifecycle } from "./runtime-lifecycle";
import { validateRuntimeRegistry } from "./runtime-registry";
import type {
  RuntimeVerification,
  RuntimeVerificationKey,
  RuntimeVerificationSnapshot,
  RuntimeVerificationStatus,
} from "./runtime-verification-types";
import { RUNTIME_VERIFICATION_KEYS } from "./runtime-verification-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";

export function isRuntimeVerificationStatus(value: unknown): value is RuntimeVerificationStatus {
  return (
    typeof value === "string" &&
    (value === "passed" || value === "warning" || value === "failed" || value === "skipped")
  );
}

export function resolveVerificationEligibility(lifecycleStatus: RuntimeLifecycleStatus): boolean {
  return lifecycleStatus === "mounted" || lifecycleStatus === "refreshing";
}

export function resolveVerificationStatus(
  eligible: boolean,
  checkPassed: boolean,
  hasWarning = false,
): RuntimeVerificationStatus {
  if (!eligible) {
    return "skipped";
  }
  if (!checkPassed) {
    return "failed";
  }
  if (hasWarning) {
    return "warning";
  }
  return "passed";
}

export function evaluateTypeIntegrity(capabilityContext: WorkspaceRuntimeCapabilityContext): boolean {
  const { lifecycleContext, capability } = capabilityContext;
  const registry = lifecycleContext.registryContext.registry;
  return (
    capabilityContext.workspaceId.trim().length > 0 &&
    validateRuntimeRegistry(registry) &&
    validateRuntimeLifecycle(lifecycleContext.lifecycle) &&
    validateCapability(capability)
  );
}

export function evaluateRegistryConsistency(capabilityContext: WorkspaceRuntimeCapabilityContext): boolean {
  const registryContext = capabilityContext.lifecycleContext.registryContext;
  return (
    registryContext.workspaceId === capabilityContext.workspaceId &&
    validateRuntimeRegistry(registryContext.registry) &&
    registryContext.registry.workspaceId === capabilityContext.workspaceId
  );
}

export function evaluateLifecycleConsistency(capabilityContext: WorkspaceRuntimeCapabilityContext): boolean {
  const { lifecycleContext, capability } = capabilityContext;
  return (
    capability.lifecycleStatus === lifecycleContext.lifecycle.status &&
    validateRuntimeLifecycle(lifecycleContext.lifecycle)
  );
}

export function evaluateCapabilityConsistency(capabilityContext: WorkspaceRuntimeCapabilityContext): boolean {
  return validateCapability(capabilityContext.capability);
}

export function evaluateContextComposition(capabilityContext: WorkspaceRuntimeCapabilityContext): boolean {
  const { lifecycleContext } = capabilityContext;
  const registryContext = lifecycleContext.registryContext;
  const workspaceId = capabilityContext.workspaceId;

  return (
    workspaceId === lifecycleContext.workspaceId &&
    workspaceId === registryContext.workspaceId &&
    workspaceId === capabilityContext.capability.workspaceId &&
    workspaceId === lifecycleContext.lifecycle.workspaceId &&
    workspaceId === registryContext.registry.workspaceId
  );
}

const VERIFICATION_EVALUATORS: Record<
  RuntimeVerificationKey,
  (capabilityContext: WorkspaceRuntimeCapabilityContext) => boolean
> = {
  "type-integrity": evaluateTypeIntegrity,
  "registry-consistency": evaluateRegistryConsistency,
  "lifecycle-consistency": evaluateLifecycleConsistency,
  "capability-consistency": evaluateCapabilityConsistency,
  "context-composition": evaluateContextComposition,
};

export function evaluateVerificationConcern(
  key: RuntimeVerificationKey,
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): boolean {
  return VERIFICATION_EVALUATORS[key](capabilityContext);
}

export function validateRuntimeVerification(value: unknown): value is RuntimeVerification {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeVerification>;
  if (!isRuntimeVerificationStatus(candidate.status)) {
    return false;
  }
  if (typeof candidate.eligible !== "boolean") {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (candidate.layer !== "runtime-foundation") {
    return false;
  }
  if (typeof candidate.concern !== "string" || candidate.concern.trim().length === 0) {
    return false;
  }
  return RUNTIME_VERIFICATION_KEYS.includes(candidate.key as RuntimeVerificationKey);
}

export function validateRuntimeVerificationSnapshot(value: unknown): value is RuntimeVerificationSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeVerificationSnapshot>;
  if (typeof candidate.workspaceId !== "string" || candidate.workspaceId.trim().length === 0) {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (typeof candidate.eligible !== "boolean") {
    return false;
  }
  if (!isRuntimeVerificationStatus(candidate.aggregateStatus)) {
    return false;
  }
  if (typeof candidate.lifecycleStatus !== "string") {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== "object") {
    return false;
  }
  return RUNTIME_VERIFICATION_KEYS.every((key) => validateRuntimeVerification(candidate.entries?.[key]));
}

export function resolveAggregateVerificationStatus(
  entries: RuntimeVerificationSnapshot["entries"],
): RuntimeVerificationStatus {
  const statuses = RUNTIME_VERIFICATION_KEYS.map((key) => entries[key].status);
  if (statuses.every((status) => status === "skipped")) {
    return "skipped";
  }
  if (statuses.some((status) => status === "failed")) {
    return "failed";
  }
  if (statuses.some((status) => status === "warning")) {
    return "warning";
  }
  if (statuses.every((status) => status === "passed" || status === "skipped")) {
    return "passed";
  }
  return "failed";
}

export function assertRuntimeVerificationHasAllStatuses(): boolean {
  return (
    isRuntimeVerificationStatus("passed") &&
    isRuntimeVerificationStatus("warning") &&
    isRuntimeVerificationStatus("failed") &&
    isRuntimeVerificationStatus("skipped")
  );
}

export function assertRuntimeVerificationLifecycleRules(): boolean {
  return (
    resolveVerificationEligibility("mounted") === true &&
    resolveVerificationEligibility("refreshing") === true &&
    resolveVerificationEligibility("unmounted") === false &&
    resolveVerificationEligibility("idle") === false &&
    resolveVerificationStatus(false, true) === "skipped" &&
    resolveVerificationStatus(true, true) === "passed" &&
    resolveVerificationStatus(true, false) === "failed" &&
    resolveVerificationStatus(true, true, true) === "warning"
  );
}

export function assertRuntimeVerificationFoundationOnly(): boolean {
  return assertRuntimeVerificationHasAllStatuses() && assertRuntimeVerificationLifecycleRules();
}
