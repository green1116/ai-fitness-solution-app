import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createQuotePortRegistry } from "@/lib/quote-runtime/ports";
import {
  createQuoteApiAdapter,
  createQuoteApiBindingFromV51,
} from "../adapters/api";
import {
  createMemoryQuoteRepositoryBinding,
  createQuotePersistenceAdapter,
} from "../adapters/persistence";
import { loadV55QuoteRuntimeSnapshot } from "../bridge/quote-runtime-bridge";
import { createQuotePortStubBundle } from "../ports/quote-port-resolver";
import { WORKSPACE_QUOTE_INTEGRATION_P5_TAG } from "../freeze/v56-p5-meta";
import {
  createQuoteWorkflowContext,
  type QuoteWorkflowContext,
} from "./quote-workflow-context";
import {
  createQuoteWorkflowOrchestrator,
  executeQuoteWorkflow,
  type QuoteWorkflowOrchestrationResult,
} from "./quote-workflow-orchestrator";
import {
  QUOTE_WORKFLOW_STATE_EXPOSED,
  QUOTE_WORKFLOW_STATE_FAILED,
  type QuoteWorkflowState,
} from "./quote-workflow-state";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationP5Validation {
  valid: boolean;
  summary: string;
}

function getP5WorkflowFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts"),
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-context.ts"),
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-state.ts"),
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-validation.ts"),
  ];
}

export function assertWorkflowOrchestratorContract(): boolean {
  const path = join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuoteWorkflowOrchestrator") &&
    content.includes("executeQuoteWorkflow") &&
    content.includes("persistQuoteState") &&
    content.includes("exposeQuoteApi")
  );
}

export function assertWorkflowContextContract(): boolean {
  const path = join(INTEGRATION_ROOT, "workflow", "quote-workflow-context.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("QuoteWorkflowContext") && content.includes("createQuoteWorkflowContext");
}

export function assertWorkflowStateContract(): boolean {
  const path = join(INTEGRATION_ROOT, "workflow", "quote-workflow-state.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("CREATED") &&
    content.includes("PERSISTED") &&
    content.includes("EXPOSED") &&
    content.includes("FAILED")
  );
}

export function assertWorkflowUsesPortsOnly(): boolean {
  const forbidden = [
    /@prisma\/client/,
    /from\s+["']@\/lib\/prisma["']/,
    /persistenceRepositories/,
    /quoteRepository/,
    /from\s+["']@\/lib\/saas-product-api\/handlers/,
    /from\s+["']@\/app\/api/,
    /adapters\/persistence/,
    /adapters\/api/,
  ];
  return getP5WorkflowFiles()
    .filter((file) => !file.endsWith("quote-workflow-validation.ts"))
    .every((file) => !forbidden.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
}

export function assertP5NoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP5WorkflowFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoDirectHandlerAccess(): boolean {
  const pattern =
    /from\s+["']@\/lib\/saas-product-api\/handlers|handlers\/quote-handlers|handleCreateQuote|withApiContext/;
  return getP5WorkflowFiles()
    .filter((file) => !file.endsWith("quote-workflow-validation.ts"))
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

async function buildMountedWorkflowPorts(workspaceId: string) {
  const tenantId = "tenant-v56-p5";
  const { binding, workspaceId: memoryWorkspaceId } = await createMemoryQuoteRepositoryBinding({
    tenantId,
  });
  const resolvedWorkspaceId = workspaceId === "v56-p5-workflow-mounted" ? memoryWorkspaceId : workspaceId;
  const persistence = createQuotePersistenceAdapter({ tenantId, binding });
  const api = createQuoteApiAdapter({ binding: createQuoteApiBindingFromV51({ tenantId }) });
  const foundation = createQuotePortStubBundle(loadV55QuoteRuntimeSnapshot(resolvedWorkspaceId).snapshot);
  return {
    workspaceId: resolvedWorkspaceId,
    ports: createQuotePortRegistry({
      persistence,
      api,
      commercial: foundation.commercial,
    }),
  };
}

export async function assertMountedQuoteWorkflowOrchestrator(): Promise<boolean> {
  const { workspaceId, ports } = await buildMountedWorkflowPorts("v56-p5-workflow-mounted");
  const context = createQuoteWorkflowContext({ workspaceId, ports });
  const orchestrator = createQuoteWorkflowOrchestrator(ports);
  const directResult = executeQuoteWorkflow(context);
  const orchestratorResult = orchestrator.executeFromWorkspace(workspaceId);

  return (
    assertWorkflowResult(directResult) &&
    assertWorkflowResult(orchestratorResult) &&
    directResult.workflowState === QUOTE_WORKFLOW_STATE_EXPOSED &&
    orchestratorResult.workflowState === QUOTE_WORKFLOW_STATE_EXPOSED
  );
}

function assertWorkflowResult(result: QuoteWorkflowOrchestrationResult): boolean {
  return (
    result.success &&
    Boolean(result.quoteId) &&
    result.status === "CREATED" &&
    result.workflowState === QUOTE_WORKFLOW_STATE_EXPOSED &&
    result.logs.some((entry) => entry.includes("persistQuoteState=true")) &&
    result.logs.some((entry) => entry.includes("exposeQuoteApi=true"))
  );
}

export async function validateQuoteIntegrationP5(): Promise<QuoteIntegrationP5Validation> {
  const mounted = await assertMountedQuoteWorkflowOrchestrator();
  const valid =
    existsSync(join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts")) &&
    assertWorkflowOrchestratorContract() &&
    assertWorkflowContextContract() &&
    assertWorkflowStateContract() &&
    assertWorkflowUsesPortsOnly() &&
    assertP5NoPrismaImport() &&
    assertP5NoDirectHandlerAccess() &&
    mounted;

  return {
    valid,
    summary: [`p5Tag=${WORKSPACE_QUOTE_INTEGRATION_P5_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasWorkflowOrchestrator(): boolean {
  return assertWorkflowOrchestratorContract();
}

export type { QuoteWorkflowContext, QuoteWorkflowOrchestrationResult, QuoteWorkflowState };
