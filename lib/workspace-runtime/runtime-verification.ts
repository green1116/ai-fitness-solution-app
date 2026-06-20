import type { WorkspaceRuntimeCapabilityContext } from "./runtime-capability-types";
import {
  evaluateVerificationConcern,
  resolveAggregateVerificationStatus,
  resolveVerificationEligibility,
  resolveVerificationStatus,
  validateRuntimeVerification,
  validateRuntimeVerificationSnapshot,
} from "./runtime-verification-validation";
import type {
  RuntimeVerification,
  RuntimeVerificationEntries,
  RuntimeVerificationKey,
  RuntimeVerificationResult,
  RuntimeVerificationSnapshot,
  RuntimeVerificationStatus,
} from "./runtime-verification-types";
import {
  RUNTIME_VERIFICATION_CONCERNS,
  RUNTIME_VERIFICATION_KEYS,
} from "./runtime-verification-types";
import { RUNTIME_VERIFICATION_VERSION } from "./shared/runtime-constants";

function createVerificationEntry(
  key: RuntimeVerificationKey,
  capabilityContext: WorkspaceRuntimeCapabilityContext,
  lifecycleStatus: WorkspaceRuntimeCapabilityContext["lifecycleContext"]["lifecycle"]["status"],
): RuntimeVerification {
  const eligible = resolveVerificationEligibility(lifecycleStatus);
  const checkPassed = evaluateVerificationConcern(key, capabilityContext);
  const status = resolveVerificationStatus(eligible, checkPassed);

  return {
    key,
    concern: RUNTIME_VERIFICATION_CONCERNS[key],
    status,
    eligible,
    version: RUNTIME_VERIFICATION_VERSION,
    layer: "runtime-foundation",
  };
}

function buildVerificationEntries(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): RuntimeVerificationEntries {
  const lifecycleStatus = capabilityContext.lifecycleContext.lifecycle.status;

  return {
    "type-integrity": createVerificationEntry("type-integrity", capabilityContext, lifecycleStatus),
    "registry-consistency": createVerificationEntry(
      "registry-consistency",
      capabilityContext,
      lifecycleStatus,
    ),
    "lifecycle-consistency": createVerificationEntry(
      "lifecycle-consistency",
      capabilityContext,
      lifecycleStatus,
    ),
    "capability-consistency": createVerificationEntry(
      "capability-consistency",
      capabilityContext,
      lifecycleStatus,
    ),
    "context-composition": createVerificationEntry(
      "context-composition",
      capabilityContext,
      lifecycleStatus,
    ),
  };
}

export function createVerificationSnapshot(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): RuntimeVerificationSnapshot {
  const lifecycleStatus = capabilityContext.lifecycleContext.lifecycle.status;
  const eligible = resolveVerificationEligibility(lifecycleStatus);
  const entries = buildVerificationEntries(capabilityContext);

  return {
    workspaceId: capabilityContext.workspaceId,
    version: RUNTIME_VERIFICATION_VERSION,
    lifecycleStatus,
    eligible,
    aggregateStatus: resolveAggregateVerificationStatus(entries),
    entries,
  };
}

export function registerVerification(
  snapshot: RuntimeVerificationSnapshot,
  key: RuntimeVerificationKey,
  verification: RuntimeVerification,
): RuntimeVerificationSnapshot {
  if (verification.key !== key) {
    throw new Error(`Verification key mismatch for ${key}`);
  }
  if (!validateRuntimeVerification(verification)) {
    throw new Error(`Invalid verification entry for ${key}`);
  }

  const normalized = {
    ...verification,
    key,
    concern: RUNTIME_VERIFICATION_CONCERNS[key],
    version: RUNTIME_VERIFICATION_VERSION,
    layer: "runtime-foundation",
  } as RuntimeVerificationEntries[typeof key];

  const entries: RuntimeVerificationEntries = {
    ...snapshot.entries,
    [key]: normalized,
  };

  return {
    ...snapshot,
    entries,
    eligible: resolveVerificationEligibility(snapshot.lifecycleStatus),
    aggregateStatus: resolveAggregateVerificationStatus(entries),
  };
}

export function resolveVerification(
  snapshot: RuntimeVerificationSnapshot,
  key: RuntimeVerificationKey,
): RuntimeVerification | undefined {
  return snapshot.entries[key];
}

export function listVerifications(snapshot: RuntimeVerificationSnapshot): RuntimeVerification[] {
  return RUNTIME_VERIFICATION_KEYS.map((key) => snapshot.entries[key]);
}

export function hasVerification(snapshot: RuntimeVerificationSnapshot, key: RuntimeVerificationKey): boolean {
  const verification = snapshot.entries[key];
  return Boolean(verification && validateRuntimeVerification(verification));
}

export function validateVerification(snapshot: RuntimeVerificationSnapshot): boolean {
  if (!validateRuntimeVerificationSnapshot(snapshot)) {
    return false;
  }

  const expectedEligible = resolveVerificationEligibility(snapshot.lifecycleStatus);
  if (snapshot.eligible !== expectedEligible) {
    return false;
  }

  if (snapshot.aggregateStatus !== resolveAggregateVerificationStatus(snapshot.entries)) {
    return false;
  }

  return RUNTIME_VERIFICATION_KEYS.every((key) => {
    const entry = snapshot.entries[key];
    if (entry.key !== key || entry.concern !== RUNTIME_VERIFICATION_CONCERNS[key]) {
      return false;
    }
    if (entry.eligible !== expectedEligible) {
      return false;
    }
    if (!expectedEligible) {
      return entry.status === "skipped";
    }
    return entry.status === "passed" || entry.status === "warning" || entry.status === "failed";
  });
}

export function resolveVerificationResult(
  snapshot: RuntimeVerificationSnapshot,
  key: RuntimeVerificationKey,
): RuntimeVerificationResult {
  const verification = snapshot.entries[key];
  return {
    key,
    status: verification.status,
    eligible: verification.eligible,
    passed: verification.status === "passed",
  };
}

export function listVerificationResults(snapshot: RuntimeVerificationSnapshot): RuntimeVerificationResult[] {
  return RUNTIME_VERIFICATION_KEYS.map((key) => resolveVerificationResult(snapshot, key));
}

export function describeRuntimeVerification(snapshot: RuntimeVerificationSnapshot): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `lifecycleStatus=${snapshot.lifecycleStatus}`,
    `eligible=${snapshot.eligible}`,
    `aggregateStatus=${snapshot.aggregateStatus}`,
    `version=${snapshot.version}`,
  ].join(" ");
}

export function syncVerificationWithCapabilityContext(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
  _snapshot: RuntimeVerificationSnapshot,
): RuntimeVerificationSnapshot {
  return createVerificationSnapshot(capabilityContext);
}

export function assertRuntimeVerificationHasAllConcerns(snapshot: RuntimeVerificationSnapshot): boolean {
  return RUNTIME_VERIFICATION_KEYS.every((key) => hasVerification(snapshot, key));
}

export function createRegisteredVerificationStatus(
  status: RuntimeVerificationStatus,
  eligible: boolean,
): RuntimeVerificationStatus {
  if (!eligible) {
    return "skipped";
  }
  return status;
}
