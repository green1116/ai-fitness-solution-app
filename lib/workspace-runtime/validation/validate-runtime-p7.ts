import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertMountedRuntimeSurfaceEligibility,
  assertUnmountedRuntimeSurfaceIneligibility,
  assertWorkspaceRuntimeSurfaceContextContract,
  createWorkspaceRuntimeSurfaceContext,
} from "../runtime-surface-context";
import {
  createSurfaceSnapshot,
  hasSurface,
  registerSurface,
  resolveSurface,
  validateSurface,
} from "../runtime-surface";
import {
  assertRuntimeSurfaceFoundationOnly,
  assertRuntimeSurfaceHasAllStatuses,
  isSurfaceStatus,
  resolveSurfaceEligibility,
  resolveSurfaceStatus,
} from "../runtime-surface-validation";
import type { RuntimeP7Validation } from "../runtime-surface-types";
import { mountRuntimeLifecycleContext } from "../runtime-lifecycle-context";
import { attachRuntimeCapabilityToLifecycleContext } from "../runtime-capability-context";
import { attachRuntimeVerificationToCapabilityContext } from "../runtime-verification-context";
import { attachRuntimeEntryToVerificationContext } from "../runtime-entry-context";
import { WORKSPACE_RUNTIME_P7_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP7(): Promise<RuntimeP7Validation> {
  const surfaceContext = createWorkspaceRuntimeSurfaceContext({ workspaceId: "p7-validate" });

  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-surface.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-surface-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-surface-validation.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-surface-context.ts")) &&
    assertWorkspaceRuntimeSurfaceContextContract(surfaceContext) &&
    assertMountedRuntimeSurfaceEligibility(surfaceContext) &&
    assertUnmountedRuntimeSurfaceIneligibility(surfaceContext) &&
    validateSurface(surfaceContext.surface);

  return {
    valid,
    summary: [
      `p7Tag=${WORKSPACE_RUNTIME_P7_TAG}`,
      `idleEligible=${surfaceContext.surface.eligible}`,
      `mountedRules=${assertMountedRuntimeSurfaceEligibility(surfaceContext)}`,
      `unmountedRules=${assertUnmountedRuntimeSurfaceIneligibility(surfaceContext)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeSurfaceContract(): boolean {
  const surfacePath = join(RUNTIME_ROOT, "runtime-surface.ts");
  const content = readFileSync(surfacePath, "utf8");
  return (
    content.includes("registerSurface") &&
    content.includes("resolveSurface") &&
    content.includes("listSurfaces") &&
    content.includes("hasSurface") &&
    content.includes("validateSurface") &&
    content.includes("createSurfaceSnapshot")
  );
}

export function assertRuntimeSurfaceTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-surface-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("WorkspaceSurface") &&
    content.includes("QuoteSurface") &&
    content.includes("ProjectSurface") &&
    content.includes("ReportSurface") &&
    content.includes("SurfaceKey") &&
    content.includes("SurfaceType") &&
    content.includes("SurfaceStatus") &&
    content.includes("SurfaceSnapshot") &&
    content.includes("SurfaceResult")
  );
}

export function assertRuntimeSurfaceValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-surface-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateSurfaceSnapshot") &&
    content.includes("resolveSurfaceEligibility") &&
    content.includes("assertRuntimeSurfaceLifecycleRules")
  );
}

export function assertRuntimeSurfaceContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-surface-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("createWorkspaceRuntimeSurfaceContext") &&
    content.includes("attachRuntimeSurfaceToEntryContext") &&
    content.includes("assertWorkspaceRuntimeSurfaceContextContract")
  );
}

export function assertRuntimeSurfaceMappingFoundation(): boolean {
  const surfaceContext = createWorkspaceRuntimeSurfaceContext({ workspaceId: "surface-mappings" });
  const snapshot = surfaceContext.surface;
  return (
    hasSurface(snapshot, "workspace") &&
    hasSurface(snapshot, "quote") &&
    hasSurface(snapshot, "project") &&
    hasSurface(snapshot, "report") &&
    Boolean(resolveSurface(snapshot, "workspace")) &&
    Boolean(resolveSurface(snapshot, "quote")) &&
    Boolean(resolveSurface(snapshot, "project")) &&
    Boolean(resolveSurface(snapshot, "report"))
  );
}

export function assertRuntimeSurfaceRegistrationFoundation(): boolean {
  const surfaceContext = createWorkspaceRuntimeSurfaceContext({ workspaceId: "surface-register" });
  const mountedLifecycle = mountRuntimeLifecycleContext(
    surfaceContext.entryContext.verificationContext.capabilityContext.lifecycleContext,
  );
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  const mountedVerification = attachRuntimeVerificationToCapabilityContext(mountedCapability);
  const mountedEntry = attachRuntimeEntryToVerificationContext(mountedVerification);
  let snapshot = createSurfaceSnapshot(mountedEntry);
  const reservedSurface = registerSurface(snapshot, "quote", {
    ...snapshot.entries.quote,
    status: "reserved",
    eligible: true,
  });
  return reservedSurface.entries.quote.status === "reserved" && validateSurface(reservedSurface);
}

export function assertRuntimeSurfaceFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-surface.ts"),
    join(RUNTIME_ROOT, "runtime-surface-types.ts"),
    join(RUNTIME_ROOT, "runtime-surface-validation.ts"),
    join(RUNTIME_ROOT, "runtime-surface-context.ts"),
  ];
  const forbidden = [
    /@prisma\/client/,
    /saas-product-persistence/,
    /handleCreateQuote/,
    /calculateQuote/,
    /handleTransitionWorkflow/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export {
  assertRuntimeSurfaceHasAllStatuses,
  isSurfaceStatus,
  resolveSurfaceEligibility,
  resolveSurfaceStatus,
};
