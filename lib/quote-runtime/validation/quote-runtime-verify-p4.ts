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
import { validateQuoteLifecycle } from "../lifecycle/quote-lifecycle-validation";
import { createQuoteLifecycleView } from "../lifecycle/quote-lifecycle-view";
import { validateQuoteLifecycleView } from "../lifecycle/quote-lifecycle-guards";
import { WORKSPACE_QUOTE_RUNTIME_P4_TAG } from "../lifecycle/freeze/v55-p4-meta";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const LIFECYCLE_ROOT = join(QUOTE_ROOT, "lifecycle");

export interface QuoteRuntimeP4Validation {
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
    /\.\.\/assembly\//,
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

function getP4LifecycleCoreFiles(): string[] {
  return [
    join(LIFECYCLE_ROOT, "quote-lifecycle-types.ts"),
    join(LIFECYCLE_ROOT, "quote-lifecycle-state.ts"),
    join(LIFECYCLE_ROOT, "quote-lifecycle-guards.ts"),
    join(LIFECYCLE_ROOT, "quote-lifecycle-registry.ts"),
    join(LIFECYCLE_ROOT, "quote-lifecycle-factory.ts"),
    join(LIFECYCLE_ROOT, "quote-lifecycle-view.ts"),
    join(LIFECYCLE_ROOT, "quote-lifecycle-validation.ts"),
  ];
}

export async function validateQuoteRuntimeP4(): Promise<QuoteRuntimeP4Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p4-quote-lifecycle-validate" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(snapshot);
  const lifecycleValidation = validateQuoteLifecycle(domainView);

  const valid =
    existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-view.ts")) &&
    existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-factory.ts")) &&
    lifecycleValidation.valid &&
    domainView.lifecyclePhase === "INTAKE" &&
    assertLifecycleTypesContract() &&
    assertLifecycleStateContract() &&
    assertLifecycleGuardsContract() &&
    assertLifecycleRegistryContract() &&
    assertLifecycleFactoryContract() &&
    assertLifecycleViewContract() &&
    assertLifecycleConsumesDomainViewOnly() &&
    assertLifecycleFoundationOnlyScope() &&
    assertMountedQuoteLifecycleReadiness();

  return {
    valid,
    summary: [
      `p4Tag=${WORKSPACE_QUOTE_RUNTIME_P4_TAG}`,
      lifecycleValidation.summary,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertLifecycleTypesContract(): boolean {
  const typesPath = join(LIFECYCLE_ROOT, "quote-lifecycle-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("QuoteLifecycleView") &&
    content.includes("QuoteLifecyclePhase") &&
    content.includes("QuoteLifecycleStatus")
  );
}

export function assertLifecycleStateContract(): boolean {
  const statePath = join(LIFECYCLE_ROOT, "quote-lifecycle-state.ts");
  const content = readFileSync(statePath, "utf8");
  return content.includes("resolveQuoteLifecycleStatus");
}

export function assertLifecycleGuardsContract(): boolean {
  const guardsPath = join(LIFECYCLE_ROOT, "quote-lifecycle-guards.ts");
  const content = readFileSync(guardsPath, "utf8");
  return content.includes("validateQuoteLifecycleView");
}

export function assertLifecycleRegistryContract(): boolean {
  const registryPath = join(LIFECYCLE_ROOT, "quote-lifecycle-registry.ts");
  const content = readFileSync(registryPath, "utf8");
  return content.includes("createQuoteLifecycleRegistry");
}

export function assertLifecycleFactoryContract(): boolean {
  const factoryPath = join(LIFECYCLE_ROOT, "quote-lifecycle-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return content.includes("createQuoteLifecycleFactory");
}

export function assertLifecycleViewContract(): boolean {
  const viewPath = join(LIFECYCLE_ROOT, "quote-lifecycle-view.ts");
  const content = readFileSync(viewPath, "utf8");
  return content.includes("createQuoteLifecycleView") && content.includes("QuoteDomainView");
}

export function assertLifecycleConsumesDomainViewOnly(): boolean {
  return getP4LifecycleCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !buildForbiddenImportPatterns().some((pattern) => pattern.test(content));
  });
}

export function assertLifecycleFoundationOnlyScope(): boolean {
  const forbidden = buildFoundationForbiddenPatterns();
  return getP4LifecycleCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedQuoteLifecycleReadiness(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p4-quote-lifecycle-mounted" });
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
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(snapshot);
  const lifecycleView = createQuoteLifecycleView(domainView);
  return (
    lifecycleView.lifecyclePhase === "REVIEW" &&
    lifecycleView.lifecycleStatus === "READY" &&
    validateQuoteLifecycleView(lifecycleView).valid
  );
}
