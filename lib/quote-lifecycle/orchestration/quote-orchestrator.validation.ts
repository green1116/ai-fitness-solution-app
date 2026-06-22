/**
 * V58 P7 — Quote Orchestration Validation
 */

import type {
  QuoteOrchestrationContext,
  QuoteOrchestrationInput,
} from "./quote-orchestrator.types";

export interface QuoteOrchestrationValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateOrchestrationContext(
  context: QuoteOrchestrationContext,
): QuoteOrchestrationValidationResult {
  const errors: string[] = [];

  if (!context.quoteId?.trim()) errors.push("quoteId is required");
  if (!context.workspaceId?.trim()) errors.push("workspaceId is required");

  return { valid: errors.length === 0, errors };
}

export function validateOrchestrationInput(
  input: QuoteOrchestrationInput,
): QuoteOrchestrationValidationResult {
  const errors: string[] = [];

  const contextResult = validateOrchestrationContext(input.context);
  errors.push(...contextResult.errors);

  if (!input.action?.trim()) errors.push("action is required");

  if (input.observedAt && Number.isNaN(Date.parse(input.observedAt))) {
    errors.push("observedAt must be a valid ISO date");
  }

  return { valid: errors.length === 0, errors };
}
