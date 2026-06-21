import { readFileSync } from "fs";
import { join } from "path";
import {
  assertPortEnforcedExecutionContract,
} from "../validation/quote-integration-verify-p1";
import { assertPortEnforcedApiContract, assertP4NoDirectApiHandler } from "../validation/quote-api.verify";
import {
  assertPortEnforcedPersistenceContract,
  assertP3NoPrismaImportInExecution,
} from "../validation/quote-persistence.verify";
import { assertWorkflowUsesPortsOnly, assertP5NoDirectHandlerAccess } from "../workflow/quote-workflow-validation";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationDependencyCheck {
  executionUsesPorts: boolean;
  workflowUsesPorts: boolean;
  persistencePortEnforced: boolean;
  apiPortEnforced: boolean;
  noDirectPrismaAccess: boolean;
  noDirectHandlerAccess: boolean;
}

function getP8DependencyScopedFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "bridge", "quote-runtime-bridge.ts"),
    join(INTEGRATION_ROOT, "services", "quote-execution.service.ts"),
    join(INTEGRATION_ROOT, "services", "quote-runtime-orchestrator.ts"),
    join(INTEGRATION_ROOT, "services", "quote-port-executor.ts"),
    join(INTEGRATION_ROOT, "integration", "create-quote-runtime-executor.ts"),
    join(INTEGRATION_ROOT, "integration", "create-quote-runtime-port-binding.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-resolver.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-registry.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-binding.ts"),
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts"),
    join(INTEGRATION_ROOT, "workflow", "quote-workflow-context.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-flow.ts"),
    join(INTEGRATION_ROOT, "e2e", "quote-e2e-context.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-error.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-retry-policy.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-execution-log.ts"),
    join(INTEGRATION_ROOT, "reliability", "quote-audit-trail.ts"),
  ];
}

export function assertExecutionUsesPorts(): boolean {
  return assertPortEnforcedExecutionContract();
}

export function assertWorkflowUsesPorts(): boolean {
  return assertWorkflowUsesPortsOnly();
}

export function assertPersistencePortEnforced(): boolean {
  return assertPortEnforcedPersistenceContract();
}

export function assertApiPortEnforced(): boolean {
  return assertPortEnforcedApiContract();
}

export function assertNoDirectPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']|persistenceRepositories\./;
  return (
    assertP3NoPrismaImportInExecution() &&
    getP8DependencyScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")))
  );
}

export function assertNoDirectHandlerAccess(): boolean {
  const pattern =
    /from\s+["']@\/lib\/saas-product-api\/handlers|handlers\/quote-handlers|handleCreateQuote|handleListQuotes|withApiContext/;
  return (
    assertP5NoDirectHandlerAccess() &&
    assertP4NoDirectApiHandler() &&
    getP8DependencyScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")))
  );
}

export function runQuoteIntegrationDependencyCheck(): QuoteIntegrationDependencyCheck {
  return {
    executionUsesPorts: assertExecutionUsesPorts(),
    workflowUsesPorts: assertWorkflowUsesPorts(),
    persistencePortEnforced: assertPersistencePortEnforced(),
    apiPortEnforced: assertApiPortEnforced(),
    noDirectPrismaAccess: assertNoDirectPrismaAccess(),
    noDirectHandlerAccess: assertNoDirectHandlerAccess(),
  };
}

export function assertQuoteIntegrationDependencyComplete(): boolean {
  const check = runQuoteIntegrationDependencyCheck();
  return Object.values(check).every(Boolean);
}
