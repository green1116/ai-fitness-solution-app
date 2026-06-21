import { readFileSync } from "fs";
import { join } from "path";
import { V56_INTEGRATION_LOCKED, WORKSPACE_QUOTE_INTEGRATION_P8_TAG } from "../freeze/v56-p8-meta";
import { validateQuoteIntegrationP1 } from "../validation/quote-integration-verify-p1";
import { validateQuoteIntegrationP2 } from "../validation/quote-port-binding.verify";
import { validateQuoteIntegrationP3 } from "../validation/quote-persistence.verify";
import { validateQuoteIntegrationP4 } from "../validation/quote-api.verify";
import { validateQuoteIntegrationP5 } from "../workflow/quote-workflow-validation";
import { validateQuoteIntegrationP6 } from "../reliability/quote-reliability-validation";
import { validateQuoteIntegrationP7 } from "../e2e/quote-e2e-validation";
import { assertP6NoBackgroundWorker, assertP6NoQueue } from "../reliability/quote-reliability-validation";
import {
  assertQuoteIntegrationDependencyComplete,
  runQuoteIntegrationDependencyCheck,
} from "./quote-integration-dependency-check";
import {
  assertQuoteIntegrationE2eComplete,
  runQuoteIntegrationE2eCheck,
} from "./quote-integration-e2e-check";
import {
  assertQuoteIntegrationFoundationComplete,
  runQuoteIntegrationFoundationCheck,
} from "./quote-integration-foundation-check";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationIntegrityReport {
  locked: typeof V56_INTEGRATION_LOCKED | null;
  foundation: ReturnType<typeof runQuoteIntegrationFoundationCheck>;
  dependency: ReturnType<typeof runQuoteIntegrationDependencyCheck>;
  e2e: Awaited<ReturnType<typeof runQuoteIntegrationE2eCheck>>;
  phaseValid: {
    p1: boolean;
    p2: boolean;
    p3: boolean;
    p4: boolean;
    p5: boolean;
    p6: boolean;
    p7: boolean;
  };
}

export interface QuoteIntegrationP8Validation {
  valid: boolean;
  summary: string;
  report: QuoteIntegrationIntegrityReport;
}

export function assertP8NoQueue(): boolean {
  const pattern =
    /from\s+["']bull|from\s+["']bullmq|from\s+["']bee-queue|Queue\s*\(|createQueue|jobQueue|messageQueue|sqs-client|@aws-sdk\/client-sqs/i;
  const files = [
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-flow.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-context.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-retry-policy.ts"),
  ];
  return assertP6NoQueue() && files.every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP8NoWorker(): boolean {
  const pattern =
    /Worker\s*\(|new\s+Worker|worker_threads|BackgroundWorker|setInterval\s*\(|cron\s*\(|scheduleJob|node-cron|bullmq|bull\s*\(/i;
  const files = [
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-flow.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-context.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-retry-policy.ts"),
  ];
  return assertP6NoBackgroundWorker() && files.every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export async function buildQuoteIntegrationIntegrityReport(): Promise<QuoteIntegrationIntegrityReport> {
  const [p1, p2, p3, p4, p5, p6, p7, e2e] = await Promise.all([
    validateQuoteIntegrationP1(),
    validateQuoteIntegrationP2(),
    validateQuoteIntegrationP3(),
    validateQuoteIntegrationP4(),
    validateQuoteIntegrationP5(),
    validateQuoteIntegrationP6(),
    validateQuoteIntegrationP7(),
    runQuoteIntegrationE2eCheck(),
  ]);

  const foundation = runQuoteIntegrationFoundationCheck();
  const dependency = runQuoteIntegrationDependencyCheck();
  const phaseValid = {
    p1: p1.valid,
    p2: p2.valid,
    p3: p3.valid,
    p4: p4.valid,
    p5: p5.valid,
    p6: p6.valid,
    p7: p7.valid,
  };

  const allPhasesValid = Object.values(phaseValid).every(Boolean);
  const foundationComplete = assertQuoteIntegrationFoundationComplete();
  const dependencyComplete = assertQuoteIntegrationDependencyComplete();
  const e2eComplete = Object.values(e2e).every(Boolean);
  const runtimeGuards = assertP8NoQueue() && assertP8NoWorker();

  const locked =
    allPhasesValid && foundationComplete && dependencyComplete && e2eComplete && runtimeGuards
      ? V56_INTEGRATION_LOCKED
      : null;

  return {
    locked,
    foundation,
    dependency,
    e2e,
    phaseValid,
  };
}

export async function assertV56IntegrationLocked(): Promise<boolean> {
  const report = await buildQuoteIntegrationIntegrityReport();
  return report.locked === V56_INTEGRATION_LOCKED;
}

export async function validateQuoteIntegrationP8(): Promise<QuoteIntegrationP8Validation> {
  const report = await buildQuoteIntegrationIntegrityReport();
  const valid = report.locked === V56_INTEGRATION_LOCKED;

  return {
    valid,
    summary: [`p8Tag=${WORKSPACE_QUOTE_INTEGRATION_P8_TAG}`, `locked=${report.locked ?? "UNLOCKED"}`, `valid=${valid}`].join(
      " ",
    ),
    report,
  };
}

export {
  assertHasExecutionCore,
  assertHasPortBindingLayer as assertHasPortBinding,
  assertHasPersistenceAdapter,
  assertHasApiAdapter,
  assertHasWorkflowLayer,
  assertHasReliabilityLayer,
  assertHasE2eFlow,
  runQuoteIntegrationFoundationCheck,
  assertQuoteIntegrationFoundationComplete,
} from "./quote-integration-foundation-check";

export { V56_INTEGRATION_LOCKED } from "../freeze/v56-p8-meta";

export {
  assertExecutionUsesPorts,
  assertWorkflowUsesPorts,
  assertPersistencePortEnforced,
  assertApiPortEnforced,
  assertNoDirectPrismaAccess,
  assertNoDirectHandlerAccess,
} from "./quote-integration-dependency-check";

export { assertQuoteIntegrationE2eComplete } from "./quote-integration-e2e-check";
