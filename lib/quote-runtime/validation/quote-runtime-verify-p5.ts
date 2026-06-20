import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import {
  createWorkspaceBusinessBridge,
  createWorkspaceBusinessContext,
  createWorkspaceBusinessDomain,
  createWorkspaceBusinessEntry,
  createWorkspaceBusinessOrchestration,
} from "@/lib/workspace-business-runtime";
import { createQuoteBridgeFromBusinessViews } from "../bridge/create-quote-bridge";
import { createQuoteContextSnapshot } from "../context/quote-context-snapshot";
import { createWorkspaceQuoteRuntimeContext } from "../context/quote-context-factory";
import { createQuoteDomainView } from "../domain/quote-domain-view";
import { createQuoteLifecycleView } from "../lifecycle/quote-lifecycle-view";
import { validateWorkspaceQuoteRuntime } from "../assembly/quote-runtime-assembly-validation";
import { createWorkspaceQuoteRuntimeAssembly } from "../assembly/quote-runtime-assembly-view";
import { validateWorkspaceQuoteRuntimeAssembly } from "../assembly/quote-runtime-assembly-guards";
import { WORKSPACE_QUOTE_RUNTIME_P5_TAG } from "../assembly/freeze/v55-p5-meta";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const ASSEMBLY_ROOT = join(QUOTE_ROOT, "assembly");

export interface QuoteRuntimeP5Validation {
  valid: boolean;
  summary: string;
}

function buildForbiddenImportPatterns(): RegExp[] {
  const prismaClient = ["@prisma", "/client"].join("");
  const persistenceLayer = ["saas-product-", "persistence"].join("");
  const apiLayer = ["saas-product-", "api"].join("");
  const portalLayer = ["saas-product-", "portal"].join("");
  const workflowRuntimeToken = ["Workflow", "Runtime"].join("");
  const executeWorkflowAction = ["execute", "Workflow"].join("");
  return [
    new RegExp(persistenceLayer),
    new RegExp(apiLayer),
    new RegExp(portalLayer),
    new RegExp(prismaClient.replace("/", "\\/")),
    new RegExp(workflowRuntimeToken),
    new RegExp(executeWorkflowAction),
    /\/api\/handlers\//,
    /@\/lib\/workspace-business-runtime/,
    /@\/lib\/workspace-runtime/,
    /\.\.\/bridge\//,
    /\.\.\/context\//,
    /\.\.\/domain\//,
  ];
}

function buildFoundationForbiddenPatterns(): RegExp[] {
  return [
    /createQuote\s*\(/,
    /calculateQuote\s*\(/,
    /submitQuote\s*\(/,
    /executeWorkflow\s*\(/,
    /transition\s*\(/,
  ];
}

function getP5AssemblyCoreFiles(): string[] {
  return [
    join(ASSEMBLY_ROOT, "quote-runtime-assembly-types.ts"),
    join(ASSEMBLY_ROOT, "quote-runtime-assembly-view.ts"),
    join(ASSEMBLY_ROOT, "quote-runtime-assembly-factory.ts"),
    join(ASSEMBLY_ROOT, "quote-runtime-assembly-guards.ts"),
    join(ASSEMBLY_ROOT, "quote-runtime-assembly-validation.ts"),
    join(ASSEMBLY_ROOT, "quote-runtime-snapshot.ts"),
  ];
}

export async function validateQuoteRuntimeP5(): Promise<QuoteRuntimeP5Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p5-quote-assembly-validate" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(snapshot);
  const lifecycleView = createQuoteLifecycleView(domainView);
  const assemblyValidation = validateWorkspaceQuoteRuntime(lifecycleView);

  const valid =
    existsSync(join(ASSEMBLY_ROOT, "quote-runtime-assembly-view.ts")) &&
    existsSync(join(ASSEMBLY_ROOT, "quote-runtime-snapshot.ts")) &&
    assemblyValidation.valid &&
    lifecycleView.lifecycleStatus === "PENDING" &&
    assertAssemblyTypesContract() &&
    assertAssemblyViewContract() &&
    assertAssemblyFactoryContract() &&
    assertAssemblyGuardsContract() &&
    assertAssemblySnapshotContract() &&
    assertAssemblyConsumesLifecycleViewOnly() &&
    assertAssemblyFoundationOnlyScope() &&
    assertMountedQuoteRuntimeAssemblyReadiness();

  return {
    valid,
    summary: [
      `p5Tag=${WORKSPACE_QUOTE_RUNTIME_P5_TAG}`,
      assemblyValidation.summary,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertAssemblyTypesContract(): boolean {
  const typesPath = join(ASSEMBLY_ROOT, "quote-runtime-assembly-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("WorkspaceQuoteRuntimeAssembly") &&
    content.includes("WorkspaceQuoteRuntimeSnapshot") &&
    content.includes("runtimeState")
  );
}

export function assertAssemblyViewContract(): boolean {
  const viewPath = join(ASSEMBLY_ROOT, "quote-runtime-assembly-view.ts");
  const content = readFileSync(viewPath, "utf8");
  return (
    content.includes("createWorkspaceQuoteRuntimeAssembly") &&
    content.includes("QuoteLifecycleView")
  );
}

export function assertAssemblyFactoryContract(): boolean {
  const factoryPath = join(ASSEMBLY_ROOT, "quote-runtime-assembly-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return content.includes("createWorkspaceQuoteRuntimeAssemblyFactory");
}

export function assertAssemblyGuardsContract(): boolean {
  const guardsPath = join(ASSEMBLY_ROOT, "quote-runtime-assembly-guards.ts");
  const content = readFileSync(guardsPath, "utf8");
  return content.includes("validateWorkspaceQuoteRuntimeAssembly");
}

export function assertAssemblySnapshotContract(): boolean {
  const snapshotPath = join(ASSEMBLY_ROOT, "quote-runtime-snapshot.ts");
  const content = readFileSync(snapshotPath, "utf8");
  return content.includes("createWorkspaceQuoteRuntimeSnapshot");
}

export function assertAssemblyConsumesLifecycleViewOnly(): boolean {
  return getP5AssemblyCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !buildForbiddenImportPatterns().some((pattern) => pattern.test(content));
  });
}

export function assertAssemblyFoundationOnlyScope(): boolean {
  const forbidden = buildFoundationForbiddenPatterns();
  return getP5AssemblyCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedQuoteRuntimeAssemblyReadiness(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p5-quote-assembly-mounted" });
  const quoteSurfaceEntry = assemblyContext.surfaceContext.surface.entries.quote;
  const mountedAssembly = {
    ...assemblyContext,
    assembly: {
      ...assemblyContext.assembly,
      eligible: true,
      assembled: true,
      aggregateStatus: "assembled" as const,
      lifecycleStatus: "mounted" as const,
    },
    surfaceContext: {
      ...assemblyContext.surfaceContext,
      surface: {
        ...assemblyContext.surfaceContext.surface,
        entries: {
          ...assemblyContext.surfaceContext.surface.entries,
          quote: {
            ...quoteSurfaceEntry,
            status: "active" as const,
            eligible: true,
          },
        },
      },
    },
  };
  const businessBridge = createWorkspaceBusinessBridge(mountedAssembly);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const contextSnapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(contextSnapshot);
  const lifecycleView = createQuoteLifecycleView(domainView);
  const runtimeAssembly = createWorkspaceQuoteRuntimeAssembly(lifecycleView);
  return (
    runtimeAssembly.lifecycleStatus === "READY" &&
    runtimeAssembly.runtimeState === "ACTIVE" &&
    validateWorkspaceQuoteRuntimeAssembly(runtimeAssembly).valid
  );
}
