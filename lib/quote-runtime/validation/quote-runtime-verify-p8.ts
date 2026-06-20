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
  assertWorkspaceQuoteSurfaceAligned,
  resolveWorkspaceQuoteAlignment,
} from "../alignment/quote-workspace-alignment";
import { validateWorkspaceQuoteAlignment } from "../alignment/quote-workspace-validation";
import { WORKSPACE_QUOTE_RUNTIME_P8_TAG } from "../alignment/freeze/v55-p8-meta";
import { assertV55FoundationIntegrityLocked } from "./quote-runtime-integrity";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const ALIGNMENT_ROOT = join(QUOTE_ROOT, "alignment");

export interface QuoteRuntimeP8Validation {
  valid: boolean;
  summary: string;
}

function buildQuoteRuntimeSnapshot(workspaceId: string) {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId });
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
  return createWorkspaceQuoteRuntimeSnapshot(runtimeAssembly);
}

function getP8AlignmentCoreFiles(): string[] {
  return [
    join(ALIGNMENT_ROOT, "quote-workspace-alignment.ts"),
    join(ALIGNMENT_ROOT, "quote-workspace-surface.ts"),
    join(ALIGNMENT_ROOT, "quote-workspace-registry.ts"),
    join(ALIGNMENT_ROOT, "quote-workspace-validation.ts"),
  ];
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
    /\.\.\/bridge\//,
    /\.\.\/context\//,
    /\.\.\/domain\//,
    /\.\.\/lifecycle\//,
    /\.\.\/ports\//,
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

export async function validateQuoteRuntimeP8(): Promise<QuoteRuntimeP8Validation> {
  const workspaceId = "p8-quote-alignment-validate";
  const runtimeSnapshot = buildQuoteRuntimeSnapshot(workspaceId);
  const alignmentValidation = validateWorkspaceQuoteAlignment(runtimeSnapshot);

  const valid =
    alignmentValidation.valid &&
    runtimeSnapshot.runtimeState === "SHELL" &&
    assertWorkspaceAlignmentContract() &&
    assertWorkspaceSurfaceContract() &&
    assertWorkspaceRegistryContract() &&
    assertWorkspaceValidationContract() &&
    assertAlignmentConsumesSnapshotAndSurfaceOnly() &&
    assertAlignmentFoundationOnlyScope() &&
    assertMountedWorkspaceQuoteSurfaceAligned();

  return {
    valid,
    summary: [
      `p8Tag=${WORKSPACE_QUOTE_RUNTIME_P8_TAG}`,
      alignmentValidation.summary,
      `integrityLocked=${assertV55FoundationIntegrityLocked(workspaceId)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertWorkspaceAlignmentContract(): boolean {
  const path = join(ALIGNMENT_ROOT, "quote-workspace-alignment.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("resolveWorkspaceQuoteAlignment") &&
    content.includes("assertWorkspaceQuoteSurfaceAligned")
  );
}

export function assertWorkspaceSurfaceContract(): boolean {
  const path = join(ALIGNMENT_ROOT, "quote-workspace-surface.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createWorkspaceQuoteSurface") && content.includes("WorkspaceQuoteSurface");
}

export function assertWorkspaceRegistryContract(): boolean {
  const path = join(ALIGNMENT_ROOT, "quote-workspace-registry.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createWorkspaceQuoteRegistry");
}

export function assertWorkspaceValidationContract(): boolean {
  const path = join(ALIGNMENT_ROOT, "quote-workspace-validation.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("validateWorkspaceQuoteAlignment");
}

export function assertAlignmentConsumesSnapshotAndSurfaceOnly(): boolean {
  return getP8AlignmentCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !buildForbiddenImportPatterns().some((pattern) => pattern.test(content));
  });
}

export function assertAlignmentFoundationOnlyScope(): boolean {
  const forbidden = buildImplementationForbiddenPatterns();
  return getP8AlignmentCoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export function assertWorkspaceQuoteSurfaceAlignedForSnapshot(workspaceId: string): boolean {
  const runtimeSnapshot = buildQuoteRuntimeSnapshot(workspaceId);
  return validateWorkspaceQuoteAlignment(runtimeSnapshot).valid;
}

export function assertMountedWorkspaceQuoteSurfaceAligned(): boolean {
  const workspaceId = "p8-quote-alignment-mounted";
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId });
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
  const runtimeSnapshot = createWorkspaceQuoteRuntimeSnapshot(runtimeAssembly);
  const alignment = resolveWorkspaceQuoteAlignment(
    runtimeSnapshot,
    mountedAssembly.surfaceContext.surface.entries.quote,
  );
  return (
    runtimeSnapshot.runtimeState === "ACTIVE" &&
    assertWorkspaceQuoteSurfaceAligned(alignment)
  );
}
