import {
  attachRuntimeVerificationToCapabilityContext,
  assertMountedRuntimeVerificationEligibility,
  assertWorkspaceRuntimeVerificationContextContract,
  createWorkspaceRuntimeVerificationContext,
} from "./runtime-verification-context";
import type { WorkspaceRuntimeVerificationContext } from "./runtime-verification-types";
import {
  attachRuntimeCapabilityToLifecycleContext,
} from "./runtime-capability-context";
import {
  mountRuntimeLifecycleContext,
  unmountRuntimeLifecycleContext,
} from "./runtime-lifecycle-context";
import {
  createEntrySnapshot,
  describeRuntimeEntry,
  syncEntryWithVerificationContext,
  validateEntry,
} from "./runtime-entry";
import type { WorkspaceRuntimeEntryContext } from "./runtime-entry-types";
import { assertRuntimeEntryFoundationOnly } from "./runtime-entry-validation";
import {
  RUNTIME_ENTRY_VERSION,
  WORKSPACE_RUNTIME_P6_TAG,
} from "./shared/runtime-constants";

export interface CreateWorkspaceRuntimeEntryContextInput {
  workspaceId: string;
}

export function attachRuntimeEntryToVerificationContext(
  verificationContext: WorkspaceRuntimeVerificationContext,
): WorkspaceRuntimeEntryContext {
  const entry = createEntrySnapshot(verificationContext);
  return {
    workspaceId: verificationContext.workspaceId,
    version: RUNTIME_ENTRY_VERSION,
    verificationContext,
    entry,
  };
}

export function createWorkspaceRuntimeEntryContext(
  input: CreateWorkspaceRuntimeEntryContextInput,
): WorkspaceRuntimeEntryContext {
  const verificationContext = createWorkspaceRuntimeVerificationContext({ workspaceId: input.workspaceId });
  return attachRuntimeEntryToVerificationContext(verificationContext);
}

export function refreshRuntimeEntryFromVerification(
  entryContext: WorkspaceRuntimeEntryContext,
): WorkspaceRuntimeEntryContext {
  return {
    ...entryContext,
    entry: syncEntryWithVerificationContext(entryContext.verificationContext, entryContext.entry),
  };
}

export function resolveVerificationContextFromEntryContext(
  entryContext: WorkspaceRuntimeEntryContext,
): WorkspaceRuntimeVerificationContext {
  return entryContext.verificationContext;
}

export function assertWorkspaceRuntimeEntryContextContract(
  entryContext: WorkspaceRuntimeEntryContext,
): boolean {
  const { verificationContext, entry } = entryContext;

  return (
    entryContext.version === RUNTIME_ENTRY_VERSION &&
    entryContext.workspaceId.trim().length > 0 &&
    validateEntry(entry) &&
    assertRuntimeEntryFoundationOnly() &&
    assertWorkspaceRuntimeVerificationContextContract(verificationContext) &&
    entry.lifecycleStatus === verificationContext.verification.lifecycleStatus &&
    entry.verificationStatus === verificationContext.verification.aggregateStatus &&
    entry.eligible === false &&
    entry.active === false &&
    entry.aggregateStatus === "inactive" &&
    entry.entries.workspace.status === "inactive"
  );
}

export function assertMountedRuntimeEntryEligibility(
  entryContext: WorkspaceRuntimeEntryContext,
): boolean {
  const mountedLifecycle = mountRuntimeLifecycleContext(
    entryContext.verificationContext.capabilityContext.lifecycleContext,
  );
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  const mountedVerification = attachRuntimeVerificationToCapabilityContext(mountedCapability);
  const mountedEntry = attachRuntimeEntryToVerificationContext(mountedVerification);

  return (
    mountedEntry.entry.lifecycleStatus === "mounted" &&
    mountedEntry.entry.eligible === true &&
    mountedEntry.entry.active === true &&
    mountedEntry.entry.aggregateStatus === "active" &&
    mountedEntry.entry.entries.workspace.status === "active" &&
    assertMountedRuntimeVerificationEligibility(entryContext.verificationContext)
  );
}

export function assertUnmountedRuntimeEntryIneligibility(
  entryContext: WorkspaceRuntimeEntryContext,
): boolean {
  const unmountedLifecycle = unmountRuntimeLifecycleContext(
    mountRuntimeLifecycleContext(entryContext.verificationContext.capabilityContext.lifecycleContext),
  );
  const unmountedCapability = attachRuntimeCapabilityToLifecycleContext(unmountedLifecycle);
  const unmountedVerification = attachRuntimeVerificationToCapabilityContext(unmountedCapability);
  const unmountedEntry = attachRuntimeEntryToVerificationContext(unmountedVerification);

  return (
    unmountedEntry.entry.lifecycleStatus === "unmounted" &&
    unmountedEntry.entry.eligible === false &&
    unmountedEntry.entry.active === false &&
    unmountedEntry.entry.aggregateStatus === "inactive" &&
    unmountedEntry.entry.entries.workspace.status === "inactive"
  );
}

export function describeWorkspaceRuntimeEntryContext(entryContext: WorkspaceRuntimeEntryContext): string {
  return [
    `tag=${WORKSPACE_RUNTIME_P6_TAG}`,
    describeRuntimeEntry(entryContext.entry),
    `verificationVersion=${entryContext.verificationContext.version}`,
  ].join(" ");
}
