import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceBusinessBridge } from "../bridge/workspace-runtime-bridge";
import { createWorkspaceBusinessContext } from "../context/workspace-business-context-factory";
import { createWorkspaceBusinessDomain } from "../domain/workspace-business-domain-factory";
import type { WorkspaceBusinessDomain } from "../domain/workspace-business-domain-types";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceBusinessOrchestration } from "./workspace-business-orchestration-factory";
import {
  assertBusinessOrchestrationScope,
  assertWorkspaceBusinessOrchestrationShape,
  describeWorkspaceBusinessOrchestration,
} from "./workspace-business-orchestration";
import { WORKSPACE_BUSINESS_RUNTIME_P4_TAG } from "./workspace-business-orchestration-meta";
import {
  resolveBusinessOrchestrationState,
  resolveBusinessOrchestrationStatus,
} from "./workspace-business-orchestration-rules";
import type { WorkspaceBusinessOrchestrationValidation } from "./workspace-business-orchestration-types";

const ORCHESTRATION_ROOT = join(process.cwd(), "lib", "workspace-business-runtime", "orchestration");

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
    /business-entry\//,
    new RegExp(["create", "BusinessEntry"].join("")),
  ];
}

export async function validateWorkspaceBusinessOrchestration(): Promise<WorkspaceBusinessOrchestrationValidation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({
    workspaceId: "p4-orchestration-validate",
  });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);
  const domain = createWorkspaceBusinessDomain(context);
  const orchestration = createWorkspaceBusinessOrchestration(domain);

  const valid =
    existsSync(join(ORCHESTRATION_ROOT, "workspace-business-orchestration.ts")) &&
    existsSync(join(ORCHESTRATION_ROOT, "workspace-business-orchestration-types.ts")) &&
    existsSync(join(ORCHESTRATION_ROOT, "workspace-business-orchestration-factory.ts")) &&
    existsSync(join(ORCHESTRATION_ROOT, "workspace-business-orchestration-rules.ts")) &&
    assertWorkspaceBusinessOrchestrationShape(orchestration) &&
    assertBusinessOrchestrationScope(orchestration.scope) &&
    orchestration.status === "BLOCKED" &&
    orchestration.domainState === "INITIALIZING" &&
    orchestration.orchestrationState === "IDLE" &&
    assertOrchestrationConsumesDomainOnly() &&
    assertOrchestrationFoundationOnlyScope();

  return {
    valid,
    summary: [
      `p4Tag=${WORKSPACE_BUSINESS_RUNTIME_P4_TAG}`,
      describeWorkspaceBusinessOrchestration(orchestration),
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertOrchestrationContract(): boolean {
  const orchestrationPath = join(ORCHESTRATION_ROOT, "workspace-business-orchestration.ts");
  const content = readFileSync(orchestrationPath, "utf8");
  return (
    content.includes("assertWorkspaceBusinessOrchestrationShape") &&
    content.includes("describeWorkspaceBusinessOrchestration")
  );
}

export function assertOrchestrationStateContract(): boolean {
  const typesPath = join(ORCHESTRATION_ROOT, "workspace-business-orchestration-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("BusinessOrchestrationState") &&
    content.includes("IDLE") &&
    content.includes("READY") &&
    content.includes("LIMITED")
  );
}

export function assertOrchestrationFactoryContract(): boolean {
  const factoryPath = join(ORCHESTRATION_ROOT, "workspace-business-orchestration-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return (
    content.includes("createWorkspaceBusinessOrchestration") &&
    content.includes("WorkspaceBusinessDomain")
  );
}

export function assertOrchestrationRulesContract(): boolean {
  const rulesPath = join(ORCHESTRATION_ROOT, "workspace-business-orchestration-rules.ts");
  const content = readFileSync(rulesPath, "utf8");
  return (
    content.includes("resolveBusinessOrchestrationState") &&
    content.includes("resolveBusinessOrchestrationStatus")
  );
}

export function assertOrchestrationValidationContract(): boolean {
  const validationPath = join(
    ORCHESTRATION_ROOT,
    "workspace-business-orchestration-validation.ts",
  );
  const content = readFileSync(validationPath, "utf8");
  return content.includes("validateWorkspaceBusinessOrchestration");
}

export function assertOrchestrationConsumesDomainOnly(): boolean {
  const orchestrationFiles = [
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration-factory.ts"),
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration.ts"),
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration-types.ts"),
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration-rules.ts"),
  ];

  return orchestrationFiles.every((file) => {
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
    return true;
  });
}

export function assertOrchestrationFoundationOnlyScope(): boolean {
  const files = [
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration.ts"),
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration-types.ts"),
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration-factory.ts"),
    join(ORCHESTRATION_ROOT, "workspace-business-orchestration-rules.ts"),
  ];
  const forbidden = buildFoundationForbiddenPatterns();
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedBusinessOrchestrationState(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({
    workspaceId: "p4-orchestration-mounted",
  });
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
  return (
    orchestration.status === "READY" &&
    orchestration.domainState === "ACTIVE" &&
    orchestration.orchestrationState === "READY"
  );
}

export function assertOrchestrationAggregatesDomain(domain: WorkspaceBusinessDomain): boolean {
  const orchestration = createWorkspaceBusinessOrchestration(domain);
  return (
    orchestration.scope.workspaceId === domain.scope.workspaceId &&
    orchestration.scope.version === domain.scope.version &&
    orchestration.status === resolveBusinessOrchestrationStatus(domain) &&
    orchestration.domainState === domain.state &&
    orchestration.orchestrationState === resolveBusinessOrchestrationState(domain)
  );
}
