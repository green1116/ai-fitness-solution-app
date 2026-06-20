import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { WorkspaceBusinessContext } from "../context/workspace-business-context-types";
import { createWorkspaceBusinessBridge } from "../bridge/workspace-runtime-bridge";
import { createWorkspaceBusinessContext } from "../context/workspace-business-context-factory";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceBusinessDomain } from "./workspace-business-domain-factory";
import {
  assertBusinessDomainScope,
  assertWorkspaceBusinessDomainShape,
  describeWorkspaceBusinessDomain,
} from "./workspace-business-domain";
import { WORKSPACE_BUSINESS_RUNTIME_P3_TAG } from "./workspace-business-domain-meta";
import {
  resolveBusinessDomainState,
  resolveBusinessDomainStatus,
} from "./workspace-business-domain-rules";
import type { WorkspaceBusinessDomainValidation } from "./workspace-business-domain-types";

const DOMAIN_ROOT = join(process.cwd(), "lib", "workspace-business-runtime", "domain");

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
  ];
}

function buildFoundationForbiddenPatterns(): RegExp[] {
  const quoteAction = ["create", "Quote"].join("");
  const calculateQuoteAction = ["calculate", "Quote"].join("");
  const projectAction = ["create", "Project"].join("");
  const reportAction = ["create", "Report"].join("");
  const workflowAction = ["execute", "Workflow"].join("");
  const orchestrationToken = "orchestrat";
  const quoteRuntimeToken = ["Quote", "Runtime"].join("");
  const projectRuntimeToken = ["Project", "Runtime"].join("");
  const reportRuntimeToken = ["Report", "Runtime"].join("");
  return [
    new RegExp(quoteAction),
    new RegExp(calculateQuoteAction),
    new RegExp(projectAction),
    new RegExp(reportAction),
    new RegExp(workflowAction),
    /approve\s*\(/,
    /dispatch\s*\(/,
    new RegExp(orchestrationToken, "i"),
    new RegExp(quoteRuntimeToken),
    new RegExp(projectRuntimeToken),
    new RegExp(reportRuntimeToken),
    /business-entry\//,
    new RegExp(["create", "BusinessEntry"].join("")),
  ];
}

export async function validateWorkspaceBusinessDomain(): Promise<WorkspaceBusinessDomainValidation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p3-domain-validate" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);
  const domain = createWorkspaceBusinessDomain(context);

  const valid =
    existsSync(join(DOMAIN_ROOT, "workspace-business-domain.ts")) &&
    existsSync(join(DOMAIN_ROOT, "workspace-business-domain-types.ts")) &&
    existsSync(join(DOMAIN_ROOT, "workspace-business-domain-factory.ts")) &&
    existsSync(join(DOMAIN_ROOT, "workspace-business-domain-rules.ts")) &&
    assertWorkspaceBusinessDomainShape(domain) &&
    assertBusinessDomainScope(domain.scope) &&
    domain.status === "BLOCKED" &&
    domain.state === "INITIALIZING" &&
    assertDomainConsumesContextOnly() &&
    assertDomainFoundationOnlyScope();

  return {
    valid,
    summary: [
      `p3Tag=${WORKSPACE_BUSINESS_RUNTIME_P3_TAG}`,
      describeWorkspaceBusinessDomain(domain),
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertDomainContract(): boolean {
  const domainPath = join(DOMAIN_ROOT, "workspace-business-domain.ts");
  const content = readFileSync(domainPath, "utf8");
  return (
    content.includes("assertWorkspaceBusinessDomainShape") &&
    content.includes("describeWorkspaceBusinessDomain")
  );
}

export function assertDomainStateContract(): boolean {
  const typesPath = join(DOMAIN_ROOT, "workspace-business-domain-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("BusinessDomainState") &&
    content.includes("INITIALIZING") &&
    content.includes("ACTIVE") &&
    content.includes("LIMITED")
  );
}

export function assertDomainFactoryContract(): boolean {
  const factoryPath = join(DOMAIN_ROOT, "workspace-business-domain-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return (
    content.includes("createWorkspaceBusinessDomain") &&
    content.includes("WorkspaceBusinessContext")
  );
}

export function assertDomainRulesContract(): boolean {
  const rulesPath = join(DOMAIN_ROOT, "workspace-business-domain-rules.ts");
  const content = readFileSync(rulesPath, "utf8");
  return (
    content.includes("resolveBusinessDomainState") &&
    content.includes("resolveBusinessDomainStatus")
  );
}

export function assertDomainValidationContract(): boolean {
  const validationPath = join(DOMAIN_ROOT, "workspace-business-domain-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return content.includes("validateWorkspaceBusinessDomain");
}

export function assertDomainConsumesContextOnly(): boolean {
  const domainFiles = [
    join(DOMAIN_ROOT, "workspace-business-domain-factory.ts"),
    join(DOMAIN_ROOT, "workspace-business-domain.ts"),
    join(DOMAIN_ROOT, "workspace-business-domain-types.ts"),
    join(DOMAIN_ROOT, "workspace-business-domain-rules.ts"),
  ];

  return domainFiles.every((file) => {
    const content = readFileSync(file, "utf8");
    if (buildForbiddenImportPatterns().some((pattern) => pattern.test(content))) {
      return false;
    }
    if (content.includes("@/lib/workspace-runtime")) {
      return false;
    }
    if (content.includes("../bridge/")) {
      return false;
    }
    return true;
  });
}

export function assertDomainFoundationOnlyScope(): boolean {
  const files = [
    join(DOMAIN_ROOT, "workspace-business-domain.ts"),
    join(DOMAIN_ROOT, "workspace-business-domain-types.ts"),
    join(DOMAIN_ROOT, "workspace-business-domain-factory.ts"),
    join(DOMAIN_ROOT, "workspace-business-domain-rules.ts"),
  ];
  const forbidden = buildFoundationForbiddenPatterns();
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedBusinessDomainState(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p3-domain-mounted" });
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
  return domain.status === "READY" && domain.state === "ACTIVE";
}

export function assertDomainAggregatesContext(context: WorkspaceBusinessContext): boolean {
  const domain = createWorkspaceBusinessDomain(context);
  return (
    domain.scope.workspaceId === context.scope.workspaceId &&
    domain.scope.version === context.scope.version &&
    domain.status === resolveBusinessDomainStatus(context) &&
    domain.state === resolveBusinessDomainState(context)
  );
}
