import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { assertWorkflowHasReliability } from "../reliability/quote-reliability-validation";
import { WORKSPACE_QUOTE_INTEGRATION_P7_TAG } from "../freeze/v56-p7-meta";
import {
  QUOTE_AUDIT_CREATED,
  QUOTE_AUDIT_EXPOSED,
  QUOTE_AUDIT_PERSISTED,
} from "../reliability/quote-audit-trail";
import { QUOTE_WORKFLOW_STATE_EXPOSED } from "../workflow/quote-workflow-state";
import { createQuoteEndToEndContext } from "./quote-e2e-context";
import { runQuoteEndToEndFlow } from "./quote-e2e-flow";
import { isQuoteEndToEndSuccess, type QuoteEndToEndResult } from "./quote-e2e-result";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationP7Validation {
  valid: boolean;
  summary: string;
}

function getP7E2eFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-flow.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-context.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-result.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-validation.ts"),
  ];
}

function getP7ScopedFiles(): string[] {
  return [
    ...getP7E2eFiles(),
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts"),
  ];
}

export function assertE2eFlowContract(): boolean {
  const path = join(INTEGRATION_ROOT, "e2e", "quote-e2e-flow.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("runQuoteEndToEndFlow") &&
    content.includes("executeQuoteRuntimeFlow") &&
    content.includes("executeQuoteWorkflow") &&
    content.includes("createQuoteEndToEndContext")
  );
}

export function assertE2eContextContract(): boolean {
  const path = join(INTEGRATION_ROOT, "e2e", "quote-e2e-context.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("QuoteEndToEndContext") &&
    content.includes("createQuoteEndToEndContext") &&
    content.includes("createQuoteRuntimePortBinding") &&
    content.includes("createQuotePersistenceAdapter") &&
    content.includes("createQuoteApiAdapter")
  );
}

export function assertE2eResultContract(): boolean {
  const path = join(INTEGRATION_ROOT, "e2e", "quote-e2e-result.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("QuoteEndToEndResult") &&
    content.includes("executionResult") &&
    content.includes("workflowResult") &&
    content.includes("persistenceResult") &&
    content.includes("apiResult") &&
    content.includes("auditTrail")
  );
}

export function assertE2eChainComplete(result: QuoteEndToEndResult): boolean {
  return (
    isQuoteEndToEndSuccess(result) &&
    result.workflowResult.workflowState === QUOTE_WORKFLOW_STATE_EXPOSED &&
    Boolean(result.workflowResult.executionId) &&
    result.auditTrail.some((entry) => entry.event === QUOTE_AUDIT_CREATED) &&
    result.auditTrail.some((entry) => entry.event === QUOTE_AUDIT_PERSISTED) &&
    result.auditTrail.some((entry) => entry.event === QUOTE_AUDIT_EXPOSED) &&
    result.logs.some((entry) => entry.includes("e2e.p1=")) &&
    result.logs.some((entry) => entry.includes("e2e.p5=")) &&
    result.logs.some((entry) => entry.includes("p3.persisted=true")) &&
    result.logs.some((entry) => entry.includes("p4.exposed=true"))
  );
}

export function assertP7NoWorker(): boolean {
  const pattern =
    /Worker\s*\(|new\s+Worker|worker_threads|BackgroundWorker|setInterval\s*\(|cron\s*\(|scheduleJob|node-cron|bullmq|bull\s*\(/i;
  return getP7ScopedFiles()
    .filter((file) => !file.endsWith("quote-e2e-validation.ts"))
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP7NoQueue(): boolean {
  const pattern =
    /from\s+["']bull|from\s+["']bullmq|from\s+["']bee-queue|Queue\s*\(|createQueue|jobQueue|messageQueue|sqs-client|@aws-sdk\/client-sqs/i;
  return getP7ScopedFiles()
    .filter((file) => !file.endsWith("quote-e2e-validation.ts"))
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export async function assertMountedQuoteEndToEndFlow(): Promise<boolean> {
  const context = await createQuoteEndToEndContext("v56-p7-e2e-mounted");
  const result = await runQuoteEndToEndFlow(context.workspaceId);
  return assertE2eChainComplete(result);
}

export async function validateQuoteIntegrationP7(): Promise<QuoteIntegrationP7Validation> {
  const mounted = await assertMountedQuoteEndToEndFlow();
  const valid =
    getP7E2eFiles().every((file) => existsSync(file)) &&
    assertE2eFlowContract() &&
    assertE2eContextContract() &&
    assertE2eResultContract() &&
    assertWorkflowHasReliability() &&
    assertP7NoWorker() &&
    assertP7NoQueue() &&
    mounted;

  return {
    valid,
    summary: [`p7Tag=${WORKSPACE_QUOTE_INTEGRATION_P7_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasE2eFlow(): boolean {
  return assertE2eFlowContract();
}

export function assertHasE2eContext(): boolean {
  return assertE2eContextContract();
}

export function assertHasE2eResult(): boolean {
  return assertE2eResultContract();
}
