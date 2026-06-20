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
import { createWorkspaceQuoteRuntimeAssembly } from "../assembly/quote-runtime-assembly-view";
import { createWorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-snapshot";
import {
  assertApiPortContract,
  assertCommercialPortContract,
  assertPersistencePortContract,
  assertPortDefinitionInterfaceOnly,
  assertPortRegistryContract,
  assertPortTypesContract,
  validateQuotePorts,
} from "../ports/quote-port-guards";
import { validateQuotePortFoundation } from "../ports/quote-port-validation";
import { WORKSPACE_QUOTE_RUNTIME_P6_TAG } from "../ports/freeze/v55-p6-meta";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const PORTS_ROOT = join(QUOTE_ROOT, "ports");

export interface QuoteRuntimeP6Validation {
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
    new RegExp(prismaClient.replace("/", "\\/")),
    new RegExp(persistenceLayer),
    new RegExp(apiLayer),
    new RegExp(portalLayer),
    new RegExp(workflowRuntimeToken),
    new RegExp(executeWorkflowAction),
    /\/api\/handlers\//,
    /@\/lib\/workspace-business-runtime/,
    /@\/lib\/workspace-runtime/,
    /\.\.\/bridge\//,
    /\.\.\/context\//,
    /\.\.\/domain\//,
    /\.\.\/lifecycle\//,
  ];
}

function buildImplementationForbiddenPatterns(): RegExp[] {
  const createQuoteAction = ["create", "Quote"].join("");
  const calculateQuoteAction = ["calculate", "Quote"].join("");
  const submitQuoteAction = ["submit", "Quote"].join("");
  const executeWorkflowAction = ["execute", "Workflow"].join("");
  return [
    /\bclass\s+/,
    new RegExp(createQuoteAction + "\\s*\\("),
    new RegExp(calculateQuoteAction + "\\s*\\("),
    new RegExp(submitQuoteAction + "\\s*\\("),
    new RegExp(executeWorkflowAction + "\\s*\\("),
    /transition\s*\(/,
    /persistenceRepositories/,
    /from\s+["']@\/lib\/prisma["']/,
  ];
}

function getP6PortCoreFiles(): string[] {
  return [
    join(PORTS_ROOT, "quote-port-types.ts"),
    join(PORTS_ROOT, "quote-persistence.port.ts"),
    join(PORTS_ROOT, "quote-api-exposure.port.ts"),
    join(PORTS_ROOT, "quote-commercial.port.ts"),
    join(PORTS_ROOT, "quote-port-registry.ts"),
    join(PORTS_ROOT, "quote-port-guards.ts"),
    join(PORTS_ROOT, "quote-port-validation.ts"),
  ];
}

export async function validateQuoteRuntimeP6(): Promise<QuoteRuntimeP6Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p6-quote-port-validate" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
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
  const runtimeSnapshot = createWorkspaceQuoteRuntimeSnapshot(runtimeAssembly);
  const portValidation = validateQuotePortFoundation(runtimeSnapshot);
  const portGuards = validateQuotePorts();

  const valid =
    portGuards.valid &&
    portValidation.valid &&
    runtimeSnapshot.runtimeState === "SHELL" &&
    assertPortConsumesAssemblySnapshotOnly() &&
    assertPortNoImplementationLogic();

  return {
    valid,
    summary: [
      `p6Tag=${WORKSPACE_QUOTE_RUNTIME_P6_TAG}`,
      portGuards.summary,
      portValidation.summary,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertPortConsumesAssemblySnapshotOnly(): boolean {
  return getP6PortCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !buildForbiddenImportPatterns().some((pattern) => pattern.test(content));
  });
}

export function assertPortNoImplementationLogic(): boolean {
  const forbidden = buildImplementationForbiddenPatterns();
  return getP6PortCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export {
  assertApiPortContract,
  assertCommercialPortContract,
  assertPersistencePortContract,
  assertPortDefinitionInterfaceOnly,
  assertPortRegistryContract,
  assertPortTypesContract,
};
