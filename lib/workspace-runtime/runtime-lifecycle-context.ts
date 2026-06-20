import {
  assertWorkspaceRuntimeRegistryContextContract,
  createWorkspaceRuntimeRegistryContext,
} from "./runtime-registry-context";
import type { WorkspaceRuntimeRegistryContext } from "./runtime-registry-types";
import {
  createRuntimeLifecycle,
  describeRuntimeLifecycle,
  mountRuntime,
  refreshRuntime,
  unmountRuntime,
  validateRuntimeLifecycle,
} from "./runtime-lifecycle";
import type { WorkspaceRuntimeLifecycleContext } from "./runtime-lifecycle-types";
import { assertRuntimeLifecycleFoundationOnly } from "./runtime-lifecycle-validation";
import {
  RUNTIME_LIFECYCLE_VERSION,
  WORKSPACE_RUNTIME_P3_TAG,
} from "./shared/runtime-constants";

export interface CreateWorkspaceRuntimeLifecycleContextInput {
  workspaceId: string;
}

export function attachRuntimeLifecycleToRegistryContext(
  registryContext: WorkspaceRuntimeRegistryContext,
): WorkspaceRuntimeLifecycleContext {
  const lifecycle = createRuntimeLifecycle(registryContext);
  return {
    workspaceId: registryContext.workspaceId,
    version: RUNTIME_LIFECYCLE_VERSION,
    registryContext,
    lifecycle,
  };
}

export function createWorkspaceRuntimeLifecycleContext(
  input: CreateWorkspaceRuntimeLifecycleContextInput,
): WorkspaceRuntimeLifecycleContext {
  const registryContext = createWorkspaceRuntimeRegistryContext({ workspaceId: input.workspaceId });
  return attachRuntimeLifecycleToRegistryContext(registryContext);
}

export function refreshWorkspaceRuntimeLifecycleContext(
  current: WorkspaceRuntimeLifecycleContext,
): WorkspaceRuntimeLifecycleContext {
  const mounted = mountRuntimeLifecycleContext(current);
  const refreshed = {
    ...mounted,
    lifecycle: refreshRuntime(mounted.lifecycle),
  };
  return refreshed;
}

export function mountRuntimeLifecycleContext(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): WorkspaceRuntimeLifecycleContext {
  let lifecycle = lifecycleContext.lifecycle;
  if (lifecycle.status === "idle") {
    lifecycle = mountRuntime(lifecycle);
  }
  if (lifecycle.status === "ready") {
    lifecycle = mountRuntime(lifecycle);
  }
  return {
    ...lifecycleContext,
    lifecycle,
  };
}

export function unmountRuntimeLifecycleContext(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): WorkspaceRuntimeLifecycleContext {
  const mounted = mountRuntimeLifecycleContext(lifecycleContext);
  return {
    ...mounted,
    lifecycle: unmountRuntime(mounted.lifecycle),
  };
}

export function assertWorkspaceRuntimeLifecycleContextContract(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): boolean {
  return (
    lifecycleContext.version === RUNTIME_LIFECYCLE_VERSION &&
    lifecycleContext.workspaceId.trim().length > 0 &&
    validateRuntimeLifecycle(lifecycleContext.lifecycle) &&
    assertRuntimeLifecycleFoundationOnly() &&
    assertWorkspaceRuntimeRegistryContextContract(lifecycleContext.registryContext) &&
    lifecycleContext.lifecycle.status === "idle" &&
    lifecycleContext.lifecycle.entries.workspace.status === "idle"
  );
}

export function describeWorkspaceRuntimeLifecycleContext(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): string {
  return [
    `tag=${WORKSPACE_RUNTIME_P3_TAG}`,
    describeRuntimeLifecycle(lifecycleContext.lifecycle),
    `registryVersion=${lifecycleContext.registryContext.version}`,
    `contextVersion=${lifecycleContext.registryContext.contextVersion}`,
  ].join(" ");
}

export function resolveRegistryContextFromLifecycleContext(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): WorkspaceRuntimeRegistryContext {
  return lifecycleContext.registryContext;
}
