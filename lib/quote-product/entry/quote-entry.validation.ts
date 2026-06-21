import type { QuoteEntryFormInput, QuoteEntrySubmission } from "./quote-entry.types";
import type { QuoteEntryRequest } from "../shared/quote-product-types";

export function validateQuoteEntryRequest(request: QuoteEntryRequest): boolean {
  return request.workspaceId.trim().length > 0;
}

export function validateQuoteEntryFormInput(input: QuoteEntryFormInput): boolean {
  return input.workspaceId.trim().length > 0;
}

export function validateQuoteEntrySubmission(submission: QuoteEntrySubmission): boolean {
  return submission.submit === true && validateQuoteEntryFormInput(submission);
}

export function assertQuoteEntryRequest(request: QuoteEntryRequest): void {
  if (!validateQuoteEntryRequest(request)) {
    throw new Error("workspaceId is required");
  }
}

export function assertQuoteEntrySubmission(submission: QuoteEntrySubmission): void {
  if (!validateQuoteEntrySubmission(submission)) {
    throw new Error("invalid quote entry submission");
  }
}
