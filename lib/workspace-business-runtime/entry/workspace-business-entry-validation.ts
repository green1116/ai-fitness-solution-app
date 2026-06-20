import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceBusinessBridge } from "../bridge/workspace-runtime-bridge";
import { createWorkspaceBusinessContext } from "../context/workspace-business-context-factory";
import { createWorkspaceBusinessDomain } from "../domain/workspace-business-domain-factory";
import { createWorkspaceBusinessOrchestration } from "../orchestration/workspace-business-orchestration-factory";
import type { WorkspaceBusinessOrchestration } from "../orchestration/workspace-business-orchestration-types";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceBusinessEntry } from "./workspace-business-entry-factory";
import {
  assertBusinessEntryScope,
  assertWorkspaceBusinessEntryShape,
  describeWorkspaceBusinessEntry,
  resolveBusinessEntryState,
  resolveBusinessEntryStatus,
} from "./workspace-business-entry";
import { WORKSPACE_BUSINESS_RUNTIME_P5_TAG } from "./workspace-business-entry-meta";
import {
  hasWorkspaceBusinessEntry,
  registerWorkspaceBusinessEntry,
  resolveWorkspaceBusinessEntry,
} from "./workspace-business-entry-registry";
import type { WorkspaceBusinessEntryValidation } from "./workspace-business-entry-types";

const ENTRY_ROOT = join(process.cwd(), "lib", "workspace-business-runtime", "entry");

function buildForbiddenImportPatterns(): RegExp[] {
  const prismaClient = ["@prisma", "/client"].join("");
  const persistenceLayer = ["saas-product-", "persistence"].join("");
  const apiLayer = ["saas-product-", "api"].join("");
  const portalLayer = ["saas-product-", "portal"].join("");
  return [
    /runtime-lifecycle/,
    /runtime-registry/,
    /runtime-entry/,
    /runtime-surface/,
    /runtime-capability/,
    /runtime-verification/,
    /runtime-workspace-assembly/,
    new RegExp(persistenceLayer),
    new RegExp(apiLayer),
    new RegExp(portalLayer),
    new RegExp(prismaClient.replace("/", "\\/")),
    /\.\.\/bridge\//,
  ];
}

function buildFoundationForbiddenPatterns(): RegExp[] {
  const quoteAction = ["create", "Quote"].join("");
  const calculateQuoteAction = ["calculate", "Quote"].join("");
  const projectAction = ["create", "Project"].join("");
  const reportAction = ["create", "Report"].join("");
  const executeWorkflowAction = ["execute", "Workflow"].join("");
  const quoteRuntimeToken = ["Quote", "Runtime"].join("");
  const projectRuntimeToken = ["Project", "Runtime"].join("");
  const reportRuntimeToken = ["Report", "Runtime"].join("");
  const workflowRuntimeToken = ["Workflow", "Runtime"].join("");
  return [
    new RegExp(quoteAction),
    new RegExp(calculateQuoteAction),
    new RegExp(projectAction),
    new RegExp(reportAction),
    new RegExp(executeWorkflowAction),
    /execute\s*\(/,
    /run\s*\(/,
    /dispatch\s*\(/,
    /transition\s*\(/,
    new RegExp(quoteRuntimeToken),
    new RegExp(projectRuntimeToken),
    new RegExp(reportRuntimeToken),
    new RegExp(workflowRuntimeToken),
  ];
}

export async function validateWorkspaceBusinessEntry(): Promise<WorkspaceBusinessEntryValidation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p5-entry-validate" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);
  const domain = createWorkspaceBusinessDomain(context);
  const orchestration = createWorkspaceBusinessOrchestration(domain);
  const entry = createWorkspaceBusinessEntry(orchestration);
  const registered = registerWorkspaceBusinessEntry(entry);
  const resolved = resolveWorkspaceBusinessEntry(entry.scope.workspaceId);

  const valid =
    existsSync(join(ENTRY_ROOT, "workspace-business-entry.ts")) &&
    existsSync(join(ENTRY_ROOT, "workspace-business-entry-types.ts")) &&
    existsSync(join(ENTRY_ROOT, "workspace-business-entry-factory.ts")) &&
    existsSync(join(ENTRY_ROOT, "workspace-business-entry-registry.ts")) &&
    assertWorkspaceBusinessEntryShape(entry) &&
    assertBusinessEntryScope(entry.scope) &&
    entry.status === "BLOCKED" &&
    entry.entryState === "DISABLED" &&
    hasWorkspaceBusinessEntry(entry.scope.workspaceId) &&
    resolved?.entryState === "DISABLED" &&
    registered.workspaceId === entry.scope.workspaceId &&
    assertEntryConsumesOrchestrationOnly() &&
    assertEntryFoundationOnlyScope();

  return {
    valid,
    summary: [
      `p5Tag=${WORKSPACE_BUSINESS_RUNTIME_P5_TAG}`,
      describeWorkspaceBusinessEntry(entry),
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertEntryContract(): boolean {
  const entryPath = join(ENTRY_ROOT, "workspace-business-entry.ts");
  const content = readFileSync(entryPath, "utf8");
  return (
    content.includes("assertWorkspaceBusinessEntryShape") &&
    content.includes("describeWorkspaceBusinessEntry") &&
    content.includes("resolveBusinessEntryState") &&
    content.includes("resolveBusinessEntryStatus")
  );
}

export function assertEntryStateContract(): boolean {
  const typesPath = join(ENTRY_ROOT, "workspace-business-entry-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("BusinessEntryState") &&
    content.includes("DRAFT") &&
    content.includes("ACTIVE") &&
    content.includes("DISABLED")
  );
}

export function assertEntryFactoryContract(): boolean {
  const factoryPath = join(ENTRY_ROOT, "workspace-business-entry-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return (
    content.includes("createWorkspaceBusinessEntry") &&
    content.includes("WorkspaceBusinessOrchestration")
  );
}

export function assertEntryRegistryContract(): boolean {
  const registryPath = join(ENTRY_ROOT, "workspace-business-entry-registry.ts");
  const content = readFileSync(registryPath, "utf8");
  return (
    content.includes("registerWorkspaceBusinessEntry") &&
    content.includes("resolveWorkspaceBusinessEntry")
  );
}

export function assertEntryValidationContract(): boolean {
  const validationPath = join(ENTRY_ROOT, "workspace-business-entry-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return content.includes("validateWorkspaceBusinessEntry");
}

export function assertEntryConsumesOrchestrationOnly(): boolean {
  const entryFiles = [
    join(ENTRY_ROOT, "workspace-business-entry-factory.ts"),
    join(ENTRY_ROOT, "workspace-business-entry.ts"),
    join(ENTRY_ROOT, "workspace-business-entry-types.ts"),
    join(ENTRY_ROOT, "workspace-business-entry-registry.ts"),
  ];

  return entryFiles.every((file) => {
    const content = readFileSync(file, "utf8");
    if (buildForbiddenImportPatterns().some((pattern) => pattern.test(content))) {
      return false;
    }
    if (content.includes("@/lib/workspace-runtime")) {
      return false;
    }
    if (/\.\.\/context\//.test(content) && !/\.\.\/context\/workspace-business-context-types/.test(content)) {
      return false;
    }
    if (/\.\.\/domain\//.test(content) && !file.endsWith("workspace-business-entry-types.ts")) {
      return false;
    }
    if (/\.\.\/orchestration\//.test(content) && file.endsWith("workspace-business-entry-registry.ts")) {
      return false;
    }
    return true;
  });
}

export function assertEntryFoundationOnlyScope(): boolean {
  const files = [
    join(ENTRY_ROOT, "workspace-business-entry.ts"),
    join(ENTRY_ROOT, "workspace-business-entry-types.ts"),
    join(ENTRY_ROOT, "workspace-business-entry-factory.ts"),
    join(ENTRY_ROOT, "workspace-business-entry-registry.ts"),
  ];
  const forbidden = buildFoundationForbiddenPatterns();
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedBusinessEntryState(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p5-entry-mounted" });
  const mountedAssembly = {
    ...assemblyContext,
    assembly: {
      ...assemblyContext.assembly,
      eligible: true,
      assembled: true,
      aggregateStatus: "assembled" as const,
      lifecycleStatus: "mounted" as const,
    },
  };
  const bridgeView = createWorkspaceBusinessBridge(mountedAssembly);
  const context = createWorkspaceBusinessContext(bridgeView);
  const domain = createWorkspaceBusinessDomain(context);
  const orchestration = createWorkspaceBusinessOrchestration(domain);
  const entry = createWorkspaceBusinessEntry(orchestration);
  return entry.status === "READY" && entry.entryState === "ACTIVE";
}

export function assertEntryAggregatesOrchestration(orchestration: WorkspaceBusinessOrchestration): boolean {
  const entry = createWorkspaceBusinessEntry(orchestration);
  return (
    entry.scope.workspaceId === orchestration.scope.workspaceId &&
    entry.scope.version === orchestration.scope.version &&
    entry.status === resolveBusinessEntryStatus(orchestration) &&
    entry.domainState === orchestration.domainState &&
    entry.orchestrationState === orchestration.orchestrationState &&
    entry.entryState === resolveBusinessEntryState(orchestration)
  );
}
