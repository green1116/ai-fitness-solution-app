import type { QuoteProductContext, QuoteProductSubmission } from "./quote-product.types";
import type { QuoteWorkspaceResolveInput } from "../workspace/quote-workspace.types";

export function validateQuoteProductContext(input: QuoteProductContext): boolean {
  return input.workspaceId.trim().length > 0;
}

export function assertQuoteProductContext(input: QuoteProductContext): void {
  if (!validateQuoteProductContext(input)) {
    throw new Error("workspaceId is required");
  }
}

export function validateQuoteProductSubmission(submission: QuoteProductSubmission): boolean {
  return validateQuoteProductContext(submission.context);
}

export function assertQuoteProductSubmission(submission: QuoteProductSubmission): void {
  if (!validateQuoteProductSubmission(submission)) {
    throw new Error("quote product submission requires a valid workspace context");
  }
}

export function validateQuoteWorkspaceResolveInput(input: QuoteWorkspaceResolveInput): boolean {
  return input.workspaceId.trim().length > 0;
}

export function assertQuoteWorkspaceResolveInput(input: QuoteWorkspaceResolveInput): void {
  if (!validateQuoteWorkspaceResolveInput(input)) {
    throw new Error("workspaceId is required");
  }
}
