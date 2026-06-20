import {
  RUNTIME_FOUNDATION_CAPABILITY,
  RUNTIME_FOUNDATION_VERSION,
  WORKSPACE_RUNTIME_SURFACES,
  type WorkspaceRuntimeSurface,
} from "./shared/runtime-constants";
import type {
  ProjectRuntime,
  QuoteRuntime,
  ReportRuntime,
  RuntimeCapability,
  RuntimeIdentity,
  RuntimeMetadataView,
  RuntimeStatus,
  WorkspaceRuntime,
  WorkspaceSurfaceRuntime,
} from "./runtime-types";

const RUNTIME_STATUSES: RuntimeStatus[] = ["idle", "ready", "mounted", "unavailable"];

const RUNTIME_CAPABILITIES: RuntimeCapability[] = ["foundation-only", "entry-only", "runtime-shell"];

export function isRuntimeStatusValue(value: unknown): value is RuntimeStatus {
  return typeof value === "string" && RUNTIME_STATUSES.includes(value as RuntimeStatus);
}

export function isRuntimeCapabilityValue(value: unknown): value is RuntimeCapability {
  return typeof value === "string" && RUNTIME_CAPABILITIES.includes(value as RuntimeCapability);
}

export function isWorkspaceRuntimeSurface(value: unknown): value is WorkspaceRuntimeSurface {
  return typeof value === "string" && WORKSPACE_RUNTIME_SURFACES.includes(value as WorkspaceRuntimeSurface);
}

export function validateRuntimeIdentity(value: unknown): value is RuntimeIdentity {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeIdentity>;
  return (
    typeof candidate.runtimeId === "string" &&
    candidate.runtimeId.trim().length > 0 &&
    typeof candidate.workspaceId === "string" &&
    candidate.workspaceId.trim().length > 0 &&
    isWorkspaceRuntimeSurface(candidate.surface)
  );
}

export function validateRuntimeMetadataView(value: unknown): value is RuntimeMetadataView {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeMetadataView>;
  return (
    typeof candidate.phase === "string" &&
    candidate.layer === "runtime-foundation" &&
    typeof candidate.note === "string"
  );
}

function validateSurfaceRuntime<T extends WorkspaceSurfaceRuntime>(
  value: unknown,
  surface: WorkspaceRuntimeSurface,
): value is T {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<WorkspaceSurfaceRuntime>;
  return (
    validateRuntimeIdentity(candidate.identity) &&
    candidate.identity?.surface === surface &&
    isRuntimeStatusValue(candidate.status) &&
    isRuntimeCapabilityValue(candidate.capability) &&
    typeof candidate.version === "string" &&
    candidate.version.trim().length > 0 &&
    validateRuntimeMetadataView(candidate.metadata)
  );
}

export function validateWorkspaceRuntime(value: unknown): value is WorkspaceRuntime {
  return validateSurfaceRuntime<WorkspaceRuntime>(value, "workspace");
}

export function validateQuoteRuntime(value: unknown): value is QuoteRuntime {
  return validateSurfaceRuntime<QuoteRuntime>(value, "quote");
}

export function validateProjectRuntime(value: unknown): value is ProjectRuntime {
  return validateSurfaceRuntime<ProjectRuntime>(value, "project");
}

export function validateReportRuntime(value: unknown): value is ReportRuntime {
  return validateSurfaceRuntime<ReportRuntime>(value, "report");
}

export function createFoundationRuntimeMetadata(surface: WorkspaceRuntimeSurface): RuntimeMetadataView {
  return {
    phase: "P1",
    layer: "runtime-foundation",
    note: `V53 P1 runtime contract shell for ${surface} · no business logic`,
  };
}

export function createFoundationRuntimeIdentity(
  workspaceId: string,
  surface: WorkspaceRuntimeSurface,
): RuntimeIdentity {
  const normalizedWorkspaceId = workspaceId.trim();
  return {
    runtimeId: `${surface}:${normalizedWorkspaceId}`,
    workspaceId: normalizedWorkspaceId,
    surface,
  };
}

export function createFoundationWorkspaceRuntime(workspaceId: string): WorkspaceRuntime {
  return {
    identity: createFoundationRuntimeIdentity(workspaceId, "workspace"),
    status: "ready",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
    version: RUNTIME_FOUNDATION_VERSION,
    metadata: createFoundationRuntimeMetadata("workspace"),
  };
}

export function createFoundationQuoteRuntime(workspaceId: string): QuoteRuntime {
  return {
    identity: createFoundationRuntimeIdentity(workspaceId, "quote"),
    status: "idle",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
    version: RUNTIME_FOUNDATION_VERSION,
    metadata: createFoundationRuntimeMetadata("quote"),
  };
}

export function createFoundationProjectRuntime(workspaceId: string): ProjectRuntime {
  return {
    identity: createFoundationRuntimeIdentity(workspaceId, "project"),
    status: "idle",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
    version: RUNTIME_FOUNDATION_VERSION,
    metadata: createFoundationRuntimeMetadata("project"),
  };
}

export function createFoundationReportRuntime(workspaceId: string): ReportRuntime {
  return {
    identity: createFoundationRuntimeIdentity(workspaceId, "report"),
    status: "idle",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
    version: RUNTIME_FOUNDATION_VERSION,
    metadata: createFoundationRuntimeMetadata("report"),
  };
}

export function assertRuntimeSchemaFoundationOnly(): boolean {
  const sample = createFoundationWorkspaceRuntime("schema-validate");
  return (
    validateWorkspaceRuntime(sample) &&
    validateQuoteRuntime(createFoundationQuoteRuntime("schema-validate")) &&
    validateProjectRuntime(createFoundationProjectRuntime("schema-validate")) &&
    validateReportRuntime(createFoundationReportRuntime("schema-validate"))
  );
}
