import { existsSync } from "fs";
import { join } from "path";
import { assertHasApiAdapter } from "../validation/quote-api.verify";
import { assertHasExecutionCore } from "../validation/quote-integration-verify-p1";
import { assertHasPortResolver } from "../validation/quote-port-binding.verify";
import { assertHasPersistenceAdapter } from "../validation/quote-persistence.verify";
import { assertHasErrorModel, assertHasAuditTrail } from "../reliability/quote-reliability-validation";
import { assertHasE2eFlow } from "../e2e/quote-e2e-validation";
import { assertHasWorkflowOrchestrator } from "../workflow/quote-workflow-validation";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationFoundationCheck {
  hasExecutionCore: boolean;
  hasPortBinding: boolean;
  hasPersistenceAdapter: boolean;
  hasApiAdapter: boolean;
  hasWorkflowLayer: boolean;
  hasReliabilityLayer: boolean;
  hasE2eFlow: boolean;
}

export function assertHasPortBindingLayer(): boolean {
  return (
    existsSync(join(INTEGRATION_ROOT, "ports", "quote-port-binding.ts")) &&
    existsSync(join(INTEGRATION_ROOT, "ports", "quote-port-registry.ts")) &&
    assertHasPortResolver()
  );
}

export function assertHasWorkflowLayer(): boolean {
  return (
    existsSync(join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts")) &&
    assertHasWorkflowOrchestrator()
  );
}

export function assertHasReliabilityLayer(): boolean {
  return (
    existsSync(join(INTEGRATION_ROOT, "reliability", "quote-error.ts")) &&
    existsSync(join(INTEGRATION_ROOT, "reliability", "quote-audit-trail.ts")) &&
    assertHasErrorModel() &&
    assertHasAuditTrail()
  );
}

export function runQuoteIntegrationFoundationCheck(): QuoteIntegrationFoundationCheck {
  return {
    hasExecutionCore: assertHasExecutionCore(),
    hasPortBinding: assertHasPortBindingLayer(),
    hasPersistenceAdapter: assertHasPersistenceAdapter(),
    hasApiAdapter: assertHasApiAdapter(),
    hasWorkflowLayer: assertHasWorkflowLayer(),
    hasReliabilityLayer: assertHasReliabilityLayer(),
    hasE2eFlow: assertHasE2eFlow(),
  };
}

export function assertQuoteIntegrationFoundationComplete(): boolean {
  const check = runQuoteIntegrationFoundationCheck();
  return Object.values(check).every(Boolean);
}

export { assertHasExecutionCore } from "../validation/quote-integration-verify-p1";
export { assertHasPersistenceAdapter } from "../validation/quote-persistence.verify";
export { assertHasApiAdapter } from "../validation/quote-api.verify";
export { assertHasE2eFlow } from "../e2e/quote-e2e-validation";
