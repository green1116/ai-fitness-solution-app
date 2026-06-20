import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertMountedRuntimeAssemblyEligibility,
  assertUnmountedRuntimeAssemblyIneligibility,
  assertWorkspaceRuntimeAssemblyContextContract,
  createWorkspaceRuntimeAssemblyContext,
} from "../runtime-workspace-assembly-context";
import {
  createAssemblySnapshot,
  hasAssembly,
  registerAssembly,
  resolveAssembly,
  validateAssembly,
} from "../runtime-workspace-assembly";
import {
  assertRuntimeAssemblyFoundationOnly,
  assertRuntimeAssemblyHasAllStatuses,
  isAssemblyStatus,
  resolveAssemblyEligibility,
  resolveAssemblyStatus,
} from "../runtime-workspace-assembly-validation";
import type { RuntimeP8Validation } from "../runtime-workspace-assembly-types";
import { mountRuntimeLifecycleContext } from "../runtime-lifecycle-context";
import { attachRuntimeCapabilityToLifecycleContext } from "../runtime-capability-context";
import { attachRuntimeVerificationToCapabilityContext } from "../runtime-verification-context";
import { attachRuntimeEntryToVerificationContext } from "../runtime-entry-context";
import { attachRuntimeSurfaceToEntryContext } from "../runtime-surface-context";
import { WORKSPACE_RUNTIME_P8_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP8(): Promise<RuntimeP8Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p8-validate" });

  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-workspace-assembly.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-workspace-assembly-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-workspace-assembly-validation.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-workspace-assembly-context.ts")) &&
    assertWorkspaceRuntimeAssemblyContextContract(assemblyContext) &&
    assertMountedRuntimeAssemblyEligibility(assemblyContext) &&
    assertUnmountedRuntimeAssemblyIneligibility(assemblyContext) &&
    validateAssembly(assemblyContext.assembly);

  return {
    valid,
    summary: [
      `p8Tag=${WORKSPACE_RUNTIME_P8_TAG}`,
      `idleEligible=${assemblyContext.assembly.eligible}`,
      `mountedRules=${assertMountedRuntimeAssemblyEligibility(assemblyContext)}`,
      `unmountedRules=${assertUnmountedRuntimeAssemblyIneligibility(assemblyContext)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeWorkspaceAssemblyContract(): boolean {
  const assemblyPath = join(RUNTIME_ROOT, "runtime-workspace-assembly.ts");
  const content = readFileSync(assemblyPath, "utf8");
  return (
    content.includes("registerAssembly") &&
    content.includes("resolveAssembly") &&
    content.includes("listAssemblies") &&
    content.includes("hasAssembly") &&
    content.includes("validateAssembly") &&
    content.includes("createAssemblySnapshot")
  );
}

export function assertRuntimeWorkspaceAssemblyTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-workspace-assembly-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("WorkspaceRuntimeAssembly") &&
    content.includes("QuoteRuntimeAssembly") &&
    content.includes("ProjectRuntimeAssembly") &&
    content.includes("ReportRuntimeAssembly") &&
    content.includes("AssemblyKey") &&
    content.includes("AssemblyType") &&
    content.includes("AssemblyStatus") &&
    content.includes("AssemblySnapshot") &&
    content.includes("AssemblyResult") &&
    content.includes("WorkspaceRuntimeAssemblyStatus") &&
    content.includes("WorkspaceRuntimeAssemblySnapshot") &&
    content.includes("WorkspaceRuntimeAssemblyResult")
  );
}

export function assertRuntimeWorkspaceAssemblyValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-workspace-assembly-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateAssemblySnapshot") &&
    content.includes("resolveAssemblyEligibility") &&
    content.includes("assertRuntimeAssemblyLifecycleRules")
  );
}

export function assertRuntimeWorkspaceAssemblyContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-workspace-assembly-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("createWorkspaceRuntimeAssemblyContext") &&
    content.includes("attachRuntimeAssemblyToSurfaceContext") &&
    content.includes("assertWorkspaceRuntimeAssemblyContextContract")
  );
}

export function assertRuntimeWorkspaceAssemblyMappingFoundation(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "assembly-mappings" });
  const snapshot = assemblyContext.assembly;
  return (
    hasAssembly(snapshot, "workspace") &&
    hasAssembly(snapshot, "quote") &&
    hasAssembly(snapshot, "project") &&
    hasAssembly(snapshot, "report") &&
    Boolean(resolveAssembly(snapshot, "workspace")) &&
    Boolean(resolveAssembly(snapshot, "quote")) &&
    Boolean(resolveAssembly(snapshot, "project")) &&
    Boolean(resolveAssembly(snapshot, "report"))
  );
}

export function assertRuntimeWorkspaceAssemblyRegistrationFoundation(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "assembly-register" });
  const mountedLifecycle = mountRuntimeLifecycleContext(
    assemblyContext.surfaceContext.entryContext.verificationContext.capabilityContext.lifecycleContext,
  );
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  const mountedVerification = attachRuntimeVerificationToCapabilityContext(mountedCapability);
  const mountedEntry = attachRuntimeEntryToVerificationContext(mountedVerification);
  const mountedSurface = attachRuntimeSurfaceToEntryContext(mountedEntry);
  let snapshot = createAssemblySnapshot(mountedSurface);
  const reservedAssembly = registerAssembly(snapshot, "quote", {
    ...snapshot.entries.quote,
    status: "reserved",
    eligible: true,
  });
  return reservedAssembly.entries.quote.status === "reserved" && validateAssembly(reservedAssembly);
}

export function assertRuntimeWorkspaceAssemblyFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-workspace-assembly.ts"),
    join(RUNTIME_ROOT, "runtime-workspace-assembly-types.ts"),
    join(RUNTIME_ROOT, "runtime-workspace-assembly-validation.ts"),
    join(RUNTIME_ROOT, "runtime-workspace-assembly-context.ts"),
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
  assertRuntimeAssemblyHasAllStatuses,
  isAssemblyStatus,
  resolveAssemblyEligibility,
  resolveAssemblyStatus,
};
