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
import { WORKSPACE_QUOTE_INTEGRATION_P6_TAG } from "../freeze/v56-p6-meta";
import {
  createQuoteWorkflowContext,
  type QuoteWorkflowContext,
} from "../workflow/quote-workflow-context";
import {
  createQuoteWorkflowOrchestrator,
  executeQuoteWorkflow,
  type QuoteWorkflowOrchestrationResult,
} from "../workflow/quote-workflow-orchestrator";
import {
  QUOTE_WORKFLOW_STATE_EXPOSED,
  QUOTE_WORKFLOW_STATE_FAILED,
} from "../workflow/quote-workflow-state";
import type { QuoteErrorType } from "./quote-error";
import {
  QUOTE_ERROR_API_EXPOSURE,
  QUOTE_ERROR_PERSISTENCE,
  QUOTE_ERROR_VALIDATION,
  QUOTE_ERROR_WORKFLOW,
} from "./quote-error";
import type { QuoteExecutionLog } from "./quote-execution-log";
import type { QuoteRetryPolicyType } from "./quote-retry-policy";
import {
  QUOTE_RETRY_POLICY_EXPONENTIAL_BACKOFF,
  QUOTE_RETRY_POLICY_IMMEDIATE,
  QUOTE_RETRY_POLICY_NONE,
} from "./quote-retry-policy";
import type { QuoteAuditTrailEvent } from "./quote-audit-trail";
import {
  QUOTE_AUDIT_CREATED,
  QUOTE_AUDIT_EXPOSED,
  QUOTE_AUDIT_FAILED,
  QUOTE_AUDIT_PERSISTED,
} from "./quote-audit-trail";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationP6Validation {
  valid: boolean;
  summary: string;
}

function getP6ReliabilityFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "reliability", "quote-error.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-retry-policy.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-execution-log.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-audit-trail.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-reliability-validation.ts"),
  ];
}

function getP6WorkflowFiles(): string[] {
  return [join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts")];
}

function getP6ScopedFiles(): string[] {
  return [...getP6ReliabilityFiles(), ...getP6WorkflowFiles()];
}

export function assertErrorModelContract(): boolean {
  const path = join(INTEGRATION_ROOT, "reliability", "quote-error.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("PERSISTENCE_ERROR") &&
    content.includes("API_EXPOSURE_ERROR") &&
    content.includes("WORKFLOW_ERROR") &&
    content.includes("VALIDATION_ERROR") &&
    content.includes("UNKNOWN_ERROR") &&
    content.includes("createQuoteError")
  );
}

export function assertRetryPolicyContract(): boolean {
  const path = join(INTEGRATION_ROOT, "reliability", "quote-retry-policy.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("NONE") &&
    content.includes("IMMEDIATE") &&
    content.includes("EXPONENTIAL_BACKOFF") &&
    content.includes("executeWithQuoteRetryPolicy")
  );
}

export function assertExecutionLogContract(): boolean {
  const path = join(INTEGRATION_ROOT, "reliability", "quote-execution-log.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("QuoteExecutionLog") &&
    content.includes("executionId") &&
    content.includes("createQuoteExecutionLogCollector")
  );
}

export function assertAuditTrailContract(): boolean {
  const path = join(INTEGRATION_ROOT, "reliability", "quote-audit-trail.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("CREATED") &&
    content.includes("PERSISTED") &&
    content.includes("EXPOSED") &&
    content.includes("FAILED") &&
    content.includes("createQuoteAuditTrail")
  );
}

export function assertWorkflowHasReliability(): boolean {
  const path = join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuoteExecutionLogCollector") &&
    content.includes("createQuoteAuditTrail") &&
    content.includes("executeWithQuoteRetryPolicy") &&
    content.includes("executionLogs") &&
    content.includes("auditTrail")
  );
}

export function assertP6NoBackgroundWorker(): boolean {
  const pattern =
    /Worker\s*\(|new\s+Worker|worker_threads|BackgroundWorker|setInterval\s*\(|cron\s*\(|scheduleJob|node-cron|bullmq|bull\s*\(/i;
  return getP6ScopedFiles()
    .filter((file) => !file.endsWith("quote-reliability-validation.ts"))
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP6NoQueue(): boolean {
  const pattern =
    /from\s+["']bull|from\s+["']bullmq|from\s+["']bee-queue|Queue\s*\(|createQueue|jobQueue|messageQueue|sqs-client|@aws-sdk\/client-sqs/i;
  return getP6ScopedFiles()
    .filter((file) => !file.endsWith("quote-reliability-validation.ts"))
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP6NoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP6ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

async function buildMountedWorkflowPorts(workspaceId: string) {
  const tenantId = "tenant-v56-p6";
  const { binding, workspaceId: memoryWorkspaceId } = await createMemoryQuoteRepositoryBinding({
    tenantId,
  });
  const resolvedWorkspaceId = workspaceId === "v56-p6-workflow-mounted" ? memoryWorkspaceId : workspaceId;
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

function assertReliabilityResult(result: QuoteWorkflowOrchestrationResult): boolean {
  return (
    result.success &&
    Boolean(result.quoteId) &&
    result.workflowState === QUOTE_WORKFLOW_STATE_EXPOSED &&
    Boolean(result.executionId) &&
    Array.isArray(result.executionLogs) &&
    result.executionLogs.length >= 3 &&
    Array.isArray(result.auditTrail) &&
    result.auditTrail.some((entry) => entry.event === QUOTE_AUDIT_CREATED) &&
    result.auditTrail.some((entry) => entry.event === QUOTE_AUDIT_PERSISTED) &&
    result.auditTrail.some((entry) => entry.event === QUOTE_AUDIT_EXPOSED) &&
    result.logs.some((entry) => entry.includes("persistQuoteState=true")) &&
    result.logs.some((entry) => entry.includes("exposeQuoteApi=true"))
  );
}

export async function assertMountedQuoteReliabilityWorkflow(): Promise<boolean> {
  const { workspaceId, ports } = await buildMountedWorkflowPorts("v56-p6-workflow-mounted");
  const context = createQuoteWorkflowContext({ workspaceId, ports });
  const orchestrator = createQuoteWorkflowOrchestrator(ports);
  const directResult = executeQuoteWorkflow(context);
  const orchestratorResult = orchestrator.executeFromWorkspace(workspaceId);

  return assertReliabilityResult(directResult) && assertReliabilityResult(orchestratorResult);
}

export async function validateQuoteIntegrationP6(): Promise<QuoteIntegrationP6Validation> {
  const mounted = await assertMountedQuoteReliabilityWorkflow();
  const valid =
    getP6ReliabilityFiles().every((file) => existsSync(file)) &&
    assertErrorModelContract() &&
    assertRetryPolicyContract() &&
    assertExecutionLogContract() &&
    assertAuditTrailContract() &&
    assertWorkflowHasReliability() &&
    assertP6NoBackgroundWorker() &&
    assertP6NoQueue() &&
    assertP6NoPrismaImport() &&
    mounted;

  return {
    valid,
    summary: [`p6Tag=${WORKSPACE_QUOTE_INTEGRATION_P6_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasErrorModel(): boolean {
  return assertErrorModelContract();
}

export function assertHasRetryPolicy(): boolean {
  return assertRetryPolicyContract();
}

export function assertHasExecutionLog(): boolean {
  return assertExecutionLogContract();
}

export function assertHasAuditTrail(): boolean {
  return assertAuditTrailContract();
}

export type {
  QuoteExecutionLog,
  QuoteErrorType,
  QuoteRetryPolicyType,
  QuoteAuditTrailEvent,
};

export {
  QUOTE_ERROR_PERSISTENCE,
  QUOTE_ERROR_API_EXPOSURE,
  QUOTE_ERROR_WORKFLOW,
  QUOTE_ERROR_VALIDATION,
  QUOTE_RETRY_POLICY_NONE,
  QUOTE_RETRY_POLICY_IMMEDIATE,
  QUOTE_RETRY_POLICY_EXPONENTIAL_BACKOFF,
  QUOTE_AUDIT_CREATED,
  QUOTE_AUDIT_PERSISTED,
  QUOTE_AUDIT_EXPOSED,
  QUOTE_AUDIT_FAILED,
};
