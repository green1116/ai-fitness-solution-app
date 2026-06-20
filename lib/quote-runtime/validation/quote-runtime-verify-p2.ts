import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createQuoteBridgeFromBusinessViews } from "../bridge/create-quote-bridge";
import {
  createWorkspaceBusinessBridge,
  createWorkspaceBusinessContext,
  createWorkspaceBusinessDomain,
  createWorkspaceBusinessEntry,
  createWorkspaceBusinessOrchestration,
} from "@/lib/workspace-business-runtime";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceQuoteRuntimeContext } from "../context/quote-context-factory";
import { validateQuoteRuntimeContext } from "../context/quote-context-guards";
import { createQuoteContextSnapshot } from "../context/quote-context-snapshot";
import { WORKSPACE_QUOTE_RUNTIME_P2_TAG } from "../freeze/v55-p2-meta";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const CONTEXT_ROOT = join(QUOTE_ROOT, "context");

export interface QuoteRuntimeP2Validation {
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
    /\.\.\/domain\//,
    /\.\.\/lifecycle\//,
    /\.\.\/assembly\//,
  ];
}

function buildFoundationForbiddenPatterns(): RegExp[] {
  return [
    /createQuote\s*\(/,
    /calculateQuote\s*\(/,
    /execute\s*\(/,
    /run\s*\(/,
    /dispatch\s*\(/,
    /transition\s*\(/,
  ];
}

function getP2ContextFiles(): string[] {
  return [
    join(CONTEXT_ROOT, "quote-context-factory.ts"),
    join(CONTEXT_ROOT, "quote-context-guards.ts"),
    join(CONTEXT_ROOT, "quote-context-snapshot.ts"),
    join(CONTEXT_ROOT, "create-quote-runtime-context.ts"),
    join(CONTEXT_ROOT, "workspace-quote-runtime-context-types.ts"),
  ];
}

export async function validateQuoteRuntimeP2(): Promise<QuoteRuntimeP2Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p2-quote-context-validate" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const validation = validateQuoteRuntimeContext(quoteContext);

  const valid =
    existsSync(join(CONTEXT_ROOT, "quote-context-factory.ts")) &&
    existsSync(join(CONTEXT_ROOT, "quote-context-guards.ts")) &&
    existsSync(join(CONTEXT_ROOT, "quote-context-snapshot.ts")) &&
    validation.valid &&
    quoteContext.quoteReadiness === "BLOCKED" &&
    quoteContext.lifecyclePhase === "INTAKE" &&
    quoteContext.domainState === "SUSPENDED" &&
    snapshot.quoteReadiness === quoteContext.quoteReadiness &&
    assertContextFactoryContract() &&
    assertContextGuardsContract() &&
    assertContextSnapshotContract() &&
    assertContextConsumesBridgeOnly() &&
    assertContextFoundationOnlyScope();

  return {
    valid,
    summary: [
      `p2Tag=${WORKSPACE_QUOTE_RUNTIME_P2_TAG}`,
      validation.summary,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertContextFactoryContract(): boolean {
  const factoryPath = join(CONTEXT_ROOT, "quote-context-factory.ts");
  const content = readFileSync(factoryPath, "utf8");
  return content.includes("createWorkspaceQuoteRuntimeContext") && content.includes("QuoteBridgeView");
}

export function assertContextGuardsContract(): boolean {
  const guardsPath = join(CONTEXT_ROOT, "quote-context-guards.ts");
  const content = readFileSync(guardsPath, "utf8");
  return content.includes("validateQuoteRuntimeContext");
}

export function assertContextSnapshotContract(): boolean {
  const snapshotPath = join(CONTEXT_ROOT, "quote-context-snapshot.ts");
  const content = readFileSync(snapshotPath, "utf8");
  return content.includes("createQuoteContextSnapshot") && content.includes("QuoteContextSnapshot");
}

export function assertContextConsumesBridgeOnly(): boolean {
  return getP2ContextFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return (
      !buildForbiddenImportPatterns().some((pattern) => pattern.test(content)) &&
      !/\.\.\/domain\//.test(content) &&
      !/\.\.\/lifecycle\//.test(content) &&
      !/\.\.\/assembly\//.test(content)
    );
  });
}

export function assertContextFoundationOnlyScope(): boolean {
  const forbidden = buildFoundationForbiddenPatterns();
  return getP2ContextFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedQuoteContextReadiness(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p2-quote-context-mounted" });
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
  return (
    quoteContext.quoteReadiness === "READY" &&
    quoteContext.lifecyclePhase === "REVIEW" &&
    quoteContext.domainState === "ACTIVE"
  );
}
