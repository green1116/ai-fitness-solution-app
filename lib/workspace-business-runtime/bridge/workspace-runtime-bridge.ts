import type { WorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import type { BusinessSurfaceKey } from "../shared/business-constants";
import { BUSINESS_SURFACE_KEYS, WORKSPACE_BUSINESS_BRIDGE_VERSION } from "../shared/business-constants";
import type {
  BusinessEntryView,
  BusinessReadiness,
  BusinessReadinessView,
  BusinessSurfaceView,
  WorkspaceBusinessBridgeView,
} from "./workspace-runtime-bridge-types";

function isBusinessSurfaceKey(value: string): value is BusinessSurfaceKey {
  return (BUSINESS_SURFACE_KEYS as readonly string[]).includes(value);
}

export function resolveBusinessReadiness(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): BusinessReadiness {
  const { assembly } = assemblyContext;
  if (!assembly.eligible) {
    return "BLOCKED";
  }
  switch (assembly.aggregateStatus) {
    case "assembled":
      return "READY";
    case "partial":
    case "reserved":
    case "degraded":
      return "PARTIAL";
    case "inactive":
    default:
      return "BLOCKED";
  }
}

export function resolveBusinessReadinessView(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): BusinessReadinessView {
  const { assembly } = assemblyContext;
  return {
    readiness: resolveBusinessReadiness(assemblyContext),
    workspaceId: assemblyContext.workspaceId,
    kernelAggregateStatus: assembly.aggregateStatus,
    kernelEligible: assembly.eligible,
    kernelAssembled: assembly.assembled,
  };
}

function resolveSurfaceVisible(kernelStatus: string): boolean {
  return kernelStatus === "visible" || kernelStatus === "active";
}

function resolveSurfaceActive(kernelStatus: string): boolean {
  return kernelStatus === "active";
}

function resolveEntryActive(kernelStatus: string): boolean {
  return kernelStatus === "active";
}

export function resolveBusinessSurfaceViews(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): BusinessSurfaceView[] {
  const surfaces = assemblyContext.surfaceContext.surface.entries;
  return BUSINESS_SURFACE_KEYS.map((key) => {
    const surface = surfaces[key];
    return {
      key,
      kernelStatus: surface.status,
      eligible: surface.eligible,
      visible: resolveSurfaceVisible(surface.status),
      active: resolveSurfaceActive(surface.status),
    };
  });
}

export function resolveBusinessEntryViews(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): BusinessEntryView[] {
  const entries = assemblyContext.surfaceContext.entryContext.entry.entries;
  return BUSINESS_SURFACE_KEYS.map((key) => {
    const entry = entries[key];
    return {
      key,
      kernelStatus: entry.status,
      eligible: entry.eligible,
      active: resolveEntryActive(entry.status),
    };
  });
}

export function createWorkspaceBusinessBridge(
  assemblyContext: WorkspaceRuntimeAssemblyContext,
): WorkspaceBusinessBridgeView {
  return {
    workspaceId: assemblyContext.workspaceId,
    version: WORKSPACE_BUSINESS_BRIDGE_VERSION,
    readiness: resolveBusinessReadinessView(assemblyContext),
    surfaces: resolveBusinessSurfaceViews(assemblyContext),
    entries: resolveBusinessEntryViews(assemblyContext),
  };
}

export function describeWorkspaceBusinessBridge(view: WorkspaceBusinessBridgeView): string {
  return [
    `workspaceId=${view.workspaceId}`,
    `readiness=${view.readiness.readiness}`,
    `kernelAggregateStatus=${view.readiness.kernelAggregateStatus}`,
    `surfaces=${view.surfaces.length}`,
    `entries=${view.entries.length}`,
  ].join(" ");
}

export function assertWorkspaceBusinessBridgeView(view: WorkspaceBusinessBridgeView): boolean {
  if (view.workspaceId.trim().length === 0) {
    return false;
  }
  if (view.surfaces.length !== BUSINESS_SURFACE_KEYS.length) {
    return false;
  }
  if (view.entries.length !== BUSINESS_SURFACE_KEYS.length) {
    return false;
  }
  return view.surfaces.every((surface) => isBusinessSurfaceKey(surface.key));
}
