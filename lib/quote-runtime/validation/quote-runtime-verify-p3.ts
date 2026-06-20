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
import { validateQuoteDomainView } from "../domain/quote-domain-guards";
import { validateQuoteDomain } from "../domain/quote-domain-validation";
import { WORKSPACE_QUOTE_RUNTIME_P3_TAG } from "../domain/freeze/v55-p3-meta";
import type { QuoteDomainValidation } from "../domain/quote-domain-types";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const DOMAIN_ROOT = join(QUOTE_ROOT, "domain");

export interface QuoteRuntimeP3Validation {
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
    /\.\.\/lifecycle\//,
    /\.\.\/assembly\//,
  ];
}

function buildFoundationForbiddenPatterns(): RegExp[] {
  return [
    /createQuote\s*\(/,
    /calculateQuote\s*\(/,
    /executeWorkflow\s*\(/,
    /transition\s*\(/,
  ];
}

function getP3DomainCoreFiles(): string[] {
  return [
    join(DOMAIN_ROOT, "quote-domain-types.ts"),
    join(DOMAIN_ROOT, "quote-domain-state.ts"),
    join(DOMAIN_ROOT, "quote-domain-guards.ts"),
    join(DOMAIN_ROOT, "quote-domain-registry.ts"),
    join(DOMAIN_ROOT, "quote-domain-factory.ts"),
    join(DOMAIN_ROOT, "quote-domain-view.ts"),
    join(DOMAIN_ROOT, "quote-domain-validation.ts"),
  ];
}

export async function validateQuoteRuntimeP3(): Promise<QuoteRuntimeP3Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p3-quote-domain-validate" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const domainValidation = validateQuoteDomain(snapshot);

  const valid =
    existsSync(join(DOMAIN_ROOT, "quote-domain-view.ts")) &&
    existsSync(join(DOMAIN_ROOT, "quote-domain-factory.ts")) &&
    domainValidation.valid &&
    snapshot.quoteReadiness === "BLOCKED" &&
    assertDomainTypesContract() &&
    assertDomainStateContract() &&
    assertDomainGuardsContract() &&
    assertDomainRegistryContract() &&
    assertDomainFactoryContract() &&
    assertDomainViewContract() &&
    assertDomainConsumesContextSnapshotOnly() &&
    assertDomainFoundationOnlyScope() &&
    assertMountedQuoteDomainReadiness();

  return {
    valid,
    summary: [
      `p3Tag=${WORKSPACE_QUOTE_RUNTIME_P3_TAG}`,
      domainValidation.summary,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertDomainTypesContract(): boolean {
  const typesPath = join(DOMAIN_ROOT, "quote-domain-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("QuoteDomainView") &&
    content.includes("QuoteDomainState") &&
    content.includes("QuoteDomainLifecyclePhase")
  );
}

export function assertDomainStateContract(): boolean {
  const statePath = join(DOMAIN_ROOT, "quote-domain-state.ts");
  const content = readFileSync(statePath, "utf8");
  return content.includes("resolveQuoteDomainState") && content.includes("resolveQuoteDomainLifecyclePhase");
}

export function assertDomainGuardsContract(): boolean {
  const guardsPath = join(DOMAIN_ROOT, "quote-domain-guards.ts");
  const content = readFileSync(guardsPath, "utf8");
  return content.includes("validateQuoteDomainView");
}

export function assertDomainRegistryContract(): boolean {
  const registryPath = join(DOMAIN_ROOT, "quote-domain-registry.ts");
  const content = readFileSync(registryPath, "utf8");
  return content.includes("createQuoteDomainRegistry");
}

export function assertDomainFactoryContract(): boolean {
  const factoryPath = join(DOMAIN_ROOT, "quote-domain-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return content.includes("createQuoteDomainFactory");
}

export function assertDomainViewContract(): boolean {
  const viewPath = join(DOMAIN_ROOT, "quote-domain-view.ts");
  const content = readFileSync(viewPath, "utf8");
  return content.includes("createQuoteDomainView") && content.includes("QuoteContextSnapshot");
}

export function assertDomainConsumesContextSnapshotOnly(): boolean {
  return getP3DomainCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !buildForbiddenImportPatterns().some((pattern) => pattern.test(content));
  });
}

export function assertDomainFoundationOnlyScope(): boolean {
  const forbidden = buildFoundationForbiddenPatterns();
  return getP3DomainCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedQuoteDomainReadiness(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p3-quote-domain-mounted" });
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
  const view = createQuoteDomainView(snapshot);
  return (
    view.quoteReadiness === "READY" &&
    view.lifecyclePhase === "REVIEW" &&
    view.domainState === "ACTIVE" &&
    validateQuoteDomainView(view).valid
  );
}

export type { QuoteDomainValidation };
