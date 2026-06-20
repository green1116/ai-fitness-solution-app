import { assertWorkspaceRuntimeContextContract, createWorkspaceRuntimeContext } from "./runtime-context";
import type { WorkspaceRuntimeContext } from "./runtime-context";
import {
  assertRuntimeRegistryHasAllSurfaces,
  createFoundationRuntimeRegistry,
  describeRuntimeRegistry,
  validateRuntimeRegistry,
} from "./runtime-registry";
import type { WorkspaceRuntimeRegistryContext } from "./runtime-registry-types";
import type { RuntimeStatus, WorkspaceSurfaceRuntime } from "./runtime-types";
import { assertRuntimeRegistryFoundationOnly } from "./runtime-registry-validation";
import {
  RUNTIME_REGISTRY_VERSION,
  WORKSPACE_RUNTIME_P1_TAG,
  WORKSPACE_RUNTIME_P2_TAG,
} from "./shared/runtime-constants";

export interface CreateWorkspaceRuntimeRegistryContextInput {
  workspaceId: string;
}

function resolveAggregateRuntimeStatus(runtimes: WorkspaceSurfaceRuntime[]): RuntimeStatus {
  if (runtimes.some((runtime) => runtime.status === "unavailable")) {
    return "unavailable";
  }
  if (runtimes.every((runtime) => runtime.status === "ready" || runtime.status === "mounted")) {
    return "ready";
  }
  if (runtimes.some((runtime) => runtime.status === "mounted")) {
    return "mounted";
  }
  return "idle";
}

function buildWorkspaceRuntimeContextFromRegistry(
  registryContext: WorkspaceRuntimeRegistryContext,
): WorkspaceRuntimeContext {
  const { registry, workspaceId, contextVersion } = registryContext;
  const workspace = registry.entries.workspace.runtime;
  const quote = registry.entries.quote.runtime;
  const project = registry.entries.project.runtime;
  const report = registry.entries.report.runtime;

  return {
    workspaceId,
    version: contextVersion,
    tag: WORKSPACE_RUNTIME_P1_TAG,
    status: resolveAggregateRuntimeStatus([workspace, quote, project, report]),
    capability: workspace.capability,
    workspace,
    quote,
    project,
    report,
  };
}

export function attachRuntimeRegistryToContext(context: WorkspaceRuntimeContext): WorkspaceRuntimeRegistryContext {
  const registry = createFoundationRuntimeRegistry(context);
  return {
    workspaceId: context.workspaceId,
    version: RUNTIME_REGISTRY_VERSION,
    contextVersion: context.version,
    registry,
  };
}

export function createWorkspaceRuntimeRegistryContext(
  input: CreateWorkspaceRuntimeRegistryContextInput,
): WorkspaceRuntimeRegistryContext {
  const context = createWorkspaceRuntimeContext({ workspaceId: input.workspaceId });
  return attachRuntimeRegistryToContext(context);
}

export function refreshWorkspaceRuntimeRegistryContext(
  current: WorkspaceRuntimeRegistryContext,
): WorkspaceRuntimeRegistryContext {
  return createWorkspaceRuntimeRegistryContext({ workspaceId: current.workspaceId });
}

export function resolveContextFromRegistryContext(
  registryContext: WorkspaceRuntimeRegistryContext,
): WorkspaceRuntimeContext {
  return buildWorkspaceRuntimeContextFromRegistry(registryContext);
}

export function assertWorkspaceRuntimeRegistryContextContract(
  registryContext: WorkspaceRuntimeRegistryContext,
): boolean {
  const context = buildWorkspaceRuntimeContextFromRegistry(registryContext);
  const expected = createWorkspaceRuntimeContext({ workspaceId: registryContext.workspaceId });

  return (
    registryContext.version === RUNTIME_REGISTRY_VERSION &&
    registryContext.workspaceId.trim().length > 0 &&
    validateRuntimeRegistry(registryContext.registry) &&
    assertRuntimeRegistryFoundationOnly(registryContext.registry) &&
    assertRuntimeRegistryHasAllSurfaces(registryContext.registry) &&
    assertWorkspaceRuntimeContextContract(context) &&
    assertWorkspaceRuntimeContextContract(expected) &&
    registryContext.registry.entries.workspace.runtime.identity.runtimeId ===
      expected.workspace.identity.runtimeId
  );
}

export function describeWorkspaceRuntimeRegistryContext(registryContext: WorkspaceRuntimeRegistryContext): string {
  return [
    `tag=${WORKSPACE_RUNTIME_P2_TAG}`,
    describeRuntimeRegistry(registryContext.registry),
    `contextVersion=${registryContext.contextVersion}`,
  ].join(" ");
}
