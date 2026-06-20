import {
  assertMountedRuntimeEntryEligibility,
  assertWorkspaceRuntimeEntryContextContract,
  attachRuntimeEntryToVerificationContext,
  createWorkspaceRuntimeEntryContext,
} from "./runtime-entry-context";
import type { WorkspaceRuntimeEntryContext } from "./runtime-entry-types";
import {
  attachRuntimeCapabilityToLifecycleContext,
} from "./runtime-capability-context";
import {
  mountRuntimeLifecycleContext,
  unmountRuntimeLifecycleContext,
} from "./runtime-lifecycle-context";
import {
  attachRuntimeVerificationToCapabilityContext,
} from "./runtime-verification-context";
import {
  createSurfaceSnapshot,
  describeRuntimeSurface,
  syncSurfaceWithEntryContext,
  validateSurface,
} from "./runtime-surface";
import type { WorkspaceRuntimeSurfaceContext } from "./runtime-surface-types";
import { assertRuntimeSurfaceFoundationOnly } from "./runtime-surface-validation";
import {
  RUNTIME_SURFACE_VERSION,
  WORKSPACE_RUNTIME_P7_TAG,
} from "./shared/runtime-constants";

export interface CreateWorkspaceRuntimeSurfaceContextInput {
  workspaceId: string;
}

export function attachRuntimeSurfaceToEntryContext(
  entryContext: WorkspaceRuntimeEntryContext,
): WorkspaceRuntimeSurfaceContext {
  const surface = createSurfaceSnapshot(entryContext);
  return {
    workspaceId: entryContext.workspaceId,
    version: RUNTIME_SURFACE_VERSION,
    entryContext,
    surface,
  };
}

export function createWorkspaceRuntimeSurfaceContext(
  input: CreateWorkspaceRuntimeSurfaceContextInput,
): WorkspaceRuntimeSurfaceContext {
  const entryContext = createWorkspaceRuntimeEntryContext({ workspaceId: input.workspaceId });
  return attachRuntimeSurfaceToEntryContext(entryContext);
}

export function refreshRuntimeSurfaceFromEntry(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): WorkspaceRuntimeSurfaceContext {
  return {
    ...surfaceContext,
    surface: syncSurfaceWithEntryContext(surfaceContext.entryContext, surfaceContext.surface),
  };
}

export function resolveEntryContextFromSurfaceContext(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): WorkspaceRuntimeEntryContext {
  return surfaceContext.entryContext;
}

export function assertWorkspaceRuntimeSurfaceContextContract(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): boolean {
  const { entryContext, surface } = surfaceContext;

  return (
    surfaceContext.version === RUNTIME_SURFACE_VERSION &&
    surfaceContext.workspaceId.trim().length > 0 &&
    validateSurface(surface) &&
    assertRuntimeSurfaceFoundationOnly() &&
    assertWorkspaceRuntimeEntryContextContract(entryContext) &&
    surface.lifecycleStatus === entryContext.entry.lifecycleStatus &&
    surface.verificationStatus === entryContext.entry.verificationStatus &&
    surface.entryStatus === entryContext.entry.aggregateStatus &&
    surface.eligible === false &&
    surface.visible === false &&
    surface.active === false &&
    surface.aggregateStatus === "inactive" &&
    surface.entries.workspace.status === "inactive"
  );
}

export function assertMountedRuntimeSurfaceEligibility(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): boolean {
  const mountedLifecycle = mountRuntimeLifecycleContext(
    surfaceContext.entryContext.verificationContext.capabilityContext.lifecycleContext,
  );
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  const mountedVerification = attachRuntimeVerificationToCapabilityContext(mountedCapability);
  const mountedEntry = attachRuntimeEntryToVerificationContext(mountedVerification);
  const mountedSurface = attachRuntimeSurfaceToEntryContext(mountedEntry);

  return (
    mountedSurface.surface.lifecycleStatus === "mounted" &&
    mountedSurface.surface.eligible === true &&
    mountedSurface.surface.visible === true &&
    mountedSurface.surface.active === true &&
    mountedSurface.surface.aggregateStatus === "active" &&
    mountedSurface.surface.entries.workspace.status === "active" &&
    assertMountedRuntimeEntryEligibility(surfaceContext.entryContext)
  );
}

export function assertUnmountedRuntimeSurfaceIneligibility(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): boolean {
  const unmountedLifecycle = unmountRuntimeLifecycleContext(
    mountRuntimeLifecycleContext(
      surfaceContext.entryContext.verificationContext.capabilityContext.lifecycleContext,
    ),
  );
  const unmountedCapability = attachRuntimeCapabilityToLifecycleContext(unmountedLifecycle);
  const unmountedVerification = attachRuntimeVerificationToCapabilityContext(unmountedCapability);
  const unmountedEntry = attachRuntimeEntryToVerificationContext(unmountedVerification);
  const unmountedSurface = attachRuntimeSurfaceToEntryContext(unmountedEntry);

  return (
    unmountedSurface.surface.lifecycleStatus === "unmounted" &&
    unmountedSurface.surface.eligible === false &&
    unmountedSurface.surface.visible === false &&
    unmountedSurface.surface.active === false &&
    unmountedSurface.surface.aggregateStatus === "inactive" &&
    unmountedSurface.surface.entries.workspace.status === "inactive"
  );
}

export function describeWorkspaceRuntimeSurfaceContext(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): string {
  return [
    `tag=${WORKSPACE_RUNTIME_P7_TAG}`,
    describeRuntimeSurface(surfaceContext.surface),
    `entryVersion=${surfaceContext.entryContext.version}`,
  ].join(" ");
}
