import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  createWorkspaceBusinessBridge,
  createWorkspaceBusinessContext,
  createWorkspaceBusinessDomain,
  createWorkspaceBusinessEntry,
  createWorkspaceBusinessOrchestration,
} from "@/lib/workspace-business-runtime";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { assertQuoteBridgeViewShape, describeQuoteBridgeView } from "../bridge/quote-bridge";
import { createQuoteBridgeFromBusinessViews } from "../bridge/create-quote-bridge";
import {
  assertQuoteRuntimeContextShape,
  createQuoteRuntimeContext,
} from "../context/quote-runtime-context";
import {
  assertWorkspaceQuoteRuntimeShape,
  createWorkspaceQuoteRuntime,
  describeWorkspaceQuoteRuntime,
} from "../assembly/create-workspace-quote-runtime";
import { WORKSPACE_QUOTE_RUNTIME_P1_TAG } from "../shared/quote-constants";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");

export interface QuoteRuntimeP1Validation {
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

function getQuoteCoreFiles(): string[] {
  return [
    join(QUOTE_ROOT, "bridge", "quote-bridge.ts"),
    join(QUOTE_ROOT, "bridge", "quote-bridge-view.ts"),
    join(QUOTE_ROOT, "bridge", "create-quote-bridge.ts"),
    join(QUOTE_ROOT, "context", "quote-runtime-context.ts"),
    join(QUOTE_ROOT, "assembly", "create-workspace-quote-runtime.ts"),
  ];
}

export async function validateQuoteRuntimeP1(): Promise<QuoteRuntimeP1Validation> {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p1-quote-bridge-validate" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createQuoteRuntimeContext(quoteBridge);
  const quoteRuntime = createWorkspaceQuoteRuntime({ entry: businessEntry, bridgeView: businessBridge });

  const valid =
    existsSync(join(QUOTE_ROOT, "bridge", "create-quote-bridge.ts")) &&
    existsSync(join(QUOTE_ROOT, "context", "quote-runtime-context.ts")) &&
    assertQuoteBridgeViewShape(quoteBridge) &&
    assertQuoteRuntimeContextShape(quoteContext) &&
    assertWorkspaceQuoteRuntimeShape(quoteRuntime) &&
    quoteBridge.quoteReadiness === "BLOCKED" &&
    quoteContext.quoteReadiness === "BLOCKED" &&
    quoteRuntime.context.entryState === "DISABLED" &&
    quoteRuntime.lifecyclePhase === "INTAKE" &&
    assertQuoteBridgeConsumesBusinessOnly() &&
    assertQuoteRuntimeFoundationOnlyScope();

  return {
    valid,
    summary: [
      `p1Tag=${WORKSPACE_QUOTE_RUNTIME_P1_TAG}`,
      describeQuoteBridgeView(quoteBridge),
      describeWorkspaceQuoteRuntime(quoteRuntime),
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertQuoteBridgeContract(): boolean {
  const bridgePath = join(QUOTE_ROOT, "bridge", "create-quote-bridge.ts");
  const content = readFileSync(bridgePath, "utf8");
  return (
    content.includes("createQuoteBridge") &&
    content.includes("createQuoteBridgeFromBusinessViews") &&
    content.includes("resolveQuoteSurfaceView")
  );
}

export function assertQuoteContextContract(): boolean {
  const contextPath = join(QUOTE_ROOT, "context", "quote-runtime-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("QuoteRuntimeContext") &&
    content.includes("createQuoteRuntimeContext") &&
    content.includes("quoteReadiness")
  );
}

export function assertQuoteBridgeConsumesBusinessOnly(): boolean {
  return getQuoteCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    if (buildForbiddenImportPatterns().some((pattern) => pattern.test(content))) {
      return false;
    }
    if (content.includes("@/lib/workspace-runtime")) {
      return false;
    }
    if (content.includes("../workspace-runtime")) {
      return false;
    }
    return true;
  });
}

export function assertQuoteRuntimeFoundationOnlyScope(): boolean {
  const files = [
    ...getQuoteCoreFiles(),
    join(QUOTE_ROOT, "domain", "quote-domain-state.ts"),
    join(QUOTE_ROOT, "lifecycle", "resolve-quote-lifecycle-phase.ts"),
  ];
  const forbidden = buildFoundationForbiddenPatterns();
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertMountedQuoteBridgeReadiness(): boolean {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "p1-quote-bridge-mounted" });
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
  const quoteRuntime = createWorkspaceQuoteRuntime({ entry: businessEntry, bridgeView: businessBridge });
  return (
    quoteBridge.quoteReadiness === "READY" &&
    quoteRuntime.domainState === "ACTIVE" &&
    quoteRuntime.lifecyclePhase === "REVIEW"
  );
}
