import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertWorkspaceRuntimeLifecycleContextContract,
  createWorkspaceRuntimeLifecycleContext,
  mountRuntimeLifecycleContext,
  refreshWorkspaceRuntimeLifecycleContext,
  unmountRuntimeLifecycleContext,
} from "../runtime-lifecycle-context";
import {
  mountRuntime,
  refreshRuntime,
  transitionRuntimeStatus,
  unmountRuntime,
  validateRuntimeLifecycle,
} from "../runtime-lifecycle";
import {
  assertRuntimeLifecycleFoundationOnly,
  assertRuntimeLifecycleHasAllStatuses,
  assertRuntimeLifecycleTransitionRules,
  validateLifecycleTransition,
  validateRuntimeLifecycleSnapshot,
} from "../runtime-lifecycle-validation";
import type { RuntimeP3Validation } from "../runtime-lifecycle-types";
import { WORKSPACE_RUNTIME_P3_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP3(): Promise<RuntimeP3Validation> {
  const lifecycleContext = createWorkspaceRuntimeLifecycleContext({ workspaceId: "p3-validate" });
  const mounted = mountRuntimeLifecycleContext(lifecycleContext);
  const refreshed = refreshWorkspaceRuntimeLifecycleContext(lifecycleContext);
  const unmounted = unmountRuntimeLifecycleContext(refreshed);

  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-lifecycle.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-lifecycle-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-lifecycle-validation.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-lifecycle-context.ts")) &&
    assertWorkspaceRuntimeLifecycleContextContract(lifecycleContext) &&
    mounted.lifecycle.status === "mounted" &&
    refreshed.lifecycle.status === "mounted" &&
    unmounted.lifecycle.status === "unmounted" &&
    validateRuntimeLifecycle(unmounted.lifecycle);

  return {
    valid,
    summary: [
      `p3Tag=${WORKSPACE_RUNTIME_P3_TAG}`,
      `mounted=${mounted.lifecycle.status}`,
      `refreshed=${refreshed.lifecycle.status}`,
      `unmounted=${unmounted.lifecycle.status}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeLifecycleContract(): boolean {
  const lifecyclePath = join(RUNTIME_ROOT, "runtime-lifecycle.ts");
  const content = readFileSync(lifecyclePath, "utf8");
  return (
    content.includes("createRuntimeLifecycle") &&
    content.includes("mountRuntime") &&
    content.includes("refreshRuntime") &&
    content.includes("unmountRuntime") &&
    content.includes("transitionRuntimeStatus") &&
    content.includes("validateLifecycleTransition")
  );
}

export function assertRuntimeLifecycleTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-lifecycle-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("RuntimeLifecycleStatus") &&
    content.includes("RuntimeLifecycleSnapshot") &&
    content.includes("WorkspaceRuntimeLifecycleContext")
  );
}

export function assertRuntimeLifecycleValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-lifecycle-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateLifecycleTransition") &&
    content.includes("validateRuntimeLifecycleSnapshot") &&
    content.includes("assertRuntimeLifecycleTransitionRules")
  );
}

export function assertRuntimeLifecycleContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-lifecycle-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("createWorkspaceRuntimeLifecycleContext") &&
    content.includes("attachRuntimeLifecycleToRegistryContext") &&
    content.includes("assertWorkspaceRuntimeLifecycleContextContract")
  );
}

export function assertRuntimeLifecycleStateMachineFoundation(): boolean {
  const lifecycleContext = createWorkspaceRuntimeLifecycleContext({ workspaceId: "lifecycle-state-machine" });
  let lifecycle = lifecycleContext.lifecycle;

  lifecycle = mountRuntime(lifecycle);
  if (lifecycle.status !== "ready") return false;

  lifecycle = mountRuntime(lifecycle);
  if (lifecycle.status !== "mounted") return false;

  lifecycle = refreshRuntime(lifecycle);
  if (lifecycle.status !== "mounted") return false;

  lifecycle = transitionRuntimeStatus(lifecycle, "workspace", "refreshing");
  lifecycle = transitionRuntimeStatus(lifecycle, "workspace", "mounted");
  if (lifecycle.entries.workspace.status !== "mounted") return false;

  lifecycle = unmountRuntime(lifecycle);
  return lifecycle.status === "unmounted" && validateRuntimeLifecycleSnapshot(lifecycle);
}

export function assertRuntimeLifecycleFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-lifecycle.ts"),
    join(RUNTIME_ROOT, "runtime-lifecycle-types.ts"),
    join(RUNTIME_ROOT, "runtime-lifecycle-validation.ts"),
    join(RUNTIME_ROOT, "runtime-lifecycle-context.ts"),
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
  assertRuntimeLifecycleHasAllStatuses,
  assertRuntimeLifecycleTransitionRules,
  validateLifecycleTransition,
};
