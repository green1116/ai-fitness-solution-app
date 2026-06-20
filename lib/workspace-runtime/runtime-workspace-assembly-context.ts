import {
  assertMountedRuntimeSurfaceEligibility,
  assertWorkspaceRuntimeSurfaceContextContract,
  attachRuntimeSurfaceToEntryContext,
  createWorkspaceRuntimeSurfaceContext,
} from "./runtime-surface-context";
import type { WorkspaceRuntimeSurfaceContext } from "./runtime-surface-types";
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
import { attachRuntimeEntryToVerificationContext } from "./runtime-entry-context";
import {
  createAssemblySnapshot,
  describeRuntimeAssembly,
  syncAssemblyWithSurfaceContext,
  validateAssembly,
} from "./runtime-workspace-assembly";
import type { WorkspaceRuntimeAssemblyContext } from "./runtime-workspace-assembly-types";
import { assertRuntimeAssemblyFoundationOnly } from "./runtime-workspace-assembly-validation";
import {
  RUNTIME_ASSEMBLY_VERSION,
  WORKSPACE_RUNTIME_P8_TAG,
} from "./shared/runtime-constants";

export interface CreateWorkspaceRuntimeAssemblyContextInput {
  workspaceId: string;
}

export function attachRuntimeAssemblyToSurfaceContext(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): WorkspaceRuntimeAssemblyContext {
  const assembly = createAssemblySnapshot(surfaceContext);
  return {
    workspaceId: surfaceContext.workspaceId,
    version: RUNTIME_ASSEMBLY_VERSION,
    surfaceContext,
    assembly,
  };
}

export function createWorkspaceRuntimeAssemblyContext(
  input: CreateWorkspaceRuntimeAssemblyContextInput,
): WorkspaceRuntimeAssemblyContext {
  const surfaceContext = createWorkspaceRuntimeSurfaceContext({ workspaceId: input.workspaceId });
  return attachRuntimeAssemblyToSurfaceContext(surfaceContext);
}

export function refreshRuntimeAssemblyFromSurface(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): WorkspaceRuntimeAssemblyContext {
  return {
    ...assemblyContext,
    assembly: syncAssemblyWithSurfaceContext(assemblyContext.surfaceContext, assemblyContext.assembly),
  };
}

export function resolveSurfaceContextFromAssemblyContext(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): WorkspaceRuntimeSurfaceContext {
  return assemblyContext.surfaceContext;
}

export function assertWorkspaceRuntimeAssemblyContextContract(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): boolean {
  const { surfaceContext, assembly } = assemblyContext;

  return (
    assemblyContext.version === RUNTIME_ASSEMBLY_VERSION &&
    assemblyContext.workspaceId.trim().length > 0 &&
    validateAssembly(assembly) &&
    assertRuntimeAssemblyFoundationOnly() &&
    assertWorkspaceRuntimeSurfaceContextContract(surfaceContext) &&
    assembly.lifecycleStatus === surfaceContext.surface.lifecycleStatus &&
    assembly.verificationStatus === surfaceContext.surface.verificationStatus &&
    assembly.entryStatus === surfaceContext.surface.entryStatus &&
    assembly.surfaceStatus === surfaceContext.surface.aggregateStatus &&
    assembly.eligible === false &&
    assembly.assembled === false &&
    assembly.aggregateStatus === "inactive" &&
    assembly.entries.workspace.status === "inactive"
  );
}

export function assertMountedRuntimeAssemblyEligibility(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): boolean {
  const mountedLifecycle = mountRuntimeLifecycleContext(
    assemblyContext.surfaceContext.entryContext.verificationContext.capabilityContext.lifecycleContext,
  );
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  const mountedVerification = attachRuntimeVerificationToCapabilityContext(mountedCapability);
  const mountedEntry = attachRuntimeEntryToVerificationContext(mountedVerification);
  const mountedSurface = attachRuntimeSurfaceToEntryContext(mountedEntry);
  const mountedAssembly = attachRuntimeAssemblyToSurfaceContext(mountedSurface);

  return (
    mountedAssembly.assembly.lifecycleStatus === "mounted" &&
    mountedAssembly.assembly.eligible === true &&
    mountedAssembly.assembly.assembled === true &&
    mountedAssembly.assembly.aggregateStatus === "assembled" &&
    mountedAssembly.assembly.entries.workspace.status === "assembled" &&
    assertMountedRuntimeSurfaceEligibility(assemblyContext.surfaceContext)
  );
}

export function assertUnmountedRuntimeAssemblyIneligibility(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): boolean {
  const unmountedLifecycle = unmountRuntimeLifecycleContext(
    mountRuntimeLifecycleContext(
      assemblyContext.surfaceContext.entryContext.verificationContext.capabilityContext.lifecycleContext,
    ),
  );
  const unmountedCapability = attachRuntimeCapabilityToLifecycleContext(unmountedLifecycle);
  const unmountedVerification = attachRuntimeVerificationToCapabilityContext(unmountedCapability);
  const unmountedEntry = attachRuntimeEntryToVerificationContext(unmountedVerification);
  const unmountedSurface = attachRuntimeSurfaceToEntryContext(unmountedEntry);
  const unmountedAssembly = attachRuntimeAssemblyToSurfaceContext(unmountedSurface);

  return (
    unmountedAssembly.assembly.lifecycleStatus === "unmounted" &&
    unmountedAssembly.assembly.eligible === false &&
    unmountedAssembly.assembly.assembled === false &&
    unmountedAssembly.assembly.aggregateStatus === "inactive" &&
    unmountedAssembly.assembly.entries.workspace.status === "inactive"
  );
}

export function describeWorkspaceRuntimeAssemblyContext(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): string {
  return [
    `tag=${WORKSPACE_RUNTIME_P8_TAG}`,
    describeRuntimeAssembly(assemblyContext.assembly),
    `surfaceVersion=${assemblyContext.surfaceContext.version}`,
  ].join(" ");
}
