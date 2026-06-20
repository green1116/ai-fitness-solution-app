import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertWorkspaceRuntimeRegistryContextContract,
  createWorkspaceRuntimeRegistryContext,
} from "../runtime-registry-context";
import {
  assertRuntimeRegistryHasAllSurfaces,
  hasRuntimeEntry,
  resolveProjectRuntime,
  resolveQuoteRuntime,
  resolveReportRuntime,
  resolveWorkspaceRuntime,
  validateRuntimeRegistry,
} from "../runtime-registry";
import {
  assertRuntimeRegistryFoundationOnly,
  validateRuntimeRegistrySnapshot,
} from "../runtime-registry-validation";
import type { RuntimeP2Validation } from "../runtime-registry-types";
import { WORKSPACE_RUNTIME_P2_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP2(): Promise<RuntimeP2Validation> {
  const registryContext = createWorkspaceRuntimeRegistryContext({ workspaceId: "p2-validate" });
  const registry = registryContext.registry;

  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-registry.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-registry-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-registry-validation.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-registry-context.ts")) &&
    validateRuntimeRegistry(registry) &&
    assertRuntimeRegistryFoundationOnly(registry) &&
    assertRuntimeRegistryHasAllSurfaces(registry) &&
    assertWorkspaceRuntimeRegistryContextContract(registryContext);

  return {
    valid,
    summary: [
      `p2Tag=${WORKSPACE_RUNTIME_P2_TAG}`,
      `registry=${validateRuntimeRegistry(registry)}`,
      `context=${assertWorkspaceRuntimeRegistryContextContract(registryContext)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeRegistryContract(): boolean {
  const registryPath = join(RUNTIME_ROOT, "runtime-registry.ts");
  const content = readFileSync(registryPath, "utf8");
  return (
    content.includes("registerRuntimeEntry") &&
    content.includes("resolveRuntimeEntry") &&
    content.includes("listRuntimeRegistryEntries") &&
    content.includes("hasRuntimeEntry") &&
    content.includes("validateRuntimeRegistry")
  );
}

export function assertRuntimeRegistryTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-registry-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return content.includes("RuntimeRegistryEntry") && content.includes("RuntimeRegistrySnapshot");
}

export function assertRuntimeRegistryValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-registry-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateRuntimeRegistryEntry") &&
    content.includes("validateRuntimeRegistrySnapshot") &&
    content.includes("assertRuntimeRegistryFoundationOnly")
  );
}

export function assertRuntimeRegistryContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-registry-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("createWorkspaceRuntimeRegistryContext") &&
    content.includes("attachRuntimeRegistryToContext") &&
    content.includes("assertWorkspaceRuntimeRegistryContextContract")
  );
}

export function assertRegistryHasAllFoundationRuntimes(): boolean {
  const registryContext = createWorkspaceRuntimeRegistryContext({ workspaceId: "registry-surface-check" });
  const registry = registryContext.registry;
  return (
    hasRuntimeEntry(registry, "workspace") &&
    hasRuntimeEntry(registry, "quote") &&
    hasRuntimeEntry(registry, "project") &&
    hasRuntimeEntry(registry, "report") &&
    Boolean(resolveWorkspaceRuntime(registry)) &&
    Boolean(resolveQuoteRuntime(registry)) &&
    Boolean(resolveProjectRuntime(registry)) &&
    Boolean(resolveReportRuntime(registry)) &&
    validateRuntimeRegistrySnapshot(registry)
  );
}

export function assertRuntimeRegistryFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-registry.ts"),
    join(RUNTIME_ROOT, "runtime-registry-types.ts"),
    join(RUNTIME_ROOT, "runtime-registry-validation.ts"),
    join(RUNTIME_ROOT, "runtime-registry-context.ts"),
  ];
  const forbidden = [
    /@prisma\/client/,
    /saas-product-persistence/,
    /handleCreateQuote/,
    /calculateQuote/,
    /handleTransitionWorkflow/,
    /handleCreateProject/,
    /handleCreateReport/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}
