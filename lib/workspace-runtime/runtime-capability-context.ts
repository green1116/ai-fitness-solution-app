import {
  assertWorkspaceRuntimeLifecycleContextContract,
  createWorkspaceRuntimeLifecycleContext,
  mountRuntimeLifecycleContext,
  unmountRuntimeLifecycleContext,
} from "./runtime-lifecycle-context";
import type { WorkspaceRuntimeLifecycleContext } from "./runtime-lifecycle-types";
import {
  createFoundationCapabilitySnapshot,
  describeRuntimeCapability,
  syncCapabilityWithLifecycle,
  validateCapability,
} from "./runtime-capability";
import type { WorkspaceRuntimeCapabilityContext } from "./runtime-capability-types";
import { assertRuntimeCapabilityFoundationOnly } from "./runtime-capability-validation";
import {
  RUNTIME_CAPABILITY_VERSION,
  WORKSPACE_RUNTIME_P4_TAG,
} from "./shared/runtime-constants";

export interface CreateWorkspaceRuntimeCapabilityContextInput {
  workspaceId: string;
}

export function attachRuntimeCapabilityToLifecycleContext(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): WorkspaceRuntimeCapabilityContext {
  const capability = createFoundationCapabilitySnapshot(lifecycleContext);
  return {
    workspaceId: lifecycleContext.workspaceId,
    version: RUNTIME_CAPABILITY_VERSION,
    lifecycleContext,
    capability,
  };
}

export function createWorkspaceRuntimeCapabilityContext(
  input: CreateWorkspaceRuntimeCapabilityContextInput,
): WorkspaceRuntimeCapabilityContext {
  const lifecycleContext = createWorkspaceRuntimeLifecycleContext({ workspaceId: input.workspaceId });
  return attachRuntimeCapabilityToLifecycleContext(lifecycleContext);
}

export function refreshRuntimeCapabilityFromLifecycle(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): WorkspaceRuntimeCapabilityContext {
  return {
    ...capabilityContext,
    capability: syncCapabilityWithLifecycle(capabilityContext.lifecycleContext, capabilityContext.capability),
  };
}

export function resolveLifecycleContextFromCapabilityContext(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): WorkspaceRuntimeLifecycleContext {
  return capabilityContext.lifecycleContext;
}

export function assertWorkspaceRuntimeCapabilityContextContract(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): boolean {
  const lifecycleContext = capabilityContext.lifecycleContext;

  return (
    capabilityContext.version === RUNTIME_CAPABILITY_VERSION &&
    capabilityContext.workspaceId.trim().length > 0 &&
    validateCapability(capabilityContext.capability) &&
    assertRuntimeCapabilityFoundationOnly() &&
    assertWorkspaceRuntimeLifecycleContextContract(lifecycleContext) &&
    capabilityContext.capability.lifecycleStatus === lifecycleContext.lifecycle.status &&
    capabilityContext.capability.available === false &&
    capabilityContext.capability.entries.workspace.status === "disabled"
  );
}

export function assertMountedRuntimeCapabilityAvailability(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): boolean {
  const mountedLifecycle = mountRuntimeLifecycleContext(capabilityContext.lifecycleContext);
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  return (
    mountedCapability.capability.lifecycleStatus === "mounted" &&
    mountedCapability.capability.available === true &&
    mountedCapability.capability.entries.workspace.available === true
  );
}

export function assertUnmountedRuntimeCapabilityAvailability(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): boolean {
  const unmountedLifecycle = unmountRuntimeLifecycleContext(
    mountRuntimeLifecycleContext(capabilityContext.lifecycleContext),
  );
  const unmountedCapability = attachRuntimeCapabilityToLifecycleContext(unmountedLifecycle);
  return (
    unmountedCapability.capability.lifecycleStatus === "unmounted" &&
    unmountedCapability.capability.available === false &&
    unmountedCapability.capability.entries.workspace.available === false
  );
}

export function describeWorkspaceRuntimeCapabilityContext(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): string {
  return [
    `tag=${WORKSPACE_RUNTIME_P4_TAG}`,
    describeRuntimeCapability(capabilityContext.capability),
    `lifecycleVersion=${capabilityContext.lifecycleContext.version}`,
  ].join(" ");
}
