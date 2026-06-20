import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertMountedRuntimeCapabilityAvailability,
  assertUnmountedRuntimeCapabilityAvailability,
  assertWorkspaceRuntimeCapabilityContextContract,
  createWorkspaceRuntimeCapabilityContext,
} from "../runtime-capability-context";
import {
  hasCapability,
  registerCapability,
  resolveCapability,
  validateCapability,
} from "../runtime-capability";
import {
  assertRuntimeCapabilityFoundationOnly,
  assertRuntimeCapabilityHasAllStatuses,
  isRuntimeCapabilityStatus,
  resolveCapabilityAvailability,
} from "../runtime-capability-validation";
import type { RuntimeP4Validation } from "../runtime-capability-types";
import { mountRuntimeLifecycleContext } from "../runtime-lifecycle-context";
import { WORKSPACE_RUNTIME_P4_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP4(): Promise<RuntimeP4Validation> {
  const capabilityContext = createWorkspaceRuntimeCapabilityContext({ workspaceId: "p4-validate" });
  const mountedLifecycle = mountRuntimeLifecycleContext(capabilityContext.lifecycleContext);
  const mountedContext = {
    ...capabilityContext,
    lifecycleContext: mountedLifecycle,
    capability: {
      ...capabilityContext.capability,
      lifecycleStatus: mountedLifecycle.lifecycle.status,
    },
  };

  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-capability.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-capability-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-capability-validation.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-capability-context.ts")) &&
    assertWorkspaceRuntimeCapabilityContextContract(capabilityContext) &&
    assertMountedRuntimeCapabilityAvailability(capabilityContext) &&
    assertUnmountedRuntimeCapabilityAvailability(capabilityContext) &&
    validateCapability(capabilityContext.capability);

  return {
    valid,
    summary: [
      `p4Tag=${WORKSPACE_RUNTIME_P4_TAG}`,
      `idle=${capabilityContext.capability.available}`,
      `mountedRules=${assertMountedRuntimeCapabilityAvailability(capabilityContext)}`,
      `unmountedRules=${assertUnmountedRuntimeCapabilityAvailability(capabilityContext)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeCapabilityContract(): boolean {
  const capabilityPath = join(RUNTIME_ROOT, "runtime-capability.ts");
  const content = readFileSync(capabilityPath, "utf8");
  return (
    content.includes("registerCapability") &&
    content.includes("resolveCapability") &&
    content.includes("listCapabilities") &&
    content.includes("hasCapability") &&
    content.includes("validateCapability")
  );
}

export function assertRuntimeCapabilityTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-capability-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("WorkspaceCapability") &&
    content.includes("QuoteCapability") &&
    content.includes("ProjectCapability") &&
    content.includes("ReportCapability") &&
    content.includes("RuntimeCapabilityStatus")
  );
}

export function assertRuntimeCapabilityValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-capability-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateRuntimeCapabilitySnapshot") &&
    content.includes("resolveCapabilityAvailability") &&
    content.includes("assertRuntimeCapabilityLifecycleRules")
  );
}

export function assertRuntimeCapabilityContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-capability-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("createWorkspaceRuntimeCapabilityContext") &&
    content.includes("attachRuntimeCapabilityToLifecycleContext") &&
    content.includes("assertWorkspaceRuntimeCapabilityContextContract")
  );
}

export function assertRuntimeCapabilitySurfaceFoundation(): boolean {
  const capabilityContext = createWorkspaceRuntimeCapabilityContext({ workspaceId: "capability-surfaces" });
  const snapshot = capabilityContext.capability;
  return (
    hasCapability(snapshot, "workspace") &&
    hasCapability(snapshot, "quote") &&
    hasCapability(snapshot, "project") &&
    hasCapability(snapshot, "report") &&
    Boolean(resolveCapability(snapshot, "workspace")) &&
    Boolean(resolveCapability(snapshot, "quote")) &&
    Boolean(resolveCapability(snapshot, "project")) &&
    Boolean(resolveCapability(snapshot, "report"))
  );
}

export function assertRuntimeCapabilityRegistrationFoundation(): boolean {
  const capabilityContext = createWorkspaceRuntimeCapabilityContext({ workspaceId: "capability-register" });
  const mounted = mountRuntimeLifecycleContext(capabilityContext.lifecycleContext);
  let snapshot = capabilityContext.capability;
  snapshot = {
    ...snapshot,
    lifecycleStatus: mounted.lifecycle.status,
  };
  const experimental = registerCapability(snapshot, "quote", {
    ...snapshot.entries.quote,
    status: "experimental",
  });
  return experimental.entries.quote.status === "experimental" && validateCapability(experimental);
}

export function assertRuntimeCapabilityFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-capability.ts"),
    join(RUNTIME_ROOT, "runtime-capability-types.ts"),
    join(RUNTIME_ROOT, "runtime-capability-validation.ts"),
    join(RUNTIME_ROOT, "runtime-capability-context.ts"),
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
  assertRuntimeCapabilityHasAllStatuses,
  isRuntimeCapabilityStatus,
  resolveCapabilityAvailability,
};
