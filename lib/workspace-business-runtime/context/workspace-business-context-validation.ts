import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { WorkspaceBusinessBridgeView } from "../bridge/workspace-runtime-bridge-types";
import { createWorkspaceBusinessBridge } from "../bridge/workspace-runtime-bridge";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import {
  assertBusinessScope,
  assertWorkspaceBusinessContextShape,
  describeWorkspaceBusinessContext,
} from "./workspace-business-context";
import { createWorkspaceBusinessContext } from "./workspace-business-context-factory";
import type { WorkspaceBusinessContextValidation } from "./workspace-business-context-types";
import { WORKSPACE_BUSINESS_RUNTIME_P2_TAG } from "./workspace-business-context-meta";

const CONTEXT_ROOT = join(process.cwd(), "lib", "workspace-business-runtime", "context");

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
    /\/domains\//,
  ];
}

function buildFoundationForbiddenPatterns(): RegExp[] {
  const quoteAction = ["create", "Quote"].join("");
  const calculateQuoteAction = ["calculate", "Quote"].join("");
  const projectAction = ["create", "Project"].join("");
  const reportAction = ["create", "Report"].join("");
  const workflowAction = ["execute", "Workflow"].join("");
  const orchestrationToken = "orchestrat";
  return [
    new RegExp(quoteAction),
    new RegExp(calculateQuoteAction),
    new RegExp(projectAction),
    new RegExp(reportAction),
    new RegExp(workflowAction),
    /approve\s*\(/,
    /calculate\s*\(/,
    new RegExp(orchestrationToken, "i"),
    new RegExp(["Quote", "Domain"].join("")),
    new RegExp(["Project", "Domain"].join("")),
    new RegExp(["Report", "Domain"].join("")),
    new RegExp(["Workspace", "Domain"].join("")),
    /business-entry\//,
    new RegExp(["create", "BusinessEntry"].join("")),
  ];
}

export async function validateWorkspaceBusinessContext(): Promise<WorkspaceBusinessContextValidation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p2-context-validate" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);

  const valid =
    existsSync(join(CONTEXT_ROOT, "workspace-business-context.ts")) &&
    existsSync(join(CONTEXT_ROOT, "workspace-business-context-types.ts")) &&
    existsSync(join(CONTEXT_ROOT, "workspace-business-context-factory.ts")) &&
    assertWorkspaceBusinessContextShape(context) &&
    assertBusinessScope(context.scope) &&
    context.readiness.readiness === "BLOCKED" &&
    assertContextConsumesBridgeOnly() &&
    assertContextFoundationOnlyScope();

  return {
    valid,
    summary: [
      `p2Tag=${WORKSPACE_BUSINESS_RUNTIME_P2_TAG}`,
      describeWorkspaceBusinessContext(context),
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertBusinessContextContract(): boolean {
  const contextPath = join(CONTEXT_ROOT, "workspace-business-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("assertWorkspaceBusinessContextShape") &&
    content.includes("describeWorkspaceBusinessContext") &&
    content.includes("resolveBusinessStatus")
  );
}

export function assertBusinessScopeContract(): boolean {
  const typesPath = join(CONTEXT_ROOT, "workspace-business-context-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return content.includes("BusinessScope") && content.includes("workspaceId") && content.includes("version");
}

export function assertContextFactoryContract(): boolean {
  const factoryPath = join(CONTEXT_ROOT, "workspace-business-context-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return (
    content.includes("createWorkspaceBusinessContext") &&
    content.includes("WorkspaceBusinessBridgeView")
  );
}

export function assertContextValidationContract(): boolean {
  const validationPath = join(CONTEXT_ROOT, "workspace-business-context-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return content.includes("validateWorkspaceBusinessContext");
}

export function assertContextConsumesBridgeOnly(): boolean {
  const contextFiles = [
    join(CONTEXT_ROOT, "workspace-business-context-factory.ts"),
    join(CONTEXT_ROOT, "workspace-business-context.ts"),
    join(CONTEXT_ROOT, "workspace-business-context-types.ts"),
  ];
  const forbiddenImports = buildForbiddenImportPatterns();

  return contextFiles.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbiddenImports.some((pattern) => pattern.test(content));
  });
}

export function assertContextFoundationOnlyScope(): boolean {
  const files = [
    join(CONTEXT_ROOT, "workspace-business-context.ts"),
    join(CONTEXT_ROOT, "workspace-business-context-types.ts"),
    join(CONTEXT_ROOT, "workspace-business-context-factory.ts"),
  ];
  const forbidden = buildFoundationForbiddenPatterns();
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedBusinessContextReadiness(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p2-context-mounted" });
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
  return context.readiness.readiness === "READY";
}

export function assertContextAggregatesBridgeView(bridgeView: WorkspaceBusinessBridgeView): boolean {
  const context = createWorkspaceBusinessContext(bridgeView);
  return (
    context.scope.workspaceId === bridgeView.workspaceId &&
    context.scope.version === bridgeView.version &&
    context.readiness.readiness === bridgeView.readiness.readiness &&
    context.surfaces.length === bridgeView.surfaces.length &&
    context.entries.length === bridgeView.entries.length
  );
}
